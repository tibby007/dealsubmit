import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, contactName, action } = body

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (action === 'approved') {
      await sendEmail({
        to: email,
        subject: 'Welcome to Commercial Capital Connect!',
        html: `
          <h2>Great news, ${contactName}!</h2>
          <p>Your partner application has been approved.</p>

          <h3>Next Steps</h3>
          <ol>
            <li>Log in to your partner portal</li>
            <li>Review and sign the Partner Agreement</li>
            <li>Upload your W9</li>
            <li>Start submitting deals!</li>
          </ol>

          <p style="margin-top: 24px;">
            <a href="${siteUrl}/login"
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Log In to Get Started
            </a>
          </p>

          <p style="margin-top: 24px; color: #666;">
            We're excited to work with you!<br />
            - The Commercial Capital Connect Team
          </p>
        `,
      })
    } else if (action === 'declined') {
      await sendEmail({
        to: email,
        subject: 'Commercial Capital Connect Application Update',
        html: `
          <h2>Hi ${contactName},</h2>
          <p>Thank you for your interest in partnering with Commercial Capital Connect.</p>

          <p>After reviewing your application, we're unable to move forward at this time.</p>

          <p>If you have questions, feel free to reach out to us at
            <a href="mailto:info@commcapconnect.com">info@commcapconnect.com</a>.
          </p>

          <p style="margin-top: 24px; color: #666;">
            Best regards,<br />
            Commercial Capital Connect
          </p>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to send approval notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
