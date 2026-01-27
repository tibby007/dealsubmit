'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DEAL_TYPES } from '@/lib/constants'
import { StatusBadge } from '@/components/deals/status-badge'
import type { DealType, DealStatus } from '@/lib/constants'

export default function AdminBrokerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [broker, setBroker] = useState<any>(null)
  const [deals, setDeals] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadBroker()
  }, [])

  async function loadBroker() {
    const { data: brokerData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (brokerData) {
      setBroker(brokerData)

      const { data: dealsData } = await supabase
        .from('deals')
        .select('id, legal_business_name, deal_type, funding_amount, status, submitted_at')
        .eq('broker_id', id)
        .order('created_at', { ascending: false })

      if (dealsData) setDeals(dealsData)
    }
  }

  async function toggleApproval() {
    if (!broker) return
    setSaving(true)

    await supabase
      .from('profiles')
      .update({ is_approved: !broker.is_approved })
      .eq('id', id)

    setBroker({ ...broker, is_approved: !broker.is_approved })
    setMessage(broker.is_approved ? 'Broker access revoked' : 'Broker approved')
    setSaving(false)
  }

  if (!broker) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/brokers" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to Brokers
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">{broker.full_name}</h2>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
          {message}
        </div>
      )}

      {/* Broker Profile */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Broker Profile</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="text-gray-900 font-medium">{broker.full_name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Company</dt>
                <dd className="text-gray-900">{broker.company_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{broker.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900">{broker.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Joined</dt>
                <dd className="text-gray-900">{new Date(broker.created_at).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      broker.is_approved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {broker.is_approved ? 'Approved' : 'Pending Approval'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
          <button
            onClick={toggleApproval}
            disabled={saving}
            className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white disabled:opacity-50 ${
              broker.is_approved
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {broker.is_approved ? 'Revoke Access' : 'Approve Broker'}
          </button>
        </div>
      </div>

      {/* Broker's Deals */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Deals ({deals.length})
        </h3>
        {deals.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deals.map((deal: any) => (
                <tr key={deal.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/deals/${deal.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      {deal.legal_business_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{DEAL_TYPES[deal.deal_type as DealType]}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">${deal.funding_amount.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={deal.status as DealStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-500">No deals submitted</p>
        )}
      </div>
    </div>
  )
}
