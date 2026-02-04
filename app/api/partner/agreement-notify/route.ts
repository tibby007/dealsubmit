import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const body = await request.json()
    const { partnerName, companyName, partnerEmail } = body

    // Notify admin
    await resend.emails.send({
      from: 'DealSubmit Pro <noreply@commcapconnect.com>',
      to: 'cheryl@commcapconnect.com',
      subject: `Partner Agreement Signed: ${companyName || partnerName}`,
      html: `
        <h2>Partner Agreement Signed</h2>
        <p>A partner has signed their partner agreement.</p>
        <hr>
        <p><strong>Partner:</strong> ${partnerName}</p>
        <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
        <p><strong>Email:</strong> ${partnerEmail}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
        <hr>
        <p>Next step: Partner will upload their W9 form.</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/partners">View Partners</a></p>
      `,
    })

    // Confirm to partner
    await resend.emails.send({
      from: 'DealSubmit Pro <noreply@commcapconnect.com>',
      to: partnerEmail,
      subject: 'Agreement Signed - Next Steps',
      html: `
        <h2>Thank You for Signing!</h2>
        <p>Hi ${partnerName},</p>
        <p>We've received your signed partner agreement. You're almost done!</p>
        <h3>Next Step: Upload Your W9</h3>
        <p>Please upload your completed W-9 form to continue your onboarding:</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/partner/documents/w9" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Upload W9</a></p>
        <p>Need a blank W-9 form? <a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf">Download from IRS</a></p>
        <hr>
        <p style="color: #666; font-size: 14px;">
          If you have any questions, please reply to this email or contact us at deals@commcapconnect.com.
        </p>
        <p style="color: #666; font-size: 12px;">
          Commercial Capital Connect, LLC<br>
          Dallas, Texas
        </p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending agreement notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
