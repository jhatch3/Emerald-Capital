import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DecisionReport } from '@/components/DecisionReport';
import { Play, Loader2, RefreshCw } from 'lucide-react';
import { triggerAgentDecision } from '@/lib/api';

interface AgentDecisionResponse {
  status: 'ok' | 'error';
  decision_id?: string;
  investment_decision?: {
    direction: 'YES' | 'NO';
    size: number;
    confidence: number;
    summary: string;
  };
  agent_analysis?: Array<{
    agent_name: string;
    direction: 'YES' | 'NO';
    confidence: number;
    size: number;
    reasoning: string;
  }>;
  conversation_logs?: {
    initial_decisions?: any[];
    debate_round?: any;
    final_decisions?: any[];
  };
  market_info?: {
    symbol?: string;
    question?: string;
    price?: number;
    volume24h?: number;
    marketCap?: number;
  };
  error?: string;
}

const Dev = () => {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<AgentDecisionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunPipeline = async () => {
    setLoading(true);
    setError(null);
    setDecision(null);

    try {
      // Trigger agent decision with auto market selection
      const result = await triggerAgentDecision();
      setDecision(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run agent pipeline';
      setError(errorMessage);
      console.error('Error running agent pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 max-w-6xl">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground">
          Agent Pipeline Dev
        </h1>
        <p className="text-muted-foreground text-lg">
          Test and demo the AI agent decision engine
        </p>
      </div>

      {/* Control Panel */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Agent Decision Pipeline</h2>
            <p className="text-sm text-muted-foreground">
              Click the button below to run the complete agent pipeline. The system will automatically select a market, run all 5 agents, conduct a debate, and produce a consensus decision.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleRunPipeline}
            disabled={loading}
            className="bg-gradient-evergreen hover:opacity-90 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Running Pipeline...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Run Agent Pipeline
              </>
            )}
          </Button>

          {decision && (
            <Button
              onClick={handleRunPipeline}
              disabled={loading}
              variant="outline"
              className="font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Again
            </Button>
          )}
        </div>

        {loading && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="font-semibold">Processing...</p>
                <p className="text-sm text-muted-foreground">
                  Market selection → Agent analysis → Debate → Consensus decision
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="glass-card p-6 border-red-500/50">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-500 text-xs">✕</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-500 mb-1">Error</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Results Display */}
      {decision && decision.status === 'ok' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Decision Results</h2>
            {decision.decision_id && (
              <div className="text-sm text-muted-foreground font-mono">
                ID: {decision.decision_id.slice(0, 8)}...
              </div>
            )}
          </div>

          <DecisionReport
            decisionId={decision.decision_id}
            investmentDecision={decision.investment_decision}
            agentAnalysis={decision.agent_analysis}
            conversationLogs={decision.conversation_logs}
            marketInfo={decision.market_info}
          />
        </div>
      )}

      {decision && decision.status === 'error' && (
        <Card className="glass-card p-6 border-red-500/50">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-500 text-xs">✕</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-500 mb-1">Pipeline Error</h3>
              <p className="text-sm text-muted-foreground">{decision.error || 'Unknown error occurred'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">How It Works</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Market Selection</p>
              <p>The system automatically fetches active Polymarket markets and uses AI to select the best opportunity.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary text-xs font-bold">2</span>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Agent Analysis</p>
              <p>All 5 specialized agents (Fundamental, Quant, Sentiment, Risk, Strategist) independently analyze the market and provide their decisions.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Debate Round</p>
              <p>Agents engage in a debate round where they refine their positions based on each other's reasoning.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary text-xs font-bold">4</span>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Consensus Decision</p>
              <p>A weighted consensus is calculated from all agent outputs, producing the final investment decision with position size and confidence.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dev;

