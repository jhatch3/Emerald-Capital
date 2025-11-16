import { OptInButton } from '@/components/OptInButton';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletContext } from '@/contexts/WalletContext';

const Landing = () => {
  const { hasCompletedOnboarding } = useWalletContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate('/dashboard');
    }
  }, [hasCompletedOnboarding, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground leading-tight">
            Evergreen Capital
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light">
            Autonomous AI-Driven Solana-Native Hedge Fund
          </p>
        </div>

        {/* Summary Section */}
        <div className="max-w-3xl mx-auto">
          <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
            Evergreen Capital is a fully autonomous, AI-powered hedge fund.
            A decentralized swarm of agents ingests real-time trades, on-chain data, Snowflake feeds, and market signals.
            The agents debate, rank strategies, and decide positions through a multi-agent governance system.
            Users stake into the AI vault and receive passive exposure to machine-optimized trading.
          </p>
        </div>

        {/* CTA Section */}
        <div className="space-y-6 pt-8">
          <OptInButton />
          
          <p className="text-sm text-muted-foreground">
            No withdrawals or redemptions. Deposit-only vault.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
