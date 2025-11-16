# Evergreen Capital - AI-Powered Decentralized Hedge Fund

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.9+
- **Git**

### Installation & Running

#### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: **http://localhost:8080**

#### 2. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```
Backend API runs on: **http://localhost:8000**

### Environment Variables

**Frontend** (`frontend/.env`):
```
VITE_API_BASE_URL=http://localhost:8000
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

**Backend** (`backend/.env`):
```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## 📦 Requirements

### Frontend Dependencies
See `frontend/package.json` - install with `npm install`

### Backend Dependencies
See `backend/requirements.txt`:
```
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.2
python-dotenv==1.0.1
```

Install with:
```bash
cd backend
pip install -r requirements.txt
```

## 🌐 Deploy to Vercel

### Frontend Deployment
```bash
cd frontend
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `VITE_API_BASE_URL`
- `VITE_SOLANA_RPC_URL` (optional)

### Backend Deployment
Deploy separately to Railway, Render, or similar:
- Root directory: `backend/`
- Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Install: `pip install -r requirements.txt`
