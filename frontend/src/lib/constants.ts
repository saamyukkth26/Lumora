export const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

export const MODELS = [
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'google', free: true },
  { id: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro',   provider: 'google', free: true },
  { id: 'gpt-4o-mini',      label: 'GPT-4o Mini',       provider: 'openai', free: false },
  { id: 'gpt-4o',           label: 'GPT-4o',            provider: 'openai', free: false },
  { id: 'claude-sonnet-4-6',label: 'Claude Sonnet 4.6', provider: 'anthropic', free: false },
  { id: 'claude-opus-4-8',  label: 'Claude Opus 4.8',   provider: 'anthropic', free: false },
]

export const NODE_COLORS: Record<string, string> = {
  document:     '#10b981',
  concept:      '#06b6d4',
  person:       '#f59e0b',
  event:        '#ef4444',
  place:        '#8b5cf6',
  topic:        '#14b8a6',
  paper:        '#ec4899',
  organization: '#f97316',
  technology:   '#3b82f6',
  location:     '#a78bfa',
  default:      '#64748b',
}

export const AGENT_STEP_LABELS: Record<string, string> = {
  retrieve_local: 'Searching knowledge base',
  search_web: 'Searching the web',
  search_arxiv: 'Searching Arxiv',
  search_wikipedia: 'Searching Wikipedia',
  synthesize: 'Synthesizing answer',
  critique: 'Evaluating quality',
  refine_query: 'Refining search',
  format_output: 'Formatting response',
}
