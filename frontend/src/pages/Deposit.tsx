import { DepositCard } from '@/components/DepositCard';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  fetchUserDeposit,
  fetchVaultStats,
  fetchTvlHistory,
  type VaultStats,
  type TvlHistoryPoint
} from '@/lib/api';
import { MetricCard } from '@/components/MetricCard';
import { LineChart } from '@/components/charts/LineChart';
import { DollarSign, Users, TrendingUp, Coins } from 'lucide-react';

const Deposit = () => {
  const { publicKey } = useWallet();
  const [depositedAmount, setDepositedAmount] = useState<number>(0);
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);
  const [tvlHistory, setTvlHistory] = useState<TvlHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      const [deposit, stats, tvl] = await Promise.all([
        publicKey ? fetchUserDeposit(publicKey.toString()) : Promise.resolve(0),
        fetchVaultStats(publicKey?.toString()),
        fetchTvlHistory(30),
      ]);

      setDepositedAmount(deposit);
      setVaultStats(stats);
      setTvlHistory(tvl);
      setLoading(false);
    };

    fetchAllData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [publicKey]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-solana bg-clip-text text-transparent">
          Deposit SOL
        </h1>
        <p className="text-muted-foreground text-lg">
          Stake your SOL and let AI agents trade on your behalf
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Deposit Card */}
        <div className="lg:col-span-1">
          <DepositCard />
        </div>

        {/* Right Column - Vault Stats */}
        <div className="lg:col-span-2 space-y-6">
          {!loading && vaultStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                title="Total Vault Liquidity"
                value={`$${vaultStats.totalValueLocked.toLocaleString()}`}
                icon={DollarSign}
              />
              <MetricCard
                title="Number of Depositors"
                value={vaultStats.numberOfDepositors.toLocaleString()}
                icon={Users}
              />
              <MetricCard
                title="Vault Share Price"
                value={`${vaultStats.vaultSharePrice.toFixed(4)} SOL`}
                subtitle="Current NAV per share"
                icon={Coins}
              />
              <MetricCard
                title="Your Deposited Amount"
                value={`${depositedAmount.toFixed(2)} SOL`}
                subtitle={vaultStats.userVaultShares ? `${vaultStats.userVaultShares.toFixed(4)} shares` : 'No shares yet'}
                icon={TrendingUp}
              />
            </div>
          )}

          {loading && (
            <Card className="glass-card p-6">
              <div className="text-muted-foreground text-center py-4">Loading vault data...</div>
            </Card>
          )}

          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Total Value Locked Over Time</h3>
            {tvlHistory.length > 0 ? (
              <LineChart
                data={tvlHistory}
                dataKey="value"
                xAxisKey="date"
                color="hsl(270 91% 65%)"
                height={300}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No TVL history available
              </div>
            )}
          </Card>

          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Important Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-yellow-500 font-bold">⚠️</span>
                <div>
                  <p className="font-medium mb-1">No Withdrawals or Redemptions</p>
                  <p className="text-muted-foreground">
                    Once deposited, your SOL is committed to the vault. There is no mechanism to withdraw or redeem your position.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-500 font-bold">ℹ️</span>
                <div>
                  <p className="font-medium mb-1">AI-Managed Trading</p>
                  <p className="text-muted-foreground">
                    Your funds will be actively managed by our multi-agent AI system across Solana DeFi markets including perps, spot, and options.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <div>
                  <p className="font-medium mb-1">Vault Share Tokens</p>
                  <p className="text-muted-foreground">
                    You receive vault share tokens representing your proportional ownership. Share price increases with profitable trades.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
