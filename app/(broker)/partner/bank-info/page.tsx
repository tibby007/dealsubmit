'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface BankInfo {
  id: string
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  routing_number: string | null
  verified: boolean
}

export default function BankInfoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingInfo, setExistingInfo] = useState<BankInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    routing_number: '',
  })

  useEffect(() => {
    async function loadBankInfo() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Get existing bank info
      const { data: bankInfo } = await supabase
        .from('partner_bank_info')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (bankInfo) {
        setExistingInfo(bankInfo)
        setFormData({
          bank_name: bankInfo.bank_name || '',
          account_name: bankInfo.account_name || '',
          account_number: '', // Don't pre-fill account number for security
          routing_number: bankInfo.routing_number || '',
        })
      } else {
        setIsEditing(true)
      }

      setLoading(false)
    }

    loadBankInfo()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.bank_name.trim()) {
      setError('Bank name is required.')
      return false
    }
    if (!formData.account_name.trim()) {
      setError('Account holder name is required.')
      return false
    }
    if (!formData.account_number.trim() || formData.account_number.length < 4) {
      setError('Please enter a valid account number.')
      return false
    }
    if (!formData.routing_number.trim() || formData.routing_number.length !== 9) {
      setError('Routing number must be 9 digits.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) return

    setSaving(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in.')
        return
      }

      const bankData = {
        user_id: user.id,
        bank_name: formData.bank_name,
        account_name: formData.account_name,
        account_number: formData.account_number,
        routing_number: formData.routing_number,
        verified: false,
      }

      if (existingInfo) {
        // Update existing
        const { error: updateError } = await supabase
          .from('partner_bank_info')
          .update(bankData)
          .eq('id', existingInfo.id)

        if (updateError) throw updateError
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('partner_bank_info')
          .insert(bankData)

        if (insertError) throw insertError
      }

      setSuccess(true)
      setIsEditing(false)

      // Reload to get updated data
      const { data: newBankInfo } = await supabase
        .from('partner_bank_info')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (newBankInfo) {
        setExistingInfo(newBankInfo)
      }
    } catch (err) {
      console.error('Error saving bank info:', err)
      setError('Failed to save bank information. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const maskAccountNumber = (num: string | null) => {
    if (!num || num.length < 4) return '****'
    return '*'.repeat(num.length - 4) + num.slice(-4)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bank Information</h2>
        <p className="text-gray-600 mt-1">
          Set up your ACH payment information for commission payments.
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <div className="ml-3 text-sm text-blue-700">
            <p className="font-medium">Your information is secure</p>
            <p className="mt-1">
              Bank details are encrypted and stored securely. We only use this information
              to process your commission payments via ACH transfer.
            </p>
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm font-medium text-green-800">
              Bank information saved successfully!
            </p>
          </div>
        </div>
      )}

      {/* View Mode */}
      {existingInfo && !isEditing ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Current Bank Information</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Edit
            </button>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{existingInfo.bank_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Account Holder</dt>
              <dd className="mt-1 text-sm text-gray-900">{existingInfo.account_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Account Number</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {maskAccountNumber(existingInfo.account_number)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Routing Number</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{existingInfo.routing_number}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    existingInfo.verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {existingInfo.verified ? 'Verified' : 'Pending Verification'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900">
            {existingInfo ? 'Update Bank Information' : 'Add Bank Information'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
                Bank Name
              </label>
              <input
                type="text"
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="e.g., Chase, Bank of America"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="account_name" className="block text-sm font-medium text-gray-700">
                Account Holder Name
              </label>
              <input
                type="text"
                id="account_name"
                name="account_name"
                value={formData.account_name}
                onChange={handleChange}
                placeholder="Name as it appears on the account"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="routing_number" className="block text-sm font-medium text-gray-700">
                Routing Number
              </label>
              <input
                type="text"
                id="routing_number"
                name="routing_number"
                value={formData.routing_number}
                onChange={handleChange}
                placeholder="9-digit routing number"
                maxLength={9}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <input
                type="text"
                id="account_number"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                placeholder={existingInfo ? 'Enter to update' : 'Your account number'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
                required={!existingInfo}
              />
              {existingInfo && (
                <p className="mt-1 text-xs text-gray-500">
                  Current: {maskAccountNumber(existingInfo.account_number)}
                </p>
              )}
            </div>

          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            {existingInfo ? (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            ) : (
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-800">
                ← Back to Dashboard
              </Link>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Bank Information'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Where to find your bank details</h4>
        <p className="text-sm text-gray-600">
          Your routing number (9 digits) and account number can be found at the bottom of your checks,
          or in your online banking portal. The routing number is typically the first set of numbers.
        </p>
      </div>
    </div>
  )
}
