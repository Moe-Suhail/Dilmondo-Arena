# Dilmondo Arena

Premium Arabic RTL private Fantasy Premier League family dashboard for league `403186`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Admin

Create `.env.local` from `.env.example` and set:

```bash
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=a-long-random-secret
```

In development only, the fallback password is `dilmondo-admin` when `ADMIN_PASSWORD` is not set. Production login requires an explicit password and session secret.

## Data rules

- Live ranks, points, gameweek scores, manager IDs, and team names are fetched server-side from Fantasy Premier League.
- The frontend never calls FPL directly.
- If FPL sync fails, the latest successful local snapshot is preserved.
- Admin-managed data is limited to local identity, images, nicknames, announcements, banter templates, and Hall of Fame entries.

## Storage

The app currently uses a local JSON fallback at `data/dilmondo-store.json` and local member uploads under `public/uploads/members`. Supabase environment variables are reserved so the storage layer can be swapped later without changing UI code.
