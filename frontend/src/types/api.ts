export interface Source {
  source_id: string
  title: string
  url: string
  snippet: string
  relevance_score: number
  doc_id: string
}

export interface ChatMessage {
  message_id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  agent_steps?: string[]
  timestamp: string
  isStreaming?: boolean
}

export interface Document {
  doc_id: string
  title: string
  source: string
  file_type: 'pdf' | 'txt' | 'url' | 'md'
  status: 'processing' | 'ready' | 'failed'
  chunk_count: number
  ingested_at: string
  size_bytes: number
}

export interface ResearchJob {
  job_id: string
  query: string
  depth: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  current_step: string
  result?: {
    report: string
    sources: Source[]
    agent_steps: string[]
    iterations: number
  }
  error?: string
  created_at: string
  completed_at?: string
}

export interface GraphNode {
  node_id: string
  label: string
  node_type: string
  properties: Record<string, unknown>
}

export interface GraphEdge {
  edge_id?: string
  source_id: string
  target_id: string
  relation: string
  weight?: number
}

export interface TimelineEvent {
  event_id: string
  event_type: 'document_ingested' | 'research_completed' | 'chat_session'
  title: string
  description: string
  timestamp: string
  metadata: Record<string, unknown>
}
