# Deploy Darija Genie to Vercel

This repo is a monorepo. The app to deploy is `apps/web` (Next.js 16).

## 1) One-time setup in Vercel

1. Import the Git repo into Vercel.
2. In **Project Settings → General**:
   - **Root Directory**: `apps/web`
   - Framework: auto-detect as **Next.js**
3. Keep Node runtime on current default (Node 20+ is supported by this repo).

## 2) Environment variables

Set variables from `apps/web/.env.example` in:
- Preview
- Production

Minimum required for current functionality:

- `DATABASE_URL`
- `GENIECHAT_PROVIDER`
- For Gemini mode:
  - `GOOGLE_GENAI_API_KEY` (or `GEMINI_API_KEY`)
- For OpenAI mode:
  - `OPENAI_API_KEY` (or `GPT_API_KEY`)
- `VOCHAI_API_KEY` (or `VOCHAI_TOKEN`)

Recommended defaults:

- `GENIECHAT_PROVIDER=gemini`
- `GEMINI_MODEL=gemini-2.5-flash`
- `OPENAI_BASE_URL=https://api.openai.com/v1`
- `VOCHAI_BASE_URL=https://aui-transcription-api.fly.dev/api/v1`
- `GOOGLE_GENAI_USE_VERTEXAI=false`

## 3) Seed content before/after first deploy

If your Neon DB is new, seed content once:

```bash
cd apps/web
pnpm db:migrate
pnpm db:seed:value-bank
pnpm db:seed:value-bank -- --file ../../content/value-bank/shopping-v1.json
```

## 4) Deploy

After push to `main`, Vercel will auto-deploy.

For manual deploy with CLI:

```bash
pnpm dlx vercel
pnpm dlx vercel --prod
```

## 5) Smoke test after deploy

- Open `/learning/scenarios/restaurant-1/geniechat`
- Send a short text turn and ensure:
  - assistant response appears
  - translation toggle works
- Open `/testing` and confirm quiz starts for each scenario.
