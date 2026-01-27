'use client'

import type { StepProps } from '@/types/forms'

export function StepUseOfFunds({ formData, updateFormData }: StepProps) {
  const isEquipment = formData.deal_type === 'equipment_finance'

  if (isEquipment) {
    const details = formData.deal_details as Record<string, string>
    const updateDetail = (key: string, value: string) => {
      updateFormData({
        deal_details: { ...formData.deal_details, [key]: value } as any,
      })
    }

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Have you funded equipment before? If so, with who?
          </label>
          <textarea
            value={details.prior_equipment_funding || ''}
            onChange={(e) => updateDetail('prior_equipment_funding', e.target.value)}
            rows={4}
            placeholder="If you have prior experience financing equipment, please describe the lender(s) and experience..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="use_of_funds" className="block text-sm font-medium text-gray-700">
          Detailed Description of How Funds Will Be Used *
        </label>
        <textarea
          id="use_of_funds"
          value={formData.use_of_funds}
          onChange={(e) => updateFormData({ use_of_funds: e.target.value })}
          rows={6}
          placeholder="Describe in detail how the funds will be used and how this financing will benefit the business..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">Minimum 10 characters</p>
      </div>
    </div>
  )
}
