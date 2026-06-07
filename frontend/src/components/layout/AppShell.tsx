import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { KnowledgeGraph } from '@/components/knowledge-graph/KnowledgeGraph'
import { DocumentPanel } from '@/components/documents/DocumentPanel'
import { ResearchPanel } from '@/components/research/ResearchPanel'
import { TimelineView } from '@/components/timeline/TimelineView'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { useChatStore } from '@/stores/chatStore'
import { useIsMobile } from '@/hooks/useIsMobile'

const VIEWS: Record<string, React.ComponentType> = {
  chat: ChatPanel,
  graph: KnowledgeGraph,
  documents: DocumentPanel,
  research: ResearchPanel,
  timeline: TimelineView,
  settings: SettingsPanel,
}

export function AppShell() {
  const { activeView } = useChatStore()
  const isMobile = useIsMobile()
  const CurrentView = VIEWS[activeView] || ChatPanel

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: '#080c0a' }}>
      {/* Animated aurora orbs */}
      <div className="aurora-bg">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
        <div className="aurora-orb aurora-orb-4" />
      </div>

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Content */}
      <div className="relative z-10 flex w-full h-full">
        {/* Desktop sidebar */}
        {!isMobile && <Sidebar />}

        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <main className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, x: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0"
                style={{ bottom: isMobile ? 64 : 0, overflowY: activeView === 'chat' || activeView === 'graph' ? 'hidden' : 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              >
                <div style={{ minHeight: activeView !== 'chat' && activeView !== 'graph' ? 'calc(100vh - 52px)' : undefined }}>
                  <CurrentView />
                </div>
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Mobile bottom nav */}
          {isMobile && <BottomNav />}
        </div>
      </div>
    </div>
  )
}
