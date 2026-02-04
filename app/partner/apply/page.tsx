'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  US_STATES,
  HOW_HEARD_OPTIONS,
  TYPICAL_DEAL_TYPES,
  MONTHLY_VOLUME_OPTIONS,
} from '@/lib/constants'

export default function PartnerApplicationPage() {
  const [formData, setFormData] = useState({
    // Company Info
    company_name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    // Contact Info
    contact_name: '',
    position: '',
    mobile_phone: '',
    email: '',
    additional_phone: '',
    // Business Info
    how_heard_about_us: '',
    typical_deal_types: [] as string[],
    estimated_monthly_volume: '',
    // Account
    password: '',
    confirm_password: '',
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDealTypeChange = (dealType: string) => {
    setFormData((prev) => {
      const types = prev.typical_deal_types.includes(dealType)
        ? prev.typical_deal_types.filter((t) => t !== dealType)
        : [...prev.typical_deal_types, dealType]
      return { ...prev, typical_deal_types: types }
    })
  }

  const validateForm = (): string | null => {
    // Required fields
    if (!formData.company_name.trim()) return 'Company name is required'
    if (!formData.address.trim()) return 'Address is required'
    if (!formData.city.trim()) return 'City is required'
    if (!formData.state) return 'State is required'
    if (!formData.zip.trim()) return 'ZIP code is required'
    if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) return 'Enter a valid ZIP code'
    if (!formData.contact_name.trim()) return 'Contact name is required'
    if (!formData.mobile_phone.trim()) return 'Mobile phone is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return 'Enter a valid email address'
    if (!formData.password) return 'Password is required'
    if (formData.password.length < 8)
      return 'Password must be at least 8 characters'
    if (formData.password !== formData.confirm_password)
      return 'Passwords do not match'

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      // 1. Create the auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.contact_name,
              company_name: formData.company_name,
              phone: formData.mobile_phone,
            },
          },
        }
      )

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          throw new Error(
            'This email is already registered. Please sign in or use a different email.'
          )
        }
        throw signUpError
      }

      if (!authData.user) {
        throw new Error('Failed to create account')
      }

      // 2. Create the partner application
      const { data: applicationData, error: applicationError } = await supabase
        .from('partner_applications')
        .insert({
          company_name: formData.company_name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          contact_name: formData.contact_name,
          position: formData.position || null,
          mobile_phone: formData.mobile_phone,
          email: formData.email,
          additional_phone: formData.additional_phone || null,
          how_heard_about_us: formData.how_heard_about_us || null,
          typical_deal_types: formData.typical_deal_types,
          estimated_monthly_volume: formData.estimated_monthly_volume || null,
          status: 'pending',
        })
        .select()
        .single()

      if (applicationError) throw applicationError

      // 3. Update the profile with onboarding status and application link
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.contact_name,
          company_name: formData.company_name,
          phone: formData.mobile_phone,
          onboarding_status: 'pending_approval',
          application_id: applicationData.id,
        })
        .eq('id', authData.user.id)

      if (profileError) throw profileError

      // 4. Send notification email to admin (via API route)
      try {
        await fetch('/api/partner/application-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: applicationData.id,
            companyName: formData.company_name,
            contactName: formData.contact_name,
            email: formData.email,
            phone: formData.mobile_phone,
            dealTypes: formData.typical_deal_types,
            monthlyVolume: formData.estimated_monthly_volume,
          }),
        })
      } catch {
        // Don't fail the submission if email fails
        console.error('Failed to send admin notification')
      }

      // 5. Show success
      setSubmitted(true)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to submit application'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in partnering with Commercial Capital
            Connect. We&apos;ll review your application and get back to you
            within 24-48 hours.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Check your email for a confirmation message.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/partner" className="inline-block mb-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">CCC</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Commercial Capital Connect
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Partner Application
          </h1>
          <p className="mt-2 text-gray-600">
            Complete the form below to apply for our partner program
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-sm rounded-xl p-8 space-y-8"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Company Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Company Information
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="company_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-3">
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700"
                  >
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">--</option>
                    {US_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label
                    htmlFor="zip"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ZIP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact_name"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="mobile_phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="mobile_phone"
                    name="mobile_phone"
                    value={formData.mobile_phone}
                    onChange={handleChange}
                    required
                    placeholder="(555) 123-4567"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="additional_phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Additional Phone
                  </label>
                  <input
                    type="tel"
                    id="additional_phone"
                    name="additional_phone"
                    value={formData.additional_phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* About Your Business */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              About Your Business
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="how_heard_about_us"
                  className="block text-sm font-medium text-gray-700"
                >
                  How did you hear about us?
                </label>
                <select
                  id="how_heard_about_us"
                  name="how_heard_about_us"
                  value={formData.how_heard_about_us}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select an option</option>
                  {HOW_HEARD_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What deal types do you typically work?
                </label>
                <div className="space-y-2">
                  {TYPICAL_DEAL_TYPES.map((dealType) => (
                    <label key={dealType} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.typical_deal_types.includes(dealType)}
                        onChange={() => handleDealTypeChange(dealType)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {dealType}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="estimated_monthly_volume"
                  className="block text-sm font-medium text-gray-700"
                >
                  Estimated monthly deal volume
                </label>
                <select
                  id="estimated_monthly_volume"
                  name="estimated_monthly_volume"
                  value={formData.estimated_monthly_volume}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select an option</option>
                  {MONTHLY_VOLUME_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Create Your Account */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Create Your Account
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 8 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
