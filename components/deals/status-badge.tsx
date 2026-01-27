import { DEAL_STATUSES, type DealStatus } from '@/lib/constants'

const statusColors: Record<DealStatus, string> = {
  submitted: 'bg-gray-100 text-gray-800',
  under_review: 'bg-blue-100 text-blue-800',
  docs_needed: 'bg-orange-100 text-orange-800',
  packaging: 'bg-purple-100 text-purple-800',
  submitted_to_lender: 'bg-indigo-100 text-indigo-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  funded: 'bg-emerald-100 text-emerald-800',
}

export function StatusBadge({ status }: { status: DealStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}
    >
      {DEAL_STATUSES[status]}
    </span>
  )
}
