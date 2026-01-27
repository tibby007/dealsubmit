'use client'

import { LEGAL_ENTITIES, LOCATION_TYPES, US_STATES } from '@/lib/constants'
import type { StepProps } from '@/types/forms'
import type { LegalEntity, LocationType } from '@/lib/constants'

export function StepBusinessInfo({ formData, updateFormData }: StepProps) {
  const field = (
    label: string,
    name: keyof typeof formData,
    opts?: { type?: string; required?: boolean; placeholder?: string }
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {opts?.required !== false && '*'}
      </label>
      <input
        id={name}
        type={opts?.type || 'text'}
        value={(formData[name] as string | number) ?? ''}
        onChange={(e) =>
          updateFormData({
            [name]:
              opts?.type === 'number'
                ? parseFloat(e.target.value) || 0
                : e.target.value,
          })
        }
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder={opts?.placeholder}
      />
    </div>
  )

  return (
    <div className="space-y-4">
      {field('Legal Business Name', 'legal_business_name')}
      {field('DBA (Doing Business As)', 'dba_name', { required: false })}
      {field('Business Address', 'business_address')}

      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-3">
          {field('City', 'business_city')}
        </div>
        <div className="col-span-1">
          <label htmlFor="business_state" className="block text-sm font-medium text-gray-700">
            State *
          </label>
          <select
            id="business_state"
            value={formData.business_state}
            onChange={(e) => updateFormData({ business_state: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">--</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          {field('Zip', 'business_zip', { placeholder: '12345' })}
        </div>
      </div>

      {field('Business Phone', 'business_phone', { type: 'tel', placeholder: '(555) 123-4567' })}
      {field('Tax ID (EIN)', 'tax_id', { placeholder: '12-3456789' })}
      {field('Date Established', 'date_established', { type: 'date' })}

      <div>
        <label htmlFor="legal_entity" className="block text-sm font-medium text-gray-700">
          Legal Entity Type *
        </label>
        <select
          id="legal_entity"
          value={formData.legal_entity}
          onChange={(e) => updateFormData({ legal_entity: e.target.value as LegalEntity })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {Object.entries(LEGAL_ENTITIES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="state_of_incorporation" className="block text-sm font-medium text-gray-700">
          State of Incorporation
        </label>
        <select
          id="state_of_incorporation"
          value={formData.state_of_incorporation}
          onChange={(e) => updateFormData({ state_of_incorporation: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">--</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {field('Industry', 'industry')}
      {field('Annual Revenue', 'annual_revenue', { type: 'number' })}

      <div>
        <label htmlFor="location_type" className="block text-sm font-medium text-gray-700">
          Location Type
        </label>
        <select
          id="location_type"
          value={formData.location_type}
          onChange={(e) => updateFormData({ location_type: e.target.value as LocationType })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {Object.entries(LOCATION_TYPES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {formData.location_type === 'rent' && (
        <>
          {field('Monthly Rent', 'monthly_rent_mortgage', { type: 'number' })}
          {field('Landlord Name', 'landlord_name', { required: false })}
          {field('Landlord Phone', 'landlord_phone', { required: false, type: 'tel' })}
        </>
      )}
      {formData.location_type === 'own' && (
        field('Monthly Mortgage', 'monthly_rent_mortgage', { type: 'number' })
      )}
    </div>
  )
}
