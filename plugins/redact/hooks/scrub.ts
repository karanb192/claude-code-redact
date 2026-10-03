import type { ApiContentBlock } from 'claude-code'
import { scan, type Hit } from './rules'

export type Settings = { pii: boolean; quiet: boolean; off: ReadonlySet<string> }

export const PLACEHOLDER = /\[REDACTED:[A-Z0-9_]+#[0-9a-f]{8}\]/g

export function fnv1a(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

export function placeholder(hit: Hit, salt: string): string {
  return `[REDACTED:${hit.label}#${fnv1a(salt + hit.value)}]`
}

export type Redacted = { text: string; hits: Hit[]; pairs: Array<[string, string]> }

export function redactText(text: string, salt: string, cfg: Settings): Redacted {
  const hits = scan(text, { pii: cfg.pii, off: cfg.off })
  if (hits.length === 0) return { text, hits, pairs: [] }
  const pairs: Array<[string, string]> = []
  let out = ''
  let last = 0
  for (const h of hits) {
    const p = placeholder(h, salt)
    out += text.slice(last, h.start) + p
    last = h.end
    pairs.push([p, h.value])
  }
  out += text.slice(last)
  return { text: out, hits, pairs }
}

export type RedactedBlocks = { blocks: ApiContentBlock[]; hits: Hit[]; pairs: Array<[string, string]> }

export function redactBlocks(blocks: readonly ApiContentBlock[], salt: string, cfg: Settings): RedactedBlocks {
  const out: ApiContentBlock[] = []
  const hits: Hit[] = []
  const pairs: Array<[string, string]> = []
  for (const block of blocks) {
    if (block.type === 'text' && typeof block.text === 'string') {
      const r = redactText(block.text, salt, cfg)
      hits.push(...r.hits)
      pairs.push(...r.pairs)
      out.push(r.hits.length ? { ...block, text: r.text } : block)
    } else if (block.type === 'tool_result' && typeof block.content === 'string') {
      const r = redactText(block.content, salt, cfg)
      hits.push(...r.hits)
      pairs.push(...r.pairs)
      out.push(r.hits.length ? { ...block, content: r.text } : block)
    } else if (block.type === 'tool_result' && Array.isArray(block.content)) {
      const r = redactBlocks(block.content as ApiContentBlock[], salt, cfg)
      hits.push(...r.hits)
      pairs.push(...r.pairs)
      out.push(r.hits.length ? { ...block, content: r.blocks } : block)
    } else {
      out.push(block)
    }
  }
  return { blocks: out, hits, pairs }
}

export const WITHHELD = '[redact withheld this content: the redactor failed while scanning it]'

// Fail closed: a row the redactor could not scan is replaced, never stored as it came.
export function withhold(blocks: readonly ApiContentBlock[]): ApiContentBlock[] {
  return blocks.map(block => {
    if (block.type === 'text') return { ...block, text: WITHHELD }
    if (block.type === 'tool_result') return { ...block, content: WITHHELD }
    return block
  })
}

export function tally(hits: readonly Hit[]): Record<string, number> {
  const t: Record<string, number> = {}
  for (const h of hits) t[h.label] = (t[h.label] ?? 0) + 1
  return t
}

export function describe(t: Record<string, number>): string {
  return Object.entries(t).sort((a, b) => b[1] - a[1]).map(([label, n]) => `${n} ${label}`).join(', ')
}

export function restore(text: string, vault: Record<string, string>): { text: string; n: number } {
  let n = 0
  const out = text.replace(PLACEHOLDER, p => {
    const real = vault[p]
    if (real === undefined) return p
    n += 1
    return real
  })
  return { text: out, n }
}
