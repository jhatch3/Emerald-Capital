"""
Main FastAPI application entry point.
This file should only contain app setup and router registration.
All endpoints should be organized in separate router files.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from routers import vault, users, positions, governance, agents, reports, agentDecision

app = FastAPI(
    title="Quack API",
    description="API for Solana AI Hedge Syndicate",
    version="1.0.0"
)

# CORS Configuration
# Allow both localhost and Railway deployment URLs
allowed_origins = [
    "http://localhost:8080",
    "http://localhost:3000",
]

# Get Railway deployment URLs from environment
railway_public_domain = os.getenv("RAILWAY_PUBLIC_DOMAIN")
railway_static_url = os.getenv("RAILWAY_STATIC_URL")

if railway_public_domain:
    allowed_origins.append(f"https://{railway_public_domain}")
if railway_static_url:
    allowed_origins.append(railway_static_url)

# Allow Railway URLs pattern
# Railway services get *.up.railway.app domains
railway_env = os.getenv("RAILWAY_ENVIRONMENT")
if railway_env:
    # Allow all Railway domains
    allowed_origins.extend([
        "https://*.up.railway.app",
        "http://*.up.railway.app",
    ])
    # Also allow all origins in Railway (can be restricted for production)
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(vault.router, prefix="/api/vault", tags=["vault"])
app.include_router(users.router, prefix="/api/user", tags=["user"])
# Also register users router with /api/users for frontend compatibility
app.include_router(users.router, prefix="/api/users", tags=["user"])
app.include_router(positions.router, prefix="/api/positions", tags=["positions"])
app.include_router(governance.router, prefix="/api/governance", tags=["governance"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(agentDecision.router, prefix="/api/agents", tags=["agents"])


@app.get("/")
async def root():
    return {"message": "Quack API is running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}



