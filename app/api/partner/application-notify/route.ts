import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

const ADMIN_EMAIL = 'cheryl@commcapconnect.com'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      applicationId,
      companyName,
      contactName,
      email,
      phone,
      dealTypes,
      monthlyVolume,
    } = body

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `New Partner Application: ${companyName}`,
      html: `
        <h2>New Partner Application Received</h2>
        <p>A new partner has applied to join Commercial Capital Connect:</p>

        <h3>Company Details</h3>
        <ul>
          <li><strong>Company:</strong> ${companyName}</li>
          <li><strong>Contact:</strong> ${contactName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
        </ul>

        <h3>Business Information</h3>
        <ul>
          <li><strong>Deal Types:</strong> ${dealTypes?.length ? dealTypes.join(', ') : 'Not specified'}</li>
          <li><strong>Monthly Volume:</strong> ${monthlyVolume || 'Not specified'}</li>
        </ul>

        <p style="margin-top: 24px;">
          <a href="${siteUrl}/admin/partner-applications/${applicationId}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Application
          </a>
        </p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send partner application notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
