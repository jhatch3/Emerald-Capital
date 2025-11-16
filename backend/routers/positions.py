"""
Position-related endpoints
Handles current open trading positions
"""
from fastapi import APIRouter
from schemas.positions import PositionsResponse

router = APIRouter()


@router.get("/current", response_model=PositionsResponse)
async def get_current_positions():
    """
    Get all currently open trading positions.
    """
    from data.consistent_data import generate_positions
    
    return generate_positions()

