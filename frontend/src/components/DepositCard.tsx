import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ArrowDown, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useSolBalance } from '@/hooks/useSolBalance';

export const DepositCard = () => {
  const { connected, publicKey } = useWallet();
  const { balance, loading } = useSolBalance();
  const [depositAmount, setDepositAmount] = useState('');

  const vaultSharePrice = 1.0847;
  const estimatedShares = depositAmount ? (parseFloat(depositAmount) / vaultSharePrice).toFixed(4) : '0';

  const handleDeposit = () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    // Mock deposit action
    toast.success(`Deposit of ${depositAmount} SOL initiated!`, {
      description: `You will receive approximately ${estimatedShares} vault shares`,
    });
    setDepositAmount('');
  };

  return (
    <Card className="glass-card p-6 max-w-md mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Deposit to Vault</h2>
          <p className="text-sm text-muted-foreground">
            Stake your SOL to earn AI-powered trading returns
          </p>
        </div>

        {connected && publicKey && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Connected Wallet</span>
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div className="font-mono text-sm mb-2">
              {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </div>
            <div className="text-xs text-muted-foreground">
              Balance: {loading ? 'Loading...' : balance !== null ? `~${balance.toFixed(2)} SOL` : 'N/A'}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Deposit Amount (SOL)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="text-lg h-12"
              step="0.01"
              min="0"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDepositAmount('1')}
                className="flex-1"
              >
                1 SOL
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDepositAmount('5')}
                className="flex-1"
              >
                5 SOL
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (balance !== null) {
                    setDepositAmount(balance.toFixed(4));
                  }
                }}
                className="flex-1"
                disabled={balance === null || loading}
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated Vault Shares</label>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="text-2xl font-bold">{estimatedShares}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Current share price: {vaultSharePrice.toFixed(4)} SOL
              </div>
            </div>
          </div>
        </div>

        <Button
          className="w-full h-12 bg-gradient-evergreen hover-glow-primary text-base font-semibold"
          onClick={handleDeposit}
          disabled={!connected}
        >
          {connected ? 'Deposit SOL' : 'Connect Wallet to Deposit'}
        </Button>

        <div className="text-xs text-center text-muted-foreground space-y-1">
          <p>⚠️ Deposits are final - no withdrawals or redemptions</p>
          <p>Your funds will be managed by AI trading agents</p>
        </div>
      </div>
    </Card>
  );
};
