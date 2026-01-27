'use client'

import { useRef } from 'react'
import { DOCUMENT_TYPES, type DocumentType, type DealType } from '@/lib/constants'

const REQUIRED_DOCS: Record<DealType, DocumentType[]> = {
  equipment_finance: ['signed_application', 'quote_invoice', 'bank_statement', 'tax_return', 'equipment_photos'],
  mca_working_capital: ['bank_statement', 'voided_check', 'credit_card_statements'],
  line_of_credit: ['bank_statement', 'tax_return', 'profit_loss', 'balance_sheet'],
  term_loan: ['bank_statement', 'tax_return', 'debt_schedule', 'profit_loss'],
  real_estate: ['bank_statement', 'tax_return', 'property_docs', 'rent_roll', 'environmental_report'],
}

interface StepDocumentsProps {
  dealType: DealType
  uploadedFiles: Record<string, File[]>
  setUploadedFiles: React.Dispatch<React.SetStateAction<Record<string, File[]>>>
}

export function StepDocuments({ dealType, uploadedFiles, setUploadedFiles }: StepDocumentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeDocType = useRef<string>('')

  const requiredDocs = REQUIRED_DOCS[dealType]

  const handleFileSelect = (docType: string) => {
    activeDocType.current = docType
    fileInputRef.current?.click()
  }

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const docType = activeDocType.current
    setUploadedFiles((prev) => ({
      ...prev,
      [docType]: [...(prev[docType] || []), ...files],
    }))

    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  const removeFile = (docType: string, index: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [docType]: prev[docType].filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Upload the required documents for your {dealType.replace(/_/g, ' ')} deal.
        Accepted formats: PDF, JPG, PNG, DOC, DOCX. Max 25MB per file.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFilesChosen}
        className="hidden"
      />

      <div className="space-y-3">
        {requiredDocs.map((docType) => {
          const files = uploadedFiles[docType] || []
          return (
            <div key={docType} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-900">
                    {DOCUMENT_TYPES[docType]}
                  </span>
                  {files.length > 0 && (
                    <span className="ml-2 text-xs text-green-600">
                      ({files.length} file{files.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleFileSelect(docType)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Upload
                </button>
              </div>
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((file, i) => (
                    <div key={i} className="flex justify-between items-center text-sm text-gray-600">
                      <span>{file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                      <button
                        type="button"
                        onClick={() => removeFile(docType, i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* Other documents */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Other Documents</span>
            <button
              type="button"
              onClick={() => handleFileSelect('other')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Upload
            </button>
          </div>
          {(uploadedFiles['other'] || []).length > 0 && (
            <div className="mt-2 space-y-1">
              {uploadedFiles['other'].map((file, i) => (
                <div key={i} className="flex justify-between items-center text-sm text-gray-600">
                  <span>{file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                  <button
                    type="button"
                    onClick={() => removeFile('other', i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
