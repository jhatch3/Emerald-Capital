import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  fetchUserCommentary,
  fetchVaultStats,
  fetchPortfolioAmountHistory,
  fetchCurrentPositions,
  type VaultStats,
  type PortfolioAmountPoint,
  type AgentCommentary,
  type Position
} from '@/lib/api';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { useSolBalance } from '@/hooks/useSolBalance';
import { Percent, Activity, AlertTriangle, Wallet, Coins, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = () => {
  const { publicKey } = useWallet();
  const { balance: solBalance } = useSolBalance();
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);
  const [commentary, setCommentary] = useState<AgentCommentary | null>(null);
  const [portfolioAmountHistory, setPortfolioAmountHistory] = useState<PortfolioAmountPoint[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(730);
  const [loading, setLoading] = useState(true);

  const handleTimeRangeChange = (days: number) => {
    setSelectedTimeRange(days);
  };

  // Calculate data science metrics from portfolio amount history
  const calculateMetrics = () => {
    if (portfolioAmountHistory.length < 2) return null;

    const amounts = portfolioAmountHistory.map(p => p.amount);
    const returns = [];
    for (let i = 1; i < amounts.length; i++) {
      returns.push((amounts[i] - amounts[i - 1]) / amounts[i - 1]);
    }

    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const volatility = stdDev * Math.sqrt(252) * 100; // Annualized volatility in %
    
    // Sharpe ratio (assuming risk-free rate of 0 for simplicity)
    const sharpeRatio = meanReturn > 0 ? (meanReturn / stdDev) * Math.sqrt(252) : 0;
    
    // Max Drawdown Calculation
    let peakAmount = amounts[0];
    let maxDrawdown = 0;
    
    for (let i = 1; i < amounts.length; i++) {
      if (amounts[i] > peakAmount) {
        peakAmount = amounts[i];
      }
      const drawdown = (peakAmount - amounts[i]) / peakAmount;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      volatility: volatility.toFixed(2),
      sharpeRatio: sharpeRatio.toFixed(2),
      maxDrawdown: (maxDrawdown * 100).toFixed(2),
      totalReturn: ((amounts[amounts.length - 1] - amounts[0]) / amounts[0] * 100).toFixed(2),
    };
  };

  const metrics = calculateMetrics();

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      // Fetch user commentary
      if (publicKey) {
        const comments = await fetchUserCommentary(publicKey.toString());
        setCommentary(comments);
      }

      // Fetch vault data - use 1095 days (3 years) for "All" to get maximum data
      const daysToFetch = selectedTimeRange >= 730 ? 1095 : selectedTimeRange;
      const [stats, portfolioAmount, currentPositions] = await Promise.all([
        fetchVaultStats(publicKey?.toString()),
        fetchPortfolioAmountHistory(daysToFetch),
        fetchCurrentPositions(),
      ]);

      setVaultStats(stats);
      setPortfolioAmountHistory(portfolioAmount);
      setPositions(currentPositions);
      setLoading(false);
    };

    fetchAllData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [publicKey, selectedTimeRange]);

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground">
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
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <Card className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                <Wallet className="w-4 h-4" />
                SOL Balance
              </h3>
              <div className="text-2xl font-bold mb-1">
                <span>{solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'Loading...'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <span>{solBalance !== null ? `≈ $${(solBalance * 150).toFixed(2)} USD` : ''}</span>
              </p>
            </Card>

            <Card className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                <Coins className="w-4 h-4" />
                Portfolio Amount
              </h3>
              {portfolioAmountHistory.length > 0 ? (
                <>
                  <div className="text-2xl font-bold mb-1">
                    <span>${portfolioAmountHistory[portfolioAmountHistory.length - 1].amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span>≈ {(portfolioAmountHistory[portfolioAmountHistory.length - 1].amount / 150).toFixed(4)} SOL</span>
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold mb-1">
                    <span>Loading...</span>
              </div>
                  <p className="text-xs text-muted-foreground">
                    <span>Calculating portfolio value</span>
              </p>
                </>
              )}
            </Card>

            <Card className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                <Percent className="w-4 h-4" />
                Portfolio Return
              </h3>
              {metrics ? (
                <>
                  <div className={`text-2xl font-bold mb-1 ${parseFloat(metrics.totalReturn) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <span>{parseFloat(metrics.totalReturn) >= 0 ? '+' : ''}{metrics.totalReturn}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span>Period return</span>
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold mb-1">
                    <span>Loading...</span>
              </div>
                  <p className="text-xs text-muted-foreground">
                    <span>Calculating return</span>
              </p>
                </>
              )}
            </Card>
          </div>

          {/* Portfolio Amount Chart */}
          {!loading && (
            <Card className="glass-card p-6 w-full">
              <h3 className="text-lg font-semibold mb-4">Portfolio Amount</h3>
              {portfolioAmountHistory.length > 0 ? (
                <LineChart
                  data={portfolioAmountHistory}
                  dataKey="amount"
                  xAxisKey="date"
                  color="hsl(0 0% 98%)"
                  height={400}
                  showTimeRangeSelector={true}
                  selectedDays={selectedTimeRange}
                  onTimeRangeChange={handleTimeRangeChange}
                  interactive="both"
                />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </Card>
          )}

          {/* Analytics Section */}
          {!loading && metrics && vaultStats && (
            <Card className="glass-card p-6 w-full">
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div>
                  <h4 className="text-lg font-bold mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Volatility
                      </div>
                      <div className="text-2xl font-bold">{metrics.volatility}%</div>
                      <p className="text-xs text-muted-foreground mt-1">Annualized</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1">Sharpe Ratio</div>
                      <div className="text-2xl font-bold">{metrics.sharpeRatio}</div>
                      <p className="text-xs text-muted-foreground mt-1">Risk-adjusted return</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-muted-foreground">Max Drawdown</span>
                      </div>
                      <div className="text-2xl font-bold">{metrics.maxDrawdown}%</div>
                      <p className="text-xs text-muted-foreground mt-1">Peak to trough decline</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1">Total Return</div>
                      <div className={`text-2xl font-bold ${parseFloat(metrics.totalReturn) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {parseFloat(metrics.totalReturn) >= 0 ? '+' : ''}{parseFloat(metrics.totalReturn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Period return</p>
                    </div>
                  </div>
                </div>

                {/* Win/Loss Statistics */}
                <div>
                  <h4 className="text-lg font-bold mb-4">Win/Loss Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        Wins
                      </div>
                      <div className="text-2xl font-bold text-green-500">
                        {vaultStats.userWinCount?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-red-500" />
                        Losses
                      </div>
                      <div className="text-2xl font-bold text-red-500">
                        {vaultStats.userLoseCount?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                      <div className={`text-2xl font-bold ${(vaultStats.userWinRate || 0) >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                        {vaultStats.userWinRate !== undefined ? `${vaultStats.userWinRate.toFixed(1)}%` : '0%'}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="text-sm text-muted-foreground mb-1">Total Bets</div>
                      <div className="text-2xl font-bold">
                        {((vaultStats.userWinCount || 0) + (vaultStats.userLoseCount || 0)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Win/Loss Distribution Chart */}
                  {vaultStats.userWinCount !== undefined && vaultStats.userLoseCount !== undefined && (
                    <div className="mt-4">
                      <BarChart
                        data={[
                          { name: 'Wins', value: vaultStats.userWinCount || 0, color: 'hsl(142 76% 36%)' },
                          { name: 'Losses', value: vaultStats.userLoseCount || 0, color: 'hsl(0 84% 60%)' },
                        ]}
                        dataKey="value"
                        xAxisKey="name"
                        color="hsl(0 0% 98%)"
                        height={200}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Open Positions */}
          {!loading && positions.length > 0 && (
            <Card className="glass-card p-6 w-full">
              <h3 className="text-lg font-semibold mb-4">Open Positions</h3>
              <div className="overflow-x-auto">
                <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-card z-10 backdrop-blur-sm">
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Bet</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Side</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Vault Amount Bet</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Portfolio Amount Bet</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Vault Payout</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Portfolio Payout</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Close Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position, index) => (
                        <tr key={index} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4 text-sm">{position.betDescription}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                              position.vote === 'YES' 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-red-500/20 text-red-500'
                            }`}>
                              {position.vote}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-right font-medium">{position.hedgeBetAmount}</td>
                          <td className="py-3 px-4 text-sm text-right font-medium">{position.myShare}</td>
                          <td className="py-3 px-4 text-sm text-right font-medium text-green-500">{position.hedgeWinAmount || '-'}</td>
                          <td className="py-3 px-4 text-sm text-right font-medium text-green-500">{position.myWinAmount || '-'}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{position.closeDate || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {/* AI Trading Summary */}
          {commentary && (
            <Card className="glass-card p-8 w-full">
              <h3 className="text-2xl font-semibold mb-4">AI Trading Summary</h3>
              <div className="p-6 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-primary">{commentary.agent}</span>
                  <span className="text-xs text-muted-foreground">{commentary.timestamp}</span>
                </div>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{commentary.message}</p>
              </div>
            </Card>
          )}

          {loading && (
            <Card className="glass-card p-8 text-center w-full">
              <div className="text-muted-foreground">Loading vault data...</div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

