'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface NavItem {
  name: string
  href: string
  requiresComplete?: boolean
}

const baseNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard' },
]

const dealNavigation: NavItem[] = [
  { name: 'My Deals', href: '/deals', requiresComplete: true },
  { name: 'Submit New Deal', href: '/deals/new', requiresComplete: true },
]

const guidelinesNavigation: NavItem[] = [
  { name: 'Underwriting Guidelines', href: '/partner/guidelines/underwriting' },
  { name: 'Submission Guidelines', href: '/partner/guidelines/submission' },
]

const accountNavigation: NavItem[] = [
  { name: 'My Agreement', href: '/partner/my-agreement', requiresComplete: true },
  { name: 'My Documents', href: '/partner/documents', requiresComplete: true },
  { name: 'Bank Info', href: '/partner/bank-info', requiresComplete: true },
  { name: 'Profile', href: '/profile' },
]

export default function BrokerSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const isOnboardingComplete = profile.onboarding_status === 'complete'
  const isPendingApproval = profile.onboarding_status === 'pending_approval'

  const filterByStatus = (items: NavItem[]) => {
    return items.filter(item => {
      if (item.requiresComplete && !isOnboardingComplete) {
        return false
      }
      return true
    })
  }

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
      return (
        <li key={item.name}>
          <Link
            href={item.href}
            className={cn(
              isActive
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:text-white hover:bg-blue-700',
              'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
            )}
          >
            {item.name}
          </Link>
        </li>
      )
    })
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-blue-600 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-white text-xl font-bold">DealSubmit Pro</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {/* Main Navigation */}
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {renderNavItems(baseNavigation)}
                {renderNavItems(filterByStatus(dealNavigation))}
              </ul>
            </li>

            {/* Guidelines - visible after approval */}
            {!isPendingApproval && (
              <li>
                <div className="text-xs font-semibold leading-6 text-blue-200 uppercase tracking-wider">
                  Guidelines
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {renderNavItems(guidelinesNavigation)}
                </ul>
              </li>
            )}

            {/* Account - visible after approval */}
            {!isPendingApproval && (
              <li>
                <div className="text-xs font-semibold leading-6 text-blue-200 uppercase tracking-wider">
                  My Account
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {renderNavItems(filterByStatus(accountNavigation))}
                </ul>
              </li>
            )}

            {/* User Info */}
            <li className="mt-auto">
              <div className="text-xs text-blue-100 border-t border-blue-500 pt-4">
                <p className="font-semibold">{profile.full_name}</p>
                {profile.company_name && (
                  <p className="text-blue-200">{profile.company_name}</p>
                )}
                {!isOnboardingComplete && (
                  <p className="text-orange-300 text-xs mt-1">Onboarding in progress</p>
                )}
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
