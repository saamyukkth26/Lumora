import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Zap, FlaskConical, Sparkles } from 'lucide-react'
import { DepthSelector } from './DepthSelector'
import { ResearchJobCard } from './ResearchJobCard'
import { useResearchStore } from '@/stores/researchStore'
import { createResearchJob, fetchResearchJobs, fetchResearchJob, deleteResearchJob } from '@/api/research'
import { useSettingsStore } from '@/stores/settingsStore'

export function ResearchPanel() {
  const { jobs, addJob, updateJob, removeJob } = useResearchStore()
  const { anthropicKey, openaiKey } = useSettingsStore()
  const [query, setQuery] = useState('')
  const [depth, setDepth] = useState(2)
  const [launching, setLaunching] = useState(false)
  const [focused, setFocused] = useState(false)
  const pollRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map())

  const { setJobs } = useResearchStore()
  const load = useCallback(async () => {
    try { const j = await fetchResearchJobs(); setJobs(j) } catch { /* silent */ }
  }, [setJobs])

  useEffect(() => { load() }, [load])

  const pollJob = useCallback((jobId: string) => {
    const timer = setInterval(async () => {
      try {
        const job = await fetchResearchJob(jobId)
        updateJob(jobId, job)
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(pollRef.current.get(jobId))
          pollRef.current.delete(jobId)
        }
      } catch { /* silent */ }
    }, 2000)
    pollRef.current.set(jobId, timer)
  }, [updateJob])

  const handleLaunch = async () => {
    if (!query.trim() || launching) return
    setLaunching(true)
    try {
      const res = await createResearchJob(query.trim(), depth)
      addJob({ job_id: res.job_id, query: query.trim(), depth, status: 'pending', progress: 0, current_step: '', created_at: new Date().toISOString() })
      setQuery('')
      pollJob(res.job_id)
    } catch (e) { console.error('Launch failed:', e) }
    finally { setLaunching(false) }
  }

  const handleDelete = async (jobId: string) => {
    try { await deleteResearchJob(jobId); removeJob(jobId) } catch { /* silent */ }
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col p-4 gap-4" style={{ minHeight: 'calc(100vh - 52px)', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      {/* Input card */}
      <motion.div
        animate={{
          boxShadow: focused
            ? '0 0 0 1px rgba(16,185,129,0.3), 0 8px 40px rgba(0,0,0,0.5)'
            : '0 4px 24px rgba(0,0,0,0.4)',
        }}
        className="rounded-none p-4 space-y-4"
        style={{
          background: 'rgba(8,14,11,0.8)',
          border: focused ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          transition: 'border 0.2s',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-none flex items-center justify-center"
            style={{
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.25)',
            }}
          >
            <FlaskConical size={15} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Deep Research</p>
            <p className="text-[10px] text-slate-500">Multi-source autonomous agent</p>
          </div>
        </div>

        {/* Textarea */}
        <div>
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5 block">Research Query</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={(e) => { setFocused(true); (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(16,185,129,0.35)' }}
            onBlur={(e) => { setFocused(false); (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
            placeholder="What topic should Lumora investigate deeply?"
            rows={3}
            className="w-full rounded-none px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none resize-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          />
        </div>

        {/* Depth */}
        <div>
          <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Research Depth</label>
          <DepthSelector value={depth} onChange={setDepth} />
        </div>

        {/* Launch button */}
        <motion.button
          onClick={handleLaunch}
          disabled={!query.trim() || launching}
          whileHover={!launching ? { scale: 1.02, y: -1 } : {}}
          whileTap={!launching ? { scale: 0.98 } : {}}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-none text-white font-semibold text-sm disabled:opacity-40 transition-all relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            boxShadow: query.trim() && !launching ? '0 0 20px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
          }}
        >
          {/* Shimmer on hover */}
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
          />
          {launching ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Search size={15} />
            </motion.div>
          ) : (
            <Zap size={15} />
          )}
          <span className="relative z-10">{launching ? 'Launching Agent...' : 'Start Deep Research'}</span>
        </motion.button>
      </motion.div>

      {/* Jobs */}
      <div className="flex-1 space-y-3">
        <AnimatePresence>
          {jobs.map((job) => (
            <ResearchJobCard key={job.job_id} job={job} onDelete={handleDelete} />
          ))}
        </AnimatePresence>

        {jobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-14 text-center"
          >
            <div
              className="w-14 h-14 rounded-none flex items-center justify-center mb-4"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <Sparkles size={22} style={{ color: '#f59e0b' }} className="opacity-60" />
            </div>
            <p className="text-sm font-medium text-slate-400">No research jobs yet</p>
            <p className="text-xs text-slate-600 mt-1 max-w-[200px] leading-relaxed">
              Describe a topic and let the agent search the web, Arxiv, and Wikipedia
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
