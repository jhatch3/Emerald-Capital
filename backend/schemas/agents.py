"""
Pydantic schemas for agent-related endpoints
"""
from pydantic import BaseModel
from typing import List, Literal, Optional


class AgentPersona(BaseModel):
    id: str
    name: str
    role: str
    avatar: str
    description: str
    specialty: str


AgentsResponse = List[AgentPersona]


class DebateMessage(BaseModel):
    agent: str
    message: str
    timestamp: str
    vote: Literal["YES", "NO"]


class DebateTranscriptResponse(BaseModel):
    proposalId: Optional[str] = None
    messages: List[DebateMessage]

