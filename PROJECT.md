# DesignOps — Project Documentation

> Last updated: 2026-04-15

---

## 1. Project Overview & Purpose

**DesignOps** is a multi-tenant SaaS platform that streamlines design request workflows between clients (project managers), designers, and organization admins. It brings together task management, real-time collaboration, brand management, AI-assisted brief analysis, and billing into a single product.

**Core value proposition:**
- Clients submit design requests with rich briefs; AI automatically scores and improves them.
- Designers receive auto-assigned work, track it in a Kanban board with live updates, and upload deliverables.
- Yöneticiler ekibi, markaları, faturalandırmayı ve analitiği dashboard üzerinden yönetir.

The application is built in **Turkish** (UI strings) and targets design agencies or in-house design teams.

---

## 2. Tech Stack & Dependencies

### Runtime
| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Runtime | Node.js (server components + API routes) |
| Styling | Tailwind CSS v4 + shadcn/ui v4 |

### Key Libraries
| Category | Library | Purpose |
|---|---|---|
| Database / Auth | `@supabase/supabase-js`, `@supabase/ssr` | Supabase client (browser + server + admin) |
| State / Data | `@tanstack/react-query` v5 | Server-state caching and mutations |
| Forms | `react-hook-form` + `@hookform/resolvers` + `zod` v4 | Form management and validation |
| Drag & Drop | `@dnd-kit/core`, `@dnd-kit/sortable` | Kanban drag-and-drop |
| AI | `@google/generative-ai` | Google Gemini API (brief analysis, design suggestion, revision translation) |
| Animation | `framer-motion`, `motion` | UI animations |
| Charts | `recharts` | Dashboard analytics |
| File Upload | `react-dropzone` | File upload UI |
| Notifications | `sonner` | Toast notifications |
| Billing | `stripe` | Payment processing (partially implemented) |
| Email | `resend` | Transactional email |
| UI Primitives | `@radix-ui/*`, `@base-ui/react`, `cmdk` | Accessible UI components |
| Fonts | Bricolage Grotesque, Instrument Sans, JetBrains Mono | Google Fonts via next/font |
| Date | `date-fns` v4 | Date formatting and manipulation |

### Dev Dependencies
- ESLint 9 + `eslint-config-next`
- `@tailwindcss/postcss`
- TypeScript strict mode

---

## 3. Folder Structure

```
designops/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, ThemeProvider, Toaster)
│   ├── globals.css               # Global styles
│   ├── Providers.tsx             # App-level providers
│   │
│   ├── (marketing)/              # Public marketing pages (no auth required)
│   │   ├── layout.tsx            # Marketing layout (navbar + footer)
│   │   ├── page.tsx              # Landing page
│   │   ├── about/page.tsx        # About page
│   │   └── pricing/page.tsx      # Pricing page
│   │
│   ├── (auth)/                   # Authentication pages
│   │   ├── layout.tsx            # Auth layout (full-screen white)
│   │   ├── login/page.tsx        # Login form
│   │   ├── signup/page.tsx       # Registration (creates org + yönetici user)
│   │   ├── forgot-password/page.tsx
│   │   ├── invite/[token]/page.tsx  # Invitation acceptance
│   │   └── pending/page.tsx      # Awaiting yönetici approval screen
│   │
│   ├── (onboarding)/             # New organization setup (post-signup)
│   │   └── onboarding/page.tsx   # Org creation + team invite wizard
│   │
│   ├── (app)/                    # Protected application pages
│   │   ├── layout.tsx            # Auth guard + sidebar + topbar shell
│   │   ├── dashboard/page.tsx    # Analytics dashboard (yönetici only)
│   │   ├── requests/
│   │   │   ├── page.tsx          # Request list with filters
│   │   │   ├── new/page.tsx      # New request form
│   │   │   └── [id]/page.tsx     # Request detail (comments, files, AI panel)
│   │   ├── kanban/page.tsx       # Kanban board with real-time updates
│   │   ├── brands/
│   │   │   ├── page.tsx          # Brand library list
│   │   │   ├── new/page.tsx      # Create brand
│   │   │   └── [id]/page.tsx     # Brand detail
│   │   ├── team/page.tsx         # Team management (invite, approve, role change)
│   │   ├── archive/page.tsx      # Completed / cancelled requests archive
│   │   ├── notifications/page.tsx # All notifications
│   │   └── settings/
│   │       ├── page.tsx          # Settings overview
│   │       ├── profile/page.tsx  # Profile settings
│   │       ├── notifications/page.tsx
│   │       └── billing/page.tsx  # Stripe billing (stub)
│   │
│   └── api/                      # API Routes (see section 8)
│
├── components/
│   ├── ui/                       # shadcn/ui primitives + custom atoms
│   ├── layout/                   # AppSidebar, AppTopbar, NotificationBell
│   ├── requests/                 # Request-specific components
│   ├── kanban/                   # KanbanBoard, KanbanColumn, KanbanCard
│   ├── comments/                 # CommentThread (threaded + real-time)
│   ├── files/                    # FileUploadZone, FileList
│   ├── ai/                       # BriefAIPanel
│   ├── dashboard/                # Charts (RequestsByTypeChart)
│   ├── team/                     # InviteTeamMember, ApproveUserButton
│   ├── billing/                  # Billing components (stub)
│   └── QueryProvider.tsx         # TanStack Query setup
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client (with dev guard)
│   │   ├── server.ts             # Server Supabase client + admin client (RLS bypass)
│   │   ├── middleware.ts         # Session refresh helper for proxy.ts
│   │   └── queries/
│   │       ├── requests.ts       # Request query helpers
│   │       ├── users.ts          # User query helpers
│   │       └── analytics.ts      # Dashboard data queries
│   ├── ai/
│   │   ├── client.ts             # Google Gemini singleton client
│   │   ├── analyze-brief.ts      # Brief analysis orchestrator
│   │   └── prompts/
│   │       ├── brief-analysis.ts
│   │       ├── design-suggestion.ts
│   │       └── revision-translation.ts
│   ├── stripe/                   # Stripe helpers (planned, empty)
│   ├── validations/
│   │   └── request.ts            # Zod schema for request creation
│   ├── hooks/                    # Custom React hooks
│   ├── email.ts                  # Resend email helpers
│   └── utils.ts                  # cn(), castRows(), castRow(), getInitials()
│
├── types/
│   └── database.ts               # Hand-written Supabase type definitions
│
├── supabase/
│   ├── migrations/               # SQL migration files (run in Supabase SQL Editor)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_indexes.sql
│   │   ├── 004_functions.sql
│   │   ├── 005_realtime.sql
│   │   ├── 006_enhancements.sql
│   │   ├── 007_fix_notifications.sql
│   │   ├── 008_single_org.sql
│   │   └── 009_add_soft_delete.sql
│   ├── seed.sql                  # Optional test data
│   ├── seed_test_users.sql
│   └── test_users.sql
│
├── proxy.ts                      # Next.js 16 route guard (replaces middleware.ts)
├── next.config.ts
├── tsconfig.json
└── components.json               # shadcn/ui config
```

---

## 4. Database Schema

Managed by Supabase. Types are hand-authored in `types/database.ts`.

### Tables

| Table | Description |
|---|---|
| `organizations` | Multi-tenant root. Holds plan, Stripe IDs, AI credit limits, storage limits. |
| `users` | App users linked to an org. Roles: `admin`, `designer`, `client`. Statuses: `active`, `invited`, `suspended`, `deactivated`. |
| `invitations` | Email invitations with HMAC token, expiry, and accepted timestamp. |
| `brands` | Brand profiles per org: colors, fonts, logo, guidelines, tone of voice. |
| `requests` | Design requests. Holds status machine state, priority, AI brief score, revision count, time tracking. |
| `request_status_history` | Immutable status transition log (append-only). |
| `comments` | Threaded comments on requests. Types: `general`, `revision_request`, `approval`, `rejection`, `ai_suggestion`. Supports internal-only and resolved flags. |
| `files` | Uploaded files with versioning, `file_type` enum, and Supabase Storage path reference. |
| `notifications` | Per-user notifications with `read_at` timestamp. |
| `ai_requests` | Audit log for every Gemini API call (tokens, latency, status, feedback). |
| `time_logs` | Designer time tracking per request. |
| `audit_logs` | Full audit trail for create/update/delete/login/status-change events. |

### Enum Types

| Enum | Values |
|---|---|
| `UserRole` | `admin`, `designer`, `client` |
| `UserStatus` | `active`, `invited`, `suspended`, `deactivated` |
| `OrgPlan` | `free`, `pro`, `enterprise` |
| `SubscriptionStatus` | `trialing`, `active`, `past_due`, `canceled`, `incomplete` |
| `RequestType` | `social_post`, `banner`, `logo`, `video`, `presentation`, `email_template`, `brochure`, `infographic`, `other` |
| `RequestStatus` | `new`, `brief_review`, `design`, `revision`, `approval`, `completed`, `archived`, `cancelled` |
| `RequestPriority` | `low`, `medium`, `high`, `urgent` |
| `CommentType` | `general`, `revision_request`, `approval`, `rejection`, `ai_suggestion` |
| `FileType` | `logo`, `image`, `pdf`, `font`, `guideline`, `design_output`, `ai_generated`, `other` |
| `NotificationType` | `request_assigned`, `status_changed`, `comment_added`, `revision_requested`, `approved`, `mention`, `deadline_reminder` |
| `AIFeature` | `brief_analysis`, `design_suggestion`, `moodboard`, `revision_suggestion`, `brand_check` |

### Database Functions (RPCs)

| Function | Purpose |
|---|---|
| `get_dashboard_stats(p_org_id)` | Aggregate stats for the dashboard |
| `get_requests_by_type(p_org_id, p_days?)` | Request counts grouped by type |
| `get_designer_workload(p_org_id)` | Per-designer active request counts |
| `get_avg_delivery_time(p_org_id)` | Average hours from `new` → `completed` |
| `transition_request_status(p_request_id, p_new_status, p_note?)` | Atomic status change + history insert |
| `check_and_consume_ai_credit(p_org_id)` | Returns `true` and decrements if credit available |

### RLS Helpers (public schema)

`public.org_id()`, `public.is_admin()`, `public.is_designer_or_admin()` — used in RLS policies instead of `auth.*` schema functions.

---

## 5. Authentication Flow

The app has **two independent authentication systems**:

### 5.1 User Authentication (Supabase Auth)

```
User visits /login
  → POST /api/auth/login (email + password)
  → Supabase Auth issues session cookie
  
OAuth / magic link
  → GET /api/auth/callback?code=...
  → Supabase exchanges code for session
  → Redirect to /dashboard

Route protection (proxy.ts — Next.js 16 middleware replacement):
  - PUBLIC_ROUTES: /, /login, /signup, /forgot-password, /pricing, /pending, /about
  - AUTH_ROUTES: redirect to /dashboard if already logged in
  - /invite/* : always accessible
  - All other routes: require session or redirect to /login?redirect=<path>

(app)/layout.tsx — server-side guard:
  1. getUser() — 401 → redirect /login
  2. Fetch users row → not found + org exists → redirect /login?error=unregistered
  3. Not found + no org → redirect /onboarding
  4. status === 'invited' → redirect /pending
  5. status === 'suspended' | 'deactivated' → redirect /login
```

### 5.2 Invitation Flow

```
Yönetici invites email via /team
  → POST /api/invitations (creates invitations row + sends email via Resend)
  → Invitee receives link: /invite/[token]
  → GET /api/invitations/[token] — validates token, returns org/role info
  → User fills name + password
  → POST /api/invitations/[token]/accept — creates Supabase auth user + users row (status: 'invited')
  → Redirect to /pending (await yönetici approval)
  → Yönetici approves via team page → POST /api/team/[userId]/approve → status: 'active'
```

---

## 6. Key Features & Modules

### Request Lifecycle
- Clients create requests (`/requests/new`) with title, type, brand, priority, deadline, description, and tags.
- On creation: auto-assigns to least-busy designer, triggers async AI brief analysis (non-blocking).
- Free plan enforces `monthly_request_limit` (default: 10).
- Status machine: `new` → `brief_review` → `design` → `revision` → `approval` → `completed`.
- Each transition is recorded in `request_status_history` and triggers DB notifications.

### Kanban Board
- Real-time board powered by Supabase Realtime (`postgres_changes` on `requests` table).
- Drag-and-drop via `@dnd-kit`. Updates during active drags are queued and flushed on drop.
- Live connection status indicator (green/yellow/red dot).
- Role-based: clients cannot update status.

### Brand Management
- Organizations maintain a brand library with color palette, fonts, logo, guidelines, and tone of voice.
- Brands can be attached to requests; AI analysis uses brand context.

### AI Features (Google Gemini)
All AI calls go through the server-side `lib/ai/client.ts` singleton using `GEMINI_API_KEY`.

| Feature | Route / Entry Point | Model |
|---|---|---|
| Brief Analysis | `POST /api/ai/analyze-brief` / `lib/ai/analyze-brief.ts` | `gemini-2.0-flash` |
| Design Suggestion | `POST /api/ai/design-suggestion` | `gemini-2.0-flash` |
| Revision Translation | `POST /api/ai/revision-translate` | `gemini-2.0-flash` |

Credits are consumed via `check_and_consume_ai_credit` RPC. Usage is logged in `ai_requests`.

### Notifications
- DB-level triggers auto-create notifications on key events (new assignment, status change, etc.).
- Real-time delivery via Supabase Realtime channel subscriptions in `NotificationBell`.
- `POST /api/notifications/mark-read` marks one or all notifications as read.

### File Uploads
- Signed URL pattern: `POST /api/upload/sign` → server returns signed Supabase Storage URL → client uploads directly.
- Metadata stored in `files` table after upload.
- Versioning supported via `version` + `parent_file_id`.

### Analytics Dashboard
- Uses Supabase RPC functions to fetch aggregate data.
- Recharts renders: requests by type, designer workload, average delivery time.

### Team Management
- Admins invite users by email with a specific role.
- Invited users appear in a "Pending Approvals" section until approved.
- Role changes: `POST /api/team/[userId]/role`.

---

## 7. Environment Variables

Create `.env.local` in the project root with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Google Gemini AI
GEMINI_API_KEY=<gemini-api-key>

# Stripe (not yet implemented)
STRIPE_SECRET_KEY=<stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<stripe-publishable-key>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>

# Resend (email)
RESEND_API_KEY=<resend-api-key>
```

> **Note:** In development, if `NEXT_PUBLIC_SUPABASE_URL` is not a valid HTTP URL, the Supabase client falls back to a placeholder and auth checks are skipped.

---

## 8. API Routes

### Auth
| Method | Path | Description |
|---|---|---|
| GET | `/api/auth/callback` | OAuth / magic-link code exchange |
| POST | `/api/auth/register` | Register new user (used during onboarding) |

### Organizations
| Method | Path | Description |
|---|---|---|
| POST | `/api/organizations` | Create organization + yönetici user (onboarding) |

### Requests
| Method | Path | Description |
|---|---|---|
| GET | `/api/requests` | List requests (filterable by status, assigned_to) |
| POST | `/api/requests` | Create request (auto-assign, AI brief trigger, plan limit check) |
| GET | `/api/requests/[id]` | Get single request with relations |
| PATCH | `/api/requests/[id]` | Update request |
| DELETE | `/api/requests/[id]` | Delete request |
| PATCH | `/api/requests/[id]/status` | Transition request status |

### Invitations
| Method | Path | Description |
|---|---|---|
| POST | `/api/invitations` | Send invitation email |
| GET | `/api/invitations/[token]` | Validate token, get invitation details |
| POST | `/api/invitations/[token]/accept` | Accept invitation, create user |

### Team
| Method | Path | Description |
|---|---|---|
| POST | `/api/team/[userId]/approve` | Approve invited user (yönetici only) |
| PATCH | `/api/team/[userId]/role` | Change user role |

### Notifications
| Method | Path | Description |
|---|---|---|
| POST | `/api/notifications/mark-read` | Mark notification(s) as read |

### File Upload
| Method | Path | Description |
|---|---|---|
| POST | `/api/upload/sign` | Get signed Supabase Storage upload URL |

### AI
| Method | Path | Description |
|---|---|---|
| POST | `/api/ai/analyze-brief` | Run AI brief quality analysis |
| POST | `/api/ai/design-suggestion` | Get AI design suggestions |
| POST | `/api/ai/revision-translate` | Translate revision comments to design direction |

### Account
| Method | Path | Description |
|---|---|---|
| DELETE | `/api/account/delete` | Delete own account |

---

## 9. Known Issues & TODOs

### Pending Implementation
- **Stripe Billing** — `lib/stripe/` directory exists but is empty. `settings/billing/page.tsx` is a stub. Missing: `lib/stripe/client.ts`, `lib/stripe/plans.ts`, `app/api/webhooks/stripe/route.ts`, plan upgrade flow.
- **n8n Email Notifications** — Email notification automation via n8n is not yet set up.
- **Notification Preferences API** — `settings/notifications/page.tsx` exists but the backend API for saving preferences is not yet implemented.
- **Supabase seed data** — `supabase/seed.sql` has not been run; test data is optional.

### Configuration Required
- **Supabase Email Confirmation** — Must be disabled in Supabase Dashboard (Authentication → Providers → Email → toggle off). If enabled, onboarding redirects fail because the session is not established yet.
- **STRIPE_* keys** — Not yet configured; billing is disabled until added.
- **GEMINI_API_KEY** — Must have sufficient quota; AI features silently skip if credits run out.

### Technical Debt / Notes
- **Untyped Supabase client** — `types/database.ts` is hand-written, not generated by `supabase gen types typescript`. Cast patterns (`as unknown as Type`) are used throughout. Run `supabase gen types typescript --project-id <id> > types/database.ts` when stable.
- **`proxy.ts` instead of `middleware.ts`** — Next.js 16.2.3 uses `proxy.ts` as the route guard entry point (breaking change from Next.js 14/15 conventions).
- **Shadcn UI v4 incompatibility** — `Button asChild` prop does not exist in v4. Pattern used: `buttonVariants()` + `<Link>` wrapper.
- **AI model discrepancy in PROGRESS.md** — `PROGRESS.md` mentions Anthropic/Claude models but the actual implementation (`lib/ai/client.ts`) uses Google Gemini (`gemini-2.0-flash`). `getAnthropicClient` is an alias for backward compatibility.
- **`/demo` route referenced in PROGRESS.md** — Listed as implemented but not found in current file tree (`app/(marketing)/demo/`). May have been removed or not committed.
