'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DOCUMENT_TYPES, type DocumentType } from '@/lib/constants'

interface Doc {
  id: string
  document_type: string
  file_name: string
  file_size: number
  created_at: string
}

export default function DocumentsPage() {
  const { id } = useParams<{ id: string }>()
  const [documents, setDocuments] = useState<Doc[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('bank_statement')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    const { data } = await supabase
      .from('documents')
      .select('id, document_type, file_name, file_size, created_at')
      .eq('deal_id', id)
      .order('created_at', { ascending: false })

    if (data) setDocuments(data)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    for (const file of files) {
      const filePath = `${id}/${selectedType}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(filePath, file)

      if (uploadError) {
        alert(`Failed to upload ${file.name}: ${uploadError.message}`)
        continue
      }

      await supabase.from('documents').insert({
        deal_id: id,
        document_type: selectedType as any,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      })
    }

    // Notify admin about uploaded documents
    try {
      await fetch('/api/email/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'document_uploaded',
          dealId: id,
          documentTypes: [selectedType],
        }),
      })
    } catch (notifyError) {
      console.error('Failed to send upload notification:', notifyError)
    }

    e.target.value = ''
    setUploading(false)
    loadDocuments()
  }

  async function handleDownload(doc: Doc) {
    const { data } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', doc.id)
      .single()

    if (!data) return

    const { data: signedUrl } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(data.file_path, 60)

    if (signedUrl?.signedUrl) {
      window.open(signedUrl.signedUrl, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/deals/${id}`} className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to Deal
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">Documents</h2>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Document Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {documents.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {DOCUMENT_TYPES[doc.document_type as DocumentType] || doc.document_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{doc.file_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(doc.file_size / 1024 / 1024).toFixed(1)} MB
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500">No documents uploaded yet</div>
        )}
      </div>
    </div>
  )
}
