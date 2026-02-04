import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ONBOARDING_STATUSES } from '@/lib/constants'

export default async function PartnersPage() {
  const supabase = await createClient()

  // Get all profiles that have an application_id (meaning they came through partner application)
  const { data: partners } = await supabase
    .from('profiles')
    .select('*')
    .not('application_id', 'is', null)
    .order('created_at', { ascending: false })

  // Get application IDs and fetch applications
  const applicationIds = partners?.map(p => p.application_id).filter(Boolean) || []

  const { data: applications } = await supabase
    .from('partner_applications')
    .select('*')
    .in('id', applicationIds)

  // Create a map of application_id to application
  const applicationMap = new Map(applications?.map(a => [a.id, a]) || [])

  // Get partner agreements and documents for each partner
  const partnerIds = partners?.map(p => p.id) || []

  const { data: agreements } = await supabase
    .from('partner_agreements')
    .select('user_id')
    .in('user_id', partnerIds)

  const { data: documents } = await supabase
    .from('partner_documents')
    .select('user_id, document_type')
    .in('user_id', partnerIds)

  const { data: bankInfo } = await supabase
    .from('partner_bank_info')
    .select('user_id')
    .in('user_id', partnerIds)

  const agreementUserIds = new Set(agreements?.map(a => a.user_id) || [])
  const w9UserIds = new Set(documents?.filter(d => d.document_type === 'w9').map(d => d.user_id) || [])
  const bankUserIds = new Set(bankInfo?.map(b => b.user_id) || [])

  // Filter to only approved applications
  const approvedPartners = partners?.filter(p => {
    const app = applicationMap.get(p.application_id)
    return app?.status === 'approved'
  }) || []

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Partner Management</h2>
        <p className="text-gray-600 mt-1">View and manage approved partners</p>
      </div>

      {approvedPartners.length > 0 ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Onboarding Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {approvedPartners.map((partner) => {
                const application = applicationMap.get(partner.application_id)
                const hasAgreement = agreementUserIds.has(partner.id)
                const hasW9 = w9UserIds.has(partner.id)
                const hasBank = bankUserIds.has(partner.id)

                return (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/partners/${partner.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {application?.company_name || partner.company_name || '—'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application?.contact_name || partner.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {partner.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        <span
                          title="Agreement"
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            hasAgreement ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {hasAgreement ? '✓' : '○'}
                        </span>
                        <span
                          title="W9"
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            hasW9 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {hasW9 ? '✓' : '○'}
                        </span>
                        <span
                          title="Bank Info"
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            hasBank ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {hasBank ? '✓' : '○'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 text-center mt-1">
                        Agree / W9 / Bank
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOnboardingBadgeClass(
                          partner.onboarding_status
                        )}`}
                      >
                        {ONBOARDING_STATUSES[partner.onboarding_status as keyof typeof ONBOARDING_STATUSES] || partner.onboarding_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(partner.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No approved partners yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Approved partner applications will appear here.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/partner-applications"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View Applications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
