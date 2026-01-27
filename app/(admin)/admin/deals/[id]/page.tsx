'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DEAL_TYPES, DEAL_STATUSES, LEGAL_ENTITIES, DOCUMENT_TYPES } from '@/lib/constants'
import { StatusBadge } from '@/components/deals/status-badge'
import type { DealType, DealStatus, LegalEntity, DocumentType } from '@/lib/constants'

export default function AdminDealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [deal, setDeal] = useState<any>(null)
  const [owners, setOwners] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [broker, setBroker] = useState<any>(null)
  const [statusHistory, setStatusHistory] = useState<any[]>([])
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadDeal()
  }, [])

  async function loadDeal() {
    const { data: dealData } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .single()

    if (!dealData) return
    setDeal(dealData)
    setNewStatus(dealData.status)
    setAdminNotes(dealData.admin_notes || '')

    const [ownersRes, docsRes, brokerRes, historyRes, msgsRes] = await Promise.all([
      supabase.from('owners').select('*').eq('deal_id', id).order('owner_number'),
      supabase.from('documents').select('*').eq('deal_id', id),
      supabase.from('profiles').select('*').eq('id', dealData.broker_id).single(),
      supabase.from('status_history').select('*').eq('deal_id', id).order('created_at', { ascending: false }),
      supabase.from('deal_messages').select('*').eq('deal_id', id).order('created_at', { ascending: true }),
    ])

    if (ownersRes.data) setOwners(ownersRes.data)
    if (docsRes.data) setDocuments(docsRes.data)
    if (brokerRes.data) setBroker(brokerRes.data)
    if (historyRes.data) setStatusHistory(historyRes.data)
    if (msgsRes.data) setMessages(msgsRes.data)
  }

  async function handleStatusUpdate() {
    if (newStatus === deal.status && !statusNote) return
    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (newStatus !== deal.status) {
      await supabase
        .from('deals')
        .update({ status: newStatus, last_status_change: new Date().toISOString() })
        .eq('id', id)

      await supabase.from('status_history').insert({
        deal_id: id,
        old_status: deal.status,
        new_status: newStatus,
        changed_by: user.id,
        notes: statusNote || null,
      })
    }

    setStatusNote('')
    setSaving(false)
    setMessage('Status updated')
    loadDeal()
  }

  async function handleSaveNotes() {
    setSaving(true)
    await supabase.from('deals').update({ admin_notes: adminNotes }).eq('id', id)
    setSaving(false)
    setMessage('Notes saved')
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('deal_messages').insert({
      deal_id: id,
      sender_id: user.id,
      message: newMessage.trim(),
    })
    setNewMessage('')
    loadDeal()
  }

  async function handleDownload(doc: any) {
    const { data } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(doc.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  if (!deal) return <div className="text-center py-12 text-gray-500">Loading...</div>

  const details = (deal.deal_details || {}) as Record<string, string>

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/deals" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to All Deals
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">
          {deal.legal_business_name}
        </h2>
        <p className="text-gray-500">
          {DEAL_TYPES[deal.deal_type as DealType]} — ${deal.funding_amount.toLocaleString()}
        </p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
          {message}
        </div>
      )}

      {/* Status Update */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-500">Current:</span>
          <StatusBadge status={deal.status as DealStatus} />
        </div>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Change Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {Object.entries(DEAL_STATUSES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Note (optional)</label>
            <input
              type="text"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Reason for change..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            onClick={handleStatusUpdate}
            disabled={saving}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            Update
          </button>
        </div>
      </div>

      {/* Broker Info */}
      {broker && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Broker Information</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="text-gray-900 font-medium">{broker.full_name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Company</dt>
              <dd className="text-gray-900">{broker.company_name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900">{broker.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="text-gray-900">{broker.phone}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* Business Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div><dt className="text-gray-500">Legal Name</dt><dd className="text-gray-900">{deal.legal_business_name}</dd></div>
          {deal.dba_name && <div><dt className="text-gray-500">DBA</dt><dd className="text-gray-900">{deal.dba_name}</dd></div>}
          <div><dt className="text-gray-500">Address</dt><dd className="text-gray-900">{deal.business_address}, {deal.business_city}, {deal.business_state} {deal.business_zip}</dd></div>
          <div><dt className="text-gray-500">Phone</dt><dd className="text-gray-900">{deal.business_phone}</dd></div>
          <div><dt className="text-gray-500">Tax ID</dt><dd className="text-gray-900">{deal.tax_id}</dd></div>
          <div><dt className="text-gray-500">Date Established</dt><dd className="text-gray-900">{new Date(deal.date_established).toLocaleDateString()}</dd></div>
          <div><dt className="text-gray-500">Entity Type</dt><dd className="text-gray-900">{LEGAL_ENTITIES[deal.legal_entity as LegalEntity]}</dd></div>
          <div><dt className="text-gray-500">Industry</dt><dd className="text-gray-900">{deal.industry}</dd></div>
          <div><dt className="text-gray-500">Annual Revenue</dt><dd className="text-gray-900">${deal.annual_revenue.toLocaleString()}</dd></div>
        </dl>
      </div>

      {/* Owners */}
      {owners.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Owners</h3>
          {owners.map((owner: any) => (
            <div key={owner.id} className="border border-gray-200 rounded p-4 mb-3">
              <p className="font-medium">{owner.first_name} {owner.last_name} — {owner.ownership_percentage}%</p>
              <p className="text-sm text-gray-500">{owner.email} | {owner.cell_phone}</p>
              <p className="text-sm text-gray-500">
                DOB: {new Date(owner.date_of_birth).toLocaleDateString()} |
                SSN: ***-**-{owner.ssn_last_four || '****'}
              </p>
              {owner.position_title && <p className="text-sm text-gray-500">{owner.position_title}</p>}
            </div>
          ))}
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

      {/* Use of Funds & Writeup */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Use of Funds</h3>
        <p className="text-sm text-gray-900 whitespace-pre-wrap">{deal.use_of_funds}</p>
      </div>

      {deal.broker_writeup && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Broker Writeup</h3>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{deal.broker_writeup}</p>
        </div>
      )}

      {/* Documents */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Documents ({documents.length})</h3>
        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc: any) => (
              <div key={doc.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                <div>
                  <span className="font-medium text-gray-900">
                    {DOCUMENT_TYPES[doc.document_type as DocumentType] || doc.document_type}
                  </span>
                  <span className="text-gray-500 ml-2">{doc.file_name}</span>
                </div>
                <button onClick={() => handleDownload(doc)} className="text-blue-600 hover:text-blue-700">
                  Download
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No documents uploaded</p>
        )}
      </div>

      {/* Admin Notes */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Notes (Internal)</h3>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={4}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Internal notes about this deal..."
        />
        <button
          onClick={handleSaveNotes}
          disabled={saving}
          className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          Save Notes
        </button>
      </div>

      {/* Messages */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Messages to Broker</h3>
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {messages.length === 0 && <p className="text-sm text-gray-500">No messages yet</p>}
          {messages.map((msg: any) => (
            <div key={msg.id} className="text-sm border-b border-gray-100 pb-2">
              <p className="text-gray-900">{msg.message}</p>
              <p className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Send a message to the broker..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {/* Status History */}
      {statusHistory.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status History</h3>
          <div className="space-y-3">
            {statusHistory.map((entry: any) => (
              <div key={entry.id} className="flex items-start gap-3 text-sm">
                <span className="text-gray-400 whitespace-nowrap">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
                <div>
                  {entry.old_status && (
                    <span className="text-gray-500">
                      {DEAL_STATUSES[entry.old_status as DealStatus] || entry.old_status} →{' '}
                    </span>
                  )}
                  <span className="font-medium text-gray-900">
                    {DEAL_STATUSES[entry.new_status as DealStatus] || entry.new_status}
                  </span>
                  {entry.notes && <p className="text-gray-500">{entry.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
