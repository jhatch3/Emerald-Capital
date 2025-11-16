# API Functions Reference

Complete list of all fetch functions available in `src/lib/api.ts`

## Vault Endpoints

### `fetchVaultStats(walletAddress?: string)`
Get vault-wide statistics. Optionally include user-specific data.
```typescript
const stats = await fetchVaultStats(); // All vault stats
const stats = await fetchVaultStats(walletAddress); // With user data
```

### `fetchNavHistory(days?: number)`
Get NAV (Net Asset Value) history. Default: 30 days.
```typescript
const history = await fetchNavHistory(30);
```

### `fetchTvlHistory(days?: number)`
Get Total Value Locked history. Default: 30 days.
```typescript
const history = await fetchTvlHistory(30);
```

### `fetchMarketAllocations()`
Get current allocation breakdown by market type.
```typescript
const allocations = await fetchMarketAllocations();
```

### `fetchPnlDistribution()`
Get PnL distribution histogram data.
```typescript
const distribution = await fetchPnlDistribution();
```

### `createDeposit(deposit: DepositRequest)`
Create a new deposit transaction.
```typescript
const result = await createDeposit({
  amount: 10.0,
  walletAddress: "7xKXtg2...",
  signature: "base64_signature"
});
```

## User Endpoints

### `fetchUserDeposit(walletAddress: string)`
Get user's deposited amount. Returns 0 if not found.
```typescript
const amount = await fetchUserDeposit(walletAddress);
```

### `fetchUserProfile(walletAddress: string)`
Get user-specific profile data.
```typescript
const profile = await fetchUserProfile(walletAddress);
```

### `fetchUserNavHistory(walletAddress: string, days?: number)`
Get user's personal NAV history. Default: 30 days.
```typescript
const history = await fetchUserNavHistory(walletAddress, 30);
```

### `fetchUserCommentary(walletAddress: string)`
Get AI agent commentary for the user.
```typescript
const commentary = await fetchUserCommentary(walletAddress);
```

### `fetchUserDeposits(walletAddress: string)`
Get user's deposit history.
```typescript
const deposits = await fetchUserDeposits(walletAddress);
```

## Positions Endpoints

### `fetchCurrentPositions()`
Get all currently open trading positions.
```typescript
const positions = await fetchCurrentPositions();
```

## Governance Endpoints

### `fetchProposals(status?: string, limit?: number)`
Get all governance proposals. Optional status filter.
```typescript
const allProposals = await fetchProposals();
const pending = await fetchProposals('PENDING');
const limited = await fetchProposals(undefined, 10);
```

### `fetchProposal(proposalId: string)`
Get details for a single proposal.
```typescript
const proposal = await fetchProposal('prop-001');
```

### `fetchProposalReasoning(proposalId: string)`
Get agent reasoning for a proposal.
```typescript
const reasoning = await fetchProposalReasoning('prop-001');
```

### `voteOnProposal(proposalId: string, voteData: VoteRequest)`
Submit a vote on a proposal.
```typescript
const result = await voteOnProposal('prop-001', {
  vote: 'YES',
  walletAddress: "7xKXtg2...",
  signature: "base64_signature"
});
```

## Agents Endpoints

### `fetchAgents()`
Get all agent personas.
```typescript
const agents = await fetchAgents();
```

### `fetchDebateTranscript(proposalId: string)`
Get debate transcript for a specific proposal.
```typescript
const transcript = await fetchDebateTranscript('prop-001');
```

### `fetchLiveDebate()`
Get the current live debate transcript.
```typescript
const liveDebate = await fetchLiveDebate();
```

## Reports Endpoints

### `fetchDailyReports(limit?: number, offset?: number)`
Get list of daily performance reports. Default: limit=30, offset=0.
```typescript
const reports = await fetchDailyReports();
const recent = await fetchDailyReports(10);
const paginated = await fetchDailyReports(20, 20); // Skip first 20
```

### `fetchDailyReport(date: string)`
Get a specific daily report by date (YYYY-MM-DD format).
```typescript
const report = await fetchDailyReport('2024-02-19');
```

### `fetchReportSummary()`
Get summary statistics across all reports.
```typescript
const summary = await fetchReportSummary();
```

## Usage Examples

### In a React Component

```typescript
import { useState, useEffect } from 'react';
import { fetchVaultStats, fetchCurrentPositions } from '@/lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const vaultStats = await fetchVaultStats();
      const currentPositions = await fetchCurrentPositions();
      setStats(vaultStats);
      setPositions(currentPositions);
    };
    loadData();
  }, []);

  return (
    <div>
      {stats && <div>TVL: ${stats.totalValueLocked}</div>}
      {positions.map(pos => (
        <div key={pos.market}>{pos.market} - {pos.pnl}</div>
      ))}
    </div>
  );
};
```

### With React Query (Recommended)

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchVaultStats, fetchCurrentPositions } from '@/lib/api';

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['vault', 'stats'],
    queryFn: () => fetchVaultStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: positions } = useQuery({
    queryKey: ['positions', 'current'],
    queryFn: fetchCurrentPositions,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <div>TVL: ${stats.totalValueLocked}</div>
      {positions?.map(pos => (
        <div key={pos.market}>{pos.market}</div>
      ))}
    </div>
  );
};
```

## Error Handling

All functions handle errors gracefully:
- Connection errors return default values (empty arrays, null, 0)
- Non-connection errors are logged in development mode
- Functions never throw - always return a safe default

## Type Safety

All functions are fully typed with TypeScript interfaces. Import types as needed:

```typescript
import type { 
  VaultStats, 
  Position, 
  Proposal, 
  UserProfile 
} from '@/lib/api';
```

