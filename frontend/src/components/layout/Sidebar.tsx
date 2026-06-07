import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Network, FileText, Search, Clock, Settings, ChevronRight, Layers } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const NAV_ITEMS = [
  { id: 'chat',      icon: MessageSquare, label: 'Ask Lumora',     desc: 'AI conversation',      color: '#10b981' },
  { id: 'graph',     icon: Network,       label: 'Knowledge Graph', desc: 'Entity relationships', color: '#06b6d4' },
  { id: 'documents', icon: FileText,      label: 'Documents',      desc: 'Your knowledge base',  color: '#14b8a6' },
  { id: 'research',  icon: Search,        label: 'Research',       desc: 'Autonomous agents',    color: '#f59e0b' },
  { id: 'timeline',  icon: Clock,         label: 'Timeline',       desc: 'Activity history',     color: '#10b981' },
]

export function Sidebar() {
  const { activeView, setActiveView } = useChatStore()
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <motion.aside
      layout
      animate={{ width: expanded ? 224 : 64 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="relative flex flex-col h-full z-20 overflow-hidden flex-shrink-0"
      style={{
        background: 'rgba(8, 8, 16, 0.85)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Subtle left-edge glow line */}
      <div
        className="absolute right-0 top-0 bottom-0 w-px"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(16,185,129,0.3) 40%, rgba(20,184,166,0.2) 70%, transparent)',
        }}
      />

      {/* Logo */}
      <motion.div layout className="flex items-center gap-3 px-3.5 py-4 flex-shrink-0">
        <motion.div
          className="w-9 h-9 rounded-none flex items-center justify-center flex-shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg, #10b981, #14b8a6)',
            boxShadow: '0 0 20px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
          whileHover={{ scale: 1.08, rotate: 8 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <Layers size={17} className="text-white" />
          {/* Pulse ring on logo */}
          <motion.div
            className="absolute inset-0 rounded-none"
            animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0.4)', '0 0 0 6px rgba(16,185,129,0)', '0 0 0 0 rgba(16,185,129,0)'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-bold text-sm tracking-tight text-white leading-none">Lumora</div>
              <div className="text-[10px] text-emerald-400/70 mt-0.5 font-medium tracking-wide">KNOWLEDGE AGENT</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          const isHovered = hovered === item.id

          return (
            <div key={item.id} className="relative">
              <motion.button
                onClick={() => setActiveView(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center gap-3 w-full rounded-none px-2.5 py-2.5 text-sm overflow-hidden"
                style={{ color: isActive ? '#fff' : '#64748b' }}
              >
                {/* Active/hover background */}
                <AnimatePresence>
                  {(isActive || isHovered) && (
                    <motion.div
                      layoutId={isActive ? 'active-nav-bg' : undefined}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-none"
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${item.color}18, ${item.color}08)`
                          : 'rgba(255,255,255,0.03)',
                        border: isActive ? `1px solid ${item.color}30` : '1px solid transparent',
                        boxShadow: isActive ? `0 0 12px ${item.color}15, inset 0 1px 0 ${item.color}15` : 'none',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon with color dot */}
                <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-5">
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{ color: isActive ? item.color : isHovered ? '#94a3b8' : '#64748b' }}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-none"
                      style={{ background: item.color, boxShadow: `0 0 4px ${item.color}` }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  )}
                </div>

                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      className="relative z-10 font-medium text-sm whitespace-nowrap"
                      style={{ color: isActive ? '#fff' : '#94a3b8' }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Tooltip when collapsed */}
              <AnimatePresence>
                {!expanded && isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -8, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
                    style={{
                      background: 'rgba(8,12,10,0.95)',
                      border: `1px solid ${item.color}30`,
                      borderRadius: 0,
                      padding: '6px 12px',
                      boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px ${item.color}15`,
                    }}
                  >
                    <p className="text-xs font-semibold text-white whitespace-nowrap">{item.label}</p>
                    <p className="text-[10px] mt-0.5 whitespace-nowrap" style={{ color: item.color + 'cc' }}>{item.desc}</p>
                    {/* Arrow */}
                    <div
                      className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1/2 w-2 h-2 rotate-45"
                      style={{ background: 'rgba(8,12,10,0.95)', borderLeft: `1px solid ${item.color}30`, borderBottom: `1px solid ${item.color}30` }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />

      {/* Bottom: Settings + toggle */}
      <div className="px-2 py-3 space-y-0.5">
        {/* Settings */}
        <motion.button
          onClick={() => setActiveView('settings')}
          onMouseEnter={() => setHovered('settings')}
          onMouseLeave={() => setHovered(null)}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-3 w-full rounded-none px-2.5 py-2.5 overflow-hidden"
        >
          {activeView === 'settings' && (
            <motion.div
              layoutId="active-nav-bg"
              className="absolute inset-0 rounded-none"
              style={{
                background: 'rgba(100,116,139,0.12)',
                border: '1px solid rgba(100,116,139,0.25)',
              }}
            />
          )}
          <Settings
            size={17}
            strokeWidth={activeView === 'settings' ? 2.5 : 1.8}
            className="relative z-10 flex-shrink-0"
            style={{ color: activeView === 'settings' ? '#94a3b8' : '#64748b' }}
          />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="relative z-10 font-medium text-sm whitespace-nowrap"
                style={{ color: activeView === 'settings' ? '#fff' : '#64748b' }}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Collapse toggle */}
        <motion.button
          onClick={() => setExpanded(!expanded)}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 w-full rounded-none px-2.5 py-2 text-slate-600 hover:text-slate-400 transition-colors"
        >
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex-shrink-0"
          >
            <ChevronRight size={15} />
          </motion.div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="text-xs whitespace-nowrap font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  )
}
