import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SolanaWalletProvider } from "@/components/WalletProvider";
import { WalletContextProvider } from "@/contexts/WalletContext";
import { Navbar } from "@/components/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Vault from "./pages/Vault";
import Governance from "./pages/Governance";
import Agents from "./pages/Agents";
import Dev from "./pages/Dev";
import NotFound from "./pages/NotFound";
import { useWalletContext } from "@/contexts/WalletContext";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { hasCompletedOnboarding } = useWalletContext();
  
  if (!hasCompletedOnboarding) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SolanaWalletProvider>
      <WalletContextProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen w-full bg-background">
              <Navbar />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/deposit" 
                  element={
                    <ProtectedRoute>
                      <Deposit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/vault" 
                  element={
                    <ProtectedRoute>
                      <Vault />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/governance" 
                  element={
                    <ProtectedRoute>
                      <Governance />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/agents" 
                  element={
                    <ProtectedRoute>
                      <Agents />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dev" 
                  element={
                    <ProtectedRoute>
                      <Dev />
                    </ProtectedRoute>
                  } 
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </WalletContextProvider>
    </SolanaWalletProvider>
  </QueryClientProvider>
);

export default App;
