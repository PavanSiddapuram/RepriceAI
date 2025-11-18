RepriceAI — AI-Powered Dynamic Pricing Engine for Real-World Retail
Smart. Real-time. Precision-driven pricing for fresh grocery items.

RepriceAI is a full-stack AI application that predicts the optimal selling price for perishable retail items (like tomatoes, onions, milk, apples, etc.) based on:

Cost price

Current stock levels

Expiry days

Demand score (1–10)

Competitor prices (Zepto, Blinkit, Amazon)

Pricing strategy (Aggressive / Balanced / Conservative)

Built for real-world retail with support for:
🔥 Price optimization
🔥 Urgency scoring
🔥 Competitor-aware adjustments
🔥 Spoilage risk handling
🔥 Discount decisioning

🚀 Live Demo Links
Component	URL
Frontend (Firebase Hosting)	https://repriceai-2025.web.app
Backend (Cloud Run)	https://repriceai-backend-10825411436.asia-south1.run.app
🧠 Tech Stack
Backend

Python FastAPI

Firestore

Google Gemini (Generative AI)

Cloud Run (Dockerized deployment)

Frontend

React + TypeScript

Vite

TailwindCSS

Axios

DevOps & Infra

Firebase Hosting

Google Cloud Run

IAM-secured Service Accounts

Firestore Native Mode

📦 Project Structure
RepriceAI/
├── backend/
│   ├── agent.py
│   ├── server.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── index.css
│   └── vite.config.ts
│
├── scripts/
│   └── upload_products.py
│   └── mock_data.json
│
└── README.md

🔥 Core Features
✓ AI-generated price recommendation

Gemini + rule-based logic gives a final price that is:

Sell-through optimized

Competitor aware

Expiry-sensitive

✓ Urgency Score

Low / Medium / High urgency based on expiry, stock & demand.

✓ Dynamic Pricing Strategies
Strategy	Behaviour
Aggressive	Drop prices to clear stock fast
Balanced	Mix of margin + sell-through
Conservative	Maintain margin, reduce discounts
✓ Firestore Competitor Data

Competitor prices stored in:
products/<productName>

Updated via script:
scripts/upload_products.py

🧪 API Example
POST /recommend-price

Request

{
  "product": "Tomato",
  "cost": 26,
  "stock_left": 10,
  "expiry_days": 3,
  "demand_score": 6,
  "strategy": "balanced"
}


Response

{
  "recommended_price": 41.2,
  "discount_percent": 3,
  "urgency": "Low",
  "reasoning": "..."
}

☁️ Deployment Overview
Backend Deployment (Cloud Run)
gcloud builds submit --tag gcr.io/repriceai-2025/repriceai-backend
gcloud run deploy repriceai-backend --image gcr.io/repriceai-2025/repriceai-backend --region asia-south1 --allow-unauthenticated

Frontend Deployment (Firebase)
npm run build
firebase deploy

⭐ Future Enhancements

Admin Dashboard (Competitor auto-update)

Historical price trends

Inventory auto-sync

Elastic Search-like search API with Firestore Indexes

Wholesale vs Retail mode

🧑‍💻 Author

Pavan Siddapuram
AI Dev • Builder • Future-Focused Engineer 🚀
