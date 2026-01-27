'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'My Deals', href: '/deals' },
  { name: 'Submit New Deal', href: '/deals/new' },
  { name: 'Profile', href: '/profile' },
]

export default function BrokerSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-blue-600 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-white text-xl font-bold">DealSubmit Pro</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
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
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <div className="text-xs text-blue-100 border-t border-blue-500 pt-4">
                <p className="font-semibold">{profile.full_name}</p>
                {profile.company_name && (
                  <p className="text-blue-200">{profile.company_name}</p>
                )}
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
