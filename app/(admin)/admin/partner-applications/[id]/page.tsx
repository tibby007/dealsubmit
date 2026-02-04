'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { APPLICATION_STATUSES } from '@/lib/constants'
import { Database } from '@/types/database'

type PartnerApplication = Database['public']['Tables']['partner_applications']['Row']

export default function PartnerApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = params.id as string

  const [application, setApplication] = useState<PartnerApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchApplication() {
      const { data, error } = await supabase
        .from('partner_applications')
        .select('*')
        .eq('id', applicationId)
        .single()

      if (error) {
        console.error('Error fetching application:', error)
        router.push('/admin/partner-applications')
        return
      }

      setApplication(data)
      setLoading(false)
    }

    fetchApplication()
  }, [applicationId, router, supabase])

  const handleApprove = async () => {
    if (!application) return
    setActionLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 1. Update application status
      const { error: appError } = await supabase
        .from('partner_applications')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

      if (appError) throw appError

      // 2. Find and update the partner's profile
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('application_id', applicationId)
        .single()

      if (profiles) {
        await supabase
          .from('profiles')
          .update({
            onboarding_status: 'agreement_pending',
            is_approved: true,
          })
          .eq('id', profiles.id)
      }

      // 3. Send approval email
      await fetch('/api/partner/approval-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: application.email,
          contactName: application.contact_name,
          action: 'approved',
        }),
      })

      router.push('/admin/partner-applications')
    } catch (error) {
      console.error('Error approving application:', error)
      alert('Failed to approve application')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!application) return
    setActionLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 1. Update application status
      const { error: appError } = await supabase
        .from('partner_applications')
        .update({
          status: 'declined',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

      if (appError) throw appError

      // 2. Send decline email
      await fetch('/api/partner/approval-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: application.email,
          contactName: application.contact_name,
          action: 'declined',
        }),
      })

      setShowDeclineModal(false)
      router.push('/admin/partner-applications')
    } catch (error) {
      console.error('Error declining application:', error)
      alert('Failed to decline application')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'declined':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found</p>
        <Link href="/admin/partner-applications" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Applications
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/partner-applications"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Back to Applications
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">{application.company_name}</h2>
          <p className="text-gray-600 mt-1">Partner Application</p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
            application.status
          )}`}
        >
          {APPLICATION_STATUSES[application.status as keyof typeof APPLICATION_STATUSES]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.company_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.address}<br />
                  {application.city}, {application.state} {application.zip}
                </dd>
              </div>
            </dl>
          </div>

          {/* Contact Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.contact_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Position</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.position || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a href={`mailto:${application.email}`} className="text-blue-600 hover:text-blue-800">
                    {application.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Mobile Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.mobile_phone}</dd>
              </div>
              {application.additional_phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Additional Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.additional_phone}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Business Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">How They Heard About Us</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.how_heard_about_us || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Estimated Monthly Volume</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.estimated_monthly_volume || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Typical Deal Types</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {application.typical_deal_types && application.typical_deal_types.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {application.typical_deal_types.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {application.status === 'pending' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Approve Application'}
                </button>
                <button
                  onClick={() => setShowDeclineModal(true)}
                  disabled={actionLoading}
                  className="w-full flex justify-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  Decline Application
                </button>
              </div>
            </div>
          )}

          {/* Application Meta */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(application.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
              {application.reviewed_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Reviewed</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(application.reviewed_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeclineModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Decline Application
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to decline the application from <strong>{application.company_name}</strong>?
                      They will receive an email notification.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleDecline}
                  disabled={actionLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Declining...' : 'Decline'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeclineModal(false)}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
