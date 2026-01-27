'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KanbanBoard } from '@/components/deals/kanban-board'

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDeals()
  }, [])

  async function loadDeals() {
    const { data } = await supabase
      .from('deals')
      .select('id, broker_id, status, legal_business_name, funding_amount, deal_type, submitted_at, created_at, profiles!deals_broker_id_fkey(full_name, company_name)')
      .order('created_at', { ascending: false })

    if (data) setDeals(data)
    setLoading(false)
  }

  async function handleStatusChange(dealId: string, oldStatus: string, newStatus: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('deals')
      .update({ status: newStatus, last_status_change: new Date().toISOString() })
      .eq('id', dealId)

    if (error) throw error

    // Record status history
    await supabase.from('status_history').insert({
      deal_id: dealId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: user.id,
      notes: 'Status updated via pipeline',
    })

    // Notify broker via email
    fetch('/api/email/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'status_change', dealId, oldStatus, newStatus }),
    })
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading pipeline...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Deal Pipeline</h2>
        <p className="text-sm text-gray-500">
          {deals.length} total deal{deals.length !== 1 ? 's' : ''} — drag cards to update status
        </p>
      </div>
      <KanbanBoard
        initialDeals={deals}
        draggable={true}
        linkPrefix="/admin/deals"
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
