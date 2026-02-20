import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || profile.role !== 'admin') {
    // Also allow service role calls (from Juan bot)
    const authHeader = request.headers.get('authorization')
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!serviceKey || authHeader !== `Bearer ${serviceKey}`) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
  
  // Parse request body
  const body = await request.json()
  const { lender, score, notes } = body
  
  if (!lender || score === undefined) {
    return NextResponse.json({ 
      error: 'Missing required fields: lender, score' 
    }, { status: 400 })
  }
  
  if (score < 0 || score > 100) {
    return NextResponse.json({ 
      error: 'Score must be between 0 and 100' 
    }, { status: 400 })
  }
  
  // Update the deal with lender recommendation
  const { error } = await supabase
    .from('deals')
    .update({
      recommended_lender: lender,
      lender_fit_score: score,
      lender_notes: notes || null,
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating deal score:', error)
    return NextResponse.json({ 
      error: 'Failed to update deal',
      details: error.message 
    }, { status: 500 })
  }
  
  return NextResponse.json({ 
    success: true,
    dealId: id,
    lender,
    score,
    notes
  })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  // Verify access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Get deal with lender recommendation
  const { data: deal, error } = await supabase
    .from('deals')
    .select('id, recommended_lender, lender_fit_score, lender_notes')
    .eq('id', id)
    .single()
  
  if (error || !deal) {
    return NextResponse.json({ 
      error: 'Deal not found' 
    }, { status: 404 })
  }
  
  return NextResponse.json(deal)
}
