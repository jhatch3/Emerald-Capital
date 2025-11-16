"""
User-related endpoints
Handles user profile, personal NAV history, commentary, and deposits
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from datetime import datetime
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
    
    from data.consistent_data import (
        USER_DEPOSITED_SOL, VAULT_OWNERSHIP_PERCENT, VAULT_SHARES
    )
    
    # Calculate days in vault (from deposit date to now)
    deposit_date = datetime(2024, 2, 1)
    days_in_vault = (datetime.now() - deposit_date).days
    
    return {
        "totalDeposited": USER_DEPOSITED_SOL,
        "depositDate": "Feb 1, 2024",
        "daysInVault": days_in_vault,
        "vaultSharePercent": round(VAULT_OWNERSHIP_PERCENT, 2),
        "vaultShares": round(VAULT_SHARES, 4),
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
    Get AI agent summary commentary for the user, summarizing all bets.
    """
    if not wallet:
        raise HTTPException(status_code=400, detail="Wallet address is required")
    
    from data.consistent_data import (
        USER_WIN_COUNT, USER_LOSE_COUNT, USER_TOTAL_BETS, 
        USER_WIN_RATE, USER_WIN_AMOUNT
    )
    
    # Generate commentary based on consistent user stats
    win_loss_text = "wins" if USER_WIN_COUNT == 1 else "wins"
    loss_text = "loss" if USER_LOSE_COUNT == 1 else "losses"
    performance_text = "loss" if USER_WIN_AMOUNT < 0 else "gain"
    amount_text = f"${abs(USER_WIN_AMOUNT):,.2f}"
    
    message = (
        f"Summary of all your bets: You've participated in {USER_TOTAL_BETS} total bets "
        f"with {USER_WIN_COUNT} {win_loss_text} and {USER_LOSE_COUNT} {loss_text}, "
        f"resulting in a {USER_WIN_RATE:.1f}% win rate. "
    )
    
    if USER_WIN_AMOUNT < 0:
        message += (
            f"Your losing bets have resulted in a total loss of {amount_text}. "
            f"Your risk management needs improvement, and you may want to reconsider "
            f"your betting strategy or position sizing."
        )
    else:
        message += (
            f"Your winning bets have generated a total profit of {amount_text}. "
            f"Your risk management has been effective, with well-diversified positions "
            f"across multiple market types and appropriate position sizing."
        )
    
    return {
        "agent": "AI Trading System",
        "timestamp": "Just now",
        "message": message
    }


@router.get("/deposits", response_model=UserDepositsResponse)
async def get_user_deposits(wallet: str = Query(..., description="Wallet address")):
    """
    Get user's deposit history.
    """
    if not wallet:
        raise HTTPException(status_code=400, detail="Wallet address is required")
    
    from data.consistent_data import USER_DEPOSITED_SOL
    
    return [
        {
            "id": "deposit-001",
            "amount": USER_DEPOSITED_SOL,
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

