#!/bin/bash
# Run the decision service - always run from backend directory
cd "$(dirname "$0")"
echo '{}' | npx ts-node --project tsconfig.json agent_engine/services/decisionService.ts
