import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, Network, ArrowRight, ArrowLeft, Tag } from 'lucide-react'
import { useGraphStore } from '@/stores/graphStore'
import { useChatStore } from '@/stores/chatStore'
import { NODE_COLORS } from '@/lib/constants'

export function GraphSidepanel() {
  const { nodes, edges, selectedNodeId, setSelectedNode } = useGraphStore()
  const { setActiveView } = useChatStore()
  const node = nodes.find((n) => n.node_id === selectedNodeId)

  const connectedEdges = edges.filter(
    (e) => e.source_id === selectedNodeId || e.target_id === selectedNodeId
  )
  const outgoing = connectedEdges.filter(e => e.source_id === selectedNodeId)
  const incoming = connectedEdges.filter(e => e.target_id === selectedNodeId)
  const color = node ? (NODE_COLORS[node.node_type] || NODE_COLORS.default) : '#94a3b8'

  const askAbout = () => {
    if (!node) return
    setActiveView('chat')
  }

  return (
    <AnimatePresence>
      {selectedNodeId && node && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="absolute right-4 top-4 bottom-4 z-20 flex flex-col"
          style={{ width: 280 }}
        >
          <div
            className="flex flex-col h-full overflow-hidden"
            style={{
              background: 'rgba(8,14,11,0.92)',
              border: `1px solid ${color}30`,
              backdropFilter: 'blur(24px)',
              boxShadow: `0 0 0 1px ${color}12, 0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${color}08`,
            }}
          >
            {/* Top color accent bar */}
            <div className="h-0.5 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${color}, ${color}40, transparent)` }} />

            {/* Header */}
            <div className="flex items-start gap-3 p-4 flex-shrink-0">
              <div
                className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${color}18`, border: `1px solid ${color}35` }}
              >
                <Network size={14} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-white leading-tight truncate">{node.label}</h3>
                <span
                  className="inline-block text-[10px] font-medium px-2 py-0.5 mt-1 uppercase tracking-wide"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
                >
                  {node.node_type}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 transition-colors flex-shrink-0"
                style={{ color: '#64748b' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
              >
                <X size={13} />
              </button>
            </div>

            {/* Divider */}
            <div className="mx-4 h-px flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }} />

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="flex flex-col items-center py-2.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="text-lg font-bold" style={{ color }}>{outgoing.length}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <ArrowRight size={9} /> Outgoing
                  </span>
                </div>
                <div
                  className="flex flex-col items-center py-2.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="text-lg font-bold" style={{ color }}>{incoming.length}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <ArrowLeft size={9} /> Incoming
                  </span>
                </div>
              </div>

              {/* Properties */}
              {Object.keys(node.properties || {}).length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag size={9} /> Properties
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(node.properties).slice(0, 6).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between gap-2 px-2.5 py-1.5"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <span className="text-[11px] text-slate-500 flex-shrink-0">{k}</span>
                        <span className="text-[11px] text-slate-300 truncate text-right">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connections */}
              {connectedEdges.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Network size={9} /> Connections ({connectedEdges.length})
                  </p>
                  <div className="space-y-1">
                    {connectedEdges.slice(0, 10).map((e, i) => {
                      const isOut = e.source_id === selectedNodeId
                      const otherId = isOut ? e.target_id : e.source_id
                      const other = nodes.find((n) => n.node_id === otherId)
                      const otherColor = other ? (NODE_COLORS[other.node_type] || NODE_COLORS.default) : '#64748b'
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center gap-2 px-2.5 py-2 cursor-pointer"
                          style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          onClick={() => setSelectedNode(otherId)}
                        >
                          <div
                            className="w-1.5 h-1.5 flex-shrink-0"
                            style={{ background: isOut ? '#10b981' : '#06b6d4' }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-slate-500 truncate uppercase tracking-wide">{e.relation}</div>
                            <div className="text-[11px] font-medium truncate" style={{ color: otherColor }}>
                              {other?.label || otherId}
                            </div>
                          </div>
                          <div
                            className="flex-shrink-0 text-[9px] px-1.5 py-0.5 uppercase"
                            style={{ color: isOut ? '#10b981' : '#06b6d4', background: isOut ? 'rgba(16,185,129,0.1)' : 'rgba(6,182,212,0.1)' }}
                          >
                            {isOut ? '→' : '←'}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer button */}
            <div className="p-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <motion.button
                onClick={askAbout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-white text-xs font-semibold transition-all"
                style={{
                  background: `linear-gradient(135deg, ${color}cc, ${color}99)`,
                  boxShadow: `0 4px 16px ${color}30`,
                }}
              >
                <MessageSquare size={12} />
                Ask about this node
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
