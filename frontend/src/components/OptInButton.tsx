import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletContext } from '@/contexts/WalletContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const OptInButton = () => {
  const { connected } = useWallet();
  const { isOptedIn, optIn } = useWalletContext();
  const navigate = useNavigate();

  const handleOptIn = () => {
    if (!connected) {
      // Wallet connection is handled by WalletMultiButton
      return;
    }

    if (!isOptedIn) {
      optIn();
      toast.success('Successfully opted in!', {
        description: 'Welcome to Evergreen Capital',
      });
      navigate('/dashboard');
    }
  };

  if (!connected) {
    return (
      <WalletMultiButton className="!bg-gradient-evergreen !text-white !text-lg !font-semibold !px-12 !py-6 !h-auto !rounded-xl hover-glow-primary !transition-all !shadow-lg" />
    );
  }

  if (connected && !isOptedIn) {
    return (
      <Button
        onClick={handleOptIn}
        className="!bg-gradient-evergreen !text-white !text-lg !font-semibold !px-12 !py-6 !h-auto !rounded-xl hover-glow-primary !transition-all !shadow-lg"
      >
        Opt In to Access Dashboard
      </Button>
    );
  }

  return null;
};
