import Link from 'next/link'
import { ONBOARDING_STATUSES } from '@/lib/constants'

type OnboardingStatus = keyof typeof ONBOARDING_STATUSES

interface OnboardingChecklistProps {
  status: OnboardingStatus
  contactName: string
}

export default function OnboardingChecklist({ status, contactName }: OnboardingChecklistProps) {
  const steps = [
    {
      id: 'application',
      name: 'Application Approved',
      description: 'Your partner application has been reviewed',
      completed: status !== 'pending_approval',
      active: status === 'pending_approval',
      href: null,
    },
    {
      id: 'agreement',
      name: 'Sign Partner Agreement',
      description: 'Review and sign the partner agreement',
      completed: status === 'w9_pending' || status === 'complete',
      active: status === 'agreement_pending',
      href: '/partner/agreement',
    },
    {
      id: 'w9',
      name: 'Upload W9',
      description: 'Upload your W9 for tax purposes',
      completed: status === 'complete',
      active: status === 'w9_pending',
      href: '/partner/documents/w9',
    },
    {
      id: 'access',
      name: 'Access Deal Submission',
      description: 'Start submitting deals',
      completed: status === 'complete',
      active: false,
      href: status === 'complete' ? '/deals/new' : null,
    },
  ]

  if (status === 'pending_approval') {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Under Review</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Your application is being reviewed by our team. We&apos;ll notify you within 24-48 hours once it&apos;s been approved.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Welcome, {contactName}!</h2>
        <p className="mt-1 text-sm text-gray-600">
          Complete the steps below to start submitting deals.
        </p>
      </div>

      <nav className="px-6 py-4">
        <ol className="space-y-4">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="relative">
              {stepIdx !== steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 -ml-px h-full w-0.5 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start group">
                <span className="flex h-8 items-center">
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                      step.completed
                        ? 'bg-green-500'
                        : step.active
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    {step.completed ? (
                      <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : step.active ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                    )}
                  </span>
                </span>
                <div className="ml-4 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={`text-sm font-medium ${
                          step.completed
                            ? 'text-green-600'
                            : step.active
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </span>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                    {step.active && step.href && (
                      <Link
                        href={step.href}
                        className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Continue
                        <svg className="ml-2 -mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {status === 'complete' && (
        <div className="px-6 py-4 bg-green-50 border-t border-green-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Onboarding complete! You now have full access to Deal Submit Pro.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <Link
                href="/deals/new"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
              >
                Submit a Deal
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
