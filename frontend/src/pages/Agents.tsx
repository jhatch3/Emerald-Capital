import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentCard } from '@/components/agents/AgentCard';
import { 
  fetchAgents,
  fetchLiveDebate,
  type AgentPersona,
  type DebateTranscript
} from '@/lib/api';

const Agents = () => {
  const [agents, setAgents] = useState<AgentPersona[]>([]);
  const [liveDebate, setLiveDebate] = useState<DebateTranscript | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const [agentsData, debateData] = await Promise.all([
        fetchAgents(),
        fetchLiveDebate(),
      ]);
      setAgents(agentsData);
      setLiveDebate(debateData);
      setLoading(false);
    };

    fetchAllData();
    
    // Refresh debate every 5 seconds for live updates
    const debateInterval = setInterval(async () => {
      const debate = await fetchLiveDebate();
      setLiveDebate(debate);
    }, 5000);
    
    return () => clearInterval(debateInterval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-solana bg-clip-text text-transparent">
          AI Trading Agents
        </h1>
        <p className="text-muted-foreground text-lg">
          Five specialized agents powering autonomous trading
        </p>
      </div>

      {loading ? (
        <Card className="glass-card p-8 text-center">
          <div className="text-muted-foreground">Loading agent data...</div>
        </Card>
      ) : (
        <>
          {/* Agent Cards */}
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  name={agent.name}
                  role={agent.role}
                  avatar={agent.avatar}
                  description={agent.description}
                  specialty={agent.specialty}
                  winRate={agent.winRate}
                />
              ))}
            </div>
          ) : (
            <Card className="glass-card p-8 text-center">
              <h3 className="text-2xl font-semibold mb-4">No Agents Available</h3>
              <p className="text-muted-foreground">
                Agent information will appear here once the vault is operational.
              </p>
            </Card>
          )}

          {/* Live Debate Transcript */}
          {liveDebate && liveDebate.messages.length > 0 && (
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold">Live Agent Debate</h3>
                <Badge className="bg-green-500/20 text-green-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Active Discussion
                </Badge>
              </div>

              <div className="space-y-4">
                {liveDebate.messages.map((message, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold">{message.agent}</div>
                        <Badge
                          className={
                            message.vote === 'YES'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          }
                        >
                          {message.vote}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {message.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {message.message}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

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
