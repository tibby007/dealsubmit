import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  emailNewDealSubmitted,
  emailStatusChanged,
  emailNewMessage,
  emailDocsRequested,
} from '@/lib/email'
import { DEAL_TYPES, DEAL_STATUSES, DOCUMENT_TYPES } from '@/lib/constants'
import type { DealType, DealStatus, DocumentType } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { type } = body

  try {
    if (type === 'new_deal') {
      const { dealId } = body
      const { data: deal } = await supabase
        .from('deals')
        .select('legal_business_name, deal_type, funding_amount, broker_id')
        .eq('id', dealId)
        .single()
      if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

      const { data: broker } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', deal.broker_id)
        .single()

      // Get all admin emails
      const { data: admins } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin')

      if (admins) {
        for (const admin of admins) {
          await emailNewDealSubmitted({
            adminEmail: admin.email,
            businessName: deal.legal_business_name,
            dealType: DEAL_TYPES[deal.deal_type as DealType] || deal.deal_type,
            amount: deal.funding_amount,
            brokerName: broker?.full_name || 'Unknown',
          })
        }
      }
    } else if (type === 'status_change') {
      const { dealId, oldStatus, newStatus, note } = body
      const { data: deal } = await supabase
        .from('deals')
        .select('legal_business_name, broker_id')
        .eq('id', dealId)
        .single()
      if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

      const { data: broker } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', deal.broker_id)
        .single()

      if (broker) {
        await emailStatusChanged({
          brokerEmail: broker.email,
          businessName: deal.legal_business_name,
          oldStatus: DEAL_STATUSES[oldStatus as DealStatus] || oldStatus,
          newStatus: DEAL_STATUSES[newStatus as DealStatus] || newStatus,
          note,
        })
      }
    } else if (type === 'new_message') {
      const { dealId, message } = body
      const { data: deal } = await supabase
        .from('deals')
        .select('legal_business_name, broker_id')
        .eq('id', dealId)
        .single()
      if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

      const { data: sender } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

      // Determine recipient: if sender is admin, notify broker; if broker, notify admins
      if (sender?.role === 'admin') {
        const { data: broker } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', deal.broker_id)
          .single()
        if (broker) {
          await emailNewMessage({
            recipientEmail: broker.email,
            businessName: deal.legal_business_name,
            senderName: sender.full_name,
            messagePreview: message.substring(0, 200),
            dealUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/deals/${dealId}/messages`,
          })
        }
      } else {
        const { data: admins } = await supabase
          .from('profiles')
          .select('email')
          .eq('role', 'admin')
        if (admins) {
          for (const admin of admins) {
            await emailNewMessage({
              recipientEmail: admin.email,
              businessName: deal.legal_business_name,
              senderName: sender?.full_name || 'Broker',
              messagePreview: message.substring(0, 200),
              dealUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/deals/${dealId}`,
            })
          }
        }
      }
    } else if (type === 'docs_requested') {
      const { dealId, documentTypes, note } = body
      const { data: deal } = await supabase
        .from('deals')
        .select('legal_business_name, broker_id')
        .eq('id', dealId)
        .single()
      if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

      const { data: broker } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', deal.broker_id)
        .single()

      if (broker) {
        await emailDocsRequested({
          brokerEmail: broker.email,
          businessName: deal.legal_business_name,
          documentTypes: documentTypes.map(
            (dt: string) => DOCUMENT_TYPES[dt as DocumentType] || dt
          ),
          note,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
