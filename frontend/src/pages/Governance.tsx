import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ProposalCard } from '@/components/governance/ProposalCard';
import { ReasoningAccordion } from '@/components/governance/ReasoningAccordion';
import { 
  fetchProposals,
  fetchProposalReasoning,
  type Proposal,
  type AgentReasoning
} from '@/lib/api';

const Governance = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalReasoning, setProposalReasoning] = useState<Record<string, AgentReasoning[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const proposalsData = await fetchProposals();
      setProposals(proposalsData);

      // Fetch reasoning for each proposal
      const reasoningPromises = proposalsData.map(async (proposal) => {
        const reasoning = await fetchProposalReasoning(proposal.id);
        return { proposalId: proposal.id, reasoning };
      });

      const reasoningResults = await Promise.all(reasoningPromises);
      const reasoningMap: Record<string, AgentReasoning[]> = {};
      reasoningResults.forEach(({ proposalId, reasoning }) => {
        reasoningMap[proposalId] = reasoning;
      });
      setProposalReasoning(reasoningMap);
      setLoading(false);
    };

    fetchAllData();
    
    // Refresh every 15 seconds
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 max-w-6xl">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-solana bg-clip-text text-transparent">
          AI Governance
        </h1>
        <p className="text-muted-foreground text-lg">
          Real-time AI agent proposals and decision-making
        </p>
      </div>

      {loading ? (
        <Card className="glass-card p-8 text-center">
          <div className="text-muted-foreground">Loading proposals...</div>
        </Card>
      ) : proposals.length === 0 ? (
        <Card className="glass-card p-8 text-center">
          <h3 className="text-2xl font-semibold mb-4">No Active Proposals</h3>
          <p className="text-muted-foreground mb-4">
            AI agent proposals and governance decisions will appear here once the vault is operational.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="space-y-4">
              <ProposalCard
                market={proposal.market}
                direction={proposal.direction}
                positionSize={proposal.positionSize}
                riskScore={proposal.riskScore}
                confidence={proposal.confidence}
                status={proposal.status}
                summary={proposal.summary}
                timestamp={proposal.timestamp}
              />

              {proposalReasoning[proposal.id] && proposalReasoning[proposal.id].length > 0 && (
                <Card className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Multi-Agent Analysis</h3>
                  <ReasoningAccordion
                    reasoning={proposalReasoning[proposal.id]}
                    dataSources={proposal.dataSources}
                  />
                </Card>
              )}
            </div>
          ))}
        </div>
      )}

      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">How AI Governance Works</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
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
