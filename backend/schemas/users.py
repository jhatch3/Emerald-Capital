"""
Pydantic schemas for user-related endpoints
"""
from pydantic import BaseModel
from typing import List


class UserProfileResponse(BaseModel):
    totalDeposited: float
    depositDate: str
    daysInVault: int
    vaultSharePercent: float
    vaultShares: float
    estimatedYieldPercent: float
    estimatedYieldSOL: float


class NavHistoryPoint(BaseModel):
    date: str
    nav: float


NavHistoryResponse = List[NavHistoryPoint]


class AgentCommentary(BaseModel):
    agent: str
    timestamp: str
    message: str


AgentCommentaryResponse = AgentCommentary


class Deposit(BaseModel):
    id: str
    amount: float
    timestamp: str
    transactionHash: str
    status: str


UserDepositsResponse = List[Deposit]

