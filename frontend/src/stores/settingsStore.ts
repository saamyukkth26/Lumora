import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  anthropicKey: string
  openaiKey: string
  googleKey: string
  selectedModel: string
  backendUrl: string
  setAnthropicKey: (key: string) => void
  setOpenaiKey: (key: string) => void
  setGoogleKey: (key: string) => void
  setSelectedModel: (model: string) => void
  setBackendUrl: (url: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      anthropicKey: '',
      openaiKey: '',
      googleKey: '',
      selectedModel: 'gemini-2.5-flash',
      backendUrl: '/api/v1',
      setAnthropicKey: (key) => set({ anthropicKey: key }),
      setOpenaiKey: (key) => set({ openaiKey: key }),
      setGoogleKey: (key) => set({ googleKey: key }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setBackendUrl: (url) => set({ backendUrl: url }),
    }),
    { name: 'lumora-settings' }
  )
)
