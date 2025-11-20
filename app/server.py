from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from app.agent import PriceAgent

# -------------------------------------------------
# FASTAPI SETUP
# -------------------------------------------------
app = FastAPI(
    title="RepriceAI – Dynamic Pricing Microservice",
    version="1.0",
    description="AI-driven price optimizer for groceries using Gemini + Firestore",
)

# CORS FOR FRONTEND (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all — restrict later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agent
agent = PriceAgent()


# -------------------------------------------------
# REQUEST MODEL
# -------------------------------------------------
class PricingRequest(BaseModel):
    product: str
    cost: float
    stock_left: int
    expiry_days: int
    demand_score: int
    strategy: str   # "aggressive" | "balanced" | "conservative"


class ProductUpdate(BaseModel):
    name: str
    prices: dict


# -------------------------------------------------
# HEALTH CHECK
# -------------------------------------------------
@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "RepriceAI backend",
        "mode": "cloud" if not agent.use_mock else "local",
    }


# -------------------------------------------------
# MAIN PRICE ENDPOINT
# -------------------------------------------------
@app.post("/recommend-price")
def recommend_price(req: PricingRequest):
    try:
        result = agent.recommend(req.dict())
        return {"success": True, "data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------
# BULK PRICING ENDPOINT
# -------------------------------------------------
@app.post("/recommend-bulk")
def recommend_bulk(payload: List[PricingRequest]):
    try:
        outputs = [agent.recommend(item.dict()) for item in payload]
        return {
            "success": True,
            "count": len(outputs),
            "data": outputs,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------------------------
# ADMIN / PRODUCT MANAGEMENT ENDPOINTS
# -------------------------------------------------

@app.get("/products")
def list_products() -> dict:
    """Return a simple list of product names.

    Uses Firestore when available, otherwise falls back to mock_data keys.
    """
    try:
        if getattr(agent, "db", None):
            docs = agent.db.collection("competitors").stream()
            names = sorted(doc.id for doc in docs)
        else:
            mock = getattr(agent, "mock_data", {})
            names = sorted(mock.keys())
        return {"results": names}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search-products")
def search_products(q: str = "") -> dict:
    """Basic substring search over product names for Admin autocomplete."""
    try:
        base = list_products()["results"]
        q_lower = q.lower()
        filtered = [name for name in base if q_lower in name.lower()]
        return {"results": [{"name": name} for name in filtered]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/get-product")
def get_product(name: str) -> dict:
    """Fetch competitor prices for a single product."""
    try:
        if getattr(agent, "db", None):
            doc = agent.db.collection("competitors").document(name).get()
            if doc.exists:
                return {"name": name, "prices": doc.to_dict()}
            return {"name": name, "prices": {}}

        mock = getattr(agent, "mock_data", {})
        return {"name": name, "prices": mock.get(name, {})}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/update-product")
def update_product(payload: ProductUpdate) -> dict:
    """Create/update a product's competitor prices.

    Writes to Firestore when available, and also updates in-memory mock_data
    so local mode remains consistent.
    """
    try:
        data = payload.dict()
        name = data["name"]
        prices = data["prices"]

        if getattr(agent, "db", None):
            agent.db.collection("competitors").document(name).set(prices)

        if hasattr(agent, "mock_data"):
            agent.mock_data[name] = prices

        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

