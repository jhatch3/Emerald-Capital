import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ReportAccordion } from '@/components/reports/ReportAccordion';
import { MetricCard } from '@/components/MetricCard';
import { TrendingUp, Target, Award, Activity } from 'lucide-react';
import { 
  fetchDailyReports,
  fetchReportSummary,
  type DailyReport,
  type ReportSummary
} from '@/lib/api';

const Reports = () => {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const [reportsData, summaryData] = await Promise.all([
        fetchDailyReports(30),
        fetchReportSummary(),
      ]);
      setReports(reportsData);
      setSummary(summaryData);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  // Calculate summary stats from reports if summary not available
  const totalPnl = reports.reduce((sum, report) => {
    const pnlValue = parseFloat(report.pnl.replace(/[+,]/g, ''));
    return sum + pnlValue;
  }, 0);

  const avgWinRate = reports.length > 0
    ? reports.reduce((sum, report) => sum + report.winRate, 0) / reports.length
    : 0;

  const totalTrades = reports.reduce((sum, report) => sum + report.trades, 0);
  const profitableDays = reports.filter((report) => report.pnl.startsWith('+')).length;

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-solana bg-clip-text text-transparent">
          Performance Reports
        </h1>
        <p className="text-muted-foreground text-lg">
          Daily trading reports with IPFS archives
        </p>
      </div>

      {loading ? (
        <Card className="glass-card p-8 text-center">
          <div className="text-muted-foreground">Loading reports...</div>
        </Card>
      ) : (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total PnL (Period)"
              value={`$${totalPnl.toLocaleString()}`}
              icon={TrendingUp}
              trend="up"
              trendValue={`${reports.length} days`}
            />
            <MetricCard
              title="Average Win Rate"
              value={`${avgWinRate.toFixed(1)}%`}
              icon={Target}
              subtitle="Across all trades"
            />
            <MetricCard
              title="Profitable Days"
              value={`${profitableDays}/${reports.length}`}
              icon={Award}
              subtitle={`${reports.length > 0 ? ((profitableDays / reports.length) * 100).toFixed(0) : 0}% success rate`}
            />
            <MetricCard
              title="Total Trades"
              value={totalTrades.toString()}
              icon={Activity}
              subtitle="All executions"
            />
          </div>

          {/* Daily Reports */}
          {reports.length > 0 ? (
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Performance Reports</h3>
              <ReportAccordion reports={reports} />
            </Card>
          ) : (
            <Card className="glass-card p-8 text-center">
              <h3 className="text-2xl font-semibold mb-4">No Reports Available</h3>
              <p className="text-muted-foreground mb-4">
                Daily performance reports will appear here once the vault begins trading operations.
              </p>
            </Card>
          )}
        </>
      )}

      {/* Report Archive Info */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Report Archive Information</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            All daily performance reports are archived on IPFS (InterPlanetary File System) for permanent, decentralized storage and verification.
          </p>
          <p>
            Each report includes comprehensive trade logs, agent decision transcripts, risk metrics, and performance analytics.
          </p>
          <p>
            Reports are immutable once published, ensuring complete transparency and auditability of all trading activity.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
