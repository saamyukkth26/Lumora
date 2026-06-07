import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Loader2, AlertCircle, Clock, ChevronDown } from 'lucide-react'
import type { ResearchJob } from '@/types'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface Props {
  job: ResearchJob
  onDelete: (id: string) => void
}

export function ResearchJobCard({ job }: Props) {
  const [expanded, setExpanded] = useState(false)

  const statusIcon = {
    pending: <Clock size={13} className="text-muted" />,
    running: <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader2 size={13} className="text-primary" /></motion.div>,
    completed: <CheckCircle size={13} className="text-success" />,
    failed: <AlertCircle size={13} className="text-destructive" />,
  }[job.status]

  return (
    <motion.div layout className="glass-card rounded-none overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-white/2 transition-colors"
        onClick={() => job.status === 'completed' && setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{statusIcon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground/90 line-clamp-2">{job.query}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-muted">Depth {job.depth}</span>
              {job.status === 'running' && job.current_step && (
                <span className="text-xs text-primary animate-pulse">{job.current_step}</span>
              )}
              {job.status === 'completed' && job.result && (
                <span className="text-xs text-muted">{job.result.sources?.length || 0} sources</span>
              )}
            </div>
            {/* Progress bar */}
            {job.status === 'running' && (
              <div className="mt-2 h-1 bg-surface-3 rounded-none overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-primary rounded-none"
                  animate={{ width: `${job.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
          {job.status === 'completed' && (
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} className="text-muted flex-shrink-0 mt-0.5" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Expanded result */}
      <AnimatePresence>
        {expanded && job.result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-4 text-sm text-foreground/80 max-h-64 overflow-y-auto">
              <ReactMarkdown>{job.result.report}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
