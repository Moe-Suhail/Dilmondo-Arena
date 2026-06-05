# Dilmondo Arena

Premium Arabic RTL private Fantasy Premier League family dashboard for league `403186`.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- Vercel Hobby Free for hosting
- Supabase Free for production database and member avatar storage

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Local development can use `data/dilmondo-store.json` and local uploads when Supabase env vars are not set. Production does not use local filesystem storage.

## Admin

Admin URL:

```text
/admin
```

In development only, the fallback password is:

```text
dilmondo-admin
```

Production requires:

```bash
ADMIN_PASSWORD=your-strong-password
ADMIN_SESSION_SECRET=a-long-random-secret
```

Sessions are signed secure cookies and do not rely on local files.

## Supabase Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run:

```text
supabase/schema.sql
```

This creates:

- `league_settings`
- `members`
- `standings_snapshots`
- `manager_gameweek_snapshots`
- `banter_templates`
- `hall_of_fame`
- `homepage_announcements`
- public Storage bucket `member-avatars`

Database tables have RLS enabled and no anon policies. The app reads/writes them only from server-side routes using `SUPABASE_SERVICE_ROLE_KEY`.

## Vercel Environment Variables

Add these in Vercel Project Settings > Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
FPL_LEAGUE_ID=403186
NEXT_PUBLIC_SITE_URL=https://dilmondo-arena.vercel.app
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client components. It is used only server-side.

## Vercel Deploy

1. Push the repo to GitHub.
2. In Vercel, import the GitHub repository.
3. Keep default Next.js settings.
4. Add the environment variables above.
5. Deploy.
6. Visit `/admin/settings` and run the first FPL sync.

Vercel docs: https://vercel.com/docs/concepts/next.js/overview

## Data Rules

- Live ranks, points, gameweek scores, manager IDs, team names, fixtures, and deadlines are fetched server-side from Fantasy Premier League.
- The frontend never calls FPL directly.
- If FPL sync fails, the latest successful Supabase snapshot is preserved and shown.
- The app never invents competitive data.
- Admin-managed data is limited to identity, images, nicknames, announcements, banter templates, and Hall of Fame entries.

## Pre-deploy Checks

```bash
npm run lint
npm run build
```
