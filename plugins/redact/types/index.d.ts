declare module 'claude-code' {
  interface PluginState {
    redact: {
      vault: Record<string, string>
      salt: string
      counts: Record<string, number>
      restored: number
    }
  }
}
