import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface UseSolBalanceReturn {
  balance: number | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook to fetch and maintain SOL balance from connected wallet
 * Automatically updates every 5 seconds
 */
export const useSolBalance = (): UseSolBalanceReturn => {
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
        
        // Try with retry logic for rate limits
        let lamports: number | null = null;
        let lastError: Error | null = null;
        
        // Try different commitment levels
        const commitments: Array<'processed' | 'confirmed' | 'finalized'> = ['confirmed', 'processed', 'finalized'];
        
        for (const commitment of commitments) {
          try {
            lamports = await connection.getBalance(publicKey, commitment);
            break; // Success, exit loop
          } catch (err) {
            lastError = err instanceof Error ? err : new Error('Failed to fetch balance');
            // Check if it's a rate limit error
            const isRateLimit = lastError.message.includes('403') || 
                               lastError.message.includes('Access forbidden') ||
                               lastError.message.includes('rate limit');
            
            if (isRateLimit && commitment !== 'finalized') {
              // Try next commitment level
              continue;
            } else if (isRateLimit) {
              // All commitment levels failed with rate limit
              throw new Error('RPC rate limit exceeded. The public Solana RPC has rate limits. Please set VITE_SOLANA_RPC_URL or VITE_HELIUS_API_KEY environment variable for a custom RPC endpoint.');
            } else {
              // Non-rate-limit error, throw immediately
              throw lastError;
            }
          }
        }
        
        if (lamports === null) {
          throw lastError || new Error('Failed to fetch balance');
        }
        
        const solBalance = lamports / LAMPORTS_PER_SOL;
        setBalance(solBalance);
        setError(null); // Clear any previous errors on success
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch balance');
        setError(error);
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

