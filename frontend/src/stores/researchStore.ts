import { create } from 'zustand'
import type { ResearchJob } from '@/types'

interface ResearchStore {
  jobs: ResearchJob[]
  selectedJobId: string | null
  setJobs: (jobs: ResearchJob[]) => void
  addJob: (job: ResearchJob) => void
  updateJob: (job_id: string, update: Partial<ResearchJob>) => void
  removeJob: (job_id: string) => void
  setSelectedJob: (id: string | null) => void
}

export const useResearchStore = create<ResearchStore>((set) => ({
  jobs: [],
  selectedJobId: null,
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((s) => ({ jobs: [job, ...s.jobs] })),
  updateJob: (job_id, update) =>
    set((s) => ({ jobs: s.jobs.map((j) => (j.job_id === job_id ? { ...j, ...update } : j)) })),
  removeJob: (job_id) => set((s) => ({ jobs: s.jobs.filter((j) => j.job_id !== job_id) })),
  setSelectedJob: (id) => set({ selectedJobId: id }),
}))
