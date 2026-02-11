import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { partnerName, companyName, partnerEmail } = body

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Notify admin that partner has completed all steps and is ready for review
    await sendEmail({
      to: 'cheryl@commcapconnect.com',
      subject: `Ready for Review: ${companyName || partnerName}`,
      html: `
        <h2>Partner Ready for Approval</h2>
        <p>A partner has completed all onboarding steps and is waiting for your approval.</p>
        <hr>
        <p><strong>Partner:</strong> ${partnerName}</p>
        <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
        <p><strong>Email:</strong> ${partnerEmail}</p>
        <p><strong>Completed:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
        <hr>
        <p><strong>Completed Steps:</strong></p>
        <ul>
          <li>Application submitted</li>
          <li>Partner agreement signed</li>
          <li>W9 uploaded</li>
        </ul>
        <p style="margin-top: 24px;">
          <a href="${siteUrl}/admin/partner-applications"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review &amp; Approve
          </a>
        </p>
      `,
    })

    // Confirmation email to partner
    await sendEmail({
      to: partnerEmail,
      subject: 'Application Received - Commercial Capital Connect',
      html: `
        <h2>Thank you, ${partnerName}!</h2>
        <p>We've received your completed application, signed agreement, and W9.</p>

        <p>Our team is reviewing your application and you'll receive an email once you've been approved to start submitting deals.</p>

        <p style="margin-top: 24px; color: #666;">
          Questions? Contact us at <a href="mailto:info@commcapconnect.com">info@commcapconnect.com</a>.
        </p>

        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          Commercial Capital Connect, LLC<br>
          Dallas, Texas
        </p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending onboarding complete notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
