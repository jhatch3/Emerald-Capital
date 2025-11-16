import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Wallet, Copy, Check, LogOut } from 'lucide-react';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const WalletConnectButton = () => {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { balance: solBalance, loading: solLoading, error: solError } = useSolBalance();
  const [copied, setCopied] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);

  const isLoading = solLoading;
  const hasError = solError;

  const handleSwitchWallet = async () => {
    await disconnect();
    setVisible(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex items-center">
      {connected && publicKey ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 px-4 font-medium hover:bg-muted/50">
              <Wallet className="w-4 h-4 text-primary mr-2" />
            <span className="text-foreground">
                {showFullAddress ? publicKey.toString() : `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`}
            </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="px-3 py-2 border-b border-border/50">
              <div className="text-xs text-muted-foreground mb-1">Connected Wallet</div>
              <div className="font-mono text-sm text-foreground break-all mb-2">
                {showFullAddress ? publicKey.toString() : `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`}
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
            <DropdownMenuItem
              onClick={() => setShowFullAddress(!showFullAddress)}
              className="cursor-pointer"
            >
              {showFullAddress ? 'Show Short Address' : 'Show Full Address'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => copyToClipboard(publicKey.toString())}
              className="cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </>
              )}
            </DropdownMenuItem>
            <div className="border-t border-border/50 my-1"></div>
            <DropdownMenuItem
              onClick={handleSwitchWallet}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Switch Wallet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <WalletMultiButton className="!bg-gradient-evergreen !text-white hover-glow-primary !rounded-lg !h-10 !px-6 !font-medium !transition-all !border-none" />
      )}
    </div>
  );
};
