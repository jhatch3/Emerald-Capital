"""
Consistent data generation for all endpoints
Ensures data matches across vault stats, user stats, portfolio amount, etc.
"""
from datetime import datetime, timedelta
import random

# Fixed seed for reproducibility
random.seed(42)

# Vault constants
TOTAL_VAULT_VALUE_USD = 2847392.45
SOL_PRICE_USD = 150.0  # Current SOL price

# User constants
USER_DEPOSITED_SOL = 25.5
USER_DEPOSITED_USD = USER_DEPOSITED_SOL * SOL_PRICE_USD  # 3825.0

# Calculate vault ownership percentage
VAULT_OWNERSHIP_PERCENT = (USER_DEPOSITED_USD / TOTAL_VAULT_VALUE_USD) * 100
VAULT_SHARES = (USER_DEPOSITED_USD / TOTAL_VAULT_VALUE_USD) * 1000000  # Assuming 1M shares total

# Generate 365 bets with consistent outcomes
TOTAL_BETS = 365
OPEN_BETS_COUNT = 10
CLOSED_BETS_COUNT = TOTAL_BETS - OPEN_BETS_COUNT

# Generate bet outcomes (80% win rate for approved bets)
random.seed(42)  # Reset seed for consistent results
WIN_COUNT = 0
LOSE_COUNT = 0
TOTAL_WIN_AMOUNT = 0.0

# Generate all bets
ALL_BETS = []
BET_OUTCOMES = []  # Store outcomes with dates for portfolio history
BET_DESCRIPTIONS = [
    "Will Trump say tariff",
    "Will BTC hit $100k by March",
    "Will Solana network handle 100k TPS?",
    "Will GDP growth exceed 2% in Q2?",
    "Will Layer 2 solutions process 50% of Ethereum transactions?",
    "Will AI tokens outperform BTC this quarter?",
    "Will S&P 500 hit new all-time high by June?",
    "Will Ethereum ETF be approved?",
    "Will Fed cut rates by 0.5%?",
    "Will inflation drop below 3%?",
    "Will DeFi TVL exceed $200B?",
    "Will NFT trading volume recover?",
    "Will stablecoin market cap grow 20%?",
    "Will crypto regulation pass Congress?",
    "Will Bitcoin halving cause price surge?",
]

# Generate 365 bets over the past year
start_date = datetime.now() - timedelta(days=365)
for i in range(TOTAL_BETS):
    bet_date = start_date + timedelta(days=i)
    bet_id = f"prop-{i+1:03d}"
    
    # 80% approval rate
    is_approved = random.random() < 0.8
    
    if is_approved:
        # 80% win rate for approved bets
        is_win = random.random() < 0.8
        bet_status = "OPEN" if i >= (TOTAL_BETS - OPEN_BETS_COUNT) else "CLOSED"
        
        if bet_status == "CLOSED":
            if is_win:
                WIN_COUNT += 1
                win_amount = random.uniform(100, 500)  # User's share of win
                TOTAL_WIN_AMOUNT += win_amount
                BET_OUTCOMES.append({
                    "date": bet_date,
                    "amount": win_amount,
                    "type": "win"
                })
            else:
                LOSE_COUNT += 1
                loss_amount = random.uniform(50, 200)  # User's share of loss
                TOTAL_WIN_AMOUNT -= loss_amount
                BET_OUTCOMES.append({
                    "date": bet_date,
                    "amount": -loss_amount,
                    "type": "loss"
                })
        else:
            # Open bets - assume they'll win (for now)
            pass
        
        status = "APPROVED"
        bet_result = "WIN" if (bet_status == "CLOSED" and is_win) else ("LOSS" if (bet_status == "CLOSED" and not is_win) else None)
    else:
        status = "REJECTED"
        bet_status = "CLOSED"
        bet_result = None
    
    bet_description = BET_DESCRIPTIONS[i % len(BET_DESCRIPTIONS)]
    vote = "YES" if random.random() < 0.7 else "NO"
    
    ALL_BETS.append({
        "id": bet_id,
        "betDescription": bet_description,
        "status": status,
        "betStatus": bet_status,
        "betResult": bet_result,
        "timestamp": bet_date.isoformat() + "Z",
        "vote": vote,
        "positionSize": f"${random.randint(50000, 300000):,}",
        "riskScore": round(random.uniform(4.0, 9.0), 1),
        "confidence": random.randint(60, 90),
    })

# Calculate user stats
USER_WIN_COUNT = WIN_COUNT
USER_LOSE_COUNT = LOSE_COUNT
USER_TOTAL_BETS = USER_WIN_COUNT + USER_LOSE_COUNT
USER_WIN_RATE = (USER_WIN_COUNT / USER_TOTAL_BETS * 100) if USER_TOTAL_BETS > 0 else 0.0
USER_WIN_AMOUNT = TOTAL_WIN_AMOUNT

# Calculate final portfolio amount based on deposited + earnings
FINAL_PORTFOLIO_AMOUNT = USER_DEPOSITED_USD + USER_WIN_AMOUNT

# Get open bets (last 10 approved bets that are still open)
OPEN_BETS = [bet for bet in ALL_BETS if bet["betStatus"] == "OPEN" and bet["status"] == "APPROVED"][-OPEN_BETS_COUNT:]

# Get closed bets (for positions that have closed)
CLOSED_BETS = [bet for bet in ALL_BETS if bet["betStatus"] == "CLOSED" and bet["status"] == "APPROVED"][-10:]

def generate_portfolio_amount_history(days: int):
    """
    Generate portfolio amount history with realistic market trends.
    1. Starts at USER_DEPOSITED_USD
    2. Ends at FINAL_PORTFOLIO_AMOUNT
    3. Follows basic market trend: up, down, up with realistic volatility
    """
    data = []
    current_amount = USER_DEPOSITED_USD
    start_amount = USER_DEPOSITED_USD
    end_amount = FINAL_PORTFOLIO_AMOUNT
    
    # Calculate overall trend (needed to reach end amount)
    total_growth = end_amount - start_amount
    avg_daily_trend = total_growth / days if days > 0 else 0
    
    # Generate data points with market-like movements
    start_date = datetime.now() - timedelta(days=days)
    trend_direction = 1  # 1 for up, -1 for down
    trend_duration = 0
    trend_length = random.randint(15, 45)  # How long current trend lasts
    
    for i in range(days):
        date = start_date + timedelta(days=i)
        
        # Change trend direction periodically (market cycles)
        if trend_duration >= trend_length:
            trend_direction *= -1  # Flip direction
            trend_length = random.randint(10, 40)  # New trend duration
            trend_duration = 0
        
        trend_duration += 1
        
        # Market movement: combination of trend and volatility
        # Base trend (slight upward bias to reach target)
        trend_component = avg_daily_trend * 0.3  # Small base trend
        
        # Market cycle (up/down movements)
        cycle_component = trend_direction * random.uniform(0.005, 0.02) * current_amount
        
        # Daily volatility (random market fluctuations)
        volatility = random.uniform(-0.015, 0.015) * current_amount
        
        # Combine all components
        daily_change = trend_component + cycle_component + volatility
        current_amount += daily_change
        
        # Ensure amount doesn't go negative and stays reasonable
        current_amount = max(current_amount, start_amount * 0.5)
        current_amount = min(current_amount, end_amount * 1.5)
        
        data.append({
            "date": date.strftime("%b %d, %Y") if days > 30 else date.strftime("%b %d"),
            "amount": round(current_amount, 2)
        })
    
    # Smoothly adjust to end amount (last 10% of data points)
    if len(data) > 10:
        adjustment_start = int(len(data) * 0.9)
        for i in range(adjustment_start, len(data)):
            progress = (i - adjustment_start) / (len(data) - adjustment_start)
            target_amount = start_amount + (total_growth * (i / len(data)))
            current_amount = data[i]["amount"]
            # Gradually move toward target
            data[i]["amount"] = round(current_amount + (target_amount - current_amount) * 0.3, 2)
    
    # Ensure last value matches final amount exactly
    if len(data) > 0:
        data[-1]["amount"] = round(FINAL_PORTFOLIO_AMOUNT, 2)
    
    # Limit to ~200 points for performance
    if len(data) > 200:
        step = len(data) // 200
        data = data[::step]
        # Ensure last point is always included
        if data[-1]["amount"] != round(FINAL_PORTFOLIO_AMOUNT, 2):
            data[-1]["amount"] = round(FINAL_PORTFOLIO_AMOUNT, 2)
    
    return data

def generate_positions():
    """
    Generate current positions from open bets.
    """
    positions = []
    for bet in OPEN_BETS:
        hedge_bet_amount = random.uniform(50000, 300000)
        user_share = (USER_DEPOSITED_USD / TOTAL_VAULT_VALUE_USD) * hedge_bet_amount
        hedge_win_amount = random.uniform(hedge_bet_amount * 0.03, hedge_bet_amount * 0.15)
        user_win_amount = (USER_DEPOSITED_USD / TOTAL_VAULT_VALUE_USD) * hedge_win_amount
        
        # Determine side based on vote (YES = LONG, NO = SHORT)
        side = "LONG" if bet["vote"] == "YES" else "SHORT"
        
        # Generate close date (7-30 days from now)
        close_days = random.randint(7, 30)
        close_date = (datetime.now() + timedelta(days=close_days)).strftime("%b %d, %Y")
        
        positions.append({
            "market": "POLYMARKET",
            "side": side,
            "betDescription": bet["betDescription"],
            "vote": bet["vote"],
            "hedgeBetAmount": f"${hedge_bet_amount:,.2f}",
            "myShare": f"${user_share:.2f}",
            "hedgeWinAmount": f"+${hedge_win_amount:,.2f}",
            "myWinAmount": f"+${user_win_amount:.2f}",
            "closeDate": close_date,
        })
    
    return positions
