import { useSettingsStore } from '@/stores/settingsStore'

export function getHeaders(): HeadersInit {
  const { anthropicKey, openaiKey } = useSettingsStore.getState()
  return {
    'Content-Type': 'application/json',
    ...(anthropicKey ? { 'X-Anthropic-Key': anthropicKey } : {}),
    ...(openaiKey ? { 'X-OpenAI-Key': openaiKey } : {}),
  }
}

export function getApiBase(): string {
  return useSettingsStore.getState().backendUrl || '/api/v1'
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const base = getApiBase()
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options?.headers || {}) },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(`${res.status}: ${err.detail || res.statusText}`)
  }
  return res.json()
}
