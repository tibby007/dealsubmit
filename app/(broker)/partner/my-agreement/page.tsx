import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyAgreementPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, company_name')
    .eq('id', user.id)
    .single()

  // Get agreement
  const { data: agreement } = await supabase
    .from('partner_agreements')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!agreement) {
    redirect('/partner/agreement')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Partner Agreement</h2>
        <p className="text-gray-600 mt-1">View your signed partner agreement</p>
      </div>

      {/* Agreement Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
        <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-medium text-green-800">Agreement Signed</p>
          <p className="text-sm text-green-700">
            Signed on{' '}
            {new Date(agreement.signed_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Agreement Details */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Agreement Details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Partner Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile?.full_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Company</dt>
            <dd className="mt-1 text-sm text-gray-900">{profile?.company_name || '—'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Agreement Version</dt>
            <dd className="mt-1 text-sm text-gray-900">{agreement.agreement_version}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Commission Rate</dt>
            <dd className="mt-1 text-sm text-gray-900">{agreement.compensation_percentage}%</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Date Signed</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(agreement.signed_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </dd>
          </div>
        </dl>
      </div>

      {/* Signature */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Signature</h3>
        {agreement.partner_signature_url ? (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={agreement.partner_signature_url}
              alt="Partner Signature"
              className="max-w-full h-auto max-h-32"
            />
          </div>
        ) : (
          <p className="text-gray-500">No signature on file</p>
        )}
      </div>

      {/* Agreement Terms Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Agreement Summary</h3>
        <div className="prose prose-sm max-w-none text-gray-600">
          <ul className="space-y-2">
            <li>
              <strong>Commission:</strong> You receive {agreement.compensation_percentage}% of the net
              commission on each funded deal.
            </li>
            <li>
              <strong>Payment:</strong> Commissions are paid via ACH within 5 business days of Company
              receiving payment.
            </li>
            <li>
              <strong>Status:</strong> You are an independent contractor, not an employee.
            </li>
            <li>
              <strong>Confidentiality:</strong> You agree to keep all client and deal information confidential.
            </li>
            <li>
              <strong>Termination:</strong> Either party may terminate with 30 days written notice.
            </li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-800">
          ← Back to Dashboard
        </Link>
        <a
          href="mailto:partners@commcapconnect.com?subject=Partner Agreement Question"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Questions? Contact Us
        </a>
      </div>
    </div>
  )
}
