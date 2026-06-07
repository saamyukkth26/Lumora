import { motion } from 'framer-motion'
import { FileText, Search, MessageSquare } from 'lucide-react'
import type { TimelineEvent } from '@/types'

interface Props {
  event: TimelineEvent
  index: number
}

const EVENT_CONFIG = {
  document_ingested: { icon: FileText, color: '#10b981', bg: 'bg-primary/10', label: 'Document Added' },
  research_completed: { icon: Search, color: '#10b981', bg: 'bg-success/10', label: 'Research Done' },
  chat_session: { icon: MessageSquare, color: '#06b6d4', bg: 'bg-accent/10', label: 'Chat Session' },
}

export function TimelineEntry({ event, index }: Props) {
  const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.document_ingested
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex gap-4 group"
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.2 }}
          className={`w-8 h-8 rounded-none ${config.bg} border border-white/8 flex items-center justify-center flex-shrink-0 mt-0.5`}
        >
          <Icon size={14} style={{ color: config.color }} />
        </motion.div>
        <div className="w-px flex-1 mt-2 bg-gradient-to-b from-white/8 to-transparent" />
      </div>

      {/* Content */}
      <motion.div
        whileHover={{ x: 2 }}
        className="flex-1 pb-6"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground/90">{event.title}</p>
            <p className="text-xs text-muted mt-0.5">{event.description}</p>
          </div>
          <span className="text-xs text-muted/60 flex-shrink-0 mt-0.5">
            {new Date(event.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
