# Dynamic NFC & QR Cards — Review Management System

نظام إدارة كروت **NFC و QR** الديناميكية لتوجيه العميل من كارت مطبوع ثابت إلى أي رابط
مراجعات (Google Reviews، Instagram، WhatsApp، صفحة Bio Link…) **دون إعادة طباعة أو
إعادة برمجة الكارت**.

كل كارت يحمل رابطاً دائماً بالشكل `/r/CARD-001`. عند مسح الكارت يقرأ النظام الوجهة
الحالية من قاعدة البيانات، يسجّل عملية المسح، ثم يحوّل العميل تلقائياً. تغيير رابط
الوجهة من لوحة التحكم يسري فوراً على كل الكروت المطبوعة.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Routes](#routes)
- [Database Schema](#database-schema)
- [Security Model (RLS + RPC)](#security-model-rls--rpc)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 (with a legacy `@config` theme bridge) |
| Icons | Lucide React |
| Auth & Database | Supabase (Postgres, Auth, Row Level Security, RPC) |
| QR Generation | `qrcode` / `qrcode.react` |
| Linting | Oxlint |
| Deployment | Vercel (SPA rewrites) |

---

## Key Features

### Dynamic Redirects

- Permanent card identifier (`/r/:cardId`) printed once on NFC tags and QR codes.
- Destination resolved server-side on every tap: change a `target_url` in the
  dashboard and every physical card follows instantly.
- Friendly failure states instead of raw errors — unknown, inactive, or
  unassigned cards render an Arabic notice page.
- URL normalisation accepts both `example.com` and `https://example.com`.

### Admin / User Separation

- Role-aware routing: `/admin` for admins, `/user` for regular members.
- Route guards via `ProtectedRoute` (`requiredRole="admin" | "user"`).
- Admins get the full inventory, bulk card generation, card assignment,
  user management, and analytics. Users only ever see their own cards.
- Card inventory moves between a shared unassigned pool and individual owners.

### Analytics

- Every tap is recorded in `card_scans` with timestamp, user agent, referrer,
  and a **hashed** IP address.
- Per-card scan counters and `last_scanned_at` maintained automatically.
- Aggregate dashboard: total cards, active / inactive / unassigned split, total
  scans, and a recent-activity feed.

### Live Simulator

- An interactive landing-page simulator renders an NFC card next to a phone
  mockup.
- Switching between Instagram / WhatsApp / Bio Link updates the phone screen,
  the action sentence, and the destination URL in sync.
- An in-app **NFC / QR simulator modal** opens the real `/r/:cardId` route so you
  can verify a card's live behaviour without printing it.

### Additional

- QR code generation with high error-correction, PNG download, and print styles.
- Bilingual UI (Arabic / English) with full RTL and LTR layout support.
- Card status derived automatically: `active`, `unassigned`, `inactive`.
- Case-insensitive unique usernames, enforced both in the UI and by a database
  index.

---

## Routes

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page + live simulator |
| `/r/:cardId` | Public | Scan redirect (records the scan, then redirects) |
| `/signup` | Public | Registration form |
| `/admin/login` | Public | Login (redirects to the right dashboard when signed in) |
| `/auth/confirm-email` | Public | Post-registration confirmation notice |
| `/admin/*` | Admin | Dashboard, cards, user cards, users, analytics, docs |
| `/user/*` | User | Dashboard, my cards, docs |
| `*` | Public | Falls back to `/` |

---

## Database Schema

Three tables, all under the `public` schema.

### `profiles`

Mirrors `auth.users` one-to-one and carries the role.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `UUID` PK | FK → `auth.users(id)` `ON DELETE CASCADE` |
| `email` | `VARCHAR(255)` | |
| `username` | `TEXT UNIQUE NOT NULL` | Lowercased; case-insensitive uniqueness via `idx_profiles_username_lower` |
| `role` | `VARCHAR(20)` | `admin` \| `user`, defaults to `user` |
| `created_at` | `TIMESTAMPTZ` | |

A `CHECK` constraint enforces the username format `^[a-z0-9_.-]{3,30}$`.

### `cards`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `UUID` PK | |
| `card_id` | `VARCHAR(50) UNIQUE` | The public identifier used in `/r/:cardId` |
| `user_id` | `UUID` | FK → `auth.users(id)` `ON DELETE SET NULL`; `NULL` = admin pool |
| `client_name` | `VARCHAR(255)` | Optional display name |
| `target_url` | `TEXT` | The redirect destination |
| `is_active` | `BOOLEAN` | Defaults to `false` |
| `scan_count` | `INTEGER` | Defaults to `0` |
| `last_scanned_at` | `TIMESTAMPTZ` | |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | `updated_at` maintained by trigger |

Card status is derived, not stored: `active` when `is_active` **and**
`target_url` is present; `unassigned` when there is no `target_url`;
`inactive` otherwise.

### `card_scans`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `UUID` PK | |
| `card_id` | `VARCHAR(50)` | FK → `cards(card_id)` `ON DELETE CASCADE` |
| `scanned_at` | `TIMESTAMPTZ` | |
| `user_agent` | `TEXT` | |
| `referer` | `TEXT` | |
| `ip_hash` | `VARCHAR(64)` | Hashed, never stored raw |

### Applying the schema

The SQL is idempotent and safe to run on a fresh project or an existing one:

- `supabase/schema.sql` — the consolidated script (use this if you only need one
  file).
- `supabase/migrations/` — the same changes split into ordered steps:
  `001_initial_schema` → `002_profiles` → `003_cards` → `004_rls_policies` →
  `005_functions_and_triggers`.

Run it from **Supabase Dashboard → SQL Editor → New query → paste → Run**, or via
the Supabase CLI:

```bash
supabase db push
```

The script also seeds an admin account idempotently. Change the seed
credentials in section 9 of `schema.sql` before running it on a public
production project.

---

## Security Model (RLS + RPC)

Row Level Security is enabled on all three tables.

### Policies

| Table | Policy | Rule |
| --- | --- | --- |
| `profiles` | Users can view their own profile | `auth.uid() = id OR is_admin()` |
| `profiles` | Users can update own profile | `auth.uid() = id OR is_admin()` |
| `cards` | Public read for redirect | `true` (the redirect route is anonymous) |
| `cards` | Users can insert their own cards | `auth.uid() = user_id OR is_admin()` |
| `cards` | Users update own cards or Admin all | `auth.uid() = user_id OR is_admin()` |
| `cards` | Users delete own cards or Admin all | `auth.uid() = user_id OR is_admin()` |
| `card_scans` | Public insert scans | `true` (a tap must never be blocked) |
| `card_scans` | Read scans for card owners or admins | card belongs to the caller, or caller is an admin |

The `UPDATE` policy on `profiles` only decides **which rows** are writable. Column
privileges decide **which columns**: table-level `UPDATE` is revoked and only
`username` and `email` are granted, so a signed-in user can never promote
themselves to admin.

### RPC functions

| Function | Access | Purpose |
| --- | --- | --- |
| `is_admin()` | internal | Boolean helper used by every policy |
| `username_exists(text)` | `anon`, `authenticated` | Case-insensitive availability check. `SECURITY DEFINER` because non-admins cannot read other profiles |
| `email_for_username(text)` | `anon`, `authenticated` | Resolves a username during login |
| `admin_set_role(uuid, text)` | `authenticated` | Promote/demote. Blocks self-changes and demoting the last admin |
| `delete_user_completely(uuid)` | `authenticated` | Removes the profile, releases their cards to the admin pool, then deletes `auth.users` |
| `handle_new_user()` | trigger | Creates the profile on sign-up, sanitises and validates the username |
| `update_updated_at_column()` | trigger | Keeps `cards.updated_at` current |

Every admin RPC re-checks authorisation **inside** the function, so revoking the
`EXECUTE` grant later can never widen access.

---

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A Supabase project (free tier is enough)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the environment

```bash
cp .env.example .env
```

Fill in the values from **Supabase Dashboard → Project Settings → API**:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Both are safe to expose in the browser bundle — row-level access is enforced by
the database, not by hiding the key. Never place the `service_role` key in `.env`.

### 3. Create the database

Paste `supabase/schema.sql` into the Supabase SQL Editor and run it, or apply the
numbered migrations with `supabase db push`. This creates the tables, indexes,
triggers, RLS policies, RPC functions, and the initial admin account.

### 4. Start the dev server

```bash
npm run dev
```

Vite prints the local URL (default `http://localhost:5173`).

### 5. Verify

- Sign in at `/admin/login`.
- Create a card, open its QR modal, and use the simulator to open `/r/:cardId`.
- Change the card's `target_url` and re-open the same `/r/:cardId` link — the new
  destination is used immediately.

> If the app renders empty lists, `isSupabaseConfigured` is `false`: the `.env`
> values are missing or still contain the `your-project` placeholder.

---

## Project Structure

```
src/
├─ components/
│  ├─ common/     # DeleteConfirmModal, EmptyState, ErrorBoundary
│  ├─ layout/     # Sidebar, Navbar, PageLayout
│  └─ ui/         # Button, Input, Select, Modal, Table, Toast, Loading
├─ context/       # AuthContext, LanguageContext
├─ features/
│  ├─ admin/      # Admin components, hooks, services, types
│  ├─ auth/       # SignupForm, PasswordInput, ProtectedRoute, authService
│  ├─ cards/      # CardStatus, CardQRCode, CardDetails, cardService, hooks
│  ├─ landing/    # LiveDemoSimulator
│  └─ user/       # UserProfile, UserCardsList, UserCard, hooks, services
├─ hooks/         # useDebounce, useModal, usePagination, useLocalStorage
├─ i18n/          # translations (ar / en)
├─ lib/supabase/  # client
├─ pages/         # HomePage, ScanRedirectPage, auth/, admin/, user/
├─ types/         # card, user, index
├─ utils/         # url, date, format, error, fetchUtils
└─ validation/    # auth, card, user, admin
supabase/
├─ migrations/    # 001 … 005
├─ functions/     # Edge Function: admin
└─ schema.sql     # consolidated idempotent script
```

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint |

---

## Deployment

The app is a static SPA. On Vercel, `vercel.json` rewrites every path to
`index.html` so client-side routes such as `/r/CARD-001` and `/admin/login` resolve
correctly on a hard refresh.

1. Import the repository into Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
3. Deploy. The default build command (`npm run build`) and output directory
   (`dist`) are detected automatically.

---

## License

ISC
