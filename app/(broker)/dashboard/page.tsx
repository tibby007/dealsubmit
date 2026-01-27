import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get broker profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get deal statistics
  const { data: deals } = await supabase
    .from('deals')
    .select('id, status, legal_business_name, funding_amount, deal_type, submitted_at')
    .eq('broker_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(5)

  const totalDeals = deals?.length || 0
  const underReview = deals?.filter((d) => d.status === 'under_review').length || 0
  const docsNeeded = deals?.filter((d) => d.status === 'docs_needed').length || 0
  const funded = deals?.filter((d) => d.status === 'funded').length || 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name}
        </h2>
        <p className="text-gray-600 mt-1">Here&apos;s your deal overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Deals</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalDeals}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Under Review</dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">{underReview}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Docs Needed</dt>
            <dd className="mt-1 text-3xl font-semibold text-orange-600">{docsNeeded}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Funded</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{funded}</dd>
          </div>
        </div>
      </div>

      {/* Submit New Deal Button */}
      <div>
        <Link
          href="/deals/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + Submit New Deal
        </Link>
      </div>

      {/* Recent Deals */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Deals
          </h3>
          {deals && deals.length > 0 ? (
            <div className="space-y-3">
              {deals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {deal.legal_business_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {deal.deal_type.replace(/_/g, ' ')} • $
                        {deal.funding_amount.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        deal.status === 'funded'
                          ? 'bg-green-100 text-green-800'
                          : deal.status === 'under_review'
                          ? 'bg-blue-100 text-blue-800'
                          : deal.status === 'docs_needed'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {deal.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Submitted: {new Date(deal.submitted_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No deals submitted yet</p>
              <Link
                href="/deals/new"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
              >
                Submit your first deal →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
