import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BrokerSidebar from '@/components/layout/broker-sidebar'
import Header from '@/components/layout/header'

export default async function BrokerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Check if broker is approved
  if (profile.role === 'broker' && !profile.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
          <p className="text-gray-600 mb-4">
            Your broker account is currently pending approval from an administrator.
            You will receive an email notification once your account has been approved.
          </p>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Redirect admin to admin panel
  if (profile.role === 'admin') {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BrokerSidebar profile={profile} />
      <div className="lg:pl-64">
        <Header profile={profile} />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
