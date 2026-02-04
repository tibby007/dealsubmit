import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ONBOARDING_STATUSES } from '@/lib/constants'

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get partner profile with application
  const { data: partner, error } = await supabase
    .from('profiles')
    .select(`
      *,
      partner_applications!application_id (*)
    `)
    .eq('id', id)
    .single()

  if (error || !partner) {
    redirect('/admin/partners')
  }

  // Get partner agreement
  const { data: agreement } = await supabase
    .from('partner_agreements')
    .select('*')
    .eq('user_id', id)
    .single()

  // Get partner documents
  const { data: documents } = await supabase
    .from('partner_documents')
    .select('*')
    .eq('user_id', id)
    .order('uploaded_at', { ascending: false })

  // Get partner bank info
  const { data: bankInfo } = await supabase
    .from('partner_bank_info')
    .select('*')
    .eq('user_id', id)
    .single()

  const application = partner.partner_applications

  const getOnboardingBadgeClass = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800'
      case 'pending_approval':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const maskAccountNumber = (num: string | null) => {
    if (!num || num.length < 4) return '****'
    return '****' + num.slice(-4)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/partners"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Back to Partners
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">
            {application?.company_name || partner.company_name || 'Partner'}
          </h2>
          <p className="text-gray-600 mt-1">{application?.contact_name || partner.full_name}</p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOnboardingBadgeClass(
            partner.onboarding_status
          )}`}
        >
          {ONBOARDING_STATUSES[partner.onboarding_status as keyof typeof ONBOARDING_STATUSES]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a href={`mailto:${partner.email}`} className="text-blue-600 hover:text-blue-800">
                    {partner.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{application?.mobile_phone || partner.phone || '—'}</dd>
              </div>
              {application && (
                <>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {application.address}<br />
                      {application.city}, {application.state} {application.zip}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          {/* Agreement */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Partner Agreement</h3>
            {agreement ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Signed Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(agreement.signed_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Version</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agreement.agreement_version}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Commission Split</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agreement.compensation_percentage}%</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Partner Signature</dt>
                  <dd className="mt-1">
                    {agreement.partner_signature_url ? (
                      <a
                        href={agreement.partner_signature_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Signature
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-500">Agreement not signed yet</p>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
            {documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.file_name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.document_type.toUpperCase()} • Uploaded{' '}
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          doc.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {doc.verified ? 'Verified' : 'Pending'}
                      </span>
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents uploaded yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bank Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Information</h3>
            {bankInfo ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{bankInfo.account_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{bankInfo.bank_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Routing Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{bankInfo.routing_number || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{maskAccountNumber(bankInfo.account_number)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Verified</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        bankInfo.verified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {bankInfo.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-500">Bank info not provided yet</p>
            )}
          </div>

          {/* Partner Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Partner Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Partner Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(partner.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              {application && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Deal Types</dt>
                    <dd className="mt-1">
                      {application.typical_deal_types?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {application.typical_deal_types.map((type: string) => (
                            <span
                              key={type}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Monthly Volume</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application.estimated_monthly_volume || '—'}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
