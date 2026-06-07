import { create } from 'zustand'
import type { GraphNode, GraphEdge } from '@/types'

interface GraphStore {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNodeId: string | null
  nodeTypeFilter: string[]
  setNodes: (nodes: GraphNode[]) => void
  setEdges: (edges: GraphEdge[]) => void
  setSelectedNode: (id: string | null) => void
  setNodeTypeFilter: (types: string[]) => void
}

export const useGraphStore = create<GraphStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  nodeTypeFilter: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  setNodeTypeFilter: (types) => set({ nodeTypeFilter: types }),
}))
