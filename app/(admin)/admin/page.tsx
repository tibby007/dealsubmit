import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get all deals statistics
  const { data: allDeals } = await supabase
    .from('deals')
    .select('id, status, legal_business_name, funding_amount, deal_type, submitted_at, broker_id')
    .order('submitted_at', { ascending: false })
    .limit(10)

  // Get broker statistics
  const { data: brokers, count: brokerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('role', 'broker')

  const approvedBrokers = brokers?.filter((b) => b.is_approved).length || 0
  const pendingBrokers = brokers?.filter((b) => !b.is_approved).length || 0

  const totalDeals = allDeals?.length || 0
  const underReview = allDeals?.filter((d) => d.status === 'under_review').length || 0
  const docsNeeded = allDeals?.filter((d) => d.status === 'docs_needed').length || 0
  const funded = allDeals?.filter((d) => d.status === 'funded').length || 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">System overview and recent activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Brokers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{brokerCount || 0}</dd>
            <p className="text-xs text-gray-500 mt-1">
              {approvedBrokers} approved, {pendingBrokers} pending
            </p>
          </div>
        </div>

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
            <dt className="text-sm font-medium text-gray-500 truncate">Funded</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">{funded}</dd>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link
          href="/admin/deals"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800"
        >
          View All Deals
        </Link>
        <Link
          href="/admin/brokers"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Manage Brokers
        </Link>
      </div>

      {/* Recent Deals */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Deal Submissions
          </h3>
          {allDeals && allDeals.length > 0 ? (
            <div className="space-y-3">
              {allDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/admin/deals/${deal.id}`}
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
            </div>
          )}
        </div>
      </div>

      {/* Pending Broker Approvals */}
      {pendingBrokers > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-orange-800 mb-2">
            Pending Broker Approvals
          </h3>
          <p className="text-sm text-orange-700">
            You have {pendingBrokers} broker{pendingBrokers !== 1 ? 's' : ''} waiting for approval.
          </p>
          <Link
            href="/admin/brokers"
            className="text-sm font-medium text-orange-800 hover:text-orange-900 mt-2 inline-block"
          >
            Review pending brokers →
          </Link>
        </div>
      )}
    </div>
  )
}
