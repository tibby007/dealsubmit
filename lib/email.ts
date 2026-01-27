import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || '')
}

const FROM_EMAIL = 'DealSubmit Pro <noreply@commercialcapitalconnect.com>'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

export function emailNewDealSubmitted({
  adminEmail,
  businessName,
  dealType,
  amount,
  brokerName,
}: {
  adminEmail: string
  businessName: string
  dealType: string
  amount: number
  brokerName: string
}) {
  return sendEmail({
    to: adminEmail,
    subject: `New Deal Submitted: ${businessName}`,
    html: `
      <h2>New Deal Submitted</h2>
      <p><strong>${brokerName}</strong> submitted a new deal:</p>
      <ul>
        <li><strong>Business:</strong> ${businessName}</li>
        <li><strong>Type:</strong> ${dealType}</li>
        <li><strong>Amount:</strong> $${amount.toLocaleString()}</li>
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/deals">View in Pipeline</a></p>
    `,
  })
}

export function emailStatusChanged({
  brokerEmail,
  businessName,
  oldStatus,
  newStatus,
  note,
}: {
  brokerEmail: string
  businessName: string
  oldStatus: string
  newStatus: string
  note?: string
}) {
  return sendEmail({
    to: brokerEmail,
    subject: `Deal Status Updated: ${businessName}`,
    html: `
      <h2>Deal Status Updated</h2>
      <p>Your deal for <strong>${businessName}</strong> has been updated:</p>
      <p><strong>${oldStatus}</strong> → <strong>${newStatus}</strong></p>
      ${note ? `<p><em>Note: ${note}</em></p>` : ''}
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/deals">View Your Deals</a></p>
    `,
  })
}

export function emailNewMessage({
  recipientEmail,
  businessName,
  senderName,
  messagePreview,
  dealUrl,
}: {
  recipientEmail: string
  businessName: string
  senderName: string
  messagePreview: string
  dealUrl: string
}) {
  return sendEmail({
    to: recipientEmail,
    subject: `New Message on ${businessName}`,
    html: `
      <h2>New Message</h2>
      <p><strong>${senderName}</strong> sent a message on the deal for <strong>${businessName}</strong>:</p>
      <blockquote style="border-left: 3px solid #ccc; padding-left: 12px; color: #555;">
        ${messagePreview}
      </blockquote>
      <p><a href="${dealUrl}">View Deal</a></p>
    `,
  })
}

export function emailDocsRequested({
  brokerEmail,
  businessName,
  documentTypes,
  note,
}: {
  brokerEmail: string
  businessName: string
  documentTypes: string[]
  note?: string
}) {
  return sendEmail({
    to: brokerEmail,
    subject: `Documents Requested: ${businessName}`,
    html: `
      <h2>Documents Requested</h2>
      <p>The following documents have been requested for <strong>${businessName}</strong>:</p>
      <ul>
        ${documentTypes.map((dt) => `<li>${dt}</li>`).join('')}
      </ul>
      ${note ? `<p><em>Note: ${note}</em></p>` : ''}
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/deals">Upload Documents</a></p>
    `,
  })
}
