import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DEAL_TYPES, LEGAL_ENTITIES, DEAL_STATUSES } from '@/lib/constants'
import { StatusBadge } from '@/components/deals/status-badge'
import type { DealType, DealStatus, LegalEntity } from '@/lib/constants'

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .eq('broker_id', user.id)
    .single()

  if (!deal) return notFound()

  const { data: owners } = await supabase
    .from('owners')
    .select('*')
    .eq('deal_id', id)
    .order('owner_number')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('deal_id', id)

  const { data: statusHistory } = await supabase
    .from('status_history')
    .select('*')
    .eq('deal_id', id)
    .order('created_at', { ascending: false })

  const details = (deal.deal_details || {}) as Record<string, string>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/deals" className="text-sm text-blue-600 hover:text-blue-700">
            ← Back to Deals
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">
            {deal.legal_business_name}
          </h2>
          <p className="text-gray-500">
            {DEAL_TYPES[deal.deal_type as DealType]} — ${deal.funding_amount.toLocaleString()}
          </p>
        </div>
        <StatusBadge status={deal.status as DealStatus} />
      </div>

      {/* Quick Links */}
      <div className="flex gap-3">
        <Link
          href={`/deals/${id}/documents`}
          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Documents ({documents?.length || 0})
        </Link>
        <Link
          href={`/deals/${id}/messages`}
          className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Messages
        </Link>
      </div>

      {/* Business Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-gray-500">Legal Name</dt>
            <dd className="text-gray-900 font-medium">{deal.legal_business_name}</dd>
          </div>
          {deal.dba_name && (
            <div>
              <dt className="text-gray-500">DBA</dt>
              <dd className="text-gray-900">{deal.dba_name}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Address</dt>
            <dd className="text-gray-900">
              {deal.business_address}, {deal.business_city}, {deal.business_state} {deal.business_zip}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Phone</dt>
            <dd className="text-gray-900">{deal.business_phone}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Tax ID</dt>
            <dd className="text-gray-900">XX-XXX{deal.tax_id.slice(-4)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Date Established</dt>
            <dd className="text-gray-900">{new Date(deal.date_established).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Entity Type</dt>
            <dd className="text-gray-900">{LEGAL_ENTITIES[deal.legal_entity as LegalEntity]}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Industry</dt>
            <dd className="text-gray-900">{deal.industry}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Annual Revenue</dt>
            <dd className="text-gray-900">${deal.annual_revenue.toLocaleString()}</dd>
          </div>
        </dl>
      </div>

      {/* Owners */}
      {owners && owners.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Owners</h3>
          <div className="space-y-4">
            {owners.map((owner) => (
              <div key={owner.id} className="border border-gray-200 rounded p-4">
                <p className="font-medium text-gray-900">
                  {owner.first_name} {owner.last_name} — {owner.ownership_percentage}% ownership
                </p>
                <p className="text-sm text-gray-500">
                  {owner.email} | {owner.cell_phone}
                </p>
                {owner.position_title && (
                  <p className="text-sm text-gray-500">{owner.position_title}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deal Details */}
      {Object.keys(details).length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Deal Details</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {Object.entries(details).map(([key, value]) => (
              <div key={key}>
                <dt className="text-gray-500">{key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</dt>
                <dd className="text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Use of Funds */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Use of Funds</h3>
        <p className="text-sm text-gray-900 whitespace-pre-wrap">{deal.use_of_funds}</p>
      </div>

      {/* Broker Writeup */}
      {deal.broker_writeup && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Broker Writeup</h3>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{deal.broker_writeup}</p>
        </div>
      )}

      {/* Status History */}
      {statusHistory && statusHistory.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status History</h3>
          <div className="space-y-3">
            {statusHistory.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 whitespace-nowrap">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
                <div>
                  <span className="font-medium text-gray-900">
                    {DEAL_STATUSES[entry.new_status as DealStatus] || entry.new_status}
                  </span>
                  {entry.notes && (
                    <p className="text-gray-500">{entry.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
