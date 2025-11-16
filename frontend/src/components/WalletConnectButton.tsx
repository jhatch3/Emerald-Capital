import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet } from 'lucide-react';
import { useSolBalance } from '@/hooks/useSolBalance';

export const WalletConnectButton = () => {
  const { connected, publicKey } = useWallet();
  const { balance: solBalance, loading: solLoading, error: solError } = useSolBalance();

  const isLoading = solLoading;
  const hasError = solError;

  return (
    <div className="flex items-center gap-4">
      {connected && publicKey && (
        <div className="hidden md:flex flex-col items-end gap-1">
          <div className="text-sm text-muted-foreground">Connected Wallet</div>
          <div className="flex items-center gap-2 text-sm font-mono">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-foreground">
              {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {isLoading ? (
              'Loading balance...'
            ) : hasError ? (
              'Error fetching balance'
            ) : (
              <>
                {solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'Balance unavailable'}
              </>
            )}
          </div>
        </div>
      )}
      <WalletMultiButton className="!bg-gradient-solana hover-glow-primary !rounded-lg !h-10 !px-6 !font-medium !transition-all" />
    </div>
  );
};
