'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import SignaturePad from '@/components/signature-pad'

const AGREEMENT_VERSION = '1.0'
const COMMISSION_PERCENTAGE = 50 // 50% commission split

export default function PartnerAgreementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ full_name: string; company_name: string | null; email: string } | null>(null)
  const [alreadySigned, setAlreadySigned] = useState(false)

  useEffect(() => {
    async function checkStatus() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, company_name, email, onboarding_status')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)

        // Check if already signed
        if (profileData.onboarding_status !== 'agreement_pending') {
          setAlreadySigned(true)
        }
      }

      setLoading(false)
    }

    checkStatus()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreed) {
      setError('Please confirm that you have read and agree to the terms.')
      return
    }

    if (!signature) {
      setError('Please provide your signature.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to sign the agreement.')
        return
      }

      // Save agreement
      const { error: insertError } = await supabase
        .from('partner_agreements')
        .insert({
          user_id: user.id,
          agreement_version: AGREEMENT_VERSION,
          company_name: profile?.company_name || profile?.full_name || '',
          contact_name: profile?.full_name || '',
          compensation_percentage: COMMISSION_PERCENTAGE,
          partner_signature_url: signature,
          ccc_signature_url: '/ccc-signature.png',
          ip_address: null,
        })

      if (insertError) {
        throw insertError
      }

      // Update profile status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ onboarding_status: 'w9_pending' })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Send notification
      try {
        await fetch('/api/partner/agreement-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerName: profile?.full_name,
            companyName: profile?.company_name,
            partnerEmail: profile?.email,
          }),
        })
      } catch (notifyError) {
        console.error('Failed to send notification:', notifyError)
        // Don't block flow if notification fails
      }

      // Redirect to W9 upload
      router.push('/partner/documents/w9')
    } catch (err) {
      console.error('Error signing agreement:', err)
      setError('Failed to save agreement. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (alreadySigned) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-green-800 mb-2">Agreement Already Signed</h2>
          <p className="text-green-700 mb-4">
            You have already signed the partner agreement.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Partner Agreement</h2>
        <p className="text-gray-600 mt-1">
          Please review and sign the partner agreement to continue your onboarding.
        </p>
      </div>

      {/* Agreement Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            DealSubmit Pro Partner Agreement
          </h3>
          <p className="text-sm text-gray-500">Version {AGREEMENT_VERSION}</p>
        </div>

        <div className="px-6 py-4 max-h-96 overflow-y-auto prose prose-sm max-w-none">
          <h4>1. INTRODUCTION</h4>
          <p>
            This Partner Agreement (&quot;Agreement&quot;) is entered into between Commercial Capital Connect,
            LLC (&quot;Company&quot;, &quot;we&quot;, or &quot;us&quot;) and the Partner identified below (&quot;Partner&quot;, &quot;you&quot;, or &quot;your&quot;).
            By signing this Agreement, you agree to be bound by its terms and conditions.
          </p>

          <h4>2. PARTNER RESPONSIBILITIES</h4>
          <p>As a Partner, you agree to:</p>
          <ul>
            <li>Submit complete and accurate deal information through the DealSubmit Pro platform</li>
            <li>Maintain current W-9 tax documentation on file</li>
            <li>Not misrepresent your relationship with Commercial Capital Connect</li>
            <li>Keep all client and deal information confidential</li>
            <li>Comply with all applicable federal, state, and local laws</li>
            <li>Not engage in any fraudulent or deceptive practices</li>
          </ul>

          <h4>3. COMMISSION STRUCTURE</h4>
          <p>
            Upon successful funding of a deal submitted through the platform, Partner shall receive
            a commission equal to <strong>{COMMISSION_PERCENTAGE}%</strong> of the net commission received by Company
            from the funding source. Commission payments will be made within 5 business days of
            Company receiving payment from the funding source.
          </p>

          <h4>4. PAYMENT TERMS</h4>
          <p>
            Commissions will be paid via ACH transfer to the bank account specified in your partner
            profile. You are responsible for ensuring your bank information is accurate and current.
            Partner is responsible for all applicable taxes on commission payments.
          </p>

          <h4>5. TERM AND TERMINATION</h4>
          <p>
            This Agreement is effective upon signing and continues until terminated by either party.
            Either party may terminate this Agreement at any time with 30 days written notice.
            Company may terminate immediately for cause, including but not limited to fraud,
            misrepresentation, or violation of this Agreement.
          </p>

          <h4>6. INDEPENDENT CONTRACTOR</h4>
          <p>
            Partner is an independent contractor and not an employee, agent, or representative of
            Company. Partner is solely responsible for their own taxes, insurance, and business
            expenses. Nothing in this Agreement creates an employment, partnership, or joint
            venture relationship.
          </p>

          <h4>7. CONFIDENTIALITY</h4>
          <p>
            Partner agrees to keep confidential all proprietary information, including but not limited
            to client information, deal terms, commission rates, and business processes. This
            obligation survives termination of this Agreement.
          </p>

          <h4>8. LIMITATION OF LIABILITY</h4>
          <p>
            Company&apos;s liability under this Agreement shall not exceed the total commissions paid
            to Partner in the 12 months preceding any claim. Company is not liable for any
            indirect, incidental, or consequential damages.
          </p>

          <h4>9. GOVERNING LAW</h4>
          <p>
            This Agreement shall be governed by the laws of the State of Texas. Any disputes
            shall be resolved in the courts of Dallas County, Texas.
          </p>

          <h4>10. ENTIRE AGREEMENT</h4>
          <p>
            This Agreement constitutes the entire agreement between the parties and supersedes
            all prior agreements and understandings. This Agreement may only be modified in
            writing signed by both parties.
          </p>
        </div>
      </div>

      {/* Signature Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sign Agreement</h3>

          {/* Partner Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Partner Name</dt>
                <dd className="font-medium text-gray-900">{profile?.full_name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Company</dt>
                <dd className="font-medium text-gray-900">{profile?.company_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Agreement Date</dt>
                <dd className="font-medium text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Commission Rate</dt>
                <dd className="font-medium text-gray-900">{COMMISSION_PERCENTAGE}%</dd>
              </div>
            </dl>
          </div>

          {/* Checkbox */}
          <div className="flex items-start mb-6">
            <div className="flex items-center h-5">
              <input
                id="agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agree" className="font-medium text-gray-700">
                I have read and agree to the Partner Agreement
              </label>
              <p className="text-gray-500">
                By checking this box, I acknowledge that I have read, understand, and agree to be
                bound by the terms and conditions of this Partner Agreement.
              </p>
            </div>
          </div>

          {/* Signature Pad */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Signature
            </label>
            <SignaturePad
              onSignatureChange={setSignature}
              width={450}
              height={150}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Dashboard
            </Link>
            <button
              type="submit"
              disabled={submitting || !agreed || !signature}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing...
                </>
              ) : (
                'Sign Agreement'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
