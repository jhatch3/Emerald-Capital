/**
 * EXAMPLE: Dashboard page using API instead of mock data
 * 
 * This shows how to convert the Dashboard page from using mock data
 * to using the API client with React Query.
 * 
 * To use this:
 * 1. Replace the current Dashboard.tsx with this implementation
 * 2. Make sure your backend has the corresponding endpoints
 * 3. Set VITE_API_BASE_URL in your .env.local file
 */

import { MetricCard } from '@/components/MetricCard';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { Card } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Activity } from 'lucide-react';
import { 
  useVaultStats,
  useNavHistory,
  useMarketAllocations,
  usePnlDistribution,
  useCurrentPositions
} from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  // Fetch all data using React Query hooks
  const { data: vaultStats, isLoading: statsLoading, error: statsError } = useVaultStats();
  const { data: navHistory, isLoading: navLoading } = useNavHistory();
  const { data: marketAllocations, isLoading: allocationsLoading } = useMarketAllocations();
  const { data: pnlHistogram, isLoading: pnlLoading } = usePnlDistribution();
  const { data: currentPositions, isLoading: positionsLoading } = useCurrentPositions();

  // Show loading state
  if (statsLoading || navLoading || allocationsLoading || pnlLoading || positionsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (statsError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Data</h2>
          <p className="text-muted-foreground">
            {statsError instanceof Error ? statsError.message : 'Failed to load dashboard data'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-evergreen bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Real-time vault performance and AI trading activity
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Value Locked"
          value={`$${vaultStats?.totalValueLocked.toLocaleString() || '0'}`}
          icon={DollarSign}
          trend="up"
          trendValue="24h: +$14,293"
        />
        <MetricCard
          title="Number of Depositors"
          value={vaultStats?.numberOfDepositors.toLocaleString() || '0'}
          icon={Users}
          subtitle="Active participants"
        />
        <MetricCard
          title="Strategy Win Rate"
          value={`${vaultStats?.strategyWinRate || 0}%`}
          icon={TrendingUp}
          trend="up"
          trendValue="Last 30 days"
        />
        <MetricCard
          title="24h PnL"
          value={`$${vaultStats?.pnl24h.toLocaleString() || '0'}`}
          icon={Activity}
          trend="up"
          trendValue="+0.52%"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">NAV Over Time</h3>
          {navHistory && navHistory.length > 0 ? (
            <LineChart
              data={navHistory}
              dataKey="nav"
              xAxisKey="date"
              color="hsl(0 0% 98%)"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Allocation by Market Type</h3>
          {marketAllocations && marketAllocations.length > 0 ? (
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
        {pnlHistogram && pnlHistogram.length > 0 ? (
          <BarChart
            data={pnlHistogram}
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
        {currentPositions && currentPositions.length > 0 ? (
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
                {currentPositions.map((position, index) => (
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
    </div>
  );
};

export default Dashboard;

