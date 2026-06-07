import { motion } from 'framer-motion'
import { MessageSquare, Network, FileText, Search, Settings } from 'lucide-react'
import { useChatStore } from '@/stores/chatStore'

const NAV_ITEMS = [
  { id: 'chat',      icon: MessageSquare, label: 'Chat',      color: '#10b981' },
  { id: 'graph',     icon: Network,       label: 'Graph',     color: '#06b6d4' },
  { id: 'documents', icon: FileText,      label: 'Docs',      color: '#14b8a6' },
  { id: 'research',  icon: Search,        label: 'Research',  color: '#f59e0b' },
  { id: 'settings',  icon: Settings,      label: 'Settings',  color: '#94a3b8' },
]

export function BottomNav() {
  const { activeView, setActiveView } = useChatStore()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around"
      style={{
        height: 64,
        background: 'rgba(8,12,10,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = activeView === item.id
        return (
          <motion.button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            whileTap={{ scale: 0.88 }}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative"
          >
            {isActive && (
              <motion.div
                layoutId="bottom-nav-bg"
                className="absolute inset-x-1 inset-y-1.5 rounded-none"
                style={{
                  background: `${item.color}12`,
                  border: `1px solid ${item.color}25`,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon
              size={20}
              strokeWidth={isActive ? 2.5 : 1.8}
              style={{ color: isActive ? item.color : '#475569' }}
              className="relative z-10"
            />
            <span
              className="text-[10px] font-medium relative z-10"
              style={{ color: isActive ? item.color : '#475569' }}
            >
              {item.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
