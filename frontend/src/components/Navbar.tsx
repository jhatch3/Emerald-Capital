import { Link, useLocation } from 'react-router-dom';
import { WalletConnectButton } from './WalletConnectButton';
import { useWalletContext } from '@/contexts/WalletContext';
import { LayoutDashboard, FileText, Users, Building2 } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const { hasCompletedOnboarding } = useWalletContext();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/vault', label: 'Vault', icon: Building2 },
    { path: '/governance', label: 'Governance', icon: FileText },
    { path: '/agents', label: 'Agents', icon: Users },
  ];

  // Don't show full nav on landing page or if not opted in
  const isLandingPage = location.pathname === '/';
  const showFullNav = hasCompletedOnboarding && !isLandingPage;

  return (
    <nav className="border-b border-border/50 glass-card sticky top-0 z-50 backdrop-blur-md bg-background/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
            <div className="w-11 h-11 rounded-lg bg-gradient-evergreen flex items-center justify-center glow-primary shadow-lg">
              <span className="text-2xl font-bold">Σ</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-foreground leading-tight">
                Evergreen Capital
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                Decentralized AI Trading
              </div>
            </div>
          </Link>

          {showFullNav && (
            <div className="hidden lg:flex items-center gap-2 flex-1 justify-center max-w-2xl mx-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {showFullNav && (
            <div className="flex items-center">
              <WalletConnectButton />
            </div>
          )}
        </div>

        {/* Mobile Navigation - Only show if opted in */}
        {showFullNav && (
          <div className="flex lg:hidden items-center gap-2 mt-2 pb-3 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap text-sm font-medium ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
