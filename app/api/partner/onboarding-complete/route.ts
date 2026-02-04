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
      subject: `Onboarding Complete: ${companyName || partnerName}`,
      html: `
        <h2>Partner Onboarding Complete</h2>
        <p>A partner has completed all onboarding steps and is ready to submit deals.</p>
        <hr>
        <p><strong>Partner:</strong> ${partnerName}</p>
        <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
        <p><strong>Email:</strong> ${partnerEmail}</p>
        <p><strong>Completed:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</p>
        <hr>
        <p><strong>Completed Steps:</strong></p>
        <ul>
          <li>✓ Application approved</li>
          <li>✓ Partner agreement signed</li>
          <li>✓ W9 uploaded</li>
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/partners">View Partners</a></p>
      `,
    })

    // Welcome email to partner
    await resend.emails.send({
      from: 'DealSubmit Pro <noreply@commcapconnect.com>',
      to: partnerEmail,
      subject: 'Welcome to DealSubmit Pro - You\'re Ready to Submit Deals!',
      html: `
        <h2>Welcome to the Team, ${partnerName}!</h2>
        <p>Congratulations! You've completed your partner onboarding and now have full access to DealSubmit Pro.</p>

        <h3>What You Can Do Now:</h3>
        <ul>
          <li><strong>Submit Deals:</strong> Enter new equipment financing opportunities through our portal</li>
          <li><strong>Track Progress:</strong> Monitor the status of all your submitted deals</li>
          <li><strong>Access Guidelines:</strong> Review underwriting and submission requirements</li>
          <li><strong>Manage Documents:</strong> Keep your W9 and other documents up to date</li>
        </ul>

        <p style="margin: 24px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/deals/new" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 12px;">Submit Your First Deal</a>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
        </p>

        <h3>Commission Structure Reminder</h3>
        <p>You'll receive 50% of the net commission on every funded deal. Payments are made via ACH within 5 business days of funding.</p>

        <h3>Quick Tips for Success:</h3>
        <ul>
          <li>Submit complete applications with all required documents</li>
          <li>Review our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/partner/guidelines/underwriting">Underwriting Guidelines</a> before submitting</li>
          <li>Reach out early if you're unsure about a deal - we're happy to pre-qualify</li>
        </ul>

        <hr>
        <p style="color: #666; font-size: 14px;">
          Questions? We're here to help! Reply to this email or contact us at deals@commcapconnect.com.
        </p>
        <p style="color: #666; font-size: 12px;">
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
