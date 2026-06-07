import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Globe, File, Trash2, CheckCircle, Clock, AlertCircle, Hash } from 'lucide-react'
import type { Document } from '@/types'

interface Props {
  doc: Document
  onDelete: (id: string) => void
}

const STATUS_CONFIG = {
  ready:      { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  label: 'Ready'      },
  processing: { icon: Clock,       color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  label: 'Processing' },
  failed:     { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   label: 'Failed'     },
}

const FILE_META: Record<string, { icon: typeof File; color: string }> = {
  pdf: { icon: FileText, color: '#ef4444' },
  url: { icon: Globe,    color: '#06b6d4' },
  txt: { icon: File,     color: '#94a3b8' },
  md:  { icon: File,     color: '#14b8a6' },
}

export function DocumentCard({ doc, onDelete }: Props) {
  const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.processing
  const StatusIcon = status.icon
  const fileMeta = FILE_META[doc.file_type] || FILE_META.txt
  const FileIcon = fileMeta.icon

  const sizeLabel = doc.size_bytes
    ? doc.size_bytes > 1024 * 1024
      ? `${(doc.size_bytes / 1024 / 1024).toFixed(1)} MB`
      : `${(doc.size_bytes / 1024).toFixed(0)} KB`
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -2 }}
      className="group relative rounded-none p-4 flex gap-3 cursor-default overflow-hidden"
      style={{
        background: 'rgba(8,14,11,0.7)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.border = `1px solid ${fileMeta.color}25`
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 6px 30px rgba(0,0,0,0.4), 0 0 20px ${fileMeta.color}08`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.06)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)'
      }}
    >
      {/* Top shine */}
      <div
        className="absolute top-0 left-4 right-12 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${fileMeta.color}40, transparent)` }}
      />

      {/* File icon */}
      <div
        className="w-10 h-10 rounded-none flex items-center justify-center flex-shrink-0"
        style={{
          background: `${fileMeta.color}12`,
          border: `1px solid ${fileMeta.color}25`,
          boxShadow: `0 0 12px ${fileMeta.color}10`,
        }}
      >
        <FileIcon size={17} style={{ color: fileMeta.color }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 truncate">{doc.title}</p>
        <p className="text-xs text-slate-500 truncate mt-0.5">{doc.source}</p>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {/* Status badge */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-none text-xs font-medium"
            style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color }}
          >
            {doc.status === 'processing' ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                <StatusIcon size={9} />
              </motion.div>
            ) : (
              <StatusIcon size={9} />
            )}
            <span>{status.label}</span>
          </div>

          {/* Chunk count */}
          {doc.chunk_count > 0 && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-none text-xs"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', color: '#6ee7b7' }}
            >
              <Hash size={9} />
              <span>{doc.chunk_count}</span>
            </div>
          )}

          {/* Size */}
          {sizeLabel && (
            <span className="text-[10px] text-slate-600">{sizeLabel}</span>
          )}
        </div>
      </div>

      {/* Delete */}
      <motion.button
        onClick={() => onDelete(doc.doc_id)}
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="opacity-0 group-hover:opacity-100 self-start p-1.5 rounded-none transition-all duration-200"
        style={{ color: '#64748b' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)'
          ;(e.currentTarget as HTMLElement).style.color = '#ef4444'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = '#64748b'
        }}
      >
        <Trash2 size={13} />
      </motion.button>
    </motion.div>
  )
}
