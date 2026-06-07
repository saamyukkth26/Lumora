import { apiFetch, getApiBase, getHeaders } from './client'
import type { ResearchJob } from '@/types'

export async function createResearchJob(query: string, depth: number, sessionId = ''): Promise<{ job_id: string; status: string }> {
  return apiFetch('/research/jobs', {
    method: 'POST',
    body: JSON.stringify({ query, depth, session_id: sessionId }),
  })
}

export async function fetchResearchJob(jobId: string): Promise<ResearchJob> {
  return apiFetch<ResearchJob>(`/research/jobs/${jobId}`)
}

export async function fetchResearchJobs(): Promise<ResearchJob[]> {
  return apiFetch<ResearchJob[]>('/research/jobs')
}

export async function deleteResearchJob(jobId: string): Promise<void> {
  await apiFetch(`/research/jobs/${jobId}`, { method: 'DELETE' })
}
