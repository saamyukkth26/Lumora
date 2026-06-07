import { useEffect, useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { useGraphStore } from '@/stores/graphStore'
import { fetchGraphNodes, fetchGraphEdges } from '@/api/graph'
import { applyDagreLayout } from '@/lib/graph-layout'
import { NODE_COLORS } from '@/lib/constants'
import { GraphNodeComponent } from './GraphNode'
import { GraphEdgeComponent } from './GraphEdge'
import { GraphSidepanel } from './GraphSidepanel'
import { Network, RefreshCw, Layers, GitBranch, Share2 } from 'lucide-react'

const nodeTypes = { graphNode: GraphNodeComponent }
const edgeTypes = { graphEdge: GraphEdgeComponent }

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-5 text-center px-8">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute -inset-6"
          style={{ border: '1px dashed rgba(16,185,129,0.2)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <div
          className="w-16 h-16 flex items-center justify-center relative"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <Share2 size={22} style={{ color: '#10b981' }} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-white font-semibold text-base mb-1">No Knowledge Graph Yet</h3>
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
          Upload documents in the Documents tab to automatically extract entities, relationships, and build your knowledge graph.
        </p>
      </motion.div>

      <motion.button
        onClick={onRefresh}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center gap-2 px-4 py-2 text-xs font-medium"
        style={{
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.25)',
          color: '#10b981',
        }}
      >
        <RefreshCw size={12} />
        Refresh Graph
      </motion.button>
    </div>
  )
}

function Legend({ nodeTypes }: { nodeTypes: string[] }) {
  const [open, setOpen] = useState(true)
  const visible = nodeTypes.filter(t => t !== 'default').slice(0, 8)
  if (visible.length === 0) return null

  return (
    <motion.div
      className="absolute bottom-4 left-4 z-10"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div
        style={{
          background: 'rgba(8,14,11,0.92)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          minWidth: 140,
        }}
      >
        <button
          onClick={() => setOpen(p => !p)}
          className="w-full flex items-center gap-2 px-3 py-2"
          style={{ borderBottom: open ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
        >
          <Layers size={10} style={{ color: '#64748b' }} />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex-1 text-left">Legend</span>
          <span className="text-[10px] text-slate-600">{open ? '−' : '+'}</span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="px-3 py-2 space-y-1.5">
                {visible.map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 flex-shrink-0"
                      style={{
                        background: NODE_COLORS[type] || NODE_COLORS.default,
                        boxShadow: `0 0 4px ${NODE_COLORS[type] || NODE_COLORS.default}80`,
                      }}
                    />
                    <span className="text-[11px] text-slate-400 capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export function KnowledgeGraph() {
  const { nodes: storeNodes, edges: storeEdges, setNodes, setEdges, selectedNodeId } = useGraphStore()
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<Node>([])
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [loading, setLoading] = useState(false)

  const nodeTypesList = [...new Set(storeNodes.map(n => n.node_type).filter(Boolean))]

  const loadGraph = useCallback(async () => {
    setLoading(true)
    try {
      const [nodes, edges] = await Promise.all([fetchGraphNodes(), fetchGraphEdges()])
      setNodes(nodes)
      setEdges(edges)

      const rawNodes: Node[] = nodes.map((n) => ({
        id: n.node_id,
        type: 'graphNode',
        position: { x: 0, y: 0 },
        data: { label: n.label, node_type: n.node_type, ...n.properties },
      }))

      const rawEdges: Edge[] = edges.map((e, i) => ({
        id: e.edge_id || `e-${i}`,
        source: e.source_id,
        target: e.target_id,
        type: 'graphEdge',
        data: { relation: e.relation },
      }))

      const laidOut = applyDagreLayout(rawNodes, rawEdges)
      setFlowNodes(laidOut)
      setFlowEdges(rawEdges)
    } catch (e) {
      console.error('Failed to load graph:', e)
    } finally {
      setLoading(false)
    }
  }, [setNodes, setEdges, setFlowNodes, setFlowEdges])

  useEffect(() => { loadGraph() }, [loadGraph])

  if (!loading && flowNodes.length === 0) {
    return <EmptyState onRefresh={loadGraph} />
  }

  return (
    <div className="relative h-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.08}
        maxZoom={3}
        className="bg-transparent"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="rgba(16,185,129,0.08)"
        />
        <Controls
          style={{
            background: 'rgba(8,14,11,0.92)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 0,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        />
        <MiniMap
          style={{
            background: 'rgba(8,14,11,0.92)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 0,
          }}
          nodeColor={(n) => NODE_COLORS[(n.data as { node_type?: string }).node_type || 'default'] || NODE_COLORS.default}
          maskColor="rgba(8,14,11,0.75)"
        />
      </ReactFlow>

      {/* Top toolbar */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        {/* Refresh */}
        <motion.button
          onClick={loadGraph}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            background: 'rgba(8,14,11,0.92)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
            color: '#64748b',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#10b981')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
        >
          <motion.div animate={loading ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}>
            <RefreshCw size={12} />
          </motion.div>
          Refresh
        </motion.button>

        {/* Stats */}
        <div
          className="flex items-center gap-3 px-3 py-1.5 text-xs"
          style={{
            background: 'rgba(8,14,11,0.92)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <span className="flex items-center gap-1.5" style={{ color: '#64748b' }}>
            <Network size={10} style={{ color: '#10b981' }} />
            <span className="text-white font-semibold">{flowNodes.length}</span> nodes
          </span>
          <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span className="flex items-center gap-1.5" style={{ color: '#64748b' }}>
            <GitBranch size={10} style={{ color: '#06b6d4' }} />
            <span className="text-white font-semibold">{flowEdges.length}</span> edges
          </span>
        </div>
      </div>

      {/* Legend */}
      <Legend nodeTypes={nodeTypesList} />

      {/* Side panel */}
      <GraphSidepanel />

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-30"
            style={{ background: 'rgba(8,12,10,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw size={20} style={{ color: '#10b981' }} />
              </motion.div>
              <span className="text-xs text-slate-400">Loading graph...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
