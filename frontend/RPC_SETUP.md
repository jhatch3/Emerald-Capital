# Solana RPC Setup Guide

## Problem: 403 Rate Limit Errors

The public Solana RPC endpoints have strict rate limits that can cause 403 "Access forbidden" errors when fetching wallet balances.

## Solution: Use a Custom RPC Provider

### Option 1: Helius (Recommended - Free Tier Available)

1. **Get a free API key:**

   - Visit https://www.helius.dev/
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Create `.env` file in the `frontend` directory:**

   ```bash
   cd frontend
   touch .env
   ```

3. **Add your API key:**

   ```
   VITE_HELIUS_API_KEY=your-api-key-here
   ```

4. **Restart the dev server:**
   ```bash
   npm run dev
   ```

### Option 2: Custom RPC Endpoint

1. **Get an RPC endpoint from:**

   - QuickNode: https://www.quicknode.com/
   - Alchemy: https://www.alchemy.com/
   - Triton: https://triton.one/
   - Or any other Solana RPC provider

2. **Create `.env` file in the `frontend` directory:**

   ```bash
   cd frontend
   touch .env
   ```

3. **Add your RPC URL:**

   ```
   VITE_SOLANA_RPC_URL=https://your-rpc-endpoint.com
   ```

4. **Restart the dev server:**
   ```bash
   npm run dev
   ```

### Option 3: Use Serum RPC (Current Default)

The app currently defaults to Serum's public RPC endpoint which is more lenient than the official Solana RPC, but may still have rate limits with heavy usage.

## Verification

After setting up a custom RPC:

1. Check the Balance Verification component on the Profile page
2. The "Endpoint" should show your custom RPC URL
3. Balances should load without 403 errors
4. Check the browser console - you should see "Balance fetched: X.XXXX SOL"

## Troubleshooting

- **Still getting 403 errors?** Make sure you've restarted the dev server after adding the `.env` file
- **Environment variable not working?** Check that the file is named exactly `.env` (not `.env.local` or `.env.development`)
- **Need higher rate limits?** Consider upgrading to a paid RPC provider plan
