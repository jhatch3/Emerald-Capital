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

const Governance = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalDebates, setProposalDebates] = useState<Record<string, DebateTranscript | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const proposalsData = await fetchProposals();
      setProposals(proposalsData);

      // Fetch debate transcript for each proposal
      const debatePromises = proposalsData.map(async (proposal) => {
        const debate = await fetchDebateTranscript(proposal.id);
        return { proposalId: proposal.id, debate };
      });

      const debateResults = await Promise.all(debatePromises);
      const debateMap: Record<string, DebateTranscript | null> = {};
      debateResults.forEach(({ proposalId, debate }) => {
        debateMap[proposalId] = debate;
      });
      setProposalDebates(debateMap);
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
