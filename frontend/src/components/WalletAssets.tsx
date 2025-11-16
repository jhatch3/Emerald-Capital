import { Card } from './ui/card';
import { useWalletAssets, WalletAsset } from '@/hooks/useWalletAssets';
import { Coins, Loader2, AlertCircle } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

const AssetRow = ({ asset }: { asset: WalletAsset }) => {
  const getUSDValue = (asset: WalletAsset): number => {
    if (asset.symbol === 'SOL') {
      return asset.uiAmount * 150; // Approximate SOL price
    } else if (asset.symbol === 'USDC' || asset.symbol === 'USDT') {
      return asset.uiAmount; // Stablecoins at $1
    }
    return 0; // Unknown tokens - no price data
  };

  const usdValue = getUSDValue(asset);
  const formatBalance = (amount: number, decimals: number): string => {
    if (decimals <= 2) {
      return amount.toFixed(2);
    } else if (decimals <= 4) {
      return amount.toFixed(4);
    } else {
      return amount.toFixed(6);
    }
  };

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-solana-glow flex items-center justify-center">
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-semibold">{asset.symbol}</div>
            <div className="text-xs text-muted-foreground">{asset.name}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="font-medium">{formatBalance(asset.uiAmount, asset.decimals)}</div>
        {usdValue > 0 && (
          <div className="text-xs text-muted-foreground">≈ ${usdValue.toFixed(2)}</div>
        )}
      </td>
      <td className="py-4 px-4 text-right text-sm text-muted-foreground font-mono">
        {asset.mint.slice(0, 8)}...{asset.mint.slice(-8)}
      </td>
    </tr>
  );
};

export const WalletAssets = () => {
  const { publicKey } = useWallet();
  const { assets, loading, error, totalValueUSD } = useWalletAssets();

  if (!publicKey) {
    return (
      <Card className="glass-card p-8 text-center w-full">
        <h3 className="text-2xl font-semibold mb-4">Wallet Assets</h3>
        <p className="text-muted-foreground">Connect your wallet to view your assets</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="glass-card p-8 w-full">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading assets...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-card p-8 w-full">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>Error loading assets: {error.message}</span>
        </div>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card className="glass-card p-8 text-center w-full">
        <h3 className="text-2xl font-semibold mb-4">No Assets Found</h3>
        <p className="text-muted-foreground">Your wallet doesn't have any assets yet</p>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-semibold mb-2">Wallet Assets</h3>
          <p className="text-sm text-muted-foreground">
            {assets.length} {assets.length === 1 ? 'asset' : 'assets'} found
          </p>
        </div>
        {totalValueUSD > 0 && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold">≈ ${totalValueUSD.toFixed(2)}</div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Asset</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Mint Address</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <AssetRow key={`${asset.mint}-${index}`} asset={asset} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

