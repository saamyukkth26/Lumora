import { motion, AnimatePresence } from 'framer-motion'
import { AGENT_STEP_LABELS } from '@/lib/constants'
import { Zap, Globe, BookOpen, Brain, Search, Cpu, CheckCircle } from 'lucide-react'

interface Props {
  step: string | null
}

const STEP_META: Record<string, { icon: typeof Zap; color: string }> = {
  route_query:      { icon: Cpu,         color: '#10b981' },
  retrieve_local:   { icon: BookOpen,    color: '#14b8a6' },
  search_web:       { icon: Globe,       color: '#06b6d4' },
  search_arxiv:     { icon: Search,      color: '#f59e0b' },
  search_wikipedia: { icon: BookOpen,    color: '#10b981' },
  synthesize:       { icon: Brain,       color: '#10b981' },
  critique:         { icon: Zap,         color: '#ec4899' },
  refine_query:     { icon: Cpu,         color: '#f59e0b' },
  format_output:    { icon: CheckCircle, color: '#10b981' },
}

export function AgentStatusBar({ step }: Props) {
  const meta = step ? (STEP_META[step] || STEP_META.route_query) : null
  const label = step ? (AGENT_STEP_LABELS[step] || step) : ''

  return (
    <AnimatePresence>
      {step && meta && (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="mx-4 mb-2 overflow-hidden"
        >
          <div
            className="relative flex items-center gap-3 px-4 py-2.5 rounded-none overflow-hidden"
            style={{
              background: `${meta.color}0d`,
              border: `1px solid ${meta.color}25`,
              boxShadow: `0 0 20px ${meta.color}10, inset 0 1px 0 ${meta.color}15`,
            }}
          >
            {/* Spinning icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="flex-shrink-0"
            >
              <meta.icon size={13} style={{ color: meta.color }} />
            </motion.div>

            {/* Step label */}
            <motion.span
              key={label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-semibold flex-1"
              style={{ color: meta.color }}
            >
              {label}...
            </motion.span>

            {/* Bouncing dots */}
            <div className="flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-none"
                  style={{ background: meta.color }}
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.2, 0.7], y: [0, -2, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </div>

            {/* Bottom shimmer progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden"
              style={{ background: `${meta.color}15` }}>
              <motion.div
                className="h-full"
                style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)`, width: '40%' }}
                animate={{ x: ['-100%', '350%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
