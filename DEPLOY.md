# NiIM Hosting: Netlify + Supabase

NiIM is ready to host on Netlify. Netlify serves the React app and runs serverless functions for `/api/*`. Supabase stores the one-device lock, authenticator secret, and auth events.

## 1. Create Supabase Database

1. Create a free Supabase project.
2. Open SQL Editor.
3. Run the SQL in `supabase-schema.sql`.
4. Copy these from Project Settings > API:
   - Project URL
   - `service_role` key

Keep the service role key private. It belongs only in Netlify environment variables.

## 2. Deploy to Netlify

1. Push this repo to GitHub.
2. In Netlify, choose Add new site > Import an existing project.
3. Select the NiIM repo.
4. Netlify should read `netlify.toml`.
5. Confirm:
   - Build command: `pnpm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
6. Add environment variables:
   - `SUPABASE_URL=your Supabase project URL`
   - `SUPABASE_SERVICE_ROLE_KEY=your Supabase service_role key`
7. Deploy.

## First Login

The first phone/browser to open the deployed Netlify URL registers itself. NiIM then shows the authenticator setup key. After that, other devices are blocked even if they know the authenticator code.

## Local Development

Use two terminals:

```bash
pnpm run dev:backend
```

```bash
pnpm run dev
```
