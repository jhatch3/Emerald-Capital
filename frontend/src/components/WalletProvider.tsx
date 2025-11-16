import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
  CoinbaseWalletAdapter 
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  // Use mainnet-beta to see real wallet balances
  // Using a more reliable RPC endpoint with fallbacks
  const endpoint = useMemo(() => {
    // Try to use environment variable first
    const customEndpoint = import.meta.env.VITE_SOLANA_RPC_URL;
    if (customEndpoint) {
      return customEndpoint;
    }
    
    // Use Helius public RPC (more reliable than default Solana RPC)
    // You can get a free API key from https://www.helius.dev/ for better rate limits
    const heliusApiKey = import.meta.env.VITE_HELIUS_API_KEY;
    if (heliusApiKey) {
      return `https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`;
    }
    
    // Use multiple fallback RPC endpoints for better reliability
    // These are public endpoints that may have rate limits
    // For production, use a paid RPC provider (Helius, QuickNode, etc.)
    const fallbackEndpoints = [
      'https://solana-api.projectserum.com', // Serum RPC
      'https://api.mainnet-beta.solana.com', // Official Solana RPC (rate limited)
    ];
    
    // Return the first endpoint (can implement rotation logic if needed)
    return fallbackEndpoints[0];
  }, []);

  // Include Phantom, Solflare, and Coinbase wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
