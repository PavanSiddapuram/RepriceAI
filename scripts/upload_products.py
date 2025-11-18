import json
import os
from google.cloud import firestore

print("🔥 Upload script started...")

# Show which Python and working dir are in use
print("🐍 Python executable:", os.sys.executable)
print("📂 CWD:", os.getcwd())

# Check credentials
creds = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
print("🔑 GOOGLE_APPLICATION_CREDENTIALS =", creds)

if not creds or not os.path.exists(creds):
    print("❌ Credentials file NOT FOUND or path invalid!")
    raise SystemExit(1)

try:
    print("📚 Trying to create Firestore client...")
    db = firestore.Client()
    print("✅ Firestore client created successfully")
except Exception as e:
    print("❌ Firestore connection failed:")
    print(e)
    raise SystemExit(1)

MOCK_FILE = os.path.join(os.path.dirname(__file__), "mock_data.json")
print("📝 Mock data file:", MOCK_FILE)

if not os.path.exists(MOCK_FILE):
    print(f"❌ Missing {MOCK_FILE}. Create it beside this script.")
    raise SystemExit(1)

with open(MOCK_FILE, "r", encoding="utf-8") as f:
    raw = json.load(f)

# Support both formats:
# 1) Old: { "Tomato": {..}, "Milk": {..} }
# 2) New: { "products": [ {"name": "Tomato", "prices": {...}}, ... ] }
products: list[tuple[str, dict]] = []

if isinstance(raw, dict) and "products" in raw and isinstance(raw["products"], list):
    # New format
    for item in raw["products"]:
        name = item.get("name")
        prices = item.get("prices") or {}
        if not name:
            continue
        products.append((name, prices))
else:
    # Assume old flat dict format
    for name, prices in raw.items():
        products.append((name, prices))

print(f"📦 Products loaded: {len(products)} items")

collection = "competitors"

for name, prices in products:
    print(f"➡️ Uploading {name} ...", prices)
    db.collection(collection).document(name).set(prices)

print("✅ DONE! All products uploaded to Firestore!")
