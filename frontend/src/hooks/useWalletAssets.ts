import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export interface WalletAsset {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  uiAmount: number;
  isNative: boolean; // true for SOL
}

interface UseWalletAssetsReturn {
  assets: WalletAsset[];
  loading: boolean;
  error: Error | null;
  totalValueUSD: number;
}

/**
 * Custom hook to fetch all assets (SOL + SPL tokens) from connected wallet
 * Automatically updates every 10 seconds
 */
export const useWalletAssets = (): UseWalletAssetsReturn => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalValueUSD, setTotalValueUSD] = useState(0);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!publicKey || !connection) {
        setAssets([]);
        setLoading(false);
        setError(null);
        setTotalValueUSD(0);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const allAssets: WalletAsset[] = [];

        // Fetch SOL balance
        try {
          let lamports: number;
          // Try different commitment levels to avoid rate limits
          try {
            lamports = await connection.getBalance(publicKey, 'confirmed');
          } catch (e) {
            try {
              lamports = await connection.getBalance(publicKey, 'processed');
            } catch (e2) {
              lamports = await connection.getBalance(publicKey, 'finalized');
            }
          }
          
          const solBalance = lamports / LAMPORTS_PER_SOL;
          if (solBalance > 0) {
            allAssets.push({
              mint: 'So11111111111111111111111111111111111111112',
              symbol: 'SOL',
              name: 'Solana',
              balance: lamports,
              decimals: 9,
              uiAmount: solBalance,
              isNative: true,
            });
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          // Only log non-rate-limit errors
          if (!error.message.includes('403') && !error.message.includes('Access forbidden')) {
            console.error('Error fetching SOL balance:', err);
          }
        }

        // Fetch all SPL token accounts
        try {
          const tokenProgramId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            programId: tokenProgramId,
          });

          // Fetch metadata for all tokens in parallel
          const tokenPromises = tokenAccounts.value
            .filter(account => {
              const tokenAmount = account.account.data.parsed.info.tokenAmount;
              return tokenAmount.uiAmount > 0;
            })
            .map(async (account) => {
              const tokenAmount = account.account.data.parsed.info.tokenAmount;
              const mint = account.account.data.parsed.info.mint;
              
              // Fetch token metadata
              const tokenInfo = await fetchTokenMetadata(connection, mint);
              
              return {
                mint: mint,
                symbol: tokenInfo.symbol,
                name: tokenInfo.name,
                balance: tokenAmount.amount,
                decimals: tokenAmount.decimals,
                uiAmount: tokenAmount.uiAmount || 0,
                isNative: false,
              };
            });

          const tokenAssets = await Promise.all(tokenPromises);
          allAssets.push(...tokenAssets);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          // Only log non-rate-limit errors
          if (!error.message.includes('403') && !error.message.includes('Access forbidden')) {
            console.error('Error fetching token accounts:', err);
          }
        }

        // Sort assets: SOL first, then by balance (highest first)
        allAssets.sort((a, b) => {
          if (a.isNative) return -1;
          if (b.isNative) return 1;
          return b.uiAmount - a.uiAmount;
        });

        setAssets(allAssets);

        // Calculate total USD value (rough estimate)
        // SOL at ~$150, USDC at $1, others at $0 for now
        let total = 0;
        for (const asset of allAssets) {
          if (asset.symbol === 'SOL') {
            total += asset.uiAmount * 150; // Approximate SOL price
          } else if (asset.symbol === 'USDC' || asset.symbol === 'USDT') {
            total += asset.uiAmount; // Stablecoins at $1
          }
        }
        setTotalValueUSD(total);

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch wallet assets');
        console.error('Error fetching wallet assets:', error);
        setError(error);
        setAssets([]);
        setTotalValueUSD(0);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
    
    // Poll assets every 10 seconds
    const interval = setInterval(fetchAssets, 10000);
    
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  return { assets, loading, error, totalValueUSD };
};

/**
 * Fetch token metadata from token list APIs
 * Tries multiple sources to get token name and symbol
 */
async function fetchTokenMetadata(
  connection: any,
  mint: string
): Promise<{ name: string; symbol: string }> {
  // First check known tokens
  const knownToken = getTokenInfoFromList(mint);
  if (knownToken.name !== `Token ${mint.slice(0, 4)}...${mint.slice(-4)}`) {
    return knownToken;
  }

  // Try Jupiter Token List API (most comprehensive)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://token.jup.ag/all', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const tokens = await response.json();
      const token = tokens.find((t: any) => t.address === mint);
      if (token && token.name && token.symbol) {
        return { name: token.name, symbol: token.symbol };
      }
    }
  } catch (e) {
    // Continue to next source
  }

  // Try Solana FM API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`https://api.solana.fm/v0/tokens/${mint}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const tokenData = await response.json();
      if (tokenData.name && tokenData.symbol) {
        return { name: tokenData.name, symbol: tokenData.symbol };
      }
    }
  } catch (e) {
    // Continue to fallback
  }

  // Fallback: return mint-based identifier
  return {
    name: `Token ${mint.slice(0, 4)}...${mint.slice(-4)}`,
    symbol: mint.slice(0, 4).toUpperCase(),
  };
}

/**
 * Get token info from known token list
 */
function getTokenInfoFromList(mint: string): { name: string; symbol: string } {
  // Extended list of common Solana tokens
  const tokenMap: Record<string, { name: string; symbol: string }> = {
    // Native
    'So11111111111111111111111111111111111111112': { name: 'Solana', symbol: 'SOL' },
    
    // Stablecoins
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { name: 'USD Coin', symbol: 'USDC' },
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { name: 'Tether USD', symbol: 'USDT' },
    '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU': { name: 'USD Coin (Devnet)', symbol: 'USDC' },
    
    // Popular Solana tokens
    'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { name: 'Jupiter', symbol: 'JUP' },
    '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': { name: 'Ethereum (Wormhole)', symbol: 'ETH' },
    'A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM': { name: 'USD Coin (Wormhole)', symbol: 'USDCet' },
    'Dn4noZ5jgGfkntzcQSUZ8czkreiZ1ForXYoV2H8Dm7S1': { name: 'Tether USD (Wormhole)', symbol: 'USDTet' },
    'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { name: 'Marinade SOL', symbol: 'mSOL' },
    '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': { name: 'Orca', symbol: 'ORCA' },
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { name: 'Bonk', symbol: 'BONK' },
    'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': { name: 'Wrapped SOL', symbol: 'wSOL' },
    'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt': { name: 'Serum', symbol: 'SRM' },
    '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': { name: 'Raydium', symbol: 'RAY' },
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU': { name: 'Samoyedcoin', symbol: 'SAMO' },
    '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E': { name: 'Bitcoin (Wormhole)', symbol: 'BTC' },
    '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk': { name: 'Ethereum (Wormhole)', symbol: 'ETH' },
  };

  if (tokenMap[mint]) {
    return tokenMap[mint];
  }

  // Default: use mint address as identifier
  return {
    name: `Token ${mint.slice(0, 4)}...${mint.slice(-4)}`,
    symbol: mint.slice(0, 4).toUpperCase(),
  };
}

