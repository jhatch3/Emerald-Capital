"""
Pydantic schemas for position-related endpoints
"""
from pydantic import BaseModel
from typing import List, Literal, Optional


class Position(BaseModel):
    market: str
    side: Literal["LONG", "SHORT"]
    betDescription: str
    vote: str  # YES or NO
    hedgeBetAmount: str  # Vault amount bet
    myShare: str  # Portfolio amount bet
    hedgeWinAmount: Optional[str] = None  # Vault amount won if bet passes
    myWinAmount: Optional[str] = None  # Portfolio amount won if bet passes
    closeDate: Optional[str] = None  # Close date for the bet


PositionsResponse = List[Position]

