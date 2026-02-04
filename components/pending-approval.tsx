'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PendingApproval() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
        <p className="text-gray-600 mb-4">
          Your broker account is currently pending approval from an administrator.
          You will receive an email notification once your account has been approved.
        </p>
        <button
          onClick={handleSignOut}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
