import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadDropzone } from './UploadDropzone'
import { DocumentCard } from './DocumentCard'
import { useDocumentStore } from '@/stores/documentStore'
import { fetchDocuments, uploadFile, uploadUrl, deleteDocument, getDocumentStatus } from '@/api/documents'
import { FileText } from 'lucide-react'

export function DocumentPanel() {
  const { documents, setDocuments, addDocument, updateDocument, removeDocument } = useDocumentStore()
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    try {
      const docs = await fetchDocuments()
      setDocuments(docs)
    } catch { /* silent */ }
  }, [setDocuments])

  useEffect(() => { load() }, [load])

  // Poll processing docs — stop on 404 (backend restart wiped registry) or after 2 min
  useEffect(() => {
    const processing = documents.filter((d) => d.status === 'processing')
    if (!processing.length) return
    const startTimes: Record<string, number> = {}
    processing.forEach((d) => { startTimes[d.doc_id] = Date.now() })
    const timer = setInterval(async () => {
      for (const doc of processing) {
        const elapsed = Date.now() - (startTimes[doc.doc_id] || 0)
        if (elapsed > 120_000) {
          updateDocument(doc.doc_id, { status: 'failed', chunk_count: 0 })
          continue
        }
        try {
          const status = await getDocumentStatus(doc.doc_id) as { status: string; chunk_count: number }
          if (status.status !== 'processing') {
            updateDocument(doc.doc_id, { status: status.status as 'ready' | 'failed', chunk_count: status.chunk_count })
          }
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e)
          if (msg.includes('404') || msg.includes('Not Found')) {
            updateDocument(doc.doc_id, { status: 'failed', chunk_count: 0 })
          }
        }
      }
    }, 3000)
    return () => clearInterval(timer)
  }, [documents, updateDocument])

  const handleUploadFile = async (file: File) => {
    setUploading(true)
    try {
      const res = await uploadFile(file)
      addDocument({
        doc_id: res.doc_id,
        title: res.title || file.name,
        source: file.name,
        file_type: file.name.endsWith('.pdf') ? 'pdf' : 'txt',
        status: 'processing',
        chunk_count: 0,
        ingested_at: new Date().toISOString(),
        size_bytes: file.size,
      })
    } catch (e) {
      console.error('Upload failed:', e)
    } finally {
      setUploading(false)
    }
  }

  const handleUploadUrl = async (url: string) => {
    setUploading(true)
    try {
      const res = await uploadUrl(url)
      addDocument({
        doc_id: res.doc_id,
        title: res.title || url,
        source: url,
        file_type: 'url',
        status: 'processing',
        chunk_count: 0,
        ingested_at: new Date().toISOString(),
        size_bytes: 0,
      })
    } catch (e) {
      console.error('URL upload failed:', e)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string) => {
    try {
      await deleteDocument(docId)
      removeDocument(docId)
    } catch { /* silent */ }
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col p-4 gap-4" style={{ minHeight: 'calc(100vh - 52px)', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      <UploadDropzone onUploadFile={handleUploadFile} onUploadUrl={handleUploadUrl} uploading={uploading} />

      <div className="flex-1 space-y-2">
        {documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div
              className="w-14 h-14 rounded-none flex items-center justify-center mb-4"
              style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)' }}
            >
              <FileText size={22} style={{ color: '#14b8a6', opacity: 0.6 }} />
            </div>
            <p className="text-sm font-medium text-slate-400">No documents yet</p>
            <p className="text-xs text-slate-600 mt-1 max-w-[180px] leading-relaxed">
              Upload PDFs, text files, or ingest web pages
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {documents.map((doc) => (
              <DocumentCard key={doc.doc_id} doc={doc} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {documents.length > 0 && (
        <div className="text-[11px] text-slate-600 text-center font-medium">
          <span className="text-emerald-400">{documents.length}</span> doc{documents.length !== 1 ? 's' : ''}
          {' · '}
          <span className="text-emerald-400">{documents.filter((d) => d.status === 'ready').length}</span> ready
        </div>
      )}
    </div>
  )
}
