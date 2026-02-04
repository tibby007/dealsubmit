'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

const navigation = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'All Deals', href: '/admin/deals' },
  { name: 'Brokers', href: '/admin/brokers' },
  { name: 'Partner Applications', href: '/admin/partner-applications' },
  { name: 'Partners', href: '/admin/partners' },
]

export default function AdminSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-white text-xl font-bold">DealSubmit Pro</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800',
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
              <div className="text-xs text-gray-400 border-t border-gray-700 pt-4">
                <p className="font-semibold text-white">{profile.full_name}</p>
                <p className="text-green-400">Admin</p>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
