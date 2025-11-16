import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  fetchProposals,
  fetchDebateTranscript,
  type Proposal,
  type DebateTranscript
} from '@/lib/api';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

// Hardcoded default proposals - always displayed
const DEFAULT_PROPOSALS: Proposal[] = [
  {
    id: "prop-default-001",
    market: "Will Bitcoin reach $100,000 by end of Q1 2025?",
    direction: "LONG",
    positionSize: "$125,000",
    riskScore: 6.5,
    confidence: 78,
    status: "APPROVED",
    summary: "Strong technical indicators suggest Bitcoin is in a bullish consolidation phase. RSI at 65, volume increasing, and institutional accumulation patterns visible. The upcoming halving cycle and ETF inflows support a move toward $100k. Risk-adjusted position size accounts for volatility.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    dataSources: ["https://polymarket.com/event/bitcoin-100k-q1-2025"],
    betStatus: "OPEN",
    vote: "YES"
  },
  {
    id: "prop-default-002",
    market: "Will Ethereum Layer 2 TVL exceed $50B by March 2025?",
    direction: "LONG",
    positionSize: "$95,000",
    riskScore: 5.2,
    confidence: 72,
    status: "APPROVED",
    summary: "Layer 2 ecosystems showing exponential growth with Arbitrum, Optimism, and Base leading adoption. Developer activity and user migration from mainnet accelerating. Fee reduction narrative driving institutional interest. Position sized conservatively given L2 token volatility.",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    dataSources: ["https://polymarket.com/event/eth-l2-tvl-50b"],
    betStatus: "OPEN",
    vote: "YES"
  },
  {
    id: "prop-default-003",
    market: "Will Solana DeFi TVL drop below $1B in the next 30 days?",
    direction: "SHORT",
    positionSize: "$80,000",
    riskScore: 4.8,
    confidence: 68,
    status: "REJECTED",
    summary: "Sentiment analysis shows mixed signals. While there are concerns about network stability, the ecosystem is showing resilience. However, risk parameters suggest this position size is too aggressive given current market conditions. Conservative approach recommended.",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    dataSources: ["https://polymarket.com/event/solana-defi-tvl-drop"],
    betStatus: "OPEN",
    vote: "NO"
  },
  {
    id: "prop-default-004",
    market: "Will AI token market cap exceed $100B by end of 2025?",
    direction: "LONG",
    positionSize: "$150,000",
    riskScore: 7.2,
    confidence: 65,
    status: "PENDING",
    summary: "AI narrative remains strong with major tech companies integrating blockchain AI solutions. However, regulatory uncertainty and high correlation with tech stocks create tail risk. Position requires careful risk management and monitoring of regulatory developments.",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    dataSources: ["https://polymarket.com/event/ai-tokens-100b-2025"],
    betStatus: "OPEN",
    vote: "YES"
  },
  {
    id: "prop-default-005",
    market: "Will USDC market cap exceed $50B by Q2 2025?",
    direction: "LONG",
    positionSize: "$110,000",
    riskScore: 3.5,
    confidence: 82,
    status: "EXECUTED",
    summary: "Stablecoin adoption accelerating with institutional demand for on-chain dollar exposure. USDC maintaining market share despite competition. Regulatory clarity improving. Low-risk, high-confidence position with strong fundamentals.",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    dataSources: ["https://polymarket.com/event/usdc-50b-q2-2025"],
    betStatus: "OPEN",
    vote: "YES"
  }
];

// Hardcoded debate transcripts
const DEFAULT_DEBATES: Record<string, DebateTranscript> = {
  "prop-default-001": {
    proposalId: "prop-default-001",
    messages: [
      {
        agent: "Quant Agent",
        message: "Technical analysis shows Bitcoin breaking above key resistance at $68k with strong volume confirmation. RSI at 65 indicates healthy momentum without overbought conditions. The 20-day MA has crossed above 50-day MA, forming a bullish pattern. Historical data suggests 78% probability of reaching $100k target within Q1 2025 timeframe. I vote YES.",
        timestamp: "14:28:33",
        vote: "YES"
      },
      {
        agent: "Risk Agent",
        message: "Portfolio heat is currently at 45%, so this $125k position would bring us to 62% - within our 75% threshold. Bitcoin correlation with existing positions is moderate at 0.65. Maximum drawdown scenario shows 2.8% portfolio impact if BTC drops 20%. Position sizing is appropriate. I approve with a stop-loss condition at $65k. I vote YES.",
        timestamp: "14:29:15",
        vote: "YES"
      },
      {
        agent: "Fundamental Agent",
        message: "ETF inflows continue to accelerate with $2.3B in net inflows this week. Institutional adoption metrics are strong. The upcoming halving in April creates supply shock dynamics. Regulatory clarity improving. Fundamental factors strongly support this position. I vote YES.",
        timestamp: "14:30:02",
        vote: "YES"
      },
      {
        agent: "Sentiment Agent",
        message: "Social sentiment is bullish at 68/100. Twitter mentions increasing, influencer activity positive. However, there's some FUD around regulatory concerns. Overall sentiment momentum is positive. I vote YES.",
        timestamp: "14:30:45",
        vote: "YES"
      },
      {
        agent: "Strategist Agent",
        message: "Market structure supports this trade. Options market shows put-call ratio of 0.58, indicating bullish bias. Funding rates positive. The arbitrage landscape is favorable. I vote YES.",
        timestamp: "14:31:20",
        vote: "YES"
      }
    ]
  },
  "prop-default-002": {
    proposalId: "prop-default-002",
    messages: [
      {
        agent: "Fundamental Agent",
        message: "Layer 2 ecosystems showing 40% month-over-month growth. Developer activity on Arbitrum, Optimism, and Base is accelerating. User migration from mainnet Ethereum is increasing due to lower fees. Fundamental metrics strongly support L2 growth. I vote YES.",
        timestamp: "11:15:30",
        vote: "YES"
      },
      {
        agent: "Quant Agent",
        message: "TVL growth rate analysis shows exponential curve. Current TVL at $28B, growing at 15% monthly. Statistical projection suggests 72% probability of exceeding $50B by March. Technical indicators support continued growth. I vote YES.",
        timestamp: "11:16:12",
        vote: "YES"
      },
      {
        agent: "Risk Agent",
        message: "Position size is conservative at $95k. L2 tokens have higher volatility but this is accounted for in sizing. Correlation with mainnet ETH is 0.72, which is acceptable. Risk parameters are within limits. I vote YES.",
        timestamp: "11:17:05",
        vote: "YES"
      },
      {
        agent: "Sentiment Agent",
        message: "Community sentiment around L2s is very positive at 75/100. Developer community actively building. However, some concerns about token unlock schedules. Overall sentiment supports the trade. I vote YES.",
        timestamp: "11:17:50",
        vote: "YES"
      },
      {
        agent: "Strategist Agent",
        message: "L2 narrative is strong. Market structure shows increasing capital allocation to L2 ecosystems. The fee reduction narrative is compelling for institutional adoption. I vote YES.",
        timestamp: "11:18:25",
        vote: "YES"
      }
    ]
  },
  "prop-default-003": {
    proposalId: "prop-default-003",
    messages: [
      {
        agent: "Quant Agent",
        message: "Current Solana DeFi TVL is $1.8B. Statistical analysis shows 35% probability of dropping below $1B in 30 days. While there are concerns, the probability is not high enough to justify a SHORT position. I vote NO.",
        timestamp: "09:20:15",
        vote: "NO"
      },
      {
        agent: "Risk Agent",
        message: "This SHORT position would increase portfolio risk. Solana ecosystem has shown resilience despite network issues. Position size of $80k is too aggressive for a low-probability trade. I vote NO.",
        timestamp: "09:21:00",
        vote: "NO"
      },
      {
        agent: "Fundamental Agent",
        message: "Solana ecosystem continues to attract developers. While there are network stability concerns, the fundamental value proposition remains strong. I vote NO.",
        timestamp: "09:21:45",
        vote: "NO"
      },
      {
        agent: "Sentiment Agent",
        message: "Sentiment is mixed at 48/100. Some negative sentiment around network issues, but community remains engaged. Not enough negative momentum to support SHORT. I vote NO.",
        timestamp: "09:22:30",
        vote: "NO"
      },
      {
        agent: "Strategist Agent",
        message: "Market structure doesn't support this SHORT. While there are risks, the ecosystem is showing resilience. I vote NO.",
        timestamp: "09:23:15",
        vote: "NO"
      }
    ]
  },
  "prop-default-004": {
    proposalId: "prop-default-004",
    messages: [
      {
        agent: "Fundamental Agent",
        message: "AI narrative remains strong with major tech companies integrating blockchain AI. However, regulatory uncertainty creates headwinds. Fundamental factors are mixed. I vote YES but with caution.",
        timestamp: "13:45:20",
        vote: "YES"
      },
      {
        agent: "Risk Agent",
        message: "AI tokens have high correlation with tech stocks (0.85) and high volatility. This $150k position would push portfolio heat to 70%, close to our limit. Risk score of 7.2 is elevated. I recommend reducing position size or waiting for clearer signals. I vote NO.",
        timestamp: "13:46:10",
        vote: "NO"
      },
      {
        agent: "Quant Agent",
        message: "Statistical analysis shows 65% probability of reaching target. However, volatility is high. Technical indicators are mixed. I vote YES but position size should be reduced.",
        timestamp: "13:47:00",
        vote: "YES"
      },
      {
        agent: "Sentiment Agent",
        message: "AI narrative sentiment is strong at 72/100. Community excited about AI-blockchain integration. However, regulatory FUD is present. Overall sentiment supports the trade. I vote YES.",
        timestamp: "13:47:45",
        vote: "YES"
      },
      {
        agent: "Strategist Agent",
        message: "Market structure supports AI tokens, but regulatory risk is real. The trade has merit but requires careful risk management. I vote YES with reduced position size.",
        timestamp: "13:48:30",
        vote: "YES"
      }
    ]
  },
  "prop-default-005": {
    proposalId: "prop-default-005",
    messages: [
      {
        agent: "Fundamental Agent",
        message: "Stablecoin adoption is accelerating. USDC maintaining market share with strong institutional demand. Regulatory clarity improving. Fundamental factors strongly support growth to $50B. I vote YES.",
        timestamp: "08:30:15",
        vote: "YES"
      },
      {
        agent: "Quant Agent",
        message: "USDC market cap currently at $32B, growing at steady 8% monthly rate. Statistical projection shows 82% probability of exceeding $50B by Q2 2025. Low volatility, high confidence trade. I vote YES.",
        timestamp: "08:31:00",
        vote: "YES"
      },
      {
        agent: "Risk Agent",
        message: "Stablecoin positions are low risk. USDC is well-regulated and trusted. Position size is appropriate. This is a high-confidence, low-risk trade. I vote YES.",
        timestamp: "08:31:45",
        vote: "YES"
      },
      {
        agent: "Sentiment Agent",
        message: "Stablecoin sentiment is neutral-positive. Community trusts USDC. No significant negative sentiment. I vote YES.",
        timestamp: "08:32:30",
        vote: "YES"
      },
      {
        agent: "Strategist Agent",
        message: "Market structure strongly supports stablecoin growth. Institutional demand for on-chain dollar exposure is increasing. This is a strategic position. I vote YES.",
        timestamp: "08:33:15",
        vote: "YES"
      }
    ]
  }
};

const Governance = () => {
  const [proposals, setProposals] = useState<Proposal[]>(DEFAULT_PROPOSALS);
  const [proposalDebates, setProposalDebates] = useState<Record<string, DebateTranscript | null>>(DEFAULT_DEBATES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const proposalsData = await fetchProposals();
        // Merge API proposals with defaults (API takes priority if IDs match)
        const mergedProposals = [...DEFAULT_PROPOSALS];
        proposalsData.forEach(apiProposal => {
          const existingIndex = mergedProposals.findIndex(p => p.id === apiProposal.id);
          if (existingIndex >= 0) {
            mergedProposals[existingIndex] = apiProposal;
          } else {
            mergedProposals.unshift(apiProposal); // Add new proposals at the top
          }
        });
        setProposals(mergedProposals);

        // Fetch debate transcripts (merge with defaults)
        const debatePromises = mergedProposals.map(async (proposal) => {
          try {
            const debate = await fetchDebateTranscript(proposal.id);
            return { proposalId: proposal.id, debate: debate || DEFAULT_DEBATES[proposal.id] || null };
          } catch {
            return { proposalId: proposal.id, debate: DEFAULT_DEBATES[proposal.id] || null };
          }
        });

        const debateResults = await Promise.all(debatePromises);
        const debateMap: Record<string, DebateTranscript | null> = { ...DEFAULT_DEBATES };
        debateResults.forEach(({ proposalId, debate }) => {
          if (debate) {
            debateMap[proposalId] = debate;
          }
        });
        setProposalDebates(debateMap);
      } catch (error) {
        // If API fails, keep defaults
        console.error('Error fetching proposals:', error);
      }
      setLoading(false);
    };

    fetchAllData();
    
    // Refresh every 15 seconds
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-8 sm:space-y-10 lg:space-y-12 max-w-6xl">
      <div className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
          AI Governance
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-2">
          Real-time AI agent proposals and decision-making
        </p>
      </div>

      {loading ? (
        <Card className="glass-card p-6 sm:p-8 text-center">
          <div className="text-muted-foreground text-sm sm:text-base">Loading proposals...</div>
        </Card>
      ) : proposals.length === 0 ? (
        <Card className="glass-card p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">No Active Proposals</h3>
          <p className="text-muted-foreground text-sm sm:text-base mb-4 px-2">
          AI agent proposals and governance decisions will appear here once the vault is operational.
        </p>
        </Card>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {proposals.map((proposal) => {
            const debate = proposalDebates[proposal.id];
            const statusColors = {
              PENDING: 'bg-yellow-500/20 text-yellow-500',
              APPROVED: 'bg-green-500/20 text-green-500',
              REJECTED: 'bg-red-500/20 text-red-500',
              EXECUTED: 'bg-blue-500/20 text-blue-500',
            };

            const betStatusTextColors = {
              OPEN: 'text-blue-500',
              CLOSED: 'text-gray-500',
            };

            const betResultTextColors = {
              WIN: 'text-green-500',
              LOSS: 'text-red-500',
            };

            return (
              <Card key={proposal.id} className="glass-card p-4 sm:p-6 hover-glow-secondary transition-all">
                {/* Proposal Card Content */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6 pb-4 border-b border-border/50">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg bg-gradient-evergreen-glow flex items-center justify-center flex-shrink-0">
                      {proposal.betStatus === 'CLOSED' && proposal.betResult ? (
                        proposal.betResult === 'WIN' ? (
                          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-red-500" />
                        )
                      ) : (
                        proposal.direction === 'LONG' ? (
                          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-red-500" />
                        )
                      )}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight break-words">{proposal.market}</h3>
                      <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                        {new Date(proposal.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge className={`${statusColors[proposal.status]} px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold self-start sm:self-auto`}>
                    {proposal.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-1">Bet Side</div>
                    <div className="font-semibold">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        proposal.vote === 'YES' 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {proposal.vote}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-1">Position Size</div>
                    <div className="font-semibold text-sm sm:text-base break-words">{proposal.positionSize}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-1">Risk Score</div>
                    <div className="font-semibold flex items-center gap-1 text-sm sm:text-base">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                      <span>{proposal.riskScore.toFixed(1)}/10</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-1">Confidence</div>
                    <div className="font-semibold text-primary text-sm sm:text-base">{proposal.confidence}%</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs sm:text-sm text-muted-foreground mb-1">Bet Status</div>
                  <div className="font-semibold flex flex-col gap-1">
                    <span className={`text-sm sm:text-base ${betStatusTextColors[proposal.betStatus]}`}>
                      {proposal.betStatus === 'OPEN' ? 'Open Bet' : 'Closed Bet'}
                    </span>
                    {proposal.betStatus === 'CLOSED' && proposal.betResult && (
                      <div className="flex items-center gap-1">
                        {proposal.betResult === 'WIN' ? (
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                        )}
                        <span className={`text-xs sm:text-sm ${betResultTextColors[proposal.betResult]}`}>
                          {proposal.betResult === 'WIN' ? 'Won' : 'Lost'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border mb-4">
                  <p className="text-xs sm:text-sm leading-relaxed break-words">{proposal.summary}</p>
                </div>

                <a
                  href="https://polymarket.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group mb-4 text-sm sm:text-base"
                >
                  <span className="font-medium">View on Polymarket</span>
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform flex-shrink-0" />
                </a>

                {/* Agent Conversation */}
                {debate && debate.messages && debate.messages.length > 0 && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`debate-${proposal.id}`} className="border border-border rounded-lg px-3 sm:px-4">
                      <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span className="font-semibold text-sm sm:text-base">Agent Conversation</span>
                          <Badge variant="outline" className="text-xs">{debate.messages.length} messages</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-3 sm:pt-4 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border">
                          <div className="space-y-3 sm:space-y-4">
                            {debate.messages.map((message, index) => (
                              <div key={index}>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-semibold text-xs sm:text-sm break-words">{message.agent}:</span>
                                  <Badge
                                    className={`text-xs ${
                                      message.vote === 'YES'
                                        ? 'bg-green-500/20 text-green-500'
                                        : 'bg-red-500/20 text-red-500'
                                    }`}
                                  >
                                    {message.vote}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground font-mono ml-auto whitespace-nowrap">
                                    {message.timestamp}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mb-2 sm:mb-3 break-words">
                                  {message.message}
                                </p>
                                {index < debate.messages.length - 1 && (
                                  <div className="border-b border-border/30 my-2" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
      </Card>
            );
          })}
        </div>
      )}

      <Card className="glass-card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">How AI Governance Works</h3>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
          <p>
            Our AI hedge fund uses a multi-agent consensus system where five specialized agents analyze market opportunities independently.
          </p>
          <p>
            Each agent votes YES or NO on proposed trades based on their domain expertise. A proposal requires majority approval (3/5) to be executed.
          </p>
          <p>
            All reasoning, data sources, and decision transcripts are transparently recorded on-chain and stored on IPFS for full auditability.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Governance;
