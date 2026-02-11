import Link from 'next/link'
import { ONBOARDING_STATUSES } from '@/lib/constants'

type OnboardingStatus = keyof typeof ONBOARDING_STATUSES

interface OnboardingChecklistProps {
  status: OnboardingStatus
  contactName: string
}

const STATUS_ORDER: readonly OnboardingStatus[] = [
  'application_pending',
  'approved',
  'agreement_pending',
  'w9_pending',
  'pending_approval',
  'complete',
]

function isAtOrPast(current: OnboardingStatus, target: OnboardingStatus): boolean {
  return STATUS_ORDER.indexOf(current) >= STATUS_ORDER.indexOf(target)
}

export default function OnboardingChecklist({ status, contactName }: OnboardingChecklistProps) {
  const steps = [
    {
      id: 'application',
      name: 'Complete Application',
      description: 'Fill out your partner application',
      completed: isAtOrPast(status, 'agreement_pending'),
      active: status === 'application_pending',
      href: '/partner/apply',
    },
    {
      id: 'agreement',
      name: 'Sign Partner Agreement',
      description: 'Review and sign the partner agreement',
      completed: isAtOrPast(status, 'w9_pending'),
      active: status === 'agreement_pending',
      href: '/partner/agreement',
    },
    {
      id: 'w9',
      name: 'Upload W9',
      description: 'Upload your W9 for tax purposes',
      completed: isAtOrPast(status, 'pending_approval'),
      active: status === 'w9_pending',
      href: '/partner/documents/w9',
    },
    {
      id: 'approval',
      name: 'Final Review',
      description: 'Your application is being reviewed by our team',
      completed: status === 'complete',
      active: status === 'pending_approval',
      href: null,
    },
  ]

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

      {status === 'pending_approval' && (
        <div className="px-6 py-4 bg-orange-50 border-t border-orange-100">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="ml-3 text-sm font-medium text-orange-800">
              All steps complete! We&apos;re reviewing your application and will notify you once approved.
            </p>
          </div>
        </div>
      )}

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
