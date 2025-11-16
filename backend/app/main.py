"""
Main FastAPI application entry point.
This file should only contain app setup and router registration.
All endpoints should be organized in separate router files.
"""
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(vault.router, prefix="/api/vault", tags=["vault"])
app.include_router(users.router, prefix="/api/user", tags=["user"])
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



