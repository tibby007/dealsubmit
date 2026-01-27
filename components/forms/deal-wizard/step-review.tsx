'use client'

import { useState } from 'react'
import { DEAL_TYPES, LEGAL_ENTITIES, DOCUMENT_TYPES } from '@/lib/constants'
import type { DealFormData } from '@/types/forms'
import type { DealType, LegalEntity, DocumentType } from '@/lib/constants'

interface StepReviewProps {
  formData: DealFormData
  uploadedFiles: Record<string, File[]>
  onSubmit: () => Promise<void>
  submitting: boolean
}

export function StepReview({ formData, uploadedFiles, onSubmit, submitting }: StepReviewProps) {
  const [agreed, setAgreed] = useState(false)

  const totalFiles = Object.values(uploadedFiles).reduce((sum, files) => sum + files.length, 0)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Review Your Deal Submission</h3>

      {/* Deal Type */}
      <section className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Deal Type</h4>
        <p className="text-gray-900">{DEAL_TYPES[formData.deal_type as DealType]}</p>
        <p className="text-gray-900">Amount: ${formData.funding_amount.toLocaleString()}</p>
      </section>

      {/* Business Info */}
      <section className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Business Information</h4>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-gray-500">Legal Name</dt>
            <dd className="text-gray-900">{formData.legal_business_name}</dd>
          </div>
          {formData.dba_name && (
            <div>
              <dt className="text-gray-500">DBA</dt>
              <dd className="text-gray-900">{formData.dba_name}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Address</dt>
            <dd className="text-gray-900">
              {formData.business_address}, {formData.business_city}, {formData.business_state} {formData.business_zip}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Phone</dt>
            <dd className="text-gray-900">{formData.business_phone}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Entity Type</dt>
            <dd className="text-gray-900">{LEGAL_ENTITIES[formData.legal_entity as LegalEntity]}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Industry</dt>
            <dd className="text-gray-900">{formData.industry}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Annual Revenue</dt>
            <dd className="text-gray-900">${formData.annual_revenue.toLocaleString()}</dd>
          </div>
        </dl>
      </section>

      {/* Owners */}
      <section className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Owners</h4>
        {formData.owners.map((owner, i) => (
          owner.first_name && (
            <div key={i} className="text-sm mb-2">
              <p className="text-gray-900 font-medium">
                {owner.first_name} {owner.last_name} — {owner.ownership_percentage}% ownership
              </p>
              <p className="text-gray-500">{owner.email} | {owner.cell_phone}</p>
              {owner.estimated_fico > 0 && (
                <p className="text-gray-500">Estimated FICO: {owner.estimated_fico}</p>
              )}
            </div>
          )
        ))}
      </section>

      {/* Documents */}
      <section className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">
          Documents ({totalFiles} file{totalFiles !== 1 ? 's' : ''})
        </h4>
        {Object.entries(uploadedFiles).map(([docType, files]) =>
          files.length > 0 ? (
            <div key={docType} className="text-sm mb-1">
              <span className="text-gray-900 font-medium">
                {DOCUMENT_TYPES[docType as DocumentType] || docType}:
              </span>{' '}
              <span className="text-gray-500">
                {files.map((f) => f.name).join(', ')}
              </span>
            </div>
          ) : null
        )}
        {totalFiles === 0 && (
          <p className="text-sm text-orange-600">No documents uploaded</p>
        )}
      </section>

      {/* Use of Funds / Equipment History */}
      {formData.deal_type === 'equipment_finance' ? (
        (formData.deal_details as Record<string, string>).prior_equipment_funding && (
          <section className="border-b border-gray-200 pb-4">
            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Prior Equipment Funding</h4>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {(formData.deal_details as Record<string, string>).prior_equipment_funding}
            </p>
          </section>
        )
      ) : (
        formData.use_of_funds && (
          <section className="border-b border-gray-200 pb-4">
            <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Use of Funds</h4>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{formData.use_of_funds}</p>
          </section>
        )
      )}

      {/* Broker Writeup */}
      {formData.broker_writeup && (
        <section className="border-b border-gray-200 pb-4">
          <h4 className="text-sm font-medium text-gray-500 uppercase mb-2">Broker Writeup</h4>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{formData.broker_writeup}</p>
        </section>
      )}

      {/* Terms */}
      <div className="flex items-start">
        <input
          type="checkbox"
          id="agree"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
          I confirm that all information provided is accurate and complete to the best of my knowledge.
          I authorize Commercial Capital Connect to process this application.
        </label>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!agreed || submitting}
        className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Deal'}
      </button>
    </div>
  )
}
