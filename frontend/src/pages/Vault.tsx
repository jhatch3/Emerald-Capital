import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  fetchUserProfile,
  fetchVaultStats,
  type VaultStats,
  type UserProfile
} from '@/lib/api';
import { PieChart, Building2, Calendar } from 'lucide-react';

const Vault = () => {
  const { publicKey } = useWallet();
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      if (publicKey) {
        const [profile, stats] = await Promise.all([
          fetchUserProfile(publicKey.toString()),
          fetchVaultStats(publicKey.toString())
        ]);
        setUserProfile(profile);
        setVaultStats(stats);
      }
      
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
        <h1 className="text-5xl md:text-6xl font-bold text-foreground">
          Vault
        </h1>
        <p className="text-muted-foreground text-lg">
          Your vault ownership and deposit information
        </p>
      </div>

      {!publicKey ? (
        <Card className="glass-card p-8 text-center">
          <h3 className="text-2xl font-semibold mb-4">Connect Your Wallet</h3>
          <p className="text-muted-foreground">
            Please connect your wallet to view your vault information.
          </p>
        </Card>
      ) : loading ? (
        <Card className="glass-card p-8 text-center">
          <p className="text-muted-foreground">Loading vault data...</p>
        </Card>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {userProfile && (
              <>
                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                    <PieChart className="w-4 h-4" />
                    Vault Ownership
                  </h3>
                  <div className="text-2xl font-bold mb-1">
                    <span>{userProfile.vaultSharePercent}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span>{userProfile.vaultShares.toFixed(4)} shares</span>
                  </p>
                </Card>

                {vaultStats && (
                  <Card className="glass-card p-5">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      Total Vault Value
                    </h3>
                    <div className="text-2xl font-bold mb-1">
                      ${vaultStats.totalValueLocked.toLocaleString()}
                    </div>
                  </Card>
                )}

                <Card className="glass-card p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Deposit Date
                  </h3>
                  <div className="text-xl font-bold mb-1">
                    <span>{userProfile.depositDate}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span>{userProfile.daysInVault} days in vault</span>
                  </p>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Vault;

