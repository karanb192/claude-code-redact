import { describe, expect, test } from 'claude-code/testing'
import type { CommandRunInput, On, SessionStartInput } from 'claude-code'

// The session.append path is not in this file: on Claude Code 2.1.288 the kit
// cannot answer session.append beneath the plugins (every answer must follow a
// next, and a test stub has nothing beneath it). scrub.test.ts covers the
// rewrite itself; the headless probe in the README covers the hook end to end.

const start: SessionStartInput = { surface: 'terminal', isInteractive: true, cwd: '/work' }
const run: CommandRunInput = {
  command: 'redact', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 },
}
const UNKNOWN = '[REDACTED:AWS_KEY#00000000]'

describe('register', () => {
  test('registers /redact on session.start', async ($, on) => {
    const names: string[] = []
    on('command.register', ($, e) => { names.push(e.name); return { value: { command: e.name } } })
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    await $.session.start(start)
    expect(names).toEqual(['redact'])
  })

  test('/redact says nothing was hidden in a fresh session, secrets only', async ($, on) => {
    on('ui.log', () => ({ value: undefined }))
    expect((await $.command.run(run)).text).toBe('redact: nothing hidden yet this session. Scanning secrets only (set pii to true for email, phone, cards, national ids).')
  })

  test('/redact names PII scanning when the option is on', { options: { pii: true } }, async ($, on) => {
    on('ui.log', () => ({ value: undefined }))
    expect((await $.command.run(run)).text).toBe('redact: nothing hidden yet this session. Scanning secrets and PII.')
  })

  test('Edit, Write and NotebookEdit pass through unchanged when no placeholder is known', async ($, on) => {
    const seen: string[] = []
    on('tool.call', { tool: 'Edit' }, ($, e) => { seen.push(e.old_string, e.new_string); return { result: 'ok' } })
    on('tool.call', { tool: 'Write' }, ($, e) => { seen.push(e.content); return { result: 'ok' } })
    on('tool.call', { tool: 'NotebookEdit' }, ($, e) => { seen.push(e.new_source); return { result: 'ok' } })
    await $.tool.call({ tool: 'Edit', file_path: '/work/.env', old_string: `A=${UNKNOWN}`, new_string: `B=${UNKNOWN}` })
    await $.tool.call({ tool: 'Write', file_path: '/work/x', content: `C=${UNKNOWN}` })
    await $.tool.call({ tool: 'NotebookEdit', notebook_path: '/work/n.ipynb', new_source: `D=${UNKNOWN}` })
    expect(seen).toEqual([`A=${UNKNOWN}`, `B=${UNKNOWN}`, `C=${UNKNOWN}`, `D=${UNKNOWN}`])
    expect((await $.command.run(run)).text).toMatch(/^redact: nothing hidden yet/)
  })

  test('Bash is never touched', async ($, on) => {
    const seen: string[] = []
    on('tool.call', { tool: 'Bash' }, ($, e) => { seen.push(e.command); return { result: 'ok' } })
    await $.tool.call({ tool: 'Bash', command: `echo ${UNKNOWN}` })
    expect(seen).toEqual([`echo ${UNKNOWN}`])
  })

  test('the standing note is appended to the env section and stands alone when core omits it', async ($, on) => {
    on('prompt.section', ($, e) => ({ text: e.text }))
    const r = await $.prompt.section({ name: 'env_info_simple', text: 'Working directory: /work' })
    expect(r.text).toMatch(/^Working directory: \/work\n\nRedaction notice: /)
    const empty = await $.prompt.section({ name: 'env_info_simple', text: null })
    expect(empty.text).toMatch(/^Redaction notice: /)
    const other = await $.prompt.section({ name: 'memory', text: 'untouched' })
    expect(other.text).toBe('untouched')
  })

  test('gate: no model call and no tool approval while the mod runs', async ($, on) => {
    let model = 0
    on('model.complete', () => { model += 1; return { deny: 'gate' } })
    on('model.fork', () => { model += 1; return { deny: 'gate' } })
    on('tool.call', { tool: 'Write' }, () => ({ result: 'ok' }))
    on('ui.log', () => ({ value: undefined }))
    await $.tool.call({ tool: 'Write', file_path: '/work/x', content: UNKNOWN })
    await $.command.run(run)
    expect(model).toBe(0)
  })
})

describe('prompt.submit', () => {
  const KEY = 'AKIAQ4ZKX7TR2MDPLW5B'
  const ONE = /\[REDACTED:AWS_KEY#[0-9a-f]{8}\]/
  function submitStub(on: On) {
    const sent: string[] = []
    const lines: string[] = []
    on('prompt.submit', ($, e) => { sent.push(e.text); return { text: e.text } })
    on('ui.log', ($, e) => { lines.push(e.text); return { value: undefined } })
    return { sent, lines }
  }

  test('a key typed in the prompt is replaced before the engine queues it, and the line says so', async ($, on) => {
    const { sent, lines } = submitStub(on)
    await $.prompt.submit({ text: `my key is ${KEY} keep it`, origin: { kind: 'composer' }, wait: false })
    expect(sent).toEqual([expect.stringMatching(/^my key is \[REDACTED:AWS_KEY#[0-9a-f]{8}\] keep it$/)])
    expect(lines).toEqual(['redact: hid 1 AWS_KEY in your prompt'])
  })

  test('a clean prompt passes through as the same text with no line', async ($, on) => {
    const { sent, lines } = submitStub(on)
    await $.prompt.submit({ text: 'rename the function', origin: { kind: 'composer' }, wait: false })
    expect(sent).toEqual(['rename the function'])
    expect(lines).toEqual([])
  })

  test('Edit gets the real value back for a placeholder the prompt created; Bash does not', async ($, on) => {
    const { sent } = submitStub(on)
    const edits: string[] = []
    const shells: string[] = []
    on('tool.call', { tool: 'Edit' }, ($, e) => { edits.push(e.old_string, e.new_string); return { result: 'ok' } })
    on('tool.call', { tool: 'Bash' }, ($, e) => { shells.push(e.command); return { result: 'ok' } })
    await $.prompt.submit({ text: `SECRET=${KEY}`, origin: { kind: 'composer' }, wait: false })
    const p = sent[0]?.match(ONE)?.[0]
    if (!p) throw new Error('no placeholder in the submitted prompt')
    await $.tool.call({ tool: 'Edit', file_path: '/work/.env', old_string: `SECRET=${p}`, new_string: `# moved\nSECRET=${p}` })
    await $.tool.call({ tool: 'Bash', command: `echo ${p}` })
    expect(edits).toEqual([`SECRET=${KEY}`, `# moved\nSECRET=${KEY}`])
    expect(shells).toEqual([`echo ${p}`])
    expect((await $.command.run({ command: 'redact', args: '', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } })).text)
      .toBe('redact: hid 1 values this session (1 AWS_KEY); restored 2 placeholders inside Edit, Write and NotebookEdit arguments. Scanning secrets only (set pii to true for email, phone, cards, national ids).')
  })

  test('with pii on, an email in the prompt is hidden; off by default', { options: { pii: true } }, async ($, on) => {
    const { sent } = submitStub(on)
    await $.prompt.submit({ text: 'mail jane.doe@example.com now', origin: { kind: 'composer' }, wait: false })
    expect(sent).toEqual([expect.stringMatching(/^mail \[REDACTED:EMAIL#[0-9a-f]{8}\] now$/)])
  })

  test('quiet keeps the line off', { options: { quiet: true } }, async ($, on) => {
    const { sent, lines } = submitStub(on)
    await $.prompt.submit({ text: KEY, origin: { kind: 'composer' }, wait: false })
    expect(sent).toEqual([expect.stringMatching(ONE)])
    expect(lines).toEqual([])
  })
})
