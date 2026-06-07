import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Link, Loader2, CloudUpload } from 'lucide-react'
import { useState, useCallback, useRef } from 'react'

interface Props {
  onUploadFile: (file: File) => Promise<void>
  onUploadUrl: (url: string) => Promise<void>
  uploading: boolean
}

export function UploadDropzone({ onUploadFile, onUploadUrl, uploading }: Props) {
  const [dragging, setDragging] = useState(false)
  const [urlMode, setUrlMode] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onUploadFile(file)
  }, [onUploadFile])

  const handleUrlSubmit = async () => {
    if (!urlValue.trim()) return
    await onUploadUrl(urlValue.trim())
    setUrlValue('')
    setUrlMode(false)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        animate={{ scale: dragging ? 1.02 : 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="relative rounded-none p-7 text-center cursor-pointer overflow-hidden"
        style={{
          background: dragging
            ? 'rgba(16,185,129,0.08)'
            : 'rgba(255,255,255,0.02)',
          border: dragging
            ? '2px dashed rgba(16,185,129,0.5)'
            : '2px dashed rgba(255,255,255,0.07)',
          boxShadow: dragging
            ? '0 0 40px rgba(16,185,129,0.12), inset 0 0 40px rgba(16,185,129,0.04)'
            : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.docx,.doc"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onUploadFile(e.target.files[0])}
        />

        {/* Background gradient when dragging */}
        {dragging && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.08), transparent 70%)',
            }}
          />
        )}

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-none flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <Loader2 size={24} className="animate-spin" style={{ color: '#10b981' }} />
                </div>
                {/* Pulsing ring */}
                <motion.div
                  className="absolute inset-0 rounded-none"
                  animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.3)', '0 0 0 12px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0)'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300">Processing document</p>
                <p className="text-xs text-slate-500 mt-0.5">Chunking, embedding, indexing...</p>
              </div>
              {/* Animated progress bar */}
              <div className="w-40 h-1 rounded-none overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-none"
                  style={{ background: 'linear-gradient(90deg, #10b981, #14b8a6)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                className="w-14 h-14 rounded-none flex items-center justify-center"
                animate={dragging
                  ? { scale: 1.15, rotate: 8, y: -4 }
                  : { scale: 1, rotate: 0, y: 0 }
                }
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  background: dragging ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
                  border: dragging ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: dragging ? '0 0 20px rgba(16,185,129,0.3)' : 'none',
                }}
              >
                {dragging
                  ? <CloudUpload size={24} style={{ color: '#10b981' }} />
                  : <Upload size={20} className="text-slate-500" />
                }
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-slate-300">
                  {dragging ? 'Drop to upload' : 'Drop files here or click'}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">PDF, DOCX, TXT, Markdown · up to 50MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* URL toggle */}
      <motion.button
        onClick={() => setUrlMode(!urlMode)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-none text-xs font-medium transition-all"
        style={
          urlMode
            ? { background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', color: '#22d3ee' }
            : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#64748b' }
        }
      >
        <Link size={13} />
        <span>Ingest a URL</span>
        <motion.span
          animate={{ rotate: urlMode ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto text-base leading-none"
        >
          ⌄
        </motion.span>
      </motion.button>

      {/* URL input */}
      <AnimatePresence>
        {urlMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                placeholder="https://example.com/article"
                autoFocus
                className="flex-1 rounded-none px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-all"
                style={{
                  background: 'rgba(8,14,11,0.8)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(6,182,212,0.4)'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <motion.button
                onClick={handleUrlSubmit}
                disabled={!urlValue.trim() || uploading}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-none text-sm font-semibold disabled:opacity-40 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                  color: '#fff',
                  boxShadow: '0 0 16px rgba(6,182,212,0.25)',
                }}
              >
                Add
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
