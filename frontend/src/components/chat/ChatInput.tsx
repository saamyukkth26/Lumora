import { motion, AnimatePresence } from 'framer-motion'
import { Send, Square, Paperclip, Sparkles, Mic } from 'lucide-react'
import { useRef, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  onSend: (text: string) => void
  isStreaming: boolean
  onCancel?: () => void
  disabled?: boolean
}

export function ChatInput({ onSend, isStreaming, onCancel, disabled }: Props) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasText = value.trim().length > 0

  const handleSend = useCallback(() => {
    const text = value.trim()
    if (!text || isStreaming) return
    onSend(text)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [value, isStreaming, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="pb-5 pt-1 flex flex-col items-center px-6">
      <motion.div
        className="w-full"
        style={{ maxWidth: 760 }}
      >
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 0 1px rgba(16,185,129,0.4), 0 0 30px rgba(16,185,129,0.12), 0 8px 32px rgba(0,0,0,0.4)'
            : '0 2px 16px rgba(0,0,0,0.3)',
        }}
        transition={{ duration: 0.2 }}
        className="relative rounded-none overflow-hidden"
        style={{
          background: 'rgba(8,14,11,0.85)',
          border: focused ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Top highlight line */}
        <div
          className="absolute top-0 left-4 right-4 h-px"
          style={{
            background: focused
              ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), rgba(20,184,166,0.5), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
            transition: 'background 0.3s',
          }}
        />

        <div className="flex items-end gap-2 px-3 py-2">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={isStreaming ? 'Lumora is thinking...' : 'Ask anything...'}
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 resize-none outline-none leading-relaxed"
            style={{ minHeight: 20, maxHeight: 120, paddingTop: 1, paddingBottom: 1 }}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isStreaming ? (
              <motion.button
                onClick={onCancel}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-7 h-7 rounded-none flex items-center justify-center relative overflow-hidden"
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.35)',
                }}
              >
                {/* Pulse animation while streaming */}
                <motion.div
                  className="absolute inset-0 rounded-none"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ background: 'rgba(239,68,68,0.1)' }}
                />
                <Square size={11} style={{ color: '#ef4444' }} className="relative z-10" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSend}
                disabled={!hasText}
                whileHover={hasText ? { scale: 1.08 } : {}}
                whileTap={hasText ? { scale: 0.92 } : {}}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-7 h-7 rounded-none flex items-center justify-center relative overflow-hidden transition-all duration-200"
                style={
                  hasText
                    ? {
                        background: 'linear-gradient(135deg, #10b981, #14b8a6)',
                        boxShadow: '0 0 16px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                        border: 'none',
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }
                }
              >
                <AnimatePresence mode="wait">
                  {hasText ? (
                    <motion.div
                      key="send"
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 20 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Send size={13} className="text-white" style={{ marginLeft: 1 }} />
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Sparkles size={13} className="text-slate-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>

        {/* Streaming indicator bar */}
        <AnimatePresence>
          {isStreaming && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
              style={{
                background: 'linear-gradient(90deg, #10b981, #14b8a6, #06b6d4, #10b981)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hint text */}
      <motion.p
        animate={{ opacity: focused ? 0.7 : 0.35 }}
        className="text-[10px] text-slate-600 text-center mt-2 font-medium"
      >
        Enter to send · Shift+Enter for new line
      </motion.p>
      </motion.div>
    </div>
  )
}
