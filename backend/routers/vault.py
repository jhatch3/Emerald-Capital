"""
Vault-related endpoints
Handles vault statistics, NAV, TVL, allocations, and deposits
"""
from fastapi import APIRouter, Query
from typing import Optional
from schemas.vault import (
    VaultStatsResponse,
    NavHistoryResponse,
    TvlHistoryResponse,
    PortfolioAmountResponse,
    MarketAllocationResponse,
    DepositRequest,
    DepositResponse
)

router = APIRouter()


@router.get("/stats", response_model=VaultStatsResponse)
async def get_vault_stats(wallet: Optional[str] = Query(None)):
    """
    Get vault-wide statistics.
    If wallet address is provided, includes user-specific data.
    """
    from data.consistent_data import (
        TOTAL_VAULT_VALUE_USD, USER_DEPOSITED_USD, USER_WIN_COUNT, USER_LOSE_COUNT, 
        USER_WIN_RATE, USER_WIN_AMOUNT, VAULT_OWNERSHIP_PERCENT, VAULT_SHARES
    )
    
    stats = {
        "totalValueLocked": TOTAL_VAULT_VALUE_USD,
        "winUserCount": 912,
        "loseUserCount": 335,
        "winPercent": 73.1,
        "vaultSharePrice": 1.0847,
    }
    
    if wallet:
        # Use consistent user data
        stats["userDepositedAmount"] = USER_DEPOSITED_USD
        stats["userVaultShares"] = round(VAULT_SHARES, 4)
        stats["userWinCount"] = USER_WIN_COUNT
        stats["userLoseCount"] = USER_LOSE_COUNT
        stats["userWinRate"] = USER_WIN_RATE
        stats["userWinAmount"] = USER_WIN_AMOUNT
    
    return stats


@router.get("/nav/history", response_model=NavHistoryResponse)
async def get_nav_history(days: int = Query(30, ge=1, le=365)):
    """
    Get NAV (Net Asset Value) history over time.
    """
    # TODO: Replace with real database query
    # Example: SELECT date, nav FROM nav_history WHERE date >= NOW() - INTERVAL '{days} days'
    return [
        {"date": "Jan 1", "nav": 1.0000},
        {"date": "Jan 8", "nav": 1.0124},
        {"date": "Jan 15", "nav": 1.0287},
    ]


@router.get("/tvl/history", response_model=TvlHistoryResponse)
async def get_tvl_history(days: int = Query(30, ge=1, le=1095)):
    """
    Get Total Value Locked (TVL) history over time.
    """
    # TODO: Replace with real database query
    from datetime import datetime, timedelta
    import random
    
    # Generate data points for the requested days
    data = []
    base_value = 2500000.0
    random.seed(42)  # For consistent data
    
    for i in range(days):
        date = datetime.now() - timedelta(days=days - i - 1)
        # Generate realistic TVL with some volatility
        change = random.uniform(-0.02, 0.03)
        base_value *= (1 + change)
        data.append({
            "date": date.strftime("%b %d, %Y") if days > 30 else date.strftime("%b %d"),
            "value": round(base_value, 2)
        })
    
    # Limit to ~200 points for performance
    if len(data) > 200:
        step = len(data) // 200
        data = data[::step]
    
    return data


@router.get("/portfolio/amount", response_model=PortfolioAmountResponse)
async def get_portfolio_amount_history(days: int = Query(30, ge=1, le=1095)):
    """
    Get portfolio amount history over time.
    Uses consistent data that matches user stats.
    """
    from data.consistent_data import generate_portfolio_amount_history
    return generate_portfolio_amount_history(days)


@router.get("/allocations", response_model=MarketAllocationResponse)
async def get_market_allocations():
    """
    Get current allocation breakdown by market type.
    """
    # TODO: Replace with real database query
    return [
        {"market": "Perps", "allocation": 42},
        {"market": "Spot", "allocation": 28},
        {"market": "Options", "allocation": 18},
        {"market": "Liquid Staking", "allocation": 12},
    ]


@router.post("/deposit", response_model=DepositResponse)
async def create_deposit(deposit: DepositRequest):
    """
    Create a new deposit transaction.
    """
    # TODO: Implement deposit logic
    # 1. Verify wallet signature
    # 2. Create transaction
    # 3. Store in database
    # 4. Return transaction hash
    
    return {
        "transactionHash": "5j7s...",
        "status": "pending",
        "message": "Deposit transaction created"
    }

