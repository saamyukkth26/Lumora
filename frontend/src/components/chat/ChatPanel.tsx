import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Network, Sparkles, Zap, BookOpen, Globe, FlaskConical, Cpu } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { AgentStatusBar } from './AgentStatusBar'
import { useChatStore } from '@/stores/chatStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Source } from '@/types'

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const SUGGESTIONS = [
  { icon: BookOpen,    text: 'Summarize my uploaded documents', color: '#14b8a6' },
  { icon: Globe,       text: 'Search the web for recent AI news', color: '#06b6d4' },
  { icon: FlaskConical,text: 'Find Arxiv papers on LLM agents',  color: '#f59e0b' },
  { icon: Cpu,         text: 'Explain the attention mechanism',   color: '#10b981' },
]

function WelcomeScreen({ onSuggest }: { onSuggest: (text: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center text-center px-6 py-4 select-none"
    >
      {/* Animated logo — self-contained 140px box, no overflow */}
      <motion.div
        className="relative flex items-center justify-center mb-5 flex-shrink-0"
        style={{ width: 140, height: 140 }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
      >
        {/* Outermost static ring with pulse glow */}
        <motion.div
          className="absolute inset-0"
          style={{ border: '1px solid rgba(16,185,129,0.12)' }}
          animate={{ boxShadow: ['0 0 0 0 rgba(16,185,129,0)', '0 0 0 10px rgba(16,185,129,0.06)', '0 0 0 0 rgba(16,185,129,0)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        {/* Rotating dashed orbit ring — sized to fit inside 140px box */}
        <motion.div
          className="absolute"
          style={{ width: 118, height: 118, border: '1px dashed rgba(16,185,129,0.28)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2"
            style={{ background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.9)' }}
          />
        </motion.div>
        {/* Counter-rotating inner ring */}
        <motion.div
          className="absolute"
          style={{ width: 92, height: 92, border: '1px solid rgba(6,182,212,0.2)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute -bottom-1 -right-1 w-1.5 h-1.5"
            style={{ background: '#06b6d4', boxShadow: '0 0 5px rgba(6,182,212,0.9)' }}
          />
        </motion.div>
        {/* Icon container */}
        <motion.div
          className="relative w-16 h-16 flex items-center justify-center float"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
            boxShadow: '0 0 32px rgba(16,185,129,0.4), 0 0 64px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
        >
          <Network size={26} className="text-white" />
          <motion.div
            className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center"
            style={{ background: '#f59e0b', boxShadow: '0 0 10px rgba(245,158,11,0.7)' }}
            animate={{ scale: [1, 1.25, 1], rotate: [0, 12, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }}
          >
            <Sparkles size={10} className="text-white" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-5"
      >
        <h2 className="text-2xl font-bold tracking-tight mb-1">
          <span className="gradient-text">Lumora</span>
        </h2>
        <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
          Ask anything. Search your documents, the web, Arxiv, and Wikipedia — all at once.
        </p>
      </motion.div>

      {/* Suggestion cards */}
      <motion.div
        className="grid grid-cols-2 gap-2 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {SUGGESTIONS.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.button
              key={s.text}
              onClick={() => onSuggest(s.text)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + i * 0.08 }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-start gap-2 p-3.5 rounded-none text-left transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = `${s.color}0d`
                ;(e.currentTarget as HTMLElement).style.borderColor = `${s.color}35`
                ;(e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${s.color}15`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              }}
            >
              <div
                className="w-7 h-7 rounded-none flex items-center justify-center"
                style={{ background: `${s.color}20`, border: `1px solid ${s.color}30` }}
              >
                <Icon size={13} style={{ color: s.color }} />
              </div>
              <span className="text-xs text-slate-300 leading-relaxed font-medium">{s.text}</span>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Bottom hint */}
      <motion.p
        className="text-[11px] text-slate-600 mt-4 flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Zap size={10} className="text-emerald-500" />
        Press Enter to send · Shift+Enter for new line
      </motion.p>
    </motion.div>
  )
}

export function ChatPanel() {
  const {
    sessions, activeSessionId, streamingMessageId, currentAgentStep,
    addUserMessage, addAssistantPlaceholder, appendStreamingDelta,
    finalizeStream, setAgentStep, createSession,
  } = useChatStore()
  const { anthropicKey, openaiKey, backendUrl } = useSettingsStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const isStreaming = streamingMessageId !== null
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    if (!sessionId) {
      const id = createSession()
      setSessionId(id)
    }
  }, [])

  const messages = sessions[sessionId] || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isStreaming])

  const handleSend = useCallback(async (text: string) => {
    if (!sessionId) return
    addUserMessage(sessionId, text)
    const assistantId = addAssistantPlaceholder(sessionId)
    abortRef.current = new AbortController()

    try {
      const base = backendUrl || '/api/v1'
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (anthropicKey) headers['X-Anthropic-Key'] = anthropicKey
      if (openaiKey) headers['X-OpenAI-Key'] = openaiKey

      const res = await fetch(`${base}/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: text, session_id: sessionId }),
        signal: abortRef.current.signal,
      })

      if (!res.body) throw new Error('No stream body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim()
            if (!raw) continue
            try {
              const payload = JSON.parse(raw)
              if (payload.delta !== undefined) {
                appendStreamingDelta(sessionId, assistantId, payload.delta)
              } else if (payload.node) {
                setAgentStep(payload.node)
              } else if (payload.sources) {
                finalizeStream(sessionId, assistantId, payload.sources as Source[])
              } else if (payload.error) {
                appendStreamingDelta(sessionId, assistantId, `\n\n*Error: ${payload.error}*`)
                finalizeStream(sessionId, assistantId, [])
              }
            } catch { /* ignore */ }
          }
        }
      }
      finalizeStream(sessionId, assistantId, [])
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        appendStreamingDelta(sessionId, assistantId, '\n\n*Connection error. Check your API key in Settings.*')
      }
      finalizeStream(sessionId, assistantId, [])
    }
  }, [sessionId, anthropicKey, openaiKey, backendUrl, addUserMessage, addAssistantPlaceholder, appendStreamingDelta, finalizeStream, setAgentStep])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages area */}
      <div
        className="flex-1 overflow-x-hidden flex flex-col items-center"
        style={{ minHeight: 0, overflowY: messages.length === 0 ? 'hidden' : 'auto' }}
      >
        <div className="w-full" style={{ maxWidth: 760, padding: '0 24px' }}>
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="welcome"
                className="flex items-center justify-center"
                style={{ minHeight: 'calc(100vh - 180px)' }}
              >
                <WelcomeScreen onSuggest={handleSend} />
              </motion.div>
            ) : (
              <motion.div key="messages" className="space-y-4 py-6">
                {messages.map((msg, i) => (
                  <MessageBubble key={msg.message_id} message={msg} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Agent status */}
      <AgentStatusBar step={isStreaming ? currentAgentStep : null} />

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        onCancel={() => abortRef.current?.abort()}
        disabled={false}
      />
    </div>
  )
}
