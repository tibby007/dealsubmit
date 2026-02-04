'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function W9UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingW9, setExistingW9] = useState<{ id: string; file_name: string; uploaded_at: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [onboardingStatus, setOnboardingStatus] = useState<string | null>(null)
  const [profileInfo, setProfileInfo] = useState<{ full_name: string; company_name: string | null; email: string } | null>(null)

  useEffect(() => {
    async function checkStatus() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Get profile status
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_status, full_name, company_name, email')
        .eq('id', user.id)
        .single()

      if (profile) {
        setOnboardingStatus(profile.onboarding_status)
        setProfileInfo({
          full_name: profile.full_name,
          company_name: profile.company_name,
          email: profile.email,
        })
      }

      // Check for existing W9
      const { data: w9Doc } = await supabase
        .from('partner_documents')
        .select('id, file_name, uploaded_at')
        .eq('user_id', user.id)
        .eq('document_type', 'w9')
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single()

      if (w9Doc) {
        setExistingW9(w9Doc)
      }

      setLoading(false)
    }

    checkStatus()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF, JPEG, or PNG file.')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      return
    }

    setError(null)
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to upload documents.')
        return
      }

      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/w9-${Date.now()}.${fileExt}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('partner-documents')
        .upload(fileName, selectedFile)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('partner-documents')
        .getPublicUrl(fileName)

      // Save document record
      const { error: insertError } = await supabase
        .from('partner_documents')
        .insert({
          user_id: user.id,
          document_type: 'w9',
          file_name: selectedFile.name,
          file_url: urlData.publicUrl,
        })

      if (insertError) {
        throw insertError
      }

      // Update profile status to complete if this is during onboarding
      if (onboardingStatus === 'w9_pending') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ onboarding_status: 'complete' })
          .eq('id', user.id)

        if (updateError) {
          throw updateError
        }

        // Send onboarding complete notification
        try {
          await fetch('/api/partner/onboarding-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              partnerName: profileInfo?.full_name,
              companyName: profileInfo?.company_name,
              partnerEmail: profileInfo?.email,
            }),
          })
        } catch (notifyError) {
          console.error('Failed to send notification:', notifyError)
          // Don't block flow if notification fails
        }
      }

      // Redirect to dashboard or documents
      if (onboardingStatus === 'w9_pending') {
        router.push('/dashboard')
      } else {
        router.push('/partner/documents')
      }
    } catch (err) {
      console.error('Error uploading W9:', err)
      setError('Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Upload W-9 Form</h2>
        <p className="text-gray-600 mt-1">
          Upload your completed W-9 form for tax reporting purposes.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="ml-3 text-sm text-blue-700">
            <p className="font-medium">Why do we need a W-9?</p>
            <p className="mt-1">
              As an independent contractor, we need your W-9 on file to issue 1099 forms for
              commission payments. Your information is kept secure and confidential.
            </p>
          </div>
        </div>
      </div>

      {/* Existing W9 */}
      {existingW9 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">W-9 Already on File</p>
              <p className="text-sm text-green-700">
                {existingW9.file_name} - Uploaded{' '}
                {new Date(existingW9.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-green-700">
            You can upload a new W-9 below to replace the existing one.
          </p>
        </div>
      )}

      {/* Upload Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select W-9 File
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors ${
                selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile ? (
                <div>
                  <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, JPEG, or PNG (max 10MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Download Blank W9 */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-2">Need a blank W-9 form?</p>
            <a
              href="https://www.irs.gov/pub/irs-pdf/fw9.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download IRS W-9 Form
            </a>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Dashboard
            </Link>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload W-9'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
