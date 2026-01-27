'use client'

import { DEAL_TYPES } from '@/lib/constants'
import type { StepProps } from '@/types/forms'
import type { DealType } from '@/lib/constants'

export function StepDealType({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Deal Type *
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(Object.entries(DEAL_TYPES) as [DealType, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => updateFormData({ deal_type: key, deal_details: {} })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.deal_type === key
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="font-medium">{label}</span>
              </button>
            )
          )}
        </div>
      </div>

      <div>
        <label htmlFor="funding_amount" className="block text-sm font-medium text-gray-700">
          Funding Amount Requested *
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="funding_amount"
            value={formData.funding_amount || ''}
            onChange={(e) =>
              updateFormData({ funding_amount: parseFloat(e.target.value) || 0 })
            }
            className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="0.00"
            min="1000"
          />
        </div>
      </div>
    </div>
  )
}
