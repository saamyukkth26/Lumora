import { apiFetch, getApiBase, getHeaders } from './client'
import type { Document } from '@/types'

export async function fetchDocuments(): Promise<Document[]> {
  return apiFetch<Document[]>('/documents')
}

export async function uploadFile(file: File): Promise<{ doc_id: string; title: string; status: string }> {
  const base = getApiBase()
  const { 'Content-Type': _ct, ...headers } = getHeaders() as Record<string, string>
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${base}/documents/upload`, { method: 'POST', headers, body: formData })
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)
  return res.json()
}

export async function uploadUrl(url: string): Promise<{ doc_id: string; title: string; status: string }> {
  const base = getApiBase()
  const { 'Content-Type': _ct, ...headers } = getHeaders() as Record<string, string>
  const formData = new FormData()
  formData.append('url', url)
  const res = await fetch(`${base}/documents/upload`, { method: 'POST', headers, body: formData })
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)
  return res.json()
}

export async function deleteDocument(doc_id: string): Promise<void> {
  await apiFetch(`/documents/${doc_id}`, { method: 'DELETE' })
}

export async function getDocumentStatus(doc_id: string) {
  return apiFetch(`/documents/${doc_id}/status`)
}
