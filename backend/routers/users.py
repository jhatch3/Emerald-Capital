"""
User-related endpoints
Handles user profile, personal NAV history, commentary, and deposits
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from schemas.users import (
    UserProfileResponse,
    NavHistoryResponse,
    AgentCommentaryResponse,
    UserDepositsResponse
)

router = APIRouter()


@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(wallet: str = Query(..., description="Wallet address")):
    """
    Get user-specific profile data.
    """
    if not wallet:
        raise HTTPException(status_code=400, detail="Wallet address is required")
    
    # TODO: Replace with real database query
    # Example: SELECT * FROM user_profiles WHERE wallet_address = wallet
    
    return {
        "totalDeposited": 25.5,
        "depositDate": "Feb 1, 2024",
        "daysInVault": 18,
        "vaultSharePercent": 0.89,
        "vaultShares": 23.5234,
        "estimatedYieldPercent": 8.47,
        "estimatedYieldSOL": 2.16,
    }


@router.get("/nav/history", response_model=NavHistoryResponse)
async def get_user_nav_history(
    wallet: str = Query(..., description="Wallet address"),
    days: int = Query(30, ge=1, le=365)
):
    """
    Get user's personal NAV history.
    """
    if not wallet:
        raise HTTPException(status_code=400, detail="Wallet address is required")
    
    # TODO: Replace with real database query
    return [
        {"date": "Jan 1", "nav": 1.0000},
        {"date": "Jan 8", "nav": 1.0124},
    ]


@router.get("/commentary", response_model=AgentCommentaryResponse)
async def get_user_commentary(wallet: str = Query(..., description="Wallet address")):
    """
    Get AI agent commentary for the user.
    """
    if not wallet:
        raise HTTPException(status_code=400, detail="Wallet address is required")
    
    # TODO: Replace with real database query
    return [
        {
            "agent": "Risk Manager",
            "timestamp": "2h ago",
            "message": "Your position is well-diversified across multiple market types."
        },
        {
            "agent": "Quant Analyst",
            "timestamp": "5h ago",
            "message": "Recent trades have captured strong momentum moves."
        },
    ]


@router.get("/deposits", response_model=UserDepositsResponse)
async def get_user_deposits(wallet: str = Query(..., description="Wallet address")):
    """
    Get user's deposit history.
    """
    if not wallet:
        raise HTTPException(status_code=400, detail="Wallet address is required")
    
    # TODO: Replace with real database query
    return [
        {
            "id": "deposit-001",
            "amount": 25.5,
            "timestamp": "2024-02-01T10:00:00Z",
            "transactionHash": "5j7s...",
            "status": "confirmed"
        }
    ]


# Additional endpoint for frontend compatibility
@router.get("/{wallet_address}/deposit")
async def get_user_deposit_amount(wallet_address: str):
    """
    Get user's total deposited amount (for frontend compatibility).
    Returns just the depositedAmount value.
    This endpoint matches the frontend's expected path: /api/users/{wallet}/deposit
    """
    # TODO: Replace with real database query
    # For now, calculate from mock deposits
    # In production, query database directly for total deposited amount
    deposits_data = await get_user_deposits(wallet=wallet_address)
    total_deposited = sum(deposit["amount"] for deposit in deposits_data) if deposits_data else 0.0
    
    return {
        "depositedAmount": total_deposited
    }

