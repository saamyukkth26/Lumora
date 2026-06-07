import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Zap, Wifi, WifiOff } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useChatStore } from '@/stores/chatStore'

const VIEW_META: Record<string, { label: string; emoji: string; color: string }> = {
  chat:      { label: 'Ask Lumora',       emoji: '💬', color: '#10b981' },
  graph:     { label: 'Knowledge Graph', emoji: '🕸️',  color: '#06b6d4' },
  documents: { label: 'Documents',       emoji: '📄', color: '#14b8a6' },
  research:  { label: 'Deep Research',   emoji: '🔬', color: '#f59e0b' },
  timeline:  { label: 'Timeline',        emoji: '⏱️', color: '#10b981' },
  settings:  { label: 'Settings',        emoji: '⚙️', color: '#94a3b8' },
}

export function TopBar() {
  const { selectedModel, anthropicKey, openaiKey } = useSettingsStore()
  const { activeView, currentAgentStep } = useChatStore()
  const hasKey = !!(anthropicKey || openaiKey)
  const meta = VIEW_META[activeView] || VIEW_META.chat

  return (
    <div
      className="h-13 flex items-center justify-between px-4 flex-shrink-0 relative"
      style={{
        background: 'rgba(8,12,10,0.7)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        height: 52,
      }}
    >
      {/* Bottom neon line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${meta.color}50 40%, ${meta.color}30 60%, transparent 100%)`,
          boxShadow: `0 0 8px ${meta.color}30`,
        }}
      />

      {/* Left: view title */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2.5"
        >
          <span className="text-base leading-none">{meta.emoji}</span>
          <h1 className="text-sm font-semibold text-white tracking-tight">{meta.label}</h1>
        </motion.div>
      </AnimatePresence>

      {/* Right: badges */}
      <div className="flex items-center gap-2">
        {/* Model badge */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-medium"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: '#6ee7b7',
          }}
        >
          <Cpu size={10} />
          <span>{selectedModel.includes('gpt') ? 'GPT-4o Mini' : selectedModel.split('-').slice(0,3).join('-')}</span>
        </motion.div>

        {/* Connection status */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-medium"
          style={{
            background: hasKey ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
            border: hasKey ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(245,158,11,0.25)',
            color: hasKey ? '#34d399' : '#fbbf24',
          }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-none"
            style={{ background: hasKey ? '#10b981' : '#f59e0b' }}
            animate={{ opacity: [1, 0.4, 1], scale: [1, 0.8, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {hasKey ? <Wifi size={10} /> : <WifiOff size={10} />}
          <span>{hasKey ? 'Live' : 'No Key'}</span>
        </motion.div>

        {/* Lumora brand */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(20,184,166,0.15))',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#6ee7b7',
            boxShadow: '0 0 12px rgba(16,185,129,0.15)',
          }}
        >
          <Zap size={10} className="text-teal-400" />
          <span className="gradient-text">Lumora</span>
        </motion.div>
      </div>
    </div>
  )
}
