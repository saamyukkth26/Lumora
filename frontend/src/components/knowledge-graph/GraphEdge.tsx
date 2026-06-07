import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'

export function GraphEdgeComponent({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })
  const label = (data as { relation?: string })?.relation || ''

  return (
    <>
      {/* Glow layer behind edge when selected */}
      {selected && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: 'rgba(6,182,212,0.25)',
            strokeWidth: 6,
            filter: 'blur(3px)',
          }}
        />
      )}

      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={selected ? 'url(#arrow-selected)' : 'url(#arrow-default)'}
        style={{
          stroke: selected ? 'rgba(6,182,212,0.85)' : 'rgba(16,185,129,0.22)',
          strokeWidth: selected ? 1.8 : 1,
          strokeDasharray: selected ? 'none' : 'none',
          transition: 'stroke 0.25s, stroke-width 0.25s',
        }}
      />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
              position: 'absolute',
            }}
          >
            <span
              style={{
                background: selected ? 'rgba(6,182,212,0.12)' : 'rgba(8,14,11,0.88)',
                border: selected ? '1px solid rgba(6,182,212,0.3)' : '1px solid rgba(255,255,255,0.07)',
                color: selected ? '#22d3ee' : 'rgba(100,116,139,0.9)',
                padding: '2px 7px',
                fontSize: '9px',
                fontWeight: 500,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                backdropFilter: 'blur(8px)',
                whiteSpace: 'nowrap',
                display: 'inline-block',
              }}
            >
              {label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
