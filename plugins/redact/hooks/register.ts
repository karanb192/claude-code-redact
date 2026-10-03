import type { EngineInterface, PluginOptions, Register, SessionAppendInput } from 'claude-code'
import { atom, read, update } from 'claude-code'
import { describe, fnv1a, redactBlocks, redactText, restore, tally, withhold, type Settings } from './scrub'

const vault = atom({ plugin: 'redact', key: 'vault' } as const, {} as Record<string, string>)
const salt = atom({ plugin: 'redact', key: 'salt' } as const, '')
const counts = atom({ plugin: 'redact', key: 'counts' } as const, {} as Record<string, number>)
const restored = atom({ plugin: 'redact', key: 'restored' } as const, 0)

const NOTE = [
  'Redaction notice: strings shaped like [REDACTED:LABEL#hex] are placeholders a local redactor inserted',
  'in place of secrets and personal data before you saw them. The real value is restored only when a',
  'placeholder is passed verbatim in Edit, Write or NotebookEdit arguments. Never ask the person for the',
  'hidden value, never try to reconstruct it, and never rely on a placeholder in a shell command.',
].join(' ')

const DOORS: Record<string, string> = {
  'prompt': 'your prompt',
  'command': 'a command result',
  'response': "Claude's reply",
  'tool-result': 'a tool result',
  'tool-message': 'a tool message',
  'delivery': 'a delivered message',
  'attachment': 'an attachment',
  'hook-context': 'hook context',
  'note': 'a plugin note',
  'compaction': 'the compaction summary',
  'notice': 'a notice',
}

function settings(options: PluginOptions): Settings {
  const off = typeof options.off === 'string' ? options.off.split(',').map(s => s.trim()).filter(Boolean) : []
  return { pii: options.pii === true, quiet: options.quiet === true, off: new Set(off) }
}

async function ensureSalt($: EngineInterface): Promise<string> {
  const have = await read($, salt)
  if (have) return have
  const fresh = fnv1a(String(Math.random()) + String(Date.now())) + fnv1a(String(Math.random()) + String(performance.now()))
  await update($, salt, () => fresh)
  return fresh
}

async function remember($: EngineInterface, pairs: ReadonlyArray<readonly [string, string]>, found: Record<string, number>, cfg: Settings, place: string): Promise<void> {
  await update($, vault, v => ({ ...v, ...Object.fromEntries(pairs) }))
  await update($, counts, c => {
    const total: Record<string, number> = { ...c }
    for (const [label, n] of Object.entries(found)) total[label] = (total[label] ?? 0) + n
    return total
  })
  if (!cfg.quiet) $.ui.log(`redact: hid ${describe(found)} in ${place}`)
}

function where(e: SessionAppendInput): string {
  const agent = e.agentId ? ' (subagent)' : ''
  return (DOORS[e.door] ?? e.door) + agent
}

export const register: Register = (on, options) => {
  const cfg = settings(options)

  on('session.start', async ($, e, next) => {
    const started = await next(e)
    await $.command.register({ name: 'redact', description: 'Show what redact hid in this session' })
    return started
  })

  // The typed prompt is scrubbed here, before the engine queues it, so the
  // queue record, the on-screen echo and the command args never hold the value.
  on('prompt.submit', async ($, e, next) => {
    const s = await ensureSalt($)
    const r = redactText(e.text, s, cfg)
    if (r.hits.length === 0) return next(e)
    await remember($, r.pairs, tally(r.hits), cfg, 'your prompt')
    return next({ ...e, text: r.text })
  })

  on('session.append', async ($, e, next) => {
    const s = await ensureSalt($)
    const r = redactBlocks(e.message.content, s, cfg)
    if (r.hits.length === 0) return next(e)
    await remember($, r.pairs, tally(r.hits), cfg, where(e))
    return next({ ...e, message: { ...e.message, content: r.blocks } })
  }).catch(($, e, next) => {
    if (next.called) return next(e)
    $.ui.log(`redact: scanning failed, so this row was withheld from the model (${where(e)})`)
    return next({ ...e, message: { ...e.message, content: withhold(e.message.content) } })
  })

  on('tool.call', { tool: ['Edit', 'Write', 'NotebookEdit'] }, async ($, e, next) => {
    const v = await read($, vault)
    if (e.tool === 'Edit') {
      const o = restore(e.old_string, v)
      const n = restore(e.new_string, v)
      if (o.n + n.n === 0) return next(e)
      await update($, restored, k => k + o.n + n.n)
      return next({ ...e, old_string: o.text, new_string: n.text })
    }
    if (e.tool === 'Write') {
      const c = restore(e.content, v)
      if (c.n === 0) return next(e)
      await update($, restored, k => k + c.n)
      return next({ ...e, content: c.text })
    }
    if (e.tool === 'NotebookEdit') {
      const c = restore(e.new_source, v)
      if (c.n === 0) return next(e)
      await update($, restored, k => k + c.n)
      return next({ ...e, new_source: c.text })
    }
    return next(e)
  })

  on('prompt.section', { name: 'env_info_simple' }, async ($, e, next) => {
    const r = await next(e)
    return { text: r.text ? `${r.text}\n\n${NOTE}` : NOTE }
  })

  on('command.run', { command: 'redact' }, async $ => {
    const c = await read($, counts)
    const k = await read($, restored)
    const total = Object.values(c).reduce((a, b) => a + b, 0)
    const rules = cfg.pii ? 'secrets and PII' : 'secrets only (set pii to true for email, phone, cards, national ids)'
    if (total === 0) return { text: `redact: nothing hidden yet this session. Scanning ${rules}.` }
    return { text: `redact: hid ${total} values this session (${describe(c)}); restored ${k} placeholders inside Edit, Write and NotebookEdit arguments. Scanning ${rules}.` }
  })
}
