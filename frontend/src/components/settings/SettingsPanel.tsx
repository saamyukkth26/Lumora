import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Server, Cpu, CheckCircle, AlertCircle, Loader2, Trash2, Eye, EyeOff } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { MODELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/api/client'

function ApiKeyInput({ label, value, onChange, placeholder }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [show, setShow] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null)

  const test = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      await apiFetch('/health/ready')
      setTestResult('ok')
    } catch {
      setTestResult('fail')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted font-medium">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-surface-3 border border-white/8 rounded-none px-3 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary/30 transition-colors font-mono"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
          >
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        {value && (
          <motion.button
            onClick={test}
            disabled={testing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'px-3 py-2 rounded-none text-xs font-medium border transition-all flex items-center gap-1.5',
              testResult === 'ok' ? 'bg-success/10 border-success/30 text-success' :
              testResult === 'fail' ? 'bg-destructive/10 border-destructive/30 text-destructive' :
              'bg-surface-3 border-white/8 text-muted hover:text-foreground'
            )}
          >
            {testing ? <Loader2 size={11} className="animate-spin" /> :
             testResult === 'ok' ? <CheckCircle size={11} /> :
             testResult === 'fail' ? <AlertCircle size={11} /> : <CheckCircle size={11} />}
            {testing ? 'Testing...' : testResult === 'ok' ? 'OK' : testResult === 'fail' ? 'Failed' : 'Test'}
          </motion.button>
        )}
      </div>
    </div>
  )
}

const PROVIDER_COLORS: Record<string, string> = {
  google:    '#10b981',
  openai:    '#06b6d4',
  anthropic: '#f59e0b',
}

export function SettingsPanel() {
  const {
    anthropicKey, openaiKey, googleKey, selectedModel, backendUrl,
    setAnthropicKey, setOpenaiKey, setGoogleKey, setSelectedModel, setBackendUrl,
  } = useSettingsStore()

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* API Keys */}
        <section className="glass-card rounded-none p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Key size={15} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">API Keys</h3>
          </div>

          {/* Gemini — free, shown first */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400">Google Gemini API Key</span>
              <span
                className="text-[10px] px-1.5 py-0.5 font-semibold uppercase tracking-wide"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                FREE
              </span>
            </div>
            <ApiKeyInput
              label=""
              value={googleKey}
              onChange={setGoogleKey}
              placeholder="AIza..."
            />
            <p className="text-[11px] text-slate-500">
              Get yours free at <span className="text-emerald-500">aistudio.google.com</span> — works for both chat and embeddings.
            </p>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

          <ApiKeyInput
            label="Anthropic API Key (optional)"
            value={anthropicKey}
            onChange={setAnthropicKey}
            placeholder="sk-ant-..."
          />
          <ApiKeyInput
            label="OpenAI API Key (optional)"
            value={openaiKey}
            onChange={setOpenaiKey}
            placeholder="sk-..."
          />
          <p className="text-xs text-muted">Keys are stored locally in your browser only.</p>
        </section>

        {/* Model selection */}
        <section className="glass-card rounded-none p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu size={15} className="text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Model</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MODELS.map((m) => {
              const color = PROVIDER_COLORS[m.provider] || '#64748b'
              const isSelected = selectedModel === m.id
              return (
                <motion.button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 rounded-none text-left text-xs border transition-all relative overflow-hidden"
                  style={{
                    background: isSelected ? `${color}12` : 'rgba(255,255,255,0.02)',
                    border: isSelected ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold" style={{ color: isSelected ? color : '#e2e8f0' }}>{m.label}</p>
                    {m.free && (
                      <span
                        className="text-[9px] px-1 py-0.5 font-bold uppercase"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
                      >
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="capitalize" style={{ color: isSelected ? `${color}99` : '#64748b' }}>{m.provider}</p>
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: color }} />
                  )}
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* Backend URL */}
        <section className="glass-card rounded-none p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Server size={15} className="text-violet" />
            <h3 className="text-sm font-semibold text-foreground">Backend URL</h3>
          </div>
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="https://your-backend.onrender.com/api/v1"
            className="w-full bg-surface-3 border border-white/8 rounded-none px-3 py-2.5 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary/30 transition-colors font-mono"
          />
          <p className="text-xs text-muted">Leave as /api/v1 for local development. Set to your Render URL in production.</p>
        </section>

        {/* Danger zone */}
        <section className="glass-card rounded-none p-5 border-destructive/10">
          <h3 className="text-sm font-semibold text-destructive/70 mb-3">Danger Zone</h3>
          <button
            onClick={() => {
              if (confirm('Clear all local settings? This cannot be undone.')) {
                setAnthropicKey('')
                setOpenaiKey('')
                setBackendUrl('/api/v1')
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-none bg-destructive/10 border border-destructive/20 text-destructive text-sm hover:bg-destructive/15 transition-colors"
          >
            <Trash2 size={13} />
            Clear all settings
          </button>
        </section>
      </div>
    </div>
  )
}
