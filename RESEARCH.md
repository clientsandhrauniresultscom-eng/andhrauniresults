# Supabase Edge Functions Research

**Researched:** April 2026  
**Domain:** Serverless Functions / Edge Computing  
**Confidence:** HIGH

## Summary

Supabase Edge Functions are globally distributed TypeScript functions that run on Deno runtime. They are ideal for webhook handlers, API integrations, and server-side Logic that needs low latency. Functions are created using the Supabase CLI, written in TypeScript/Deno, and deployed to Supabase's global edge network. Database access is provided through the supabase-js client or direct Postgres connections.

**Primary recommendation:** Use `supabase functions new <name>` to scaffold functions, write in TypeScript with Deno.serve(), and deploy via CLI. Configure JWT verification and secrets in config.toml and production secrets respectively.

## Standard Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| Supabase CLI | Latest | Create, serve, and deploy functions |
| Deno | Latest (or Supabase Edge Runtime) | TypeScript runtime for functions |
| @supabase/supabase-js | ^2 | Database client for Edge Functions |

### Core Dependencies

```bash
# Install Supabase CLI
npm install -g supabase

# Or use npx
npx supabase@latest functions new my-function
```

## Project Structure

```
supabase/
├── functions/
│   ├── hello-world/
│   │   ├── index.ts       # Function code
│   │   └── deno.json    # Per-function dependencies
│   └── another-function/
│       └── index.ts
└── config.toml           # Function configurations
```

## Key Commands

### Initialization and Creation

```bash
# Initialize a new Supabase project (if needed)
supabase init my-project

# Create a new Edge Function
supabase functions new hello-world
```

### Local Development

```bash
# Start local Supabase stack (database, auth, storage, functions)
supabase start

# Serve a specific function with hot reloading
supabase functions serve hello-world

# Serve all functions
supabase functions serve

# Skip JWT verification during development (for webhooks)
supabase functions serve hello-world --no-verify-jwt
```

### Deployment

```bash
# Deploy a specific function
supabase functions deploy hello-world

# Deploy all functions
supabase functions deploy

# Deploy without JWT verification (for public webhooks)
supabase functions deploy hello-world --no-verify-jwt
```

## Function Code Patterns

### Basic Function Handle

```typescript
// supabase/functions/hello-world/index.ts
Deno.serve(async (req) => {
  const { name } = await req.json()

  return new Response(
    JSON.stringify({
      message: `Hello ${name}!`,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  )
})
```

### Accessing Environment Variables

```typescript
Deno.serve(async (req) => {
  // Default secrets available in Edge Functions
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  const dbUrl = Deno.env.get("SUPABASE_DB_URL")!

  // Custom secrets
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")

  return new Response(JSON.stringify({ status: "ok" }))
})
```

### Database Access with supabase-js

```typescript
import { createClient } from "npm:@supabase/supabase-js@2"

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    }
  )

  // RLS is enforced with anon key
  const { data, error } = await supabase.from("countries").select("*")

  // Use service key for admin operations (bypasses RLS)
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  return new Response(JSON.stringify({ data, error }), {
    headers: { "Content-Type": "application/json" },
  })
})
```

### Direct Postgres Connection (for raw SQL)

```typescript
import postgres from "npm:postgres@3.4.3"

Deno.serve(async (_req) => {
  const connectionString = Deno.env.get("SUPABASE_DB_URL")!
  const client = postgres(connectionString)

  const result = await client`SELECT * FROM countries`

  return Response.json(result)
})
```

## Configuration

### config.toml (Function Settings)

```toml
[functions.hello-world]
verify_jwt = false  # Disable JWT verification (for webhooks)

[functions.image-processor]
import_map = "./functions/image-processor/import_map.json"

[functions.legacy-function]
entrypoint = "./functions/legacy-function/index.js"
```

**Key settings:**
- `verify_jwt`: Set to `false` for public endpoints (Stripe webhooks, sitemaps)
- `import_map`: Custom dependencies for specific functions
- `entrypoint`: Custom entry point (for JavaScript files)

### Secrets Management

**Local development:**

```bash
# Create .env file at supabase/functions/.env
STRIPE_SECRET_KEY=sk_test_...
```

```bash
# Or specify custom env file
supabase functions serve hello-world --env-file .env.local
```

**Production secrets:**

```bash
# Set individual secret
supabase secrets set STRIPE_SECRET_KEY=sk_live_...

# Set from .env file
supabase secrets set --env-file .env

# List all secrets
supabase secrets list
```

## Invoking Edge Functions

### Using cURL

```bash
curl --request POST 'https://<project-ref>.supabase.co/functions/v1/hello-world' \
  --header 'Authorization: Bearer ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name": "World"}'
```

### Using supabase-js

```typescript
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://<project-ref>.supabase.co",
  "ANON_KEY"
)

const { data, error } = await supabase.functions.invoke("hello-world", {
  body: { name: "World" },
})
```

## CI/CD Deployment

### GitHub Actions

```yaml
name: Deploy Function

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: supabase functions deploy
        env:
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Local Testing

```bash
# Run Deno tests
deno test --allow-all supabase/functions/tests/hello-world-test.ts
```

## Edge Function Examples

| Example | Description |
|---------|-------------|
| With supabase-js | Use Supabase client with RLS |
| With Kysely | Type-safe SQL queries |
| Connect to Postgres | Direct Postgres connection |
| CORS headers | Browser-accessible functions |
| Open Graph images | Generate OG images |

## Limitations and Considerations

- **Cold starts:** Design for short-lived, idempotent operations
- **Database connections:** Use connection pooling or serverless-friendly connections
- **JWT verification:** Enabled by default—set `verify_jwt = false` only for public webhooks
- **Secrets:** Never commit secrets to version control

## Environment Availability

| Requirement | Status | Notes |
|-------------|--------|-------|
| Supabase CLI | Required | Install via npm or binary |
| Deno (optional) | Recommended | For better IDE support |
| Node.js | Required | For Supabase CLI |

## Sources

- [Getting Started with Edge Functions](https://supabase.com/docs/guides/functions/quickstart) — Official quickstart guide
- [Deploy to Production](https://supabase.com/docs/guides/functions/deploy) — Deployment documentation
- [Database Integration](https://supabase.com/docs/guides/functions/connect-to-postgres) — Postgres connection guide
- [Function Configuration](https://supabase.com/docs/guides/functions/function-configuration) — config.toml settings
- [Managing Secrets](https://supabase.com/docs/guides/functions/secrets) — Environment variables
- [Managing Dependencies](https://supabase.com/docs/guides/functions/dependencies) — deno.json and import maps