import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const body = await request.json()
  const { action } = body as { action: 'login' | 'register' | 'reset' | 'upload' }

  const limits: Record<string, { limit: number; windowMs: number }> = {
    login: { limit: 5, windowMs: 15 * 60 * 1000 },      // 5 per 15 min
    register: { limit: 3, windowMs: 60 * 60 * 1000 },    // 3 per hour
    reset: { limit: 3, windowMs: 15 * 60 * 1000 },       // 3 per 15 min
    upload: { limit: 20, windowMs: 10 * 60 * 1000 },     // 20 per 10 min
  }

  const config = limits[action]
  if (!config) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const result = rateLimit({
    key: `${action}:${ip}`,
    limit: config.limit,
    windowMs: config.windowMs,
  })

  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    )
  }

  return NextResponse.json({ success: true, remaining: result.remaining })
}
