'use client'

import { US_STATES } from '@/lib/constants'
import type { StepProps } from '@/types/forms'
import type { OwnerFormData } from '@/types/forms'

export function StepOwnerInfo({ formData, updateFormData }: StepProps) {
  const updateOwner = (index: number, updates: Partial<OwnerFormData>) => {
    const owners = [...formData.owners]
    owners[index] = { ...owners[index], ...updates }
    updateFormData({ owners })
  }

  const addOwner = () => {
    if (formData.owners.length < 2) {
      updateFormData({
        owners: [
          ...formData.owners,
          {
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
          },
        ],
      })
    }
  }

  const removeOwner = (index: number) => {
    if (formData.owners.length > 1) {
      updateFormData({ owners: formData.owners.filter((_, i) => i !== index) })
    }
  }

  const renderOwnerForm = (owner: OwnerFormData, index: number) => (
    <div key={index} className="space-y-4 border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Owner {index + 1}</h4>
        {index > 0 && (
          <button
            type="button"
            onClick={() => removeOwner(index)}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name *</label>
          <input
            type="text"
            value={owner.first_name}
            onChange={(e) => updateOwner(index, { first_name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name *</label>
          <input
            type="text"
            value={owner.last_name}
            onChange={(e) => updateOwner(index, { last_name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Home Address *</label>
        <input
          type="text"
          value={owner.home_address}
          onChange={(e) => updateOwner(index, { home_address: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">City *</label>
          <input
            type="text"
            value={owner.city}
            onChange={(e) => updateOwner(index, { city: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">State *</label>
          <select
            value={owner.state}
            onChange={(e) => updateOwner(index, { state: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">--</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Zip *</label>
          <input
            type="text"
            value={owner.zip}
            onChange={(e) => updateOwner(index, { zip: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Home Phone</label>
          <input
            type="tel"
            value={owner.home_phone}
            onChange={(e) => updateOwner(index, { home_phone: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cell Phone *</label>
          <input
            type="tel"
            value={owner.cell_phone}
            onChange={(e) => updateOwner(index, { cell_phone: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email *</label>
        <input
          type="email"
          value={owner.email}
          onChange={(e) => updateOwner(index, { email: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">SSN *</label>
          <input
            type="password"
            value={owner.ssn}
            onChange={(e) => updateOwner(index, { ssn: e.target.value })}
            placeholder="XXX-XX-XXXX"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
          <input
            type="date"
            value={owner.date_of_birth}
            onChange={(e) => updateOwner(index, { date_of_birth: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ownership % *</label>
          <input
            type="number"
            value={owner.ownership_percentage || ''}
            onChange={(e) =>
              updateOwner(index, { ownership_percentage: parseFloat(e.target.value) || 0 })
            }
            min="1"
            max="100"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Estimated FICO Score *</label>
          <input
            type="number"
            value={owner.estimated_fico || ''}
            onChange={(e) =>
              updateOwner(index, { estimated_fico: parseInt(e.target.value) || 0 })
            }
            min="300"
            max="850"
            placeholder="300-850"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Income</label>
          <input
            type="number"
            value={owner.annual_income || ''}
            onChange={(e) =>
              updateOwner(index, { annual_income: parseFloat(e.target.value) || 0 })
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Position/Title</label>
          <input
            type="text"
            value={owner.position_title}
            onChange={(e) => updateOwner(index, { position_title: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {formData.owners.map((owner, i) => renderOwnerForm(owner, i))}

      {formData.owners.length < 2 && (
        <button
          type="button"
          onClick={addOwner}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Second Owner
        </button>
      )}
    </div>
  )
}
