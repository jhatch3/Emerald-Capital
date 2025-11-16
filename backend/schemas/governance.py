"""
Pydantic schemas for governance-related endpoints
"""
from pydantic import BaseModel
from typing import List, Literal, Optional


class Proposal(BaseModel):
    id: str
    market: str
    direction: Literal["LONG", "SHORT"]
    positionSize: str
    riskScore: float
    confidence: int
    status: Literal["PENDING", "APPROVED", "REJECTED", "EXECUTED"]
    summary: str
    timestamp: str
    dataSources: List[str]
    betStatus: Literal["OPEN", "CLOSED"]
    betResult: Optional[Literal["WIN", "LOSS"]] = None
    closedAt: Optional[str] = None
    vote: Literal["YES", "NO"]  # Bet side (YES/NO)


ProposalsResponse = List[Proposal]


class ProposalResponse(Proposal):
    pass


class AgentReasoning(BaseModel):
    agent: str
    vote: Literal["YES", "NO"]
    rationale: str


ProposalReasoningResponse = List[AgentReasoning]


class VoteRequest(BaseModel):
    vote: Literal["YES", "NO"]
    walletAddress: str
    signature: Optional[str] = None


class VoteResponse(BaseModel):
    success: bool
    message: str
    voteId: Optional[str] = None

