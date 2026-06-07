import { create } from 'zustand'
import type { Document } from '@/types'

interface DocumentStore {
  documents: Document[]
  uploadProgress: Record<string, number>
  setDocuments: (docs: Document[]) => void
  addDocument: (doc: Document) => void
  updateDocument: (doc_id: string, update: Partial<Document>) => void
  removeDocument: (doc_id: string) => void
  setUploadProgress: (key: string, progress: number) => void
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  uploadProgress: {},
  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
  updateDocument: (doc_id, update) =>
    set((s) => ({
      documents: s.documents.map((d) => (d.doc_id === doc_id ? { ...d, ...update } : d)),
    })),
  removeDocument: (doc_id) =>
    set((s) => ({ documents: s.documents.filter((d) => d.doc_id !== doc_id) })),
  setUploadProgress: (key, progress) =>
    set((s) => ({ uploadProgress: { ...s.uploadProgress, [key]: progress } })),
}))
