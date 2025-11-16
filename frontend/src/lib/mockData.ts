// Mock data for Evergreen Capital

export const userProfile = {
  totalDeposited: 25.5,
  totalDepositedUSD: 2547,
  depositDate: "Feb 1, 2024",
  daysInVault: 18,
  vaultSharePercent: 0.89,
  vaultShares: 23.5234,
  estimatedYieldPercent: 8.47,
  estimatedYieldSOL: 2.16,
  agentCommentary: [
    {
      agent: "Risk Manager",
      timestamp: "2h ago",
      message: "Your position is well-diversified across multiple market types. Current portfolio heat optimal.",
    },
    {
      agent: "Quant Analyst",
      timestamp: "5h ago",
      message: "Recent trades have captured strong momentum moves. Your share value increased 0.8% today.",
    },
    {
      agent: "News Analyst",
      timestamp: "1d ago",
      message: "Positive sentiment shifts benefiting your positions. Ecosystem growth driving organic returns.",
    },
  ],
};

export const vaultStats = {
  totalValueLocked: 2847392.45,
  numberOfDepositors: 1247,
  strategyWinRate: 73.4,
  pnl24h: 14293.67,
  vaultSharePrice: 1.0847,
  userDepositedAmount: 0,
  userVaultShares: 0,
};

export const tvlHistory = [
  { date: "Jan 1", value: 1200000 },
  { date: "Jan 8", value: 1450000 },
  { date: "Jan 15", value: 1680000 },
  { date: "Jan 22", value: 1920000 },
  { date: "Jan 29", value: 2150000 },
  { date: "Feb 5", value: 2380000 },
  { date: "Feb 12", value: 2620000 },
  { date: "Feb 19", value: 2847392 },
];

export const navHistory = [
  { date: "Jan 1", nav: 1.0000 },
  { date: "Jan 8", nav: 1.0124 },
  { date: "Jan 15", nav: 1.0287 },
  { date: "Jan 22", nav: 1.0456 },
  { date: "Jan 29", nav: 1.0589 },
  { date: "Feb 5", nav: 1.0712 },
  { date: "Feb 12", nav: 1.0798 },
  { date: "Feb 19", nav: 1.0847 },
];

export const marketAllocations = [
  { market: "Perps", allocation: 42 },
  { market: "Spot", allocation: 28 },
  { market: "Options", allocation: 18 },
  { market: "Liquid Staking", allocation: 12 },
];

export const pnlHistogram = [
  { range: "-5%", count: 3 },
  { range: "-2%", count: 8 },
  { range: "0%", count: 15 },
  { range: "+2%", count: 28 },
  { range: "+5%", count: 34 },
  { range: "+8%", count: 19 },
  { range: "+10%", count: 7 },
];

export const currentPositions = [
  {
    market: "SOL-PERP",
    side: "LONG",
    size: "$142,340",
    entryPrice: "$98.45",
    currentPrice: "$102.34",
    pnl: "+3.95%",
    pnlValue: "+$5,622",
  },
  {
    market: "JTO-PERP",
    side: "SHORT",
    size: "$87,230",
    entryPrice: "$3.12",
    currentPrice: "$2.98",
    pnl: "+4.49%",
    pnlValue: "+$3,916",
  },
  {
    market: "BONK-SPOT",
    side: "LONG",
    size: "$54,120",
    entryPrice: "$0.000023",
    currentPrice: "$0.000025",
    pnl: "+8.70%",
    pnlValue: "+$4,708",
  },
  {
    market: "RAY-PERP",
    side: "LONG",
    size: "$98,450",
    entryPrice: "$1.87",
    currentPrice: "$1.92",
    pnl: "+2.67%",
    pnlValue: "+$2,628",
  },
];

export const aiProposals = [
  {
    id: "prop-001",
    market: "SOL-PERP",
    direction: "LONG" as const,
    positionSize: "$150,000",
    riskScore: 6.2,
    confidence: 82,
    status: "APPROVED" as const,
    summary: "Strong bullish momentum detected on SOL with high volume inflows and positive funding rates. Technical indicators show breakout above key resistance.",
    timestamp: "2024-02-19T14:32:00Z",
    reasoning: [
      {
        agent: "Quant Analyst",
        vote: "YES" as const,
        rationale: "Bollinger bands squeezing with RSI at 68. Volume profile suggests accumulation phase complete.",
      },
      {
        agent: "Risk Manager",
        vote: "YES" as const,
        rationale: "Portfolio heat at 42%, sufficient room for $150k position. Max drawdown acceptable at current volatility.",
      },
      {
        agent: "Market Maker",
        vote: "YES" as const,
        rationale: "Spread tightening indicates strong buyer interest. Order book depth supports large entry without significant slippage.",
      },
      {
        agent: "News Analyst",
        vote: "YES" as const,
        rationale: "Positive sentiment from recent Solana ecosystem announcements. No negative catalysts in 48h window.",
      },
      {
        agent: "Arbitrage Analyst",
        vote: "NO" as const,
        rationale: "Funding rate differential suggests potential for short-term correction. Recommend waiting for pullback.",
      },
    ],
    dataSources: [
      "https://snowflake.mock/sol-price-data",
      "https://snowflake.mock/volume-analysis",
      "https://snowflake.mock/sentiment-feed",
    ],
  },
  {
    id: "prop-002",
    market: "JTO-PERP",
    direction: "SHORT" as const,
    positionSize: "$90,000",
    riskScore: 7.8,
    confidence: 71,
    status: "PENDING" as const,
    summary: "Overbought conditions on JTO with decreasing volume. Technical resistance at $3.20 likely to hold based on historical patterns.",
    timestamp: "2024-02-19T16:45:00Z",
    reasoning: [
      {
        agent: "Quant Analyst",
        vote: "YES" as const,
        rationale: "RSI divergence forming on 4h timeframe. Stochastic overbought with bearish cross imminent.",
      },
      {
        agent: "Risk Manager",
        vote: "NO" as const,
        rationale: "Correlation risk with existing SOL long position too high. Recommend reducing overall leverage first.",
      },
      {
        agent: "Market Maker",
        vote: "YES" as const,
        rationale: "Bid-ask spread widening significantly. Indicates weakness and potential for quick downturn.",
      },
      {
        agent: "News Analyst",
        vote: "YES" as const,
        rationale: "Token unlock scheduled in 72 hours may create selling pressure. Short positioning optimal timing.",
      },
      {
        agent: "Arbitrage Analyst",
        vote: "YES" as const,
        rationale: "Perp-spot basis elevated. Mean reversion trade setup with favorable risk-reward.",
      },
    ],
    dataSources: [
      "https://snowflake.mock/jto-technicals",
      "https://snowflake.mock/unlock-schedule",
      "https://snowflake.mock/basis-tracking",
    ],
  },
];

export const agentPersonas = [
  {
    id: "quant-analyst",
    name: "Quant Analyst",
    role: "Technical Analysis & Indicators",
    avatar: "📊",
    description: "Analyzes price action, volume profiles, and technical indicators using quantitative models. Specializes in momentum detection and pattern recognition.",
    specialty: "Technical Analysis",
    winRate: 76.3,
  },
  {
    id: "risk-manager",
    name: "Risk Manager",
    role: "Portfolio Risk & Exposure",
    avatar: "🛡️",
    description: "Monitors portfolio heat, correlation risk, and maximum drawdown. Ensures positions stay within risk parameters and leverage limits.",
    specialty: "Risk Management",
    winRate: 84.1,
  },
  {
    id: "market-maker",
    name: "Market Maker",
    role: "Liquidity & Order Flow",
    avatar: "💧",
    description: "Tracks order book depth, spread dynamics, and liquidity conditions. Identifies optimal entry and exit points based on market microstructure.",
    specialty: "Market Microstructure",
    winRate: 71.8,
  },
  {
    id: "news-analyst",
    name: "News Analyst",
    role: "Sentiment & Events",
    avatar: "📰",
    description: "Monitors social sentiment, news catalysts, and upcoming events. Correlates narrative shifts with price movements and volatility.",
    specialty: "Sentiment Analysis",
    winRate: 68.4,
  },
  {
    id: "arbitrage-analyst",
    name: "Arbitrage Analyst",
    role: "Cross-Market Opportunities",
    avatar: "⚡",
    description: "Identifies pricing inefficiencies across venues and derivatives. Executes statistical arbitrage and basis trades.",
    specialty: "Statistical Arbitrage",
    winRate: 79.2,
  },
];

export const debateTranscript = {
  proposalId: "prop-001",
  messages: [
    {
      agent: "Quant Analyst",
      message: "SOL showing strong technical setup. Bollinger squeeze complete, RSI confirming momentum shift. Volume accumulation phase finished - we're ready for expansion.",
      timestamp: "14:28:33",
      vote: "YES" as const,
    },
    {
      agent: "Risk Manager",
      message: "Portfolio heat check: currently at 42%. Adding $150k SOL long brings us to 58% - still within our 75% threshold. Correlation with existing positions manageable.",
      timestamp: "14:29:01",
      vote: "YES" as const,
    },
    {
      agent: "Arbitrage Analyst",
      message: "Wait - funding rate differential between perps and spot concerning. We're looking at 0.08% premium which historically precedes short-term pullbacks. Suggest we wait for funding to normalize.",
      timestamp: "14:29:45",
      vote: "NO" as const,
    },
    {
      agent: "Market Maker",
      message: "Order book analysis disagrees with arbitrage concern. Depth profile excellent on both sides. Large buy walls at $97.50 provide strong support. Entry at current levels offers good fill quality.",
      timestamp: "14:30:22",
      vote: "YES" as const,
    },
    {
      agent: "News Analyst",
      message: "Sentiment backdrop extremely positive. Solana ecosystem announcement yesterday driving organic interest. Social volume up 340% with 89% positive sentiment. No bearish catalysts on horizon.",
      timestamp: "14:31:08",
      vote: "YES" as const,
    },
    {
      agent: "Arbitrage Analyst",
      message: "Acknowledged on the buy walls. My concern is more about optimal timing. Perhaps we split the entry - take $75k now, scale into remaining $75k if funding normalizes?",
      timestamp: "14:31:52",
      vote: "NO" as const,
    },
    {
      agent: "Risk Manager",
      message: "Splitting entry makes sense from risk perspective. Reduces execution risk and allows us to capture better average if pullback occurs. But technicals suggest we might miss the move.",
      timestamp: "14:32:19",
      vote: "YES" as const,
    },
    {
      agent: "Quant Analyst",
      message: "Technical window closing fast. Breakout confirmation in next 4-6 hours. Full position now maximizes expected value based on historical similar setups. Win rate: 78% in these conditions.",
      timestamp: "14:32:47",
      vote: "YES" as const,
    },
  ],
};

export const dailyReports = [
  {
    date: "2024-02-19",
    pnl: "+14,293.67",
    pnlPercent: "+0.52%",
    trades: 7,
    winRate: 71.4,
    keyTrades: [
      "Opened SOL-PERP LONG $142k @ $98.45",
      "Closed BONK-SPOT LONG $54k @ $0.000025 (+8.7%)",
      "Opened JTO-PERP SHORT $87k @ $3.12",
    ],
    agentNotes: "Strong risk-adjusted returns today. Quant Analyst's SOL momentum call highly profitable. Market Maker identified excellent entry on BONK. Portfolio heat well-managed at 58%.",
    ipfsReport: "ipfs://QmX7Ry4KjQz8hN3vM2wP9sA1bT5cU6dE8fG9hI0jK1lM2n",
  },
  {
    date: "2024-02-18",
    pnl: "+8,127.34",
    pnlPercent: "+0.29%",
    trades: 5,
    winRate: 80.0,
    keyTrades: [
      "Closed RAY-PERP LONG $98k @ $1.92 (+2.67%)",
      "Opened BONK-SPOT LONG $54k @ $0.000023",
      "Closed WIF-PERP SHORT $34k @ $0.87 (+5.2%)",
    ],
    agentNotes: "Consistent execution across multiple markets. News Analyst correctly predicted token sentiment shifts. Risk Manager kept drawdown minimal during intraday volatility.",
    ipfsReport: "ipfs://QmY8Sz5LkRz9iO4wN3xQ0rB2cV7dF9gI1kL3mN4oP5qR6s",
  },
  {
    date: "2024-02-17",
    pnl: "-3,492.12",
    pnlPercent: "-0.12%",
    trades: 6,
    winRate: 50.0,
    keyTrades: [
      "Stopped out SOL-PERP LONG $120k @ $94.20 (-2.1%)",
      "Closed JUP-PERP LONG $67k @ $1.34 (+1.8%)",
      "Closed ORCA-SPOT LONG $43k @ $4.12 (+0.9%)",
    ],
    agentNotes: "Minor drawdown day. SOL position stopped out correctly per risk parameters. Quant Analyst's oscillator gave false signal - recalibrating models. Overall risk management performed well.",
    ipfsReport: "ipfs://QmZ9Ta6MlSa0jP5xO4yR1sC3dW8eG0hJ2lM4nO5pQ6rS7t",
  },
  {
    date: "2024-02-16",
    pnl: "+22,847.91",
    pnlPercent: "+0.83%",
    trades: 8,
    winRate: 87.5,
    keyTrades: [
      "Closed PYTH-PERP LONG $156k @ $0.68 (+12.4%)",
      "Opened RAY-PERP LONG $98k @ $1.87",
      "Closed SOL-SPOT LONG $234k @ $101.20 (+4.3%)",
    ],
    agentNotes: "Exceptional day driven by PYTH momentum trade. Arbitrage Analyst identified perp-spot mispricing perfectly. News Analyst's ecosystem narrative call highly accurate. Strong cross-agent consensus.",
    ipfsReport: "ipfs://QmA0Ub7NmTb1kQ6yP5zS2tD4eX9fH1iK3mN5oP6qR7sT8u",
  },
  {
    date: "2024-02-15",
    pnl: "+11,673.28",
    pnlPercent: "+0.43%",
    trades: 7,
    winRate: 71.4,
    keyTrades: [
      "Opened PYTH-PERP LONG $156k @ $0.605",
      "Closed RNDR-PERP LONG $89k @ $9.34 (+3.8%)",
      "Opened SOL-SPOT LONG $234k @ $96.98",
    ],
    agentNotes: "Solid performance with multiple profitable exits. Market Maker execution excellent on PYTH entry. Quant Analyst's RNDR exit timing precise. Building SOL spot position strategically.",
    ipfsReport: "ipfs://QmB1Vc8OmUc2lR7zQ6aT3uE5fY0gI2jL4nO6pQ7rS8tU9v",
  },
];
