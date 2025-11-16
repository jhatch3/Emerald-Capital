import { Card } from '@/components/ui/card';
import { AgentCard } from '@/components/agents/AgentCard';

// Agent personas - always available in frontend
const AGENT_PERSONAS = [
  {
    id: "fundamental-agent",
    name: "Fundamental Agent",
    role: "Fundamental Analysis & Events",
    avatar: "📈",
    description: "Specializes in logical, factual, and event-based reasoning. Analyzes fundamentals, news events, partnerships, protocol upgrades, and ecosystem developments. Focuses on tokenomics, supply dynamics, user growth, transaction volume, and developer activity. Bases decisions on factual information and logical analysis, ignoring short-term price movements.",
    specialty: "Fundamental Analysis"
  },
  {
    id: "quant-agent",
    name: "Quant Agent",
    role: "Quantitative Analysis & Statistics",
    avatar: "📊",
    description: "Specializes in probability, statistics, and numerical analysis. Uses ONLY numerical data: prices, volumes, returns, volatility, correlations. Applies statistical models like mean reversion, momentum, and volatility clustering. Calculates probabilities and expected values. Uses technical indicators (RSI, MACD, Bollinger Bands) and analyzes volume profiles and market microstructure.",
    specialty: "Quantitative Analysis"
  },
  {
    id: "sentiment-agent",
    name: "Sentiment Agent",
    role: "Social Media & Narrative Analysis",
    avatar: "📰",
    description: "Specializes in social media narrative, momentum, and trend-driven analysis. Analyzes Twitter, Reddit, and Discord sentiment. Tracks narrative shifts, hype cycles, and momentum patterns. Monitors influencer activity, community engagement, and viral potential. Considers market psychology, FOMO/FUD dynamics, and contrarian signals when sentiment is extreme.",
    specialty: "Sentiment Analysis"
  },
  {
    id: "risk-agent",
    name: "Risk Agent",
    role: "Risk Management & Portfolio Protection",
    avatar: "🛡️",
    description: "Conservative, tail-risk-aware agent that prioritizes capital preservation over returns. Limits position sizes to manage portfolio heat. Evaluates correlation with existing positions, sets maximum drawdown limits, and uses conservative position sizing (typically 5-15% of portfolio per position). Rejects high-risk opportunities even if profitable. Considers liquidity, slippage risks, and worst-case scenarios.",
    specialty: "Risk Management"
  },
  {
    id: "strategist-agent",
    name: "Strategist Agent",
    role: "Market Structure & Strategy",
    avatar: "⚡",
    description: "Specializes in market structure, incentives, and inefficiencies. Analyzes market mechanics, identifies arbitrage opportunities, and considers incentive structures and game theory. Evaluates market maker behavior, order flow, funding rates, basis, and derivatives pricing. Identifies market manipulation patterns and strategic positioning opportunities.",
    specialty: "Market Strategy"
  },
];

const Agents = () => {
  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground">
          AI Trading Agents
        </h1>
        <p className="text-muted-foreground text-lg">
          Five specialized agents powering autonomous trading
        </p>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AGENT_PERSONAS.map((agent) => (
          <AgentCard
            key={agent.id}
            name={agent.name}
            role={agent.role}
            avatar={agent.avatar}
            description={agent.description}
            specialty={agent.specialty}
          />
        ))}
      </div>

      {/* System Architecture */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Multi-Agent Architecture</h3>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Our AI trading system employs a multi-agent debate framework where specialized agents with distinct roles analyze market opportunities from different perspectives.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="font-semibold text-foreground mb-2">Consensus Mechanism</h4>
              <p>Agents vote YES/NO on proposals. Majority consensus (3/5) required for execution.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="font-semibold text-foreground mb-2">Risk Management</h4>
              <p>Risk Manager agent has veto power on proposals exceeding portfolio heat thresholds.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="font-semibold text-foreground mb-2">Data Sources</h4>
              <p>Agents pull data from Snowflake data warehouse, on-chain feeds, and sentiment APIs.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h4 className="font-semibold text-foreground mb-2">Transparency</h4>
              <p>All agent reasoning, votes, and data sources recorded on-chain for full auditability.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Agents;
