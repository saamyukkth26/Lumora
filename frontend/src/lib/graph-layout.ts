import type { Node, Edge } from '@xyflow/react'

export function applyDagreLayout(nodes: Node[], _edges: Edge[]): Node[] {
  // Simple force-directed layout without dagre dependency
  // Arrange nodes in a circular/grid pattern
  const COLS = Math.ceil(Math.sqrt(nodes.length))
  const CELL_W = 200
  const CELL_H = 150

  return nodes.map((node, idx) => {
    const col = idx % COLS
    const row = Math.floor(idx / COLS)
    // Add some jitter for organic look
    const jitterX = (Math.sin(idx * 137.5) * 30)
    const jitterY = (Math.cos(idx * 137.5) * 20)
    return {
      ...node,
      position: {
        x: col * CELL_W + CELL_W / 2 + jitterX,
        y: row * CELL_H + CELL_H / 2 + jitterY,
      },
    }
  })
}
