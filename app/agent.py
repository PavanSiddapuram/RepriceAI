import os
import json
from dotenv import load_dotenv

# Always load the .env from the project root, regardless of CWD
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")

# Try python-dotenv first
load_dotenv(dotenv_path=ENV_PATH)

# -------------------------------------------------
# AUTO-DETECT FIRESTORE (Cloud Run Mode vs Local)
# -------------------------------------------------
USE_FIRESTORE = False
try:
    from google.cloud import firestore
    # Check credentials availability
    test_client = firestore.Client()
    USE_FIRESTORE = True
    print("🔥 Cloud Mode: Firestore enabled")
except Exception:
    firestore = None
    print("🟡 Local Mode: Using mock JSON data")


# -------------------------------------------------
# GEMINI SETUP (Optional Local Mode)
# -------------------------------------------------
import google.generativeai as genai

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
print("🔑 GEMINI_API_KEY present?", bool(GEMINI_KEY))
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)


# -------------------------------------------------
# PRICE AGENT CLASS
# -------------------------------------------------
class PriceAgent:
    def __init__(self, project_id=None):
        self.project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT")

        # Firestore client only in cloud
        if USE_FIRESTORE:
            self.db = firestore.Client(project=self.project_id)
        else:
            self.db = None

        # Always load mock competitor dataset (local fallback)
        # Prefer scripts/mock_data.json which exists in this project.
        mock_path = "scripts/mock_data.json"
        try:
            with open(mock_path, "r") as f:
                self.mock_data = json.load(f)
        except Exception as e:
            print(f"⚠️ Could not load mock competitors from {mock_path}:", e)
            self.mock_data = {}

    # -------------------------------------------------
    # FETCH COMPETITOR PRICES
    # -------------------------------------------------
    def get_competitors(self, product):
        """Return competitor prices for a product.

        First tries an exact match. If that fails, it attempts a simple
        fuzzy match so that loose names like "Tomato" can match
        "Tomato 1kg" in Firestore or mock_data.
        """

        name = product.strip()
        if not name:
            return {}

        # 1) Cloud Run → Firestore (exact then fuzzy)
        if self.db:
            # Exact document match
            doc = self.db.collection("competitors").document(name).get()
            if doc.exists:
                return doc.to_dict()

            # Fuzzy: pick first doc where product name is contained in the id
            try:
                docs = list(self.db.collection("competitors").stream())
                name_lower = name.lower()
                for d in docs:
                    doc_id = d.id
                    if name_lower in doc_id.lower() or doc_id.lower() in name_lower:
                        return d.to_dict()
            except Exception as e:
                print("⚠️ Firestore fuzzy match failed:", e)

        # 2) Local → JSON fallback (exact then fuzzy)
        if name in self.mock_data:
            return self.mock_data[name]

        name_lower = name.lower()
        for key, value in self.mock_data.items():
            key_lower = key.lower()
            if name_lower in key_lower or key_lower in name_lower:
                return value

        # No match at all
        return {}

    # -------------------------------------------------
    # PROMPT GENERATOR
    # -------------------------------------------------
    def build_prompt(self, payload, competitor_prices):
        with open("app/prompts/pricing_prompt.txt") as f:
            tmpl = f.read()

        return tmpl.format(
            cost=payload["cost"],
            stock_left=payload["stock_left"],
            expiry_days=payload["expiry_days"],
            competitor_prices=json.dumps(competitor_prices),
            demand_score=payload["demand_score"],
            strategy=payload["strategy"],
        )

    # -------------------------------------------------
    # GEMINI CALL WITH SAFE FALLBACK
    # -------------------------------------------------
    def call_gemini(self, prompt):
        # No Gemini key available
        if not GEMINI_KEY:
            return {
                "recommended_price": None,
                "discount_percent": 0,
                "urgency": "Low",
                "reasoning": "Gemini key missing — fallback mode",
            }

        # Normal Gemini call: try multiple models in order
        try:
            last_error = None
            for model_name in ["gemini-2.0-flash", "gemini-1.5-flash"]:
                try:
                    print(f"🔷 Calling Gemini model: {model_name}")
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)

                    raw_text = getattr(response, "text", None) or "".join(
                        p.text for p in getattr(response, "candidates", [])[0].content.parts
                    ) if getattr(response, "candidates", None) else ""

                    # Try direct JSON parse first
                    try:
                        return json.loads(raw_text)
                    except Exception:
                        # Sometimes Gemini wraps JSON in markdown code fences or extra text.
                        import re

                        match = re.search(r"\{[\s\S]*\}", raw_text)
                        if match:
                            try:
                                return json.loads(match.group(0))
                            except Exception:
                                pass

                        print("❌ Gemini JSON parse failed for", model_name, "Raw output:\n", raw_text)
                        raise

                except Exception as model_err:
                    print(f"❌ Gemini call failed for {model_name}:", model_err)
                    last_error = model_err

            # If all models fail, propagate last error to outer handler
            raise last_error if last_error else RuntimeError("All Gemini models failed")

        except Exception as e:
            print("❌ Gemini call failed:", e)
            return {
                "recommended_price": None,
                "discount_percent": 0,
                "urgency": "Low",
                "reasoning": "Gemini error — fallback mode",
            }

    # -------------------------------------------------
    # BUSINESS GUARDRAILS (Never return invalid price)
    # -------------------------------------------------
    def enforce_guardrails(self, result, cost, competitors):
        # Basic competitor or fallback price
        avg_comp = (
            sum(competitors.values()) / len(competitors)
            if competitors else cost * 1.2
        )

        # Fallback if recommended price is None
        if result["recommended_price"] is None:
            result["recommended_price"] = round(avg_comp, 2)
            result["reasoning"] += " | Fallback applied"

        price = float(result["recommended_price"])

        # Rule 1: Never go below cost
        if price < cost:
            price = cost
            result["recommended_price"] = price

        # Rule 2: Prevent wild jumps (±25% of competitor avg)
        jump = abs(price - avg_comp) / avg_comp if avg_comp else 0
        if avg_comp and jump > 0.25:
            price = round(avg_comp, 2)
            result["recommended_price"] = price
            result["reasoning"] += " | Guardrail applied"

        # Recompute discount based on final price vs competitor average
        if competitors and avg_comp:
            raw_discount = (avg_comp - price) / avg_comp * 100
            discount = max(0, round(raw_discount))
        else:
            discount = 0

        result["discount_percent"] = discount

        return result

    # -------------------------------------------------
    # MAIN FUNCTION
    # -------------------------------------------------
    def recommend(self, payload):
        competitors = self.get_competitors(payload["product"])
        prompt = self.build_prompt(payload, competitors)
        result = self.call_gemini(prompt)
        final = self.enforce_guardrails(result, payload["cost"], competitors)
        final["product"] = payload["product"]
        return final
