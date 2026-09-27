from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import FRONTEND_ORIGIN
from .database import Base, engine
from .routers import admin, ai, auth, crops, expert, inventory, knowledge, messaging, notifications, orders, prices, reviews, users, weather

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Agro Connect API", version="1.0.0")

# The frontend sends `credentials: "include"` (for the httpOnly refresh
# cookie), which means the origin here CANNOT be "*" — it must be the exact
# origin the browser is serving the React app from.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(crops.router, prefix=API_PREFIX)
app.include_router(orders.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(inventory.router, prefix=API_PREFIX)
app.include_router(messaging.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(expert.router, prefix=API_PREFIX)
app.include_router(prices.router, prefix=API_PREFIX)
app.include_router(reviews.router, prefix=API_PREFIX)
app.include_router(knowledge.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)
app.include_router(weather.router, prefix=API_PREFIX)


@app.get("/")
def root():
    return {"service": "Agro Connect API", "status": "running", "docs": "/docs"}


@app.get(f"{API_PREFIX}/health")
def health():
    return {"status": "ok"}
