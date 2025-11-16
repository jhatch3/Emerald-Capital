# OpenRouter Setup

## What Changed

The agent engine now uses **OpenRouter** instead of Google's Gemini API directly. This gives you:

- Access to multiple models (Gemini, Claude, GPT-4, etc.)
- Single API key for all models
- Better reliability and rate limits

## Setup

### 1. Get OpenRouter API Key

1. Go to: https://openrouter.ai/
2. Sign up / Log in
3. Go to "Keys" section
4. Create a new API key
5. Copy it

### 2. Update .env File

```bash
cd backend
echo "OPENROUTER_API_KEY=your_openrouter_key_here" > .env
```

Or add it to your existing `.env` file:

```
OPENROUTER_API_KEY=your_openrouter_key_here
```

### 3. Available Models

You can use any model OpenRouter supports. Common options:

**Gemini Models:**

- `google/gemini-pro` (default)
- `google/gemini-1.5-pro`
- `google/gemini-1.5-flash` (faster, cheaper)

**Other Options:**

- `anthropic/claude-3-opus`
- `anthropic/claude-3-sonnet`
- `openai/gpt-4`
- `openai/gpt-4-turbo`
- `openai/gpt-3.5-turbo`

To change the model, edit `backend/agent_engine/agents/baseAgent.ts`:

```typescript
protected model: string = 'google/gemini-1.5-flash'; // or any other model
```

### 4. Test It

```bash
cd backend
echo '{"market":{"symbol":"SOL","price":98.45},"data":{}}' | npx ts-node agent_engine/services/decisionService.ts
```

## Benefits

✅ **Single API key** - No need for separate Google API key
✅ **Multiple models** - Easy to switch between Gemini, Claude, GPT-4, etc.
✅ **Better pricing** - Often cheaper than direct API access
✅ **Rate limits** - More generous limits
✅ **Reliability** - OpenRouter handles retries and fallbacks

## Cost

OpenRouter charges per token. Check their pricing at: https://openrouter.ai/models

Gemini models are typically very affordable on OpenRouter.
