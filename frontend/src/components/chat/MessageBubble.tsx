import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Brain, User, Copy, Check, Sparkles } from 'lucide-react'
import type { ChatMessage } from '@/types'
import { SourceCitations } from './SourceCitations'
import { StreamingIndicator } from './StreamingIndicator'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface Props {
  message: ChatMessage
  index: number
}

export function MessageBubble({ message, index }: Props) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.04, 0.2),
        ease: [0.23, 1, 0.32, 1],
      }}
      className={cn('flex gap-3 group w-full', isUser ? 'flex-row-reverse' : 'flex-row')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400 }}
        className="flex-shrink-0 mt-1"
      >
        {isUser ? (
          <div
            className="w-8 h-8 rounded-none flex items-center justify-center"
            style={{
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.25)',
              boxShadow: '0 0 10px rgba(16,185,129,0.1)',
            }}
          >
            <User size={13} style={{ color: '#6ee7b7' }} />
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-none flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, #10b981, #14b8a6)',
              boxShadow: '0 0 16px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <Brain size={13} className="text-white" />
            {message.isStreaming && (
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-none"
                style={{ background: '#10b981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </div>
        )}
      </motion.div>

      {/* Bubble */}
      <div className={cn('flex flex-col', isUser ? 'items-end max-w-[70%]' : 'items-start flex-1')}>
        {/* Role label */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          className="text-[10px] font-semibold mb-1 px-1"
          style={{ color: isUser ? '#6ee7b7' : '#64748b' }}
        >
          {isUser ? 'You' : 'Lumora'}
        </motion.div>

        <motion.div
          whileHover={isUser ? {} : { boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' }}
          className={cn(
            'rounded-none text-sm leading-relaxed relative overflow-hidden',
            isUser ? 'px-4 py-2.5' : 'px-5 py-4',
          )}
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(20,184,166,0.12) 100%)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: '#f1f5f9',
                  boxShadow: '0 2px 12px rgba(16,185,129,0.1)',
                }
              : {
                  background: 'rgba(8,14,11,0.8)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(241,245,249,0.92)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
                }
          }
        >
          {/* User bubble gradient shimmer */}
          {isUser && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.05) 60%, transparent 70%)',
              }}
            />
          )}

          {/* AI bubble left accent bar */}
          {!isUser && (
            <div
              className="absolute left-0 top-3 bottom-3 w-0.5 rounded-none"
              style={{ background: 'linear-gradient(to bottom, #10b981, #14b8a6)' }}
            />
          )}

          <div className={cn(!isUser && 'pl-3')}>
            {message.isStreaming && !message.content ? (
              <StreamingIndicator />
            ) : (
              <div
                className={cn(
                  'prose-response',
                  message.isStreaming && message.content && 'streaming-cursor',
                )}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const isBlock = className?.includes('language-')
                      return isBlock ? (
                        <pre style={{
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(16,185,129,0.15)',
                          borderRadius: 0,
                          padding: '12px 16px',
                          overflowX: 'auto',
                          margin: '12px 0',
                          fontSize: '0.78rem',
                          lineHeight: 1.6,
                        }}>
                          <code className={className} {...props}>{children}</code>
                        </pre>
                      ) : (
                        <code
                          style={{
                            background: 'rgba(16,185,129,0.12)',
                            color: '#6ee7b7',
                            border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: 0,
                            padding: '1px 6px',
                            fontFamily: 'JetBrains Mono, Fira Code, monospace',
                            fontSize: '0.8em',
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    },
                    p({ children }) {
                      return (
                        <p style={{
                          marginBottom: '0.75rem',
                          lineHeight: 1.75,
                          color: 'rgba(241,245,249,0.90)',
                          textAlign: 'justify',
                          hyphens: 'auto',
                        }}
                        className="last:mb-0"
                        >
                          {children}
                        </p>
                      )
                    },
                    h1({ children }) {
                      return (
                        <h1 style={{
                          fontSize: '1.1rem', fontWeight: 700, color: '#fff',
                          marginTop: '1.25rem', marginBottom: '0.5rem',
                          paddingBottom: '6px',
                          borderBottom: '1px solid rgba(16,185,129,0.2)',
                          letterSpacing: '-0.01em',
                        }}>{children}</h1>
                      )
                    },
                    h2({ children }) {
                      return (
                        <h2 style={{
                          fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9',
                          marginTop: '1rem', marginBottom: '0.4rem',
                          letterSpacing: '-0.01em',
                        }}>{children}</h2>
                      )
                    },
                    h3({ children }) {
                      return (
                        <h3 style={{
                          fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0',
                          marginTop: '0.75rem', marginBottom: '0.3rem',
                        }}>{children}</h3>
                      )
                    },
                    ul({ children }) {
                      return (
                        <ul style={{ margin: '0.5rem 0 0.75rem 0', paddingLeft: 0, listStyle: 'none' }}>
                          {children}
                        </ul>
                      )
                    },
                    ol({ children }) {
                      return (
                        <ol style={{ margin: '0.5rem 0 0.75rem 0', paddingLeft: '1.25rem', listStyleType: 'decimal' }}>
                          {children}
                        </ol>
                      )
                    },
                    li({ children }) {
                      return (
                        <li style={{
                          display: 'flex', alignItems: 'flex-start', gap: '8px',
                          marginBottom: '0.4rem', lineHeight: 1.65,
                          color: 'rgba(226,232,240,0.88)',
                        }}>
                          <span style={{
                            marginTop: '7px', width: '5px', height: '5px', flexShrink: 0,
                            background: '#10b981', display: 'inline-block',
                          }} />
                          <span>{children}</span>
                        </li>
                      )
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote style={{
                          margin: '0.75rem 0',
                          paddingLeft: '12px',
                          paddingTop: '4px',
                          paddingBottom: '4px',
                          borderLeft: '3px solid rgba(16,185,129,0.5)',
                          background: 'rgba(16,185,129,0.05)',
                          color: '#94a3b8',
                          fontStyle: 'italic',
                          fontSize: '0.875rem',
                          lineHeight: 1.7,
                        }}>
                          {children}
                        </blockquote>
                      )
                    },
                    a({ href, children }) {
                      return (
                        <a href={href} target="_blank" rel="noopener noreferrer" style={{
                          color: '#22d3ee', textDecoration: 'underline',
                          textUnderlineOffset: '3px', transition: 'color 0.15s',
                        }}>
                          {children}
                        </a>
                      )
                    },
                    strong({ children }) {
                      return <strong style={{ fontWeight: 600, color: '#ffffff' }}>{children}</strong>
                    },
                    em({ children }) {
                      return <em style={{ color: '#94a3b8', fontStyle: 'italic' }}>{children}</em>
                    },
                    hr() {
                      return <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '1rem 0' }} />
                    },
                    table({ children }) {
                      return (
                        <div style={{ overflowX: 'auto', margin: '0.75rem 0' }}>
                          <table style={{
                            width: '100%', borderCollapse: 'collapse',
                            fontSize: '0.82rem', lineHeight: 1.5,
                          }}>{children}</table>
                        </div>
                      )
                    },
                    th({ children }) {
                      return (
                        <th style={{
                          padding: '6px 12px', textAlign: 'left', fontWeight: 600,
                          color: '#6ee7b7', fontSize: '0.78rem', letterSpacing: '0.04em',
                          borderBottom: '1px solid rgba(16,185,129,0.25)',
                          background: 'rgba(16,185,129,0.08)',
                        }}>{children}</th>
                      )
                    },
                    td({ children }) {
                      return (
                        <td style={{
                          padding: '6px 12px', color: 'rgba(226,232,240,0.85)',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                        }}>{children}</td>
                      )
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sources */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full mt-2"
          >
            <SourceCitations sources={message.sources} />
          </motion.div>
        )}

        {/* Footer: timestamp + copy */}
        <AnimatePresence>
          {!message.isStreaming && hovered && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'flex items-center gap-2 mt-1.5 px-1',
                isUser ? 'flex-row-reverse' : 'flex-row',
              )}
            >
              <span className="text-[10px] text-slate-600">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {!isUser && (
                <motion.button
                  onClick={copy}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 rounded-none transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check size={11} style={{ color: '#10b981' }} />
                      </motion.div>
                    ) : (
                      <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Copy size={11} className="text-slate-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
              {!isUser && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-1 text-[10px]"
                  style={{ color: '#10b981' }}
                >
                  <Sparkles size={9} />
                  <span>AI</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
