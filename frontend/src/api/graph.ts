import { apiFetch } from './client'
import type { GraphNode, GraphEdge } from '@/types'

export async function fetchGraphNodes(nodeType?: string): Promise<GraphNode[]> {
  const q = nodeType ? `?node_type=${nodeType}` : ''
  return apiFetch<GraphNode[]>(`/graph/nodes${q}`)
}

export async function fetchGraphEdges(nodeId?: string): Promise<GraphEdge[]> {
  const q = nodeId ? `?node_id=${nodeId}` : ''
  return apiFetch<GraphEdge[]>(`/graph/edges${q}`)
}

export async function fetchSubgraph(nodeId: string, depth = 1) {
  return apiFetch<{ nodes: GraphNode[]; edges: GraphEdge[] }>(`/graph/subgraph/${nodeId}?depth=${depth}`)
}

export async function exportGraph() {
  return apiFetch<{ nodes: GraphNode[]; edges: GraphEdge[] }>('/graph/export')
}
