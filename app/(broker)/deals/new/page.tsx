'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StepDealType } from '@/components/forms/deal-wizard/step-deal-type'
import { StepBusinessInfo } from '@/components/forms/deal-wizard/step-business-info'
import { StepOwnerInfo } from '@/components/forms/deal-wizard/step-owner-info'
import { StepDealDetails } from '@/components/forms/deal-wizard/step-deal-details'
import { StepUseOfFunds } from '@/components/forms/deal-wizard/step-use-of-funds'
import { StepDocuments } from '@/components/forms/deal-wizard/step-documents'
import { StepBrokerWriteup } from '@/components/forms/deal-wizard/step-broker-writeup'
import { StepReview } from '@/components/forms/deal-wizard/step-review'
import type { DealFormData, OwnerFormData } from '@/types/forms'

const STEPS = [
  'Deal Type',
  'Business Info',
  'Owner Info',
  'Deal Details',
  'Use of Funds',
  'Documents',
  'Broker Writeup',
  'Review & Submit',
]

const initialOwner: OwnerFormData = {
  first_name: '',
  last_name: '',
  home_address: '',
  city: '',
  state: '',
  zip: '',
  home_phone: '',
  cell_phone: '',
  email: '',
  ssn: '',
  date_of_birth: '',
  ownership_percentage: 0,
  annual_income: 0,
  position_title: '',
  estimated_fico: 0,
}

const initialFormData: DealFormData = {
  deal_type: 'equipment_finance',
  funding_amount: 0,
  legal_business_name: '',
  dba_name: '',
  business_address: '',
  business_city: '',
  business_state: '',
  business_zip: '',
  business_phone: '',
  tax_id: '',
  date_established: '',
  legal_entity: 'llc',
  state_of_incorporation: '',
  industry: '',
  annual_revenue: 0,
  location_type: 'rent',
  monthly_rent_mortgage: 0,
  landlord_name: '',
  landlord_phone: '',
  use_of_funds: '',
  broker_writeup: '',
  deal_details: {},
  owners: [{ ...initialOwner }],
}

export default function NewDealPage() {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<DealFormData>(initialFormData)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const updateFormData = (updates: Partial<DealFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Insert deal
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          broker_id: user.id,
          deal_type: formData.deal_type,
          funding_amount: formData.funding_amount,
          legal_business_name: formData.legal_business_name,
          dba_name: formData.dba_name || null,
          business_address: formData.business_address,
          business_city: formData.business_city,
          business_state: formData.business_state,
          business_zip: formData.business_zip,
          business_phone: formData.business_phone,
          tax_id: formData.tax_id,
          date_established: formData.date_established,
          legal_entity: formData.legal_entity,
          state_of_incorporation: formData.state_of_incorporation || null,
          industry: formData.industry,
          annual_revenue: formData.annual_revenue,
          location_type: formData.location_type || null,
          monthly_rent_mortgage: formData.monthly_rent_mortgage || null,
          landlord_name: formData.landlord_name || null,
          landlord_phone: formData.landlord_phone || null,
          deal_details: formData.deal_details,
          broker_writeup: formData.broker_writeup || null,
          use_of_funds: formData.deal_type === 'equipment_finance'
            ? 'Equipment purchase'
            : formData.use_of_funds,
        })
        .select()
        .single()

      if (dealError) throw dealError

      // Insert owners
      for (let i = 0; i < formData.owners.length; i++) {
        const owner = formData.owners[i]
        if (!owner.first_name) continue

        const ssnLastFour = owner.ssn ? owner.ssn.replace(/\D/g, '').slice(-4) : null

        const { error: ownerError } = await supabase.from('owners').insert({
          deal_id: deal.id,
          owner_number: (i + 1) as 1 | 2,
          first_name: owner.first_name,
          last_name: owner.last_name,
          home_address: owner.home_address,
          city: owner.city,
          state: owner.state,
          zip: owner.zip,
          home_phone: owner.home_phone || null,
          cell_phone: owner.cell_phone,
          email: owner.email,
          ssn_last_four: ssnLastFour,
          date_of_birth: owner.date_of_birth,
          ownership_percentage: owner.ownership_percentage,
          annual_income: owner.annual_income || null,
          position_title: owner.position_title || null,
        })

        if (ownerError) throw ownerError
      }

      // Upload documents
      for (const [docType, files] of Object.entries(uploadedFiles)) {
        for (const file of files) {
          const filePath = `${deal.id}/${docType}/${file.name}`

          const { error: uploadError } = await supabase.storage
            .from('deal-documents')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { error: docError } = await supabase.from('documents').insert({
            deal_id: deal.id,
            document_type: docType as any,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
          })

          if (docError) throw docError
        }
      }

      // Create initial status history
      await supabase.from('status_history').insert({
        deal_id: deal.id,
        new_status: 'submitted',
        changed_by: user.id,
        notes: 'Deal submitted',
      })

      router.push(`/deals/${deal.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to submit deal')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Submit New Deal</h2>
        <p className="text-gray-600 mt-1">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {step === 0 && (
          <StepDealType formData={formData} updateFormData={updateFormData} />
        )}
        {step === 1 && (
          <StepBusinessInfo formData={formData} updateFormData={updateFormData} />
        )}
        {step === 2 && (
          <StepOwnerInfo formData={formData} updateFormData={updateFormData} />
        )}
        {step === 3 && (
          <StepDealDetails formData={formData} updateFormData={updateFormData} />
        )}
        {step === 4 && (
          <StepUseOfFunds formData={formData} updateFormData={updateFormData} />
        )}
        {step === 5 && (
          <StepDocuments
            dealType={formData.deal_type}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
          />
        )}
        {step === 6 && (
          <StepBrokerWriteup formData={formData} updateFormData={updateFormData} />
        )}
        {step === 7 && (
          <StepReview
            formData={formData}
            uploadedFiles={uploadedFiles}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        {step < STEPS.length - 1 && (
          <button
            type="button"
            onClick={next}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
