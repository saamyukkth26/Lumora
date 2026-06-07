import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  onChange: (v: number) => void
}

const DEPTH_CONFIG = [
  { level: 1, label: 'Quick', desc: 'Fast, 1 source' },
  { level: 2, label: 'Deep', desc: 'Balanced, 2-3 sources' },
  { level: 3, label: 'Max', desc: 'Thorough, all sources' },
]

export function DepthSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {DEPTH_CONFIG.map(({ level, label, desc }) => (
        <motion.button
          key={level}
          onClick={() => onChange(level)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'flex-1 p-3 rounded-none border text-left transition-all relative overflow-hidden',
            value === level
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-surface-2 border-white/8 text-muted hover:border-white/15'
          )}
        >
          {value === level && (
            <motion.div
              layoutId="depth-active"
              className="absolute inset-0 bg-primary/5 rounded-none"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <div className="relative">
            {/* Animated rings showing depth */}
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-none',
                    i < level ? (value === level ? 'bg-primary' : 'bg-muted/40') : 'bg-surface-3'
                  )}
                  animate={value === level && i < level ? { opacity: [0.7, 1, 0.7] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <p className="text-xs font-semibold">{label}</p>
            <p className="text-xs opacity-60 mt-0.5">{desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  )
}
