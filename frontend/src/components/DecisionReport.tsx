import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';

interface AgentAnalysis {
  agent_name: string;
  direction: 'YES' | 'NO';
  confidence: number;
  size: number;
  reasoning: string;
}

interface InvestmentDecision {
  direction: 'YES' | 'NO';
  size: number;
  confidence: number;
  summary: string;
}

interface DecisionReportProps {
  decisionId?: string;
  investmentDecision?: InvestmentDecision;
  agentAnalysis?: AgentAnalysis[];
  conversationLogs?: {
    initial_decisions?: any[];
    debate_round?: any;
    final_decisions?: any[];
  };
  marketInfo?: {
    symbol?: string;
    question?: string;
    price?: number;
    volume24h?: number;
    marketCap?: number;
  };
}

export const DecisionReport = ({
  decisionId,
  investmentDecision,
  agentAnalysis,
  conversationLogs,
  marketInfo,
}: DecisionReportProps) => {
  if (!investmentDecision) {
    return (
      <Card className="glass-card p-6">
        <p className="text-muted-foreground">No decision data available</p>
      </Card>
    );
  }

  const directionColors = {
    YES: 'bg-green-500/20 text-green-500',
    NO: 'bg-red-500/20 text-red-500',
  };

  return (
    <div className="space-y-6">
      {/* Investment Decision Summary */}
      <Card className="glass-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              investmentDecision.direction === 'YES' 
                ? 'bg-green-500/20' 
                : 'bg-red-500/20'
            }`}>
              {investmentDecision.direction === 'YES' ? (
                <TrendingUp className="w-6 h-6 text-green-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold">Investment Decision</h3>
              {decisionId && (
                <p className="text-xs text-muted-foreground font-mono">{decisionId}</p>
              )}
            </div>
          </div>
          <Badge className={directionColors[investmentDecision.direction]}>
            {investmentDecision.direction}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Position Size</div>
            <div className="font-semibold">${investmentDecision.size.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Confidence</div>
            <div className="font-semibold text-primary">{investmentDecision.confidence.toFixed(1)}%</div>
          </div>
          {marketInfo?.price && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Market Price</div>
              <div className="font-semibold">${marketInfo.price.toLocaleString()}</div>
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <div className="text-sm font-semibold mb-2">Decision Summary</div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {investmentDecision.summary}
          </p>
        </div>

        {marketInfo?.question && (
          <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="text-xs text-muted-foreground mb-1">Market Question</div>
            <div className="text-sm font-medium">{marketInfo.question}</div>
          </div>
        )}
      </Card>

      {/* Agent Analysis */}
      {agentAnalysis && agentAnalysis.length > 0 && (
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Agent Analysis</h3>
          <div className="space-y-4">
            {agentAnalysis.map((agent, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{agent.agent_name}</span>
                    <Badge className={directionColors[agent.direction]} variant="outline">
                      {agent.direction}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Confidence: {agent.confidence.toFixed(1)}% | Size: ${agent.size.toLocaleString()}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {agent.reasoning}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Conversation Logs */}
      {conversationLogs && (
        <Card className="glass-card p-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="conversation-logs" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Full Conversation Logs</span>
                  <Badge variant="outline" className="text-xs">
                    {conversationLogs.initial_decisions?.length || 0} initial + {conversationLogs.final_decisions?.length || 0} final
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-4">
                  {conversationLogs.initial_decisions && conversationLogs.initial_decisions.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2 text-muted-foreground">Initial Decisions</div>
                      <div className="space-y-2">
                        {conversationLogs.initial_decisions.map((decision: any, idx: number) => (
                          <div key={idx} className="p-3 rounded bg-muted/20 border border-border/50">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold">{decision.agent}</span>
                              <Badge className={directionColors[decision.decision?.direction || 'NO']} variant="outline">
                                {decision.decision?.direction || 'NO'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {decision.decision?.reasoning || 'No reasoning provided'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {conversationLogs.final_decisions && conversationLogs.final_decisions.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold mb-2 text-muted-foreground">Final Decisions (After Debate)</div>
                      <div className="space-y-2">
                        {conversationLogs.final_decisions.map((decision: any, idx: number) => (
                          <div key={idx} className="p-3 rounded bg-muted/20 border border-border/50">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold">{decision.agent}</span>
                              <Badge className={directionColors[decision.decision?.direction || 'NO']} variant="outline">
                                {decision.decision?.direction || 'NO'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {decision.decision?.reasoning || 'No reasoning provided'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      )}
    </div>
  );
};

