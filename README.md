# Evergreen Capital

An AI-powered decentralized prediction hedge fund built on Solana, integrating Polymarket bets with multi-agent AI governance.

## 🚀 Overview

Evergreen Capital is a decentralized hedge fund that uses AI agents to analyze and trade on Polymarket prediction markets. Users deposit SOL into a vault, and AI agents propose trades based on market analysis. The community votes on proposals, and approved trades are executed automatically.

## ✨ Features

- **Multi-Agent AI System**: Five specialized AI agents (Quant Analyst, Risk Manager, Market Maker, News Analyst, Arbitrage Analyst) analyze markets and vote on proposals
- **Polymarket Integration**: Real-time bet data and execution on Polymarket prediction markets
- **Solana Vault**: Deposit SOL and receive vault shares, track portfolio performance
- **Governance Layer**: Community voting on AI-generated trade proposals
- **Real-time Dashboard**: Track portfolio, positions, analytics, and agent debates
- **Snowflake Data Warehouse**: (Planned) Historical data, analytics, and feature store

## 🛠️ Tech Stack

### Frontend
- **React** + **TypeScript** + **Vite**
- **TailwindCSS** + **shadcn/ui** for styling
- **Solana Wallet Adapter** for wallet connectivity
- **Recharts** for data visualization
- **React Router** for navigation

### Backend
- **FastAPI** (Python) for REST API
- **Pydantic** for data validation
- **Uvicorn** as ASGI server

### AI Agents
- **TypeScript** agent engine
- **Google Gemini** for AI analysis (planned)
- Multi-agent consensus system

### Blockchain
- **Solana** (Anchor framework)
- Programs: Vault, Governance, Reporting

### Database
- **Snowflake** (planned) for data warehouse
- Mock data generation for development

## 📁 Project Structure

```
quack/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # API client and utilities
│   │   └── hooks/         # Custom React hooks
│   └── package.json
│
├── backend/               # FastAPI backend
│   ├── app/
│   │   └── main.py        # FastAPI application entry point
│   ├── routers/           # API route handlers
│   ├── schemas/           # Pydantic data models
│   ├── data/              # Mock data generation
│   └── agent_engine/      # AI agent system (TypeScript)
│
├── solana/                # Solana smart contracts
│   └── programs/          # Anchor programs
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.10+
- **Solana CLI** (for smart contract development)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jhatch3/Emerald-Capital.git
   cd quack
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

### Environment Variables

Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=your-rpc-url
```

Create a `.env` file in the `backend` directory (if needed):
```env
SNOWFLAKE_ACCOUNT=your-account
SNOWFLAKE_USER=your-user
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_WAREHOUSE=your-warehouse
SNOWFLAKE_DATABASE=QUACK_PROD
```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   uvicorn app.main:app --port 8000 --reload
   ```
   The API will be available at `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`
   - Random Bet Endpoint: `http://localhost:8000/api/governance/random-bet`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:8080`

## 📡 API Endpoints

### Governance
- `GET /api/governance/proposals` - Get all proposals
- `GET /api/governance/proposals/{id}` - Get proposal details
- `GET /api/governance/random-bet` - Get random Polymarket bet
- `GET /api/governance/proposals/{id}/reasoning` - Get agent reasoning
- `POST /api/governance/proposals/{id}/vote` - Vote on proposal

### Vault
- `GET /api/vault/stats` - Get vault statistics
- `GET /api/vault/portfolio/amount` - Get portfolio amount history
- `GET /api/vault/nav/history` - Get NAV history

### Users
- `GET /api/users/{wallet}/profile` - Get user profile
- `GET /api/users/{wallet}/deposit` - Get user deposits
- `GET /api/users/{wallet}/commentary` - Get AI commentary

### Positions
- `GET /api/positions/current` - Get current open positions

### Agents
- `GET /api/agents` - Get all agent personas
- `GET /api/agents/{id}/debate` - Get agent debate transcript

## 🎯 Key Features

### Dashboard
- SOL balance display
- Portfolio amount tracking with interactive charts
- Performance metrics (Volatility, Sharpe Ratio, Max Drawdown, Total Return)
- Win/Loss statistics
- Open positions table
- AI trading summary

### Governance
- View all proposals/bets
- See agent debates and reasoning
- Vote on proposals
- Track bet status (OPEN/CLOSED) and results (WIN/LOSS)
- Link to Polymarket bets

### Vault
- Deposit tracking
- Vault ownership percentage
- Total vault value
- Portfolio performance charts
- Analytics and metrics

### Agents
- View all AI agent personas
- See agent specialties and descriptions
- Track agent performance

## 🗄️ Database Schema (Snowflake)

The project is designed to use Snowflake with the following structure:

- **USERS Schema**: User accounts, deposits, portfolio history
- **VAULT Schema**: Vault stats, NAV history, TVL history
- **GOVERNANCE Schema**: Proposals, votes, agent reasoning, debates
- **POSITIONS Schema**: Open and closed trading positions
- **AGENTS Schema**: Agent personas and decisions
- **MARKET_DATA Schema**: Polymarket events and prices
- **ANALYTICS Schema**: Performance metrics and reporting

See the database design documentation for detailed schema information.

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Style
- Frontend: ESLint + Prettier
- Backend: Black + flake8

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **GitHub**: https://github.com/jhatch3/Emerald-Capital
- **Polymarket**: https://polymarket.com
- **Solana**: https://solana.com

## 🙏 Acknowledgments

- Solana Foundation
- Polymarket
- shadcn/ui for UI components
- The open-source community

---

Built with ❤️ by the Evergreen Capital team
