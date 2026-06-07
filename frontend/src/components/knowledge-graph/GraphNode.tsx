import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { NODE_COLORS } from '@/lib/constants'
import { useGraphStore } from '@/stores/graphStore'
import { Tag, Building, User, FileText, Cpu, Globe, BookOpen, HelpCircle } from 'lucide-react'

interface GraphNodeData {
  label: string
  node_type: string
  [key: string]: unknown
}

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  person:       User,
  organization: Building,
  concept:      Tag,
  document:     FileText,
  technology:   Cpu,
  location:     Globe,
  topic:        BookOpen,
  default:      HelpCircle,
}

export function GraphNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as GraphNodeData
  const color = NODE_COLORS[nodeData.node_type] || NODE_COLORS.default
  const { setSelectedNode } = useGraphStore()
  const Icon = TYPE_ICONS[nodeData.node_type?.toLowerCase()] || TYPE_ICONS.default

  return (
    <motion.div
      onClick={() => setSelectedNode(id)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="relative cursor-pointer select-none"
      style={{ minWidth: 120 }}
    >
      {/* Selected outer ring */}
      {selected && (
        <motion.div
          className="absolute -inset-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            border: `1px solid ${color}45`,
            boxShadow: `0 0 16px ${color}25`,
          }}
        />
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: color, border: `2px solid rgba(0,0,0,0.4)`,
          width: 8, height: 8, top: -4, zIndex: 10,
        }}
      />

      <motion.div
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        style={{
          background: selected
            ? `linear-gradient(135deg, ${color}1a 0%, ${color}0d 100%)`
            : 'rgba(8,14,11,0.92)',
          border: selected ? `1px solid ${color}55` : `1px solid rgba(255,255,255,0.09)`,
          backdropFilter: 'blur(20px)',
          boxShadow: selected
            ? `0 0 0 1px ${color}25, 0 6px 24px ${color}20, 0 12px 40px rgba(0,0,0,0.5)`
            : '0 2px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
          padding: '8px 12px',
        }}
      >
        {/* Top color bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
        />

        <div className="flex items-center gap-2">
          {/* Icon badge */}
          <div
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
            style={{
              background: `${color}18`,
              border: `1px solid ${color}35`,
            }}
          >
            <Icon size={11} style={{ color }} />
          </div>

          <div className="flex flex-col min-w-0">
            <span
              className="text-xs font-semibold leading-tight truncate"
              style={{
                color: selected ? '#fff' : 'rgba(241,245,249,0.92)',
                maxWidth: 100,
              }}
            >
              {nodeData.label}
            </span>
            <span
              className="text-[9px] font-medium mt-0.5 uppercase tracking-wide"
              style={{ color: `${color}bb` }}
            >
              {nodeData.node_type}
            </span>
          </div>
        </div>

        {/* Pulse dot bottom-right */}
        <motion.div
          className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5"
          style={{ background: color, boxShadow: `0 0 5px ${color}` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: color, border: `2px solid rgba(0,0,0,0.4)`,
          width: 8, height: 8, bottom: -4, zIndex: 10,
        }}
      />
    </motion.div>
  )
}
