# NiIM Hosting: Vercel + Supabase

NiIM can be hosted on Vercel with Supabase as the hosted database. Vercel serves the React app and runs the `/api/*` serverless functions. Supabase stores the one-device lock, authenticator secret, and login events.

## 1. Create Supabase Database

1. Create a Supabase project.
2. Open the SQL Editor.
3. Run the SQL in `supabase-schema.sql`.
4. Copy these values from Project Settings > API:
   - Project URL
   - `service_role` key

Keep the service role key private. It goes only in Vercel environment variables.

## 2. Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, create a new project from the repo.
3. Use:
   - Framework preset: Vite
   - Build command: `pnpm run build`
   - Output directory: `dist`
4. Add environment variables:
   - `SUPABASE_URL=your Supabase project URL`
   - `SUPABASE_SERVICE_ROLE_KEY=your Supabase service_role key`
5. Deploy.

## 3. First Login

The first device to open the deployed app registers itself. NiIM then shows the authenticator setup key. After that, other devices are blocked by the API even if they know the authenticator code.

## Local Development

Use the local JSON backend:

```bash
pnpm run dev:backend
```

```bash
pnpm run dev
```

For local testing against Vercel-style API routes, use Vercel CLI with the Supabase environment variables configured.
