"""
Pydantic schemas for vault-related endpoints
"""
from pydantic import BaseModel
from typing import List, Optional


class VaultStatsResponse(BaseModel):
    totalValueLocked: float
    winUserCount: int
    loseUserCount: int
    winPercent: float
    vaultSharePrice: float
    userDepositedAmount: Optional[float] = None
    userVaultShares: Optional[float] = None
    userWinCount: Optional[int] = None
    userLoseCount: Optional[int] = None
    userWinRate: Optional[float] = None
    userWinAmount: Optional[float] = None


class NavHistoryPoint(BaseModel):
    date: str
    nav: float


NavHistoryResponse = List[NavHistoryPoint]


class TvlHistoryPoint(BaseModel):
    date: str
    value: float


TvlHistoryResponse = List[TvlHistoryPoint]


class PortfolioAmountPoint(BaseModel):
    date: str
    amount: float


PortfolioAmountResponse = List[PortfolioAmountPoint]


class MarketAllocation(BaseModel):
    market: str
    allocation: int


MarketAllocationResponse = List[MarketAllocation]


class PnlHistogramPoint(BaseModel):
    range: str
    count: int


PnlDistributionResponse = List[PnlHistogramPoint]


class DepositRequest(BaseModel):
    amount: float
    walletAddress: str
    signature: Optional[str] = None


class DepositResponse(BaseModel):
    transactionHash: str
    status: str
    message: str

