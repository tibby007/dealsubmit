# DealSubmit Pro - Build Notes

## What's Been Built

### Auth & Access
- Broker registration with admin approval flow
- Login with role-based routing (admin vs broker)
- Forgot password + reset password via Supabase
- Rate limiting on login (5/15min), register (3/hr), password reset (3/15min)
- Middleware for route protection

### Broker Portal
- Dashboard with deal stats
- 8-step deal submission wizard with Zod per-step validation
- Deal detail view with status tracking
- Document upload/download management
- Messaging with admin
- Read-only kanban board of deal statuses
- Profile edit page

### Admin Portal
- Admin dashboard with pipeline stats
- Drag-and-drop kanban deal pipeline
- Deal detail with status updates, admin notes, messaging
- Document request flow (checkboxes + auto-sets status to "Docs Needed")
- Broker management with approve/revoke
- Broker detail with deal list

### Email Notifications (Resend)
- New deal submitted (notifies admins)
- Status changes (notifies broker)
- New messages (notifies other party)
- Document requests (notifies broker)

### Security
- AES-256-GCM SSN encryption via server-side API route
- Zod validation schemas on wizard steps
- Rate limiting on auth and uploads
- Supabase RLS with SECURITY DEFINER admin function

## Database Migrations

✅ Completed (2026-01-28):
- Added `ssn_encrypted` column to owners table
- Added `signed_application` to document types constraint

## Environment Variables (Vercel)

✅ All configured:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `ENCRYPTION_KEY` (random string for AES-256 SSN encryption)
- `NEXT_PUBLIC_SITE_URL` (production URL for email links)

## Deployment

- GitHub: https://github.com/tibby007/dealsubmit.git
- Hosted on Vercel, auto-deploys from main branch
- Next.js 16.1.5 with Turbopack

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Supabase (PostgreSQL, Auth, Storage, RLS)
- Tailwind CSS
- Resend for email
- Zod for validation
- AES-256-GCM for SSN encryption

## What's Left (Nice-to-Have)

- Resend domain verification and FROM_EMAIL update in lib/email.ts

## Architecture Decision: Email Notifications

**Evaluated Supabase Edge Functions** but staying with current `/api/email/notify` route because:
- Current implementation is reliable and well-tested
- Edge Functions provide value mainly with database webhooks (future automation)
- Simpler to debug and maintain in Next.js API routes
- No immediate scaling need

**Recommendation:** Revisit Edge Functions when:
- Adding non-web deal creation (bulk import, external API)
- Need guaranteed delivery independent of Next.js deployment
- Implementing full database-triggered automation
