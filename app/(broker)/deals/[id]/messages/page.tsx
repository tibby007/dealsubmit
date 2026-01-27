'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  sender_id: string | null
  message: string
  created_at: string
  profiles?: { full_name: string; role: string } | null
}

export default function MessagesPage() {
  const { id } = useParams<{ id: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadUser()
    loadMessages()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) setUserId(user.id)
  }

  async function loadMessages() {
    const { data } = await supabase
      .from('deal_messages')
      .select('id, sender_id, message, created_at')
      .eq('deal_id', id)
      .order('created_at', { ascending: true })

    if (data) {
      // Load sender names
      const senderIds = [...new Set(data.map((m) => m.sender_id).filter(Boolean))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('id', senderIds as string[])

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])
      setMessages(
        data.map((m) => ({
          ...m,
          profiles: m.sender_id ? profileMap.get(m.sender_id) || null : null,
        }))
      )
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    setSending(true)
    const { error } = await supabase.from('deal_messages').insert({
      deal_id: id,
      sender_id: userId,
      message: newMessage.trim(),
    })

    if (!error) {
      fetch('/api/email/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'new_message', dealId: id, message: newMessage.trim() }),
      })
      setNewMessage('')
      loadMessages()
    }
    setSending(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/deals/${id}`} className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to Deal
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">Messages</h2>
      </div>

      <div className="bg-white shadow rounded-lg flex flex-col" style={{ height: '500px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 py-8">No messages yet. Start the conversation.</p>
          )}
          {messages.map((msg) => {
            const isOwn = msg.sender_id === userId
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className={`text-xs font-medium mb-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                    {msg.profiles?.full_name || 'Unknown'}
                    {msg.profiles?.role === 'admin' && ' (Admin)'}
                  </p>
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-gray-200 p-4 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
