import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BrokerSidebar from '@/components/layout/broker-sidebar'
import Header from '@/components/layout/header'
import PendingApproval from '@/components/pending-approval'

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
    return <PendingApproval />
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
