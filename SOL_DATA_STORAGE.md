# SOL Data Storage Guide

## Two Types of SOL Data

### 1. **Wallet SOL Balance** (Real-time from Blockchain)
**Location:** `frontend/src/hooks/useSolBalance.ts`

**How it works:**
- Fetches directly from Solana blockchain using `connection.getBalance(publicKey)`
- **NOT hardcoded** - this is real-time data
- Updates every 5 seconds automatically
- Shows the actual SOL in the user's connected wallet

**Code:**
```typescript
const lamports = await connection.getBalance(publicKey);
const solBalance = lamports / LAMPORTS_PER_SOL;
```

---

### 2. **Deposited SOL Amount** (Currently Hardcoded)
**Location:** `backend/routers/users.py`

**Hardcoded Values:**

#### Line 29 - User Profile:
```python
return {
    "totalDeposited": 25.5,  # ← HARDCODED
    "totalDepositedUSD": 2547,
    ...
}
```

#### Line 93 - Deposit History:
```python
return [
    {
        "id": "deposit-001",
        "amount": 25.5,  # ← HARDCODED
        "amountUSD": 2547,
        ...
    }
]
```

#### Line 114 - Deposit Amount Endpoint:
```python
# This calculates from the hardcoded deposits above
deposits_data = await get_user_deposits(wallet=wallet_address)
total_deposited = sum(deposit["amount"] for deposit in deposits_data)
# Returns 25.5 for everyone currently
```

---

## How to Change the Hardcoded Values

### Option 1: Quick Change (Temporary)
Edit `backend/routers/users.py`:

```python
# Line 29 - Change the hardcoded value
"totalDeposited": 50.0,  # Change from 25.5 to 50.0

# Line 93 - Change deposit amount
"amount": 50.0,  # Change from 25.5 to 50.0
```

### Option 2: Make it Dynamic (Recommended)
Store in a database or in-memory dictionary:

```python
# In backend/routers/users.py
# Add at the top of the file
user_deposits = {}  # In-memory storage: {wallet_address: amount}

@router.get("/{wallet_address}/deposit")
async def get_user_deposit_amount(wallet_address: str):
    # Check if user has a deposit
    if wallet_address in user_deposits:
        return {"depositedAmount": user_deposits[wallet_address]}
    return {"depositedAmount": 0.0}

@router.post("/deposit", response_model=DepositResponse)
async def create_deposit(deposit: DepositRequest):
    # Store the deposit
    if deposit.walletAddress not in user_deposits:
        user_deposits[deposit.walletAddress] = 0.0
    user_deposits[deposit.walletAddress] += deposit.amount
    
    return {
        "transactionHash": "5j7s...",
        "status": "pending",
        "message": "Deposit transaction created"
    }
```

### Option 3: Use a Database (Production)
Connect to PostgreSQL/SQLite and store deposits:

```python
# In backend/routers/users.py
from db.database import SessionLocal
from models.users import UserDeposit

@router.get("/{wallet_address}/deposit")
async def get_user_deposit_amount(wallet_address: str):
    db = SessionLocal()
    try:
        deposits = db.query(UserDeposit).filter(
            UserDeposit.wallet_address == wallet_address
        ).all()
        total = sum(dep.amount for dep in deposits)
        return {"depositedAmount": total}
    finally:
        db.close()
```

---

## Current Data Flow

```
User's Wallet (Blockchain)
    ↓
useSolBalance hook
    ↓
Shows real SOL balance in wallet ✅ (Real-time)

Backend API
    ↓
/routers/users.py (Hardcoded)
    ↓
Returns 25.5 SOL for everyone ❌ (Hardcoded)
```

---

## Summary

| Data Type | Location | Hardcoded? | How to Change |
|-----------|----------|------------|---------------|
| **Wallet SOL Balance** | `frontend/src/hooks/useSolBalance.ts` | ❌ No | Real-time from blockchain |
| **Deposited SOL** | `backend/routers/users.py` line 29, 93 | ✅ Yes | Edit the file or use database |

---

## Quick Fix: Change Hardcoded Value

To change the deposited amount everyone sees:

1. Open `backend/routers/users.py`
2. Find line 29: `"totalDeposited": 25.5,`
3. Change to: `"totalDeposited": 100.0,` (or any value)
4. Find line 93: `"amount": 25.5,`
5. Change to: `"amount": 100.0,`
6. Restart backend server

The frontend will now show the new value!

