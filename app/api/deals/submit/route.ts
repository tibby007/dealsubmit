import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { owners } = body as { owners: Array<{ ssn: string; [key: string]: any }> }

  try {
    // Encrypt SSNs and return encrypted values + last 4
    const processedOwners = owners.map((owner) => {
      const ssnRaw = owner.ssn?.replace(/\D/g, '') || ''
      const ssnLastFour = ssnRaw.slice(-4) || null
      let ssnEncrypted: string | null = null

      if (ssnRaw.length >= 9) {
        ssnEncrypted = encrypt(ssnRaw)
      }

      return {
        ssn_last_four: ssnLastFour,
        ssn_encrypted: ssnEncrypted,
      }
    })

    return NextResponse.json({ owners: processedOwners })
  } catch (error) {
    console.error('SSN encryption error:', error)
    return NextResponse.json({ error: 'Failed to process sensitive data' }, { status: 500 })
  }
}
