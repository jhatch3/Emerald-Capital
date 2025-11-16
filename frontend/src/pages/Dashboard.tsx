import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  fetchUserDeposit,
  fetchVaultStats,
  fetchNavHistory,
  fetchMarketAllocations,
  fetchPnlDistribution,
  fetchCurrentPositions,
  type VaultStats,
  type NavHistoryPoint,
  type MarketAllocation,
  type PnlHistogramPoint,
  type Position
} from '@/lib/api';
import { MetricCard } from '@/components/MetricCard';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useUSDCBalance } from '@/hooks/useUSDCBalance';
import { WalletAssets } from '@/components/WalletAssets';
import { DollarSign, Users, TrendingUp, Activity } from 'lucide-react';

const Dashboard = () => {
  const { publicKey } = useWallet();
  const { balance: solBalance } = useSolBalance();
  const { balance: usdcBalance } = useUSDCBalance();
  const [depositedAmount, setDepositedAmount] = useState<number>(0);
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);
  const [navHistory, setNavHistory] = useState<NavHistoryPoint[]>([]);
  const [marketAllocations, setMarketAllocations] = useState<MarketAllocation[]>([]);
  const [pnlDistribution, setPnlDistribution] = useState<PnlHistogramPoint[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      // Fetch user deposit
      if (publicKey) {
        const deposit = await fetchUserDeposit(publicKey.toString());
        setDepositedAmount(deposit);
      }

      // Fetch vault data
      const [stats, nav, allocations, pnl, currentPositions] = await Promise.all([
        fetchVaultStats(publicKey?.toString()),
        fetchNavHistory(30),
        fetchMarketAllocations(),
        fetchPnlDistribution(),
        fetchCurrentPositions(),
      ]);

      setVaultStats(stats);
      setNavHistory(nav);
      setMarketAllocations(allocations);
      setPnlDistribution(pnl);
      setPositions(currentPositions);
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
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Real-time vault performance and AI trading activity
        </p>
      </div>

      {!publicKey ? (
        <Card className="glass-card p-8 text-center">
          <h3 className="text-2xl font-semibold mb-4">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Please connect your wallet to view your dashboard and vault statistics.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">SOL Balance</h3>
              <div className="text-3xl font-bold mb-2">
                {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'Loading...'}
              </div>
              <p className="text-sm text-muted-foreground">
                {solBalance !== null ? `≈ $${(solBalance * 150).toFixed(2)} USD` : ''}
              </p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">USDC Balance</h3>
              <div className="text-3xl font-bold mb-2">
                {usdcBalance !== null ? `${usdcBalance.toFixed(2)} USDC` : 'Loading...'}
              </div>
              <p className="text-sm text-muted-foreground">
                {usdcBalance !== null ? `≈ $${usdcBalance.toFixed(2)} USD` : ''}
              </p>
            </Card>

            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Deposited in Vault</h3>
              <div className="text-3xl font-bold mb-2">
                {depositedAmount > 0 ? `${depositedAmount.toFixed(4)} SOL` : '0.0000 SOL'}
              </div>
              <p className="text-sm text-muted-foreground">
                {depositedAmount > 0 ? `≈ $${(depositedAmount * 150).toFixed(2)} USD` : 'No deposits yet'}
              </p>
            </Card>
          </div>

          {/* All Wallet Assets */}
          <WalletAssets />

          {depositedAmount === 0 && (
            <Card className="glass-card p-8 text-center">
              <h3 className="text-2xl font-semibold mb-4">No Vault Activity Yet</h3>
              <p className="text-muted-foreground mb-4">
                Vault statistics, positions, and performance data will appear here once you make a deposit.
              </p>
              <p className="text-sm text-muted-foreground">
                Visit the Deposit page to stake your SOL and start earning returns.
              </p>
            </Card>
          )}

          {/* Vault Statistics */}
          {!loading && vaultStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Value Locked"
                  value={`$${vaultStats.totalValueLocked.toLocaleString()}`}
                  icon={DollarSign}
                  trend="up"
                  trendValue="24h: +$14,293"
                />
                <MetricCard
                  title="Number of Depositors"
                  value={vaultStats.numberOfDepositors.toLocaleString()}
                  icon={Users}
                  subtitle="Active participants"
                />
                <MetricCard
                  title="Strategy Win Rate"
                  value={`${vaultStats.strategyWinRate}%`}
                  icon={TrendingUp}
                  trend="up"
                  trendValue="Last 30 days"
                />
                <MetricCard
                  title="24h PnL"
                  value={`$${vaultStats.pnl24h.toLocaleString()}`}
                  icon={Activity}
                  trend="up"
                  trendValue="+0.52%"
                />
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4">NAV Over Time</h3>
                  {navHistory.length > 0 ? (
                    <LineChart
                      data={navHistory}
                      dataKey="nav"
                      xAxisKey="date"
                      color="hsl(270 91% 65%)"
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </Card>

                <Card className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Allocation by Market Type</h3>
                  {marketAllocations.length > 0 ? (
                    <BarChart
                      data={marketAllocations}
                      dataKey="allocation"
                      xAxisKey="market"
                      color="hsl(220 91% 60%)"
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </Card>
              </div>

              {/* Charts Row 2 */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">PnL Distribution</h3>
                {pnlDistribution.length > 0 ? (
                  <BarChart
                    data={pnlDistribution}
                    dataKey="count"
                    xAxisKey="range"
                    color="hsl(180 91% 60%)"
                    height={250}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </Card>

              {/* Current Positions */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Current Open Positions</h3>
                {positions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Market</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Side</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Size</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Entry</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Current</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">PnL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {positions.map((position, index) => (
                          <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-medium">{position.market}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                position.side === 'LONG' 
                                  ? 'bg-green-500/20 text-green-500' 
                                  : 'bg-red-500/20 text-red-500'
                              }`}>
                                {position.side}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">{position.size}</td>
                            <td className="py-3 px-4 text-right text-muted-foreground">{position.entryPrice}</td>
                            <td className="py-3 px-4 text-right">{position.currentPrice}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="text-green-500 font-medium">{position.pnl}</div>
                              <div className="text-xs text-muted-foreground">{position.pnlValue}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No open positions
                  </div>
                )}
              </Card>
            </>
          )}

          {loading && (
            <Card className="glass-card p-8 text-center">
              <div className="text-muted-foreground">Loading vault data...</div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
