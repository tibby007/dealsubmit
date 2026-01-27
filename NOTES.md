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

## Pending SQL to Run

```sql
-- Add encrypted SSN column
ALTER TABLE owners ADD COLUMN ssn_encrypted TEXT;

-- Add signed_application to document type constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;
ALTER TABLE documents ADD CONSTRAINT documents_document_type_check CHECK (
  document_type IN (
    'bank_statement','tax_return','quote_invoice','voided_check',
    'credit_card_statements','profit_loss','balance_sheet','debt_schedule',
    'property_docs','rent_roll','environmental_report','equipment_photos',
    'signed_application','other'
  )
);
```

## Environment Variables (Vercel)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ENCRYPTION_KEY` (any random string for AES-256 SSN encryption)
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

- Supabase Edge Functions (send-notification, handle-new-deal, handle-status-change)
- React Hook Form integration (wizard currently uses raw useState)
- Resend domain verification and FROM_EMAIL update in lib/email.ts
