import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Wallet, Coins, DollarSign, Calendar, TrendingUp, PieChart } from 'lucide-react';
import { 
  fetchUserDeposit,
  fetchUserProfile,
  fetchUserNavHistory,
  fetchUserCommentary,
  type UserProfile,
  type NavHistoryPoint,
  type AgentCommentary
} from '@/lib/api';
import { LineChart } from '@/components/charts/LineChart';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useUSDCBalance } from '@/hooks/useUSDCBalance';
import { BalanceVerification } from '@/components/BalanceVerification';
import { WalletAssets } from '@/components/WalletAssets';

const Profile = () => {
  const { publicKey } = useWallet();
  const { balance: solBalance, loading: solLoading } = useSolBalance();
  const { balance: usdcBalance, loading: usdcLoading } = useUSDCBalance();
  const [depositedAmount, setDepositedAmount] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [navHistory, setNavHistory] = useState<NavHistoryPoint[]>([]);
  const [commentary, setCommentary] = useState<AgentCommentary[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all user data from backend
  useEffect(() => {
    const fetchAllData = async () => {
      if (!publicKey) {
        setDepositedAmount(0);
        setUserProfile(null);
        setNavHistory([]);
        setCommentary([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const walletAddress = publicKey.toString();

      const [deposit, profile, nav, comments] = await Promise.all([
        fetchUserDeposit(walletAddress),
        fetchUserProfile(walletAddress),
        fetchUserNavHistory(walletAddress, 30),
        fetchUserCommentary(walletAddress),
      ]);

      setDepositedAmount(deposit);
      setUserProfile(profile);
      setNavHistory(nav);
      setCommentary(comments);
      setLoading(false);
    };

    fetchAllData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, [publicKey]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-solana bg-clip-text text-transparent">
            Your Profile
          </h1>
          <p className="text-muted-foreground text-lg">
            Personal vault statistics and performance
          </p>
        </div>

        {/* Balance Verification (Dev Only) */}
        <BalanceVerification />

        {/* Wallet Info Card */}
        <Card className="glass-card p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-solana-glow flex items-center justify-center">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Wallet Address</div>
              <div className="font-mono text-lg">
                {publicKey ? publicKey.toString() : 'Not Connected'}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-border">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Coins className="w-4 h-4" />
                <span className="text-sm">SOL Balance</span>
              </div>
              <div className="text-3xl font-bold">
                {!publicKey ? (
                  <span className="text-muted-foreground">Connect Wallet</span>
                ) : solLoading ? (
                  <span className="text-muted-foreground">Loading...</span>
                ) : solBalance !== null ? (
                  `${solBalance.toFixed(4)} SOL`
                ) : (
                  <span className="text-muted-foreground">Unable to fetch</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {solBalance !== null && !solLoading && publicKey
                  ? `≈ $${(solBalance * 150).toFixed(2)} USD`
                  : ''}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">USDC Balance</span>
              </div>
              <div className="text-3xl font-bold">
                {!publicKey ? (
                  <span className="text-muted-foreground">Connect Wallet</span>
                ) : usdcLoading ? (
                  <span className="text-muted-foreground">Loading...</span>
                ) : usdcBalance !== null ? (
                  `${usdcBalance.toFixed(2)} USDC`
                ) : (
                  <span className="text-muted-foreground">Unable to fetch</span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {usdcBalance !== null && !usdcLoading && publicKey
                  ? `≈ $${usdcBalance.toFixed(2)} USD`
                  : ''}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Coins className="w-4 h-4" />
                <span className="text-sm">Deposited in App</span>
              </div>
              <div className="text-3xl font-bold">
                {depositedAmount > 0 ? `${depositedAmount.toFixed(4)} SOL` : '0.0000 SOL'}
              </div>
              <div className="text-sm text-muted-foreground">
                {depositedAmount > 0 ? `≈ $${(depositedAmount * 150).toFixed(2)} USD` : 'No deposits yet'}
              </div>
            </div>
          </div>
        </Card>

        {/* All Wallet Assets */}
        <WalletAssets />

        {/* User Profile Data */}
        {!loading && userProfile && (
          <>
            <Card className="glass-card p-8">
              <h3 className="text-2xl font-semibold mb-6">Vault Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Total Deposited</span>
                  </div>
                  <div className="text-3xl font-bold">{userProfile.totalDeposited} SOL</div>
                  <div className="text-sm text-muted-foreground">
                    ${userProfile.totalDepositedUSD.toLocaleString()} USD
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Deposit Date</span>
                  </div>
                  <div className="text-2xl font-semibold">{userProfile.depositDate}</div>
                  <div className="text-sm text-muted-foreground">
                    {userProfile.daysInVault} days in vault
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <PieChart className="w-4 h-4" />
                    <span className="text-sm">Vault Ownership</span>
                  </div>
                  <div className="text-3xl font-bold">{userProfile.vaultSharePercent}%</div>
                  <div className="text-sm text-muted-foreground">
                    {userProfile.vaultShares.toFixed(4)} shares
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Estimated Yield</span>
                  </div>
                  <div className="text-3xl font-bold text-green-500">+{userProfile.estimatedYieldPercent}%</div>
                  <div className="text-sm text-muted-foreground">
                    +{userProfile.estimatedYieldSOL} SOL
                  </div>
                </div>
              </div>
            </Card>

            {/* Personal NAV Chart */}
            <Card className="glass-card p-8">
              <h3 className="text-2xl font-semibold mb-6">Your NAV Over Time</h3>
              {navHistory.length > 0 ? (
                <LineChart
                  data={navHistory}
                  dataKey="nav"
                  xAxisKey="date"
                  color="hsl(270 91% 65%)"
                  height={280}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No NAV history available
                </div>
              )}
            </Card>

            {/* Agent Commentary */}
            {commentary.length > 0 && (
              <Card className="glass-card p-8">
                <h3 className="text-2xl font-semibold mb-4">AI Agent Commentary</h3>
                <div className="space-y-4">
                  {commentary.map((comment, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-primary">{comment.agent}</span>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="text-foreground/90">{comment.message}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {loading && (
          <Card className="glass-card p-8 text-center">
            <div className="text-muted-foreground">Loading profile data...</div>
          </Card>
        )}

        {depositedAmount === 0 && (
          <Card className="glass-card p-8">
            <h3 className="text-2xl font-semibold mb-4">No Deposits Yet</h3>
            <p className="text-muted-foreground">
              Visit the Deposit page to stake your SOL and start earning returns.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
