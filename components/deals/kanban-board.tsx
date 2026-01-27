'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { DEAL_TYPES, DEAL_STATUSES } from '@/lib/constants'
import type { DealType, DealStatus } from '@/lib/constants'

const COLUMN_COLORS: Record<DealStatus, string> = {
  submitted: 'border-t-gray-400',
  under_review: 'border-t-blue-500',
  docs_needed: 'border-t-orange-500',
  packaging: 'border-t-purple-500',
  submitted_to_lender: 'border-t-indigo-500',
  approved: 'border-t-green-500',
  declined: 'border-t-red-500',
  funded: 'border-t-emerald-500',
}

const COLUMN_BG: Record<DealStatus, string> = {
  submitted: 'bg-gray-50',
  under_review: 'bg-blue-50',
  docs_needed: 'bg-orange-50',
  packaging: 'bg-purple-50',
  submitted_to_lender: 'bg-indigo-50',
  approved: 'bg-green-50',
  declined: 'bg-red-50',
  funded: 'bg-emerald-50',
}

interface Deal {
  id: string
  status: string
  legal_business_name: string
  funding_amount: number
  deal_type: string
  submitted_at: string
  profiles?: { full_name: string; company_name: string | null } | null
}

interface KanbanBoardProps {
  initialDeals: Deal[]
  draggable?: boolean
  linkPrefix: string // '/admin/deals' or '/deals'
  onStatusChange?: (dealId: string, oldStatus: string, newStatus: string) => Promise<void>
}

export function KanbanBoard({ initialDeals, draggable = false, linkPrefix, onStatusChange }: KanbanBoardProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const dragCounter = useRef<Record<string, number>>({})

  const columns = Object.keys(DEAL_STATUSES) as DealStatus[]

  const grouped: Record<string, Deal[]> = {}
  for (const status of columns) {
    grouped[status] = deals.filter((d) => d.status === status)
  }

  const totalDeals = deals.length

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    if (!draggable) return
    setDraggedDealId(dealId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', dealId)
  }

  const handleDragEnter = (e: React.DragEvent, status: string) => {
    if (!draggable) return
    e.preventDefault()
    dragCounter.current[status] = (dragCounter.current[status] || 0) + 1
    setDragOverColumn(status)
  }

  const handleDragLeave = (e: React.DragEvent, status: string) => {
    if (!draggable) return
    e.preventDefault()
    dragCounter.current[status] = (dragCounter.current[status] || 0) - 1
    if (dragCounter.current[status] <= 0) {
      dragCounter.current[status] = 0
      if (dragOverColumn === status) setDragOverColumn(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!draggable) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    if (!draggable) return
    e.preventDefault()
    setDragOverColumn(null)
    dragCounter.current = {}

    const dealId = e.dataTransfer.getData('text/plain')
    if (!dealId) return

    const deal = deals.find((d) => d.id === dealId)
    if (!deal || deal.status === newStatus) {
      setDraggedDealId(null)
      return
    }

    const oldStatus = deal.status

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, status: newStatus } : d))
    )
    setDraggedDealId(null)

    // Persist
    if (onStatusChange) {
      try {
        await onStatusChange(dealId, oldStatus, newStatus)
      } catch {
        // Revert on failure
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, status: oldStatus } : d))
        )
      }
    }
  }

  const handleDragEnd = () => {
    setDraggedDealId(null)
    setDragOverColumn(null)
    dragCounter.current = {}
  }

  return (
    <div>
      {totalDeals > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
          {columns.map((status) => {
            const columnDeals = grouped[status]
            const columnTotal = columnDeals.reduce((sum, d) => sum + d.funding_amount, 0)
            const isOver = dragOverColumn === status
            return (
              <div
                key={status}
                className={`flex-shrink-0 w-72 rounded-lg border-t-4 ${COLUMN_COLORS[status]} bg-gray-50 flex flex-col transition-all ${
                  isOver ? 'ring-2 ring-blue-400 bg-blue-50/50' : ''
                }`}
                onDragEnter={(e) => handleDragEnter(e, status)}
                onDragLeave={(e) => handleDragLeave(e, status)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column Header */}
                <div className={`px-3 py-3 ${COLUMN_BG[status]} rounded-t-lg`}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {DEAL_STATUSES[status]}
                    </h3>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs font-medium text-gray-700 shadow-sm">
                      {columnDeals.length}
                    </span>
                  </div>
                  {columnDeals.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ${columnTotal.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {columnDeals.map((deal) => {
                    const isDragging = draggedDealId === deal.id
                    return (
                      <div
                        key={deal.id}
                        draggable={draggable}
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onDragEnd={handleDragEnd}
                        className={`rounded-lg shadow-sm border border-gray-200 p-3 transition-all ${
                          draggable ? 'cursor-grab active:cursor-grabbing' : ''
                        } ${isDragging ? 'opacity-40 scale-95' : 'bg-white hover:shadow-md'}`}
                      >
                        <Link href={`${linkPrefix}/${deal.id}`}>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {deal.legal_business_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {DEAL_TYPES[deal.deal_type as DealType]}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-semibold text-gray-900">
                              ${deal.funding_amount.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(deal.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                          {deal.profiles && (
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {deal.profiles.full_name}
                              {deal.profiles.company_name ? ` - ${deal.profiles.company_name}` : ''}
                            </p>
                          )}
                        </Link>
                      </div>
                    )
                  })}
                  {columnDeals.length === 0 && (
                    <div className={`text-center py-8 rounded-lg border-2 border-dashed ${
                      isOver ? 'border-blue-300 bg-blue-50' : 'border-transparent'
                    }`}>
                      <p className="text-xs text-gray-400">
                        {isOver ? 'Drop here' : 'No deals'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-12 text-center text-gray-500">
          No deals submitted yet
        </div>
      )}
    </div>
  )
}
