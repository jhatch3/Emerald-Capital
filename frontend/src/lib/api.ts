const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserDeposit {
  walletAddress: string;
  depositedAmount: number;
}

export interface VaultStats {
  totalValueLocked: number;
  numberOfDepositors: number;
  strategyWinRate: number;
  pnl24h: number;
  vaultSharePrice: number;
  userDepositedAmount?: number;
  userVaultShares?: number;
}

export interface NavHistoryPoint {
  date: string;
  nav: number;
}

export interface TvlHistoryPoint {
  date: string;
  value: number;
}

export interface MarketAllocation {
  market: string;
  allocation: number;
}

export interface PnlHistogramPoint {
  range: string;
  count: number;
}

export interface DepositRequest {
  amount: number;
  walletAddress: string;
  signature?: string;
}

export interface DepositResponse {
  transactionHash: string;
  status: string;
  message: string;
}

export interface UserProfile {
  totalDeposited: number;
  totalDepositedUSD: number;
  depositDate: string;
  daysInVault: number;
  vaultSharePercent: number;
  vaultShares: number;
  estimatedYieldPercent: number;
  estimatedYieldSOL: number;
}

export interface AgentCommentary {
  agent: string;
  timestamp: string;
  message: string;
}

export interface Deposit {
  id: string;
  amount: number;
  amountUSD: number;
  timestamp: string;
  transactionHash: string;
  status: string;
}

export interface Position {
  market: string;
  side: 'LONG' | 'SHORT';
  size: string;
  entryPrice: string;
  currentPrice: string;
  pnl: string;
  pnlValue: string;
}

export interface Proposal {
  id: string;
  market: string;
  direction: 'LONG' | 'SHORT';
  positionSize: string;
  riskScore: number;
  confidence: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  summary: string;
  timestamp: string;
  dataSources: string[];
}

export interface AgentReasoning {
  agent: string;
  vote: 'YES' | 'NO';
  rationale: string;
}

export interface VoteRequest {
  vote: 'YES' | 'NO';
  walletAddress: string;
  signature?: string;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  voteId?: string;
}

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
  specialty: string;
  winRate: number;
}

export interface DebateMessage {
  agent: string;
  message: string;
  timestamp: string;
  vote: 'YES' | 'NO';
}

export interface DebateTranscript {
  proposalId?: string;
  messages: DebateMessage[];
}

export interface DailyReport {
  date: string;
  pnl: string;
  pnlPercent: string;
  trades: number;
  winRate: number;
  keyTrades: string[];
  agentNotes: string;
  ipfsReport: string;
}

export interface ReportSummary {
  totalPnl: number;
  averageWinRate: number;
  totalTrades: number;
  profitableDays: number;
  totalDays: number;
}

// ============================================================================
// HELPER FUNCTION
// ============================================================================

const handleFetchError = (error: unknown, defaultReturn: any) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isConnectionError = 
    (error instanceof TypeError && errorMessage.includes('Failed to fetch')) ||
    errorMessage.includes('ERR_CONNECTION_REFUSED') ||
    errorMessage.includes('aborted') ||
    error instanceof DOMException;
  
  if (import.meta.env.DEV && !isConnectionError) {
    console.warn('API Error:', error);
  }
  return defaultReturn;
};

// ============================================================================
// VAULT ENDPOINTS
// ============================================================================

export const fetchVaultStats = async (walletAddress?: string): Promise<VaultStats | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const url = walletAddress 
      ? `${API_BASE_URL}/api/vault/stats?wallet=${walletAddress}`
      : `${API_BASE_URL}/api/vault/stats`;
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return handleFetchError(error, null);
  }
};

export const fetchNavHistory = async (days: number = 30): Promise<NavHistoryPoint[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/vault/nav/history?days=${days}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

export const fetchTvlHistory = async (days: number = 30): Promise<TvlHistoryPoint[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/vault/tvl/history?days=${days}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

export const fetchMarketAllocations = async (): Promise<MarketAllocation[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/vault/allocations`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

export const fetchPnlDistribution = async (): Promise<PnlHistogramPoint[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/vault/pnl/distribution`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

export const createDeposit = async (deposit: DepositRequest): Promise<DepositResponse | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_BASE_URL}/api/vault/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deposit),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return handleFetchError(error, null);
  }
};

// ============================================================================
// USER ENDPOINTS
// ============================================================================

export const fetchUserDeposit = async (walletAddress: string): Promise<number> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = `${API_BASE_URL}/api/users/${walletAddress}/deposit`;
    
    // Debug logging (remove in production)
    if (import.meta.env.DEV) {
      console.log('[API] Fetching deposit:', url);
    }

    const response = await fetch(url, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (import.meta.env.DEV) {
        console.warn('[API] Response not OK:', response.status, response.statusText);
      }
      return 0;
    }
    
    const data = await response.json();
    
    if (import.meta.env.DEV) {
      console.log('[API] Deposit data received:', data);
    }
    
    return data.depositedAmount || 0;
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.error('[API] Error fetching deposit:', error);
    }
    return handleFetchError(error, 0);
  }
};

export const fetchUserProfile = async (walletAddress: string): Promise<UserProfile | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/user/profile?wallet=${walletAddress}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return handleFetchError(error, null);
  }
};

export const fetchUserNavHistory = async (walletAddress: string, days: number = 30): Promise<NavHistoryPoint[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/user/nav/history?wallet=${walletAddress}&days=${days}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

export const fetchUserCommentary = async (walletAddress: string): Promise<AgentCommentary[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/user/commentary?wallet=${walletAddress}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

export const fetchUserDeposits = async (walletAddress: string): Promise<Deposit[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/user/deposits?wallet=${walletAddress}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

// ============================================================================
// POSITIONS ENDPOINTS
// ============================================================================

export const fetchCurrentPositions = async (): Promise<Position[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/positions/current`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

// ============================================================================
// GOVERNANCE ENDPOINTS
// ============================================================================

export const fetchProposals = async (status?: string, limit: number = 50): Promise<Proposal[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/api/governance/proposals?${params}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

export const fetchProposal = async (proposalId: string): Promise<Proposal | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/governance/proposals/${proposalId}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return handleFetchError(error, null);
  }
};

export const fetchProposalReasoning = async (proposalId: string): Promise<AgentReasoning[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/governance/proposals/${proposalId}/reasoning`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

export const voteOnProposal = async (proposalId: string, voteData: VoteRequest): Promise<VoteResponse | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${API_BASE_URL}/api/governance/proposals/${proposalId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voteData),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return handleFetchError(error, null);
  }
};

// ============================================================================
// AGENTS ENDPOINTS
// ============================================================================

export const fetchAgents = async (): Promise<AgentPersona[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/agents`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

export const fetchDebateTranscript = async (proposalId: string): Promise<DebateTranscript | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/agents/debate/${proposalId}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return handleFetchError(error, null);
  }
};

export const fetchLiveDebate = async (): Promise<DebateTranscript | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/agents/debate/live`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return handleFetchError(error, null);
  }
};

// ============================================================================
// REPORTS ENDPOINTS
// ============================================================================

export const fetchDailyReports = async (limit: number = 30, offset: number = 0): Promise<DailyReport[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/reports/daily?limit=${limit}&offset=${offset}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return handleFetchError(error, []);
  }
};

export const fetchDailyReport = async (date: string): Promise<DailyReport | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/reports/daily/${date}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return handleFetchError(error, null);
  }
};

export const fetchReportSummary = async (): Promise<ReportSummary | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/api/reports/summary`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return handleFetchError(error, null);
  }
};
