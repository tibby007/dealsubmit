'use client'

import type { StepProps } from '@/types/forms'

export function StepBrokerWriteup({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Provide context and insights that will help the underwriting team understand this deal better.
      </p>

      <div>
        <label htmlFor="broker_writeup" className="block text-sm font-medium text-gray-700">
          Broker Writeup
        </label>
        <textarea
          id="broker_writeup"
          value={formData.broker_writeup}
          onChange={(e) => updateFormData({ broker_writeup: e.target.value })}
          rows={10}
          placeholder={`Consider addressing:
• Why is the client seeking funding now?
• Story behind any credit issues?
• Anything not obvious from the application?
• Deal strengths
• Potential concerns
• Urgency level (urgent, standard, flexible)`}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
    </div>
  )
}
