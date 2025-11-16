/**
 * Development component to verify balance data is being fetched correctly
 * Shows detailed information about balance fetching status
 */

import { useSolBalance } from '@/hooks/useSolBalance';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Card } from './ui/card';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { isValidBalance, formatBalance } from '@/utils/balanceVerification';

export const BalanceVerification = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { balance, loading, error } = useSolBalance();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const isBalanceValid = isValidBalance(balance);
  const hasWallet = connected && publicKey !== null;
  const hasError = error !== null;

  return (
    <Card className="p-4 mb-4 border-2 border-dashed">
      <div className="space-y-3">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <AlertCircle className="w-4 h-4" />
          Balance Verification (Dev Only)
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            {hasWallet ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span>Wallet Connected: {hasWallet ? 'Yes' : 'No'}</span>
          </div>

          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
            <span>Loading: {loading ? 'Yes' : 'No'}</span>
          </div>

          <div className="flex items-center gap-2">
            {isBalanceValid ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span>Balance Valid: {isBalanceValid ? 'Yes' : 'No'}</span>
          </div>

          <div className="flex items-center gap-2">
            {hasError ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
            <span>Error: {hasError ? 'Yes' : 'No'}</span>
          </div>
        </div>

        <div className="pt-2 border-t space-y-1 text-xs">
          <div>
            <span className="text-muted-foreground">Raw Balance: </span>
            <span className="font-mono">{balance !== null ? balance.toString() : 'null'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Formatted: </span>
            <span className="font-mono">{formatBalance(balance)} SOL</span>
          </div>
          {error && (
            <div className="text-red-500 space-y-2">
              <div>
                <span className="text-muted-foreground">Error: </span>
                {error.message}
              </div>
              {error.message.includes('rate limit') && (
                <div className="text-xs text-yellow-500 bg-yellow-500/10 p-2 rounded mt-2">
                  <strong>Solution:</strong> The public Solana RPC has rate limits. To fix this:
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Get a free API key from <a href="https://www.helius.dev/" target="_blank" rel="noopener noreferrer" className="underline">Helius</a> or use another RPC provider</li>
                    <li>Create a <code className="bg-muted px-1 rounded">.env</code> file in the frontend directory</li>
                    <li>Add: <code className="bg-muted px-1 rounded">VITE_HELIUS_API_KEY=your-api-key</code></li>
                    <li>Restart the dev server</li>
                  </ol>
                </div>
              )}
            </div>
          )}
          {publicKey && (
            <div>
              <span className="text-muted-foreground">Wallet: </span>
              <span className="font-mono text-xs">{publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}</span>
            </div>
          )}
          {connection && (
            <div>
              <span className="text-muted-foreground">Network: </span>
              <span className="font-mono text-xs">
                {connection.rpcEndpoint.includes('mainnet') ? 'Mainnet' : 
                 connection.rpcEndpoint.includes('devnet') ? 'Devnet' : 
                 connection.rpcEndpoint.includes('testnet') ? 'Testnet' : 
                 'Custom'}
              </span>
            </div>
          )}
          {connection && (
            <div className="text-xs">
              <span className="text-muted-foreground">Endpoint: </span>
              <span className="font-mono break-all">{connection.rpcEndpoint}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

