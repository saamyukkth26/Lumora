import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { TimelineEntry } from './TimelineEntry'
import { apiFetch } from '@/api/client'
import type { TimelineEvent } from '@/types'

export function TimelineView() {
  const [events, setEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    apiFetch<{ events: TimelineEvent[] }>('/timeline')
      .then((res) => setEvents(res.events))
      .catch(() => setEvents([]))
  }, [])

  return (
    <div className="h-full overflow-y-auto p-6" style={{ minHeight: 'calc(100vh - 52px)', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Clock size={16} className="text-muted" />
          <h2 className="text-sm font-semibold text-foreground">Activity Timeline</h2>
          <span className="text-xs text-muted">({events.length} events)</span>
        </div>

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Clock size={32} className="text-muted/30 mx-auto mb-3" />
            <p className="text-muted text-sm">No activity yet</p>
            <p className="text-muted/60 text-xs mt-1">Upload documents or start a chat to see events here</p>
          </motion.div>
        ) : (
          <div>
            {events.map((event, i) => (
              <TimelineEntry key={event.event_id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
