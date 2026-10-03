import { describe, expect, test } from 'claude-code/testing'
import type { ApiContentBlock } from 'claude-code'
import { PLACEHOLDER, WITHHELD, fnv1a, redactBlocks, redactText, restore, tally, describe as describeCounts, withhold, type Settings } from '../hooks/scrub'

const KEY = 'AKIAQ4ZKX7TR2MDPLW5B'
const EMAIL = 'jane.doe@example.com'
const SALT = 'test-salt'
const cfg = (over: Partial<Settings> = {}): Settings => ({ pii: false, quiet: false, off: new Set(), ...over })
const one = /^\[REDACTED:[A-Z0-9_]+#[0-9a-f]{8}\]$/

function at<T>(rows: readonly T[], i = 0): T {
  const row = rows[i]
  if (row === undefined) throw new Error(`no row ${i}`)
  return row
}

describe('redactText', () => {
  test('replaces a key with a placeholder and keeps the text around it', async () => {
    const r = redactText(`here is my key ${KEY} please use it`, SALT, cfg())
    expect(r.text).toMatch(/^here is my key \[REDACTED:[A-Z0-9_]+#[0-9a-f]{8}\] please use it$/)
    expect(r.hits.length).toBe(1)
    expect(r.pairs).toEqual([[expect.stringMatching(one), KEY]])
  })

  test('the same value and salt give the same placeholder, a different salt a different one', async () => {
    const a = redactText(KEY, SALT, cfg()).text
    const b = redactText(`x ${KEY} y`, SALT, cfg()).text
    const c = redactText(KEY, 'other', cfg()).text
    expect(a).toMatch(one)
    expect(b).toBe(`x ${a} y`)
    expect(c).not.toBe(a)
  })

  test('clean text comes back as the same string with no hits', async () => {
    const text = 'rename the function and add a test'
    const r = redactText(text, SALT, cfg())
    expect(r).toEqual({ text, hits: [], pairs: [] })
  })

  test('PII is left alone until pii is on', async () => {
    expect(redactText(`mail ${EMAIL}`, SALT, cfg()).text).toContain(EMAIL)
    const on = redactText(`mail ${EMAIL}`, SALT, cfg({ pii: true }))
    expect(on.text).not.toContain(EMAIL)
    expect(on.text).toMatch(/^mail \[REDACTED:EMAIL#[0-9a-f]{8}\]$/)
  })

  test('a rule in off is skipped', async () => {
    expect(redactText(`key ${KEY}`, SALT, cfg({ off: new Set(['aws-access-key']) })).text).toContain(KEY)
  })

  test('a placeholder already in the text is not matched again', async () => {
    const once = redactText(KEY, SALT, cfg()).text
    const twice = redactText(once, SALT, cfg())
    expect(twice.hits).toEqual([])
    expect(twice.text).toBe(once)
  })
})

describe('redactBlocks', () => {
  test('rewrites text blocks, string tool results and nested tool result blocks; keeps the rest', async () => {
    const image: ApiContentBlock = { type: 'image', source: { data: 'abc' } }
    const blocks: ApiContentBlock[] = [
      { type: 'text', text: `a ${KEY}` },
      { type: 'tool_result', tool_use_id: 't1', content: `b ${KEY}` },
      { type: 'tool_result', tool_use_id: 't2', content: [{ type: 'text', text: `c ${KEY}` }, image] },
      image,
      { type: 'thinking', thinking: KEY },
    ]
    const r = redactBlocks(blocks, SALT, cfg())
    expect(r.hits.length).toBe(3)
    expect(JSON.stringify(r.blocks.slice(0, 3))).not.toContain(KEY)
    expect(at(r.blocks, 1)).toMatchObject({ type: 'tool_result', tool_use_id: 't1' })
    const nested = at(r.blocks, 2).content as ApiContentBlock[]
    expect(at(nested, 1)).toBe(image)
    expect(at(r.blocks, 3)).toBe(image)
    expect(at(r.blocks, 4)).toBe(at(blocks, 4))
  })

  test('a clean block is the same object, not a copy', async () => {
    const block: ApiContentBlock = { type: 'text', text: 'nothing here' }
    expect(at(redactBlocks([block], SALT, cfg()).blocks)).toBe(block)
  })
})

describe('restore', () => {
  test('puts the real value back for a known placeholder and leaves an unknown one', async () => {
    const r = redactText(`SECRET=${KEY}`, SALT, cfg())
    const vault = Object.fromEntries(r.pairs)
    const p = at(r.pairs)[0]
    expect(restore(`SECRET=${p}\n# ${p}`, vault)).toEqual({ text: `SECRET=${KEY}\n# ${KEY}`, n: 2 })
    expect(restore('v=[REDACTED:AWS_KEY#00000000]', vault)).toEqual({ text: 'v=[REDACTED:AWS_KEY#00000000]', n: 0 })
  })
})

describe('the rest', () => {
  test('withhold replaces text and tool results, keeps ids and media', async () => {
    const image: ApiContentBlock = { type: 'image', source: {} }
    const out = withhold([{ type: 'text', text: KEY }, { type: 'tool_result', tool_use_id: 't1', content: KEY, is_error: true }, image])
    expect(out).toEqual([{ type: 'text', text: WITHHELD }, { type: 'tool_result', tool_use_id: 't1', content: WITHHELD, is_error: true }, image])
    expect(JSON.stringify(out)).not.toContain(KEY)
  })

  test('tally and describe count by label, most frequent first', async () => {
    const r = redactText(`${KEY} ${EMAIL} ${EMAIL}`, SALT, cfg({ pii: true }))
    const t = tally(r.hits)
    expect(t).toEqual({ AWS_KEY: 1, EMAIL: 2 })
    expect(describeCounts(t)).toBe('2 EMAIL, 1 AWS_KEY')
  })

  test('fnv1a is stable and eight hex chars', async () => {
    expect(fnv1a('')).toBe('811c9dc5')
    expect(fnv1a('a')).toBe('e40c292c')
    expect(fnv1a(KEY)).toMatch(/^[0-9a-f]{8}$/)
    expect(PLACEHOLDER.source).toContain('REDACTED')
  })
})
