'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { KanbanBoard } from '@/components/deals/kanban-board'

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDeals()
  }, [])

  async function loadDeals() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('deals')
      .select('id, status, legal_business_name, funding_amount, deal_type, submitted_at, created_at')
      .eq('broker_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setDeals(data)
    setLoading(false)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading deals...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Deals</h2>
          <p className="text-sm text-gray-500">{deals.length} deal{deals.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/deals/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          + Submit New Deal
        </Link>
      </div>
      <KanbanBoard
        initialDeals={deals}
        draggable={false}
        linkPrefix="/deals"
      />
    </div>
  )
}
