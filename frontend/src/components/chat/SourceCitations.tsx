import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, BookOpen } from 'lucide-react'
import type { Source } from '@/types'
import { useState } from 'react'

interface Props {
  sources: Source[]
}

function SourceCard({ source, index }: { source: Source; index: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="relative">
      <motion.a
        href={source.url || '#'}
        target={source.url ? '_blank' : undefined}
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ y: -2, scale: 1.02 }}
        className="flex items-start gap-2.5 p-3 rounded-none bg-surface-2 border border-white/6 hover:border-primary/30 transition-colors cursor-pointer group"
      >
        <div className="w-5 h-5 rounded-none bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold mt-0.5">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground/80 truncate group-hover:text-foreground transition-colors">
            {source.title || 'Source'}
          </p>
          {source.snippet && (
            <p className="text-xs text-muted mt-0.5 line-clamp-2">{source.snippet}</p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-none bg-success/60" />
            <span className="text-xs text-muted">{Math.round(source.relevance_score * 100)}% match</span>
          </div>
        </div>
        {source.url && <ExternalLink size={11} className="text-muted group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />}
      </motion.a>
    </div>
  )
}

export function SourceCitations({ sources }: Props) {
  if (!sources?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <BookOpen size={12} className="text-muted" />
        <span className="text-xs text-muted font-medium">{sources.length} source{sources.length > 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {sources.slice(0, 4).map((s, i) => (
          <SourceCard key={s.source_id || i} source={s} index={i} />
        ))}
      </div>
    </motion.div>
  )
}
