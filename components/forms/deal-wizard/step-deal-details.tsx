'use client'

import type { StepProps } from '@/types/forms'
import type { Json } from '@/types/database'

export function StepDealDetails({ formData, updateFormData }: StepProps) {
  const details = formData.deal_details as Record<string, string>

  const updateDetail = (key: string, value: string) => {
    updateFormData({
      deal_details: { ...formData.deal_details, [key]: value } as Record<string, Json>,
    })
  }

  const input = (label: string, key: string, opts?: { type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={opts?.type || 'text'}
        value={details[key] || ''}
        onChange={(e) => updateDetail(key, e.target.value)}
        placeholder={opts?.placeholder}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  )

  const select = (label: string, key: string, options: string[]) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={details[key] || ''}
        onChange={(e) => updateDetail(key, e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )

  const textarea = (label: string, key: string, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        value={details[key] || ''}
        onChange={(e) => updateDetail(key, e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    </div>
  )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        {formData.deal_type === 'equipment_finance' && 'Equipment Finance Details'}
        {formData.deal_type === 'mca_working_capital' && 'MCA Working Capital Details'}
        {formData.deal_type === 'line_of_credit' && 'Line of Credit Details'}
        {formData.deal_type === 'term_loan' && 'Term Loan Details'}
        {formData.deal_type === 'real_estate' && 'Real Estate Loan Details'}
      </h3>

      {formData.deal_type === 'equipment_finance' && (
        <>
          {textarea('Equipment Type / Description', 'equipment_description')}
          {select('New or Used', 'equipment_condition', ['New', 'Used'])}
          {input('Vendor / Seller Name', 'vendor_name')}
          {input('Vendor Contact Name', 'vendor_contact')}
          {input('Vendor Phone', 'vendor_phone', { type: 'tel' })}
          {input('Vendor Address', 'vendor_address')}
          {input('Equipment Price', 'equipment_price', { type: 'number' })}
          {input('Down Payment (if any)', 'down_payment', { type: 'number' })}
        </>
      )}

      {formData.deal_type === 'mca_working_capital' && (
        <>
          {input('Monthly Credit Card Volume', 'monthly_cc_volume', { type: 'number' })}
          {input('Average Bank Balance', 'avg_bank_balance', { type: 'number' })}
          {select('Any Current MCA Positions?', 'current_mca', ['Yes', 'No'])}
          {details.current_mca === 'Yes' &&
            textarea('Details of Current MCA Positions', 'mca_position_details')}
          {select('Preferred Payment Frequency', 'payment_frequency', ['Daily', 'Weekly'])}
        </>
      )}

      {formData.deal_type === 'line_of_credit' && (
        <>
          {input('Requested Credit Limit', 'credit_limit', { type: 'number' })}
          {textarea('Intended Use', 'intended_use')}
          {textarea('Expected Draw Schedule', 'draw_schedule')}
        </>
      )}

      {formData.deal_type === 'term_loan' && (
        <>
          {textarea('Loan Purpose', 'loan_purpose')}
          {select('Preferred Term Length', 'term_length', [
            '6 months', '12 months', '24 months', '36 months', '48 months', '60 months',
          ])}
          {select('Collateral Available?', 'collateral_available', ['Yes', 'No'])}
          {details.collateral_available === 'Yes' &&
            textarea('Collateral Description', 'collateral_description')}
          {textarea('Existing Debt Obligations', 'existing_debt')}
        </>
      )}

      {formData.deal_type === 'real_estate' && (
        <>
          {select('Property Type', 'property_type', [
            'Office', 'Retail', 'Industrial', 'Mixed-Use', 'Multi-Family', 'Warehouse', 'Other',
          ])}
          {input('Property Address', 'property_address')}
          {select('Purchase or Refinance', 'purchase_or_refi', ['Purchase', 'Refinance'])}
          {input(
            details.purchase_or_refi === 'Refinance' ? 'Current Value' : 'Purchase Price',
            'purchase_price',
            { type: 'number' }
          )}
          {input('Loan Amount Requested', 'loan_amount', { type: 'number' })}
          {input('Requested LTV (%)', 'ltv', { type: 'number' })}
          {input('Current Occupancy Rate (%)', 'occupancy_rate', { type: 'number' })}
        </>
      )}
    </div>
  )
}
