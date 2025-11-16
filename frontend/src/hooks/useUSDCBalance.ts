import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface UseUSDCBalanceReturn {
  balance: number | null;
  loading: boolean;
  error: Error | null;
}

// USDC mint addresses
const USDC_MAINNET = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const USDC_DEVNET = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

/**
 * Custom hook to fetch and maintain USDC balance from connected wallet
 * Automatically updates every 5 seconds
 */
export const useUSDCBalance = (): UseUSDCBalanceReturn => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey || !connection) {
        setBalance(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Determine network and USDC mint address
        const endpoint = connection.rpcEndpoint;
        const isMainnet = endpoint.includes('mainnet') || !endpoint.includes('devnet');
        const usdcMint = isMainnet ? USDC_MAINNET : USDC_DEVNET;
        
        // Get all token accounts for the wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          mint: new PublicKey(usdcMint),
        });

        // Calculate total USDC balance
        let totalBalance = 0;
        if (tokenAccounts.value.length > 0) {
          for (const account of tokenAccounts.value) {
            const tokenAmount = account.account.data.parsed.info.tokenAmount;
            // USDC has 6 decimals
            totalBalance += tokenAmount.uiAmount || 0;
          }
        }
        
        setBalance(totalBalance);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch USDC balance');
        
        // Check if it's a rate limit error
        const isRateLimit = error.message.includes('403') || 
                           error.message.includes('Access forbidden') ||
                           error.message.includes('rate limit');
        
        if (isRateLimit) {
          console.warn('Rate limited when fetching USDC balance');
          // Don't log as error, just set balance to null
          setError(null); // Suppress rate limit errors for USDC
        } else {
          console.error('Error fetching USDC balance:', error);
          setError(error);
        }
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    
    // Poll balance every 5 seconds
    const interval = setInterval(fetchBalance, 5000);
    
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  return { balance, loading, error };
};

