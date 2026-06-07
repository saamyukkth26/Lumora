import { create } from 'zustand'
import type { ChatMessage, Source } from '@/types'

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

interface ChatStore {
  sessions: Record<string, ChatMessage[]>
  activeSessionId: string
  streamingMessageId: string | null
  currentAgentStep: string | null
  activeView: string

  addUserMessage: (sessionId: string, content: string) => string
  addAssistantPlaceholder: (sessionId: string) => string
  appendStreamingDelta: (sessionId: string, msgId: string, delta: string) => void
  finalizeStream: (sessionId: string, msgId: string, sources: Source[]) => void
  setAgentStep: (step: string | null) => void
  createSession: () => string
  clearSession: (sessionId: string) => void
  setActiveView: (view: string) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: {},
  activeSessionId: '',
  streamingMessageId: null,
  currentAgentStep: null,
  activeView: 'chat',

  addUserMessage: (sessionId, content) => {
    const msgId = genId()
    const msg: ChatMessage = {
      message_id: msgId,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    set((state) => ({
      sessions: {
        ...state.sessions,
        [sessionId]: [...(state.sessions[sessionId] || []), msg],
      },
    }))
    return msgId
  },

  addAssistantPlaceholder: (sessionId) => {
    const msgId = genId()
    const msg: ChatMessage = {
      message_id: msgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }
    set((state) => ({
      sessions: {
        ...state.sessions,
        [sessionId]: [...(state.sessions[sessionId] || []), msg],
      },
      streamingMessageId: msgId,
    }))
    return msgId
  },

  appendStreamingDelta: (sessionId, msgId, delta) => {
    set((state) => {
      const messages = state.sessions[sessionId] || []
      return {
        sessions: {
          ...state.sessions,
          [sessionId]: messages.map((m) =>
            m.message_id === msgId ? { ...m, content: m.content + delta } : m
          ),
        },
      }
    })
  },

  finalizeStream: (sessionId, msgId, sources) => {
    set((state) => ({
      sessions: {
        ...state.sessions,
        [sessionId]: (state.sessions[sessionId] || []).map((m) =>
          m.message_id === msgId ? { ...m, isStreaming: false, sources } : m
        ),
      },
      streamingMessageId: null,
      currentAgentStep: null,
    }))
  },

  setAgentStep: (step) => set({ currentAgentStep: step }),

  createSession: () => {
    const id = genId()
    set((state) => ({
      sessions: { ...state.sessions, [id]: [] },
      activeSessionId: id,
    }))
    return id
  },

  clearSession: (sessionId) => {
    set((state) => {
      const s = { ...state.sessions }
      delete s[sessionId]
      return { sessions: s }
    })
  },

  setActiveView: (view) => set({ activeView: view }),
}))
