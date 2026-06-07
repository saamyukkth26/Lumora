import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, Server, Cpu, CheckCircle, AlertCircle, Loader2, Trash2, Eye, EyeOff } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { MODELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/api/client'

function ApiKeyInput({ label, value, onChange, placeholder, testEndpoint }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  testEndpoint?: string
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

export function SettingsPanel() {
  const { anthropicKey, openaiKey, selectedModel, backendUrl, setAnthropicKey, setOpenaiKey, setSelectedModel, setBackendUrl } = useSettingsStore()

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* API Keys */}
        <section className="glass-card rounded-none p-5 space-y-5">
          <div className="flex items-center gap-2">
            <Key size={15} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">API Keys</h3>
          </div>

          <ApiKeyInput
            label="Anthropic API Key"
            value={anthropicKey}
            onChange={setAnthropicKey}
            placeholder="sk-ant-..."
          />
          <ApiKeyInput
            label="OpenAI API Key (fallback)"
            value={openaiKey}
            onChange={setOpenaiKey}
            placeholder="sk-..."
          />
          <p className="text-xs text-muted">Keys are stored locally in your browser and never sent to any server except the LLM provider.</p>
        </section>

        {/* Model selection */}
        <section className="glass-card rounded-none p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu size={15} className="text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Model</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MODELS.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'p-3 rounded-none text-left text-xs border transition-all',
                  selectedModel === m.id
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-surface-3 border-white/8 text-muted hover:border-white/15'
                )}
              >
                <p className="font-medium">{m.label}</p>
                <p className="opacity-60 mt-0.5 capitalize">{m.provider}</p>
              </motion.button>
            ))}
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
