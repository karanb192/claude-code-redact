#!/usr/bin/env node
// False-positive measurement for the redact rules against pinned public repositories.
// Run from the repo root: node tools/fp-corpus.mjs
// Shallow-fetches each pinned commit into /private/tmp/redact-fp-corpus/ (reused when present),
// scans every text file under 2 MB with scan(text, {pii:false}) and scan(text, {pii:true}),
// prints a summary and writes tools/fp-corpus-results.md. Always exits 0: the number is the point.

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { availableParallelism } from 'node:os'
import { fileURLToPath, pathToFileURL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

const CORPUS = [
  { repo: 'changesets/changesets', sha: 'c73949ba7b3160a4aa5729223335c190de1528f8', why: 'JS monorepo, yarn.lock' },
  { repo: 'psf/requests', sha: '611c6162cbc4ac2020a2f91c7cfa4f3abf9bbb60', why: 'Python, requirements, test fixtures' },
  { repo: 'spf13/cobra', sha: 'adbc8813901bba65827259daa8e22ff94ec1f30e', why: 'Go, go.sum' },
  { repo: 'GoogleCloudPlatform/microservices-demo', sha: '38e7348eb289eb5b87c0c6e8cb19ced0449dc389', why: 'Kubernetes manifests, Helm, Terraform' },
  { repo: 'docker/awesome-compose', sha: '30f4b7f6a6c3b0c0ecf4d4efb0de203c48d11562', why: 'docker-compose files with sample DB credentials' },
  { repo: 'tldr-pages/tldr', sha: '0653c297d0a88eb694e7b41fa72bd10bed7713db', why: 'docs-heavy Markdown, many languages' },
  { repo: 'twbs/bootstrap', sha: 'c1f9b9db4dd14d5353e34462ec589cdf8c7270d3', why: 'SVG data URIs in SCSS, minified dist' },
  { repo: 'highlightjs/cdn-release', sha: '47245af257d8d54d3f5181df0c0ec7e0113af3ec', why: 'minified JS heavy' },
  { repo: 'auth0/node-jsonwebtoken', sha: 'b924272f29192e12926b5414546f7c5bfcc9579d', why: 'sample JWTs, PEM test keys' },
  { repo: 'panva/jose', sha: '2a3a5259683f21b8ae42181a33cdc812330104be', why: 'JOSE test vectors, JWKs, UUIDs' },
  { repo: 'motdotla/dotenv', sha: '05215e09b73575b6f8e272658ca7849685651384', why: '.env docs and examples' },
]

const MAX_BYTES = 2 * 1024 * 1024
const FILE_TIMEOUT_MS = 15_000
const CACHE = '/private/tmp/redact-fp-corpus'
const EXCERPT_LEN = 40

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const RULES = path.join(ROOT, 'plugins/redact/hooks/rules.ts')
const RESULTS = path.join(HERE, 'fp-corpus-results.md')
const LABELS = path.join(HERE, 'fp-corpus-labels.json')

if (!isMainThread) {
  const { scan } = await import(pathToFileURL(workerData.rules).href)
  parentPort.on('message', ({ job, text }) => {
    const t0 = performance.now()
    const describe = (h) => {
      let line = 1
      for (let i = text.indexOf('\n'); i !== -1 && i < h.start; i = text.indexOf('\n', i + 1)) line++
      const lineStart = text.lastIndexOf('\n', h.start - 1) + 1
      const masked = (h.value.slice(0, 4) + '*'.repeat(Math.min(Math.max(h.value.length - 4, 0), 16))).slice(0, EXCERPT_LEN)
      const before = text.slice(Math.max(lineStart, h.start - (EXCERPT_LEN - masked.length)), h.start)
      const excerpt = (before + masked).replace(/[\r\n\t]/g, ' ')
      return { id: h.id, kind: h.kind, line, len: h.value.length, excerpt }
    }
    const secret = scan(text, { pii: false }).map(describe)
    const pii = scan(text, { pii: true }).filter((h) => h.kind === 'pii').map(describe)
    parentPort.postMessage({ job, secret, pii, ms: performance.now() - t0 })
  })
}

function git(cwd, ...args) {
  execFileSync('git', args, { cwd, stdio: ['ignore', 'ignore', 'pipe'], env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } })
}

function checkout({ repo, sha }) {
  const dir = path.join(CACHE, `${repo.replace('/', '__')}@${sha.slice(0, 12)}`)
  const marker = path.join(dir, '.git', 'fp-corpus-ok')
  if (fs.existsSync(marker)) return { dir, fetched: false }
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  git(dir, 'init', '-q')
  git(dir, 'fetch', '-q', '--depth', '1', `https://github.com/${repo}.git`, sha)
  git(dir, '-c', 'advice.detachedHead=false', 'checkout', '-q', 'FETCH_HEAD')
  fs.writeFileSync(marker, sha + '\n')
  return { dir, fetched: true }
}

function* walk(dir, base = dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (ent.name === '.git') continue
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) yield* walk(full, base)
    else if (ent.isFile()) yield path.relative(base, full)
  }
}

class Pool {
  constructor(size) {
    this.size = size
    this.slots = []
  }
  spawn() {
    const w = new Worker(fileURLToPath(import.meta.url), { workerData: { rules: RULES } })
    w.unref()
    return w
  }
  run(text) {
    return new Promise((resolve) => {
      const slot = this.slots.pop() ?? { worker: this.spawn() }
      const job = Math.random()
      const done = (result) => {
        clearTimeout(timer)
        slot.worker.off('message', onMessage)
        slot.worker.off('error', onError)
        resolve(result)
      }
      const onMessage = (msg) => {
        if (msg.job !== job) return
        this.slots.push(slot)
        done(msg)
      }
      const onError = (err) => {
        slot.worker.terminate()
        done({ error: String(err?.message ?? err) })
      }
      const timer = setTimeout(() => {
        slot.worker.terminate()
        done({ timeout: true })
      }, FILE_TIMEOUT_MS)
      slot.worker.on('message', onMessage)
      slot.worker.on('error', onError)
      slot.worker.postMessage({ job, text })
    })
  }
  async close() {
    await Promise.all(this.slots.map((s) => s.worker.terminate()))
    this.slots = []
  }
}

async function scanRepo(entry, pool, concurrency) {
  const t0 = performance.now()
  const out = { ...entry, files: 0, bytes: 0, skippedBinary: 0, skippedLarge: 0, timeouts: [], errors: [], secret: [], pii: [], slowest: null }
  let dir
  try {
    ;({ dir } = checkout(entry))
  } catch (err) {
    out.fetchError = String(err?.stderr ?? err?.message ?? err).trim().split('\n')[0]
    out.seconds = (performance.now() - t0) / 1000
    return out
  }
  const files = [...walk(dir)]
  let next = 0
  const workerLoop = async () => {
    while (next < files.length) {
      const rel = files[next++]
      const full = path.join(dir, rel)
      const st = fs.statSync(full)
      if (st.size > MAX_BYTES) {
        out.skippedLarge++
        continue
      }
      const buf = fs.readFileSync(full)
      if (buf.includes(0)) {
        out.skippedBinary++
        continue
      }
      out.files++
      out.bytes += buf.length
      const r = await pool.run(buf.toString('utf8'))
      if (r.timeout) out.timeouts.push(rel)
      else if (r.error) out.errors.push(`${rel}: ${r.error}`)
      else {
        for (const h of r.secret) out.secret.push({ repo: entry.repo, file: rel, ...h })
        for (const h of r.pii) out.pii.push({ repo: entry.repo, file: rel, ...h })
        if (!out.slowest || r.ms > out.slowest.ms) out.slowest = { file: rel, ms: r.ms }
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, workerLoop))
  const order = (a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line || (a.id < b.id ? -1 : 1))
  out.secret.sort(order)
  out.pii.sort(order)
  out.seconds = (performance.now() - t0) / 1000
  return out
}

const hitKey = (h) => `${h.repo}|${h.file}|${h.line}|${h.id}`
const cell = (s) => '`' + String(s).replace(/`/g, "'").replace(/\|/g, '\\|') + '`'
const pad = (s, n) => String(s).padEnd(n)

function loadLabels() {
  try {
    return JSON.parse(fs.readFileSync(LABELS, 'utf8'))
  } catch {
    return {}
  }
}

async function main() {
  const started = new Date()
  const t0 = performance.now()
  const rulesText = fs.readFileSync(RULES, 'utf8')
  const rulesHash = createHash('sha256').update(rulesText).digest('hex').slice(0, 16)
  const ruleCount = (rulesText.match(/^\s{4}id: '/gm) ?? []).length
  fs.mkdirSync(CACHE, { recursive: true })

  const concurrency = Math.max(1, Math.min(8, availableParallelism() - 1))
  const pool = new Pool(concurrency)
  const results = []
  for (const entry of CORPUS) {
    process.stderr.write(`scanning ${entry.repo}@${entry.sha.slice(0, 12)} ... `)
    const r = await scanRepo(entry, pool, concurrency)
    process.stderr.write(r.fetchError ? `fetch failed: ${r.fetchError}\n` : `${r.files} files, ${r.secret.length} secret, ${r.pii.length} pii, ${r.seconds.toFixed(1)}s\n`)
    results.push(r)
  }
  await pool.close()
  const wall = (performance.now() - t0) / 1000

  const labels = loadLabels()
  const allSecret = results.flatMap((r) => r.secret)
  const allPii = results.flatMap((r) => r.pii)
  const totalFiles = results.reduce((n, r) => n + r.files, 0)
  const totalBytes = results.reduce((n, r) => n + r.bytes, 0)
  const classes = { fixture: 0, 'real-shaped': 0, 'false positive': 0, unreviewed: 0 }
  for (const h of allSecret) {
    const l = labels[hitKey(h)]?.label
    classes[l in classes ? l : 'unreviewed']++
  }

  const summary = [
    '| repo | sha | files scanned | bytes | secret hits | pii hits | seconds |',
    '|---|---|--:|--:|--:|--:|--:|',
    ...results.map((r) =>
      r.fetchError
        ? `| ${r.repo} | ${r.sha.slice(0, 12)} | fetch failed | | | | ${r.seconds.toFixed(1)} |`
        : `| ${r.repo} | ${r.sha.slice(0, 12)} | ${r.files} | ${r.bytes} | ${r.secret.length} | ${r.pii.length} | ${r.seconds.toFixed(1)} |`,
    ),
    `| **total** | | **${totalFiles}** | **${totalBytes}** | **${allSecret.length}** | **${allPii.length}** | **${wall.toFixed(1)}** |`,
  ]

  const ruleIds = [...new Set([...allSecret, ...allPii].map((h) => h.id))].sort()
  const perRule = [
    `| rule | kind | ${results.map((r) => r.repo.split('/')[1]).join(' | ')} | total |`,
    `|---|---|${results.map(() => '--:').join('|')}|--:|`,
    ...ruleIds.map((id) => {
      const kind = (allSecret.find((h) => h.id === id) ?? allPii.find((h) => h.id === id)).kind
      const counts = results.map((r) => (kind === 'secret' ? r.secret : r.pii).filter((h) => h.id === id).length)
      return `| ${id} | ${kind} | ${counts.join(' | ')} | ${counts.reduce((a, b) => a + b, 0)} |`
    }),
  ]

  const labelNames = ['fixture', 'real-shaped', 'false positive', 'unreviewed']
  const secretIds = [...new Set(allSecret.map((h) => h.id))].sort()
  const perRuleLabel = [
    `| rule | ${labelNames.join(' | ')} | total |`,
    `|---|${labelNames.map(() => '--:').join('|')}|--:|`,
    ...secretIds.map((id) => {
      const hs = allSecret.filter((h) => h.id === id)
      const counts = labelNames.map((n) => hs.filter((h) => (labels[hitKey(h)]?.label ?? 'unreviewed') === n).length)
      return `| ${id} | ${counts.join(' | ')} | ${hs.length} |`
    }),
  ]

  const secretRows = allSecret.map((h, i) => {
    const l = labels[hitKey(h)]
    return `| ${i + 1} | ${h.repo} | ${cell(`${h.file}:${h.line}`)} | ${h.id} | ${cell(h.excerpt)} | ${l?.label ?? 'unreviewed'} | ${l?.note ?? ''} |`
  })
  const piiRows = allPii.map((h, i) => `| ${i + 1} | ${h.repo} | ${cell(`${h.file}:${h.line}`)} | ${h.id} | ${cell(h.excerpt)} |`)

  const skipped = results.map((r) => `- ${r.repo}: ${r.skippedBinary} binary, ${r.skippedLarge} over 2 MB, ${r.timeouts.length} timed out${r.timeouts.length ? ` (${r.timeouts.join(', ')})` : ''}, ${r.errors.length} errors${r.slowest ? `; slowest file ${r.slowest.file} at ${r.slowest.ms.toFixed(0)} ms` : ''}`)

  const md = [
    '# Redact false-positive corpus results',
    '',
    `Rerun: \`node tools/fp-corpus.mjs\``,
    '',
    `- Date: ${started.toISOString()}`,
    `- Node: ${process.version}`,
    `- Rules: plugins/redact/hooks/rules.ts, ${ruleCount} rules, sha256 prefix ${rulesHash}`,
    `- Corpus: ${results.length} public repositories at pinned commits, shallow-fetched into ${CACHE}`,
    `- Scanned: ${totalFiles} text files, ${totalBytes} bytes (${(totalBytes / 1048576).toFixed(1)} MB); files over 2 MB, binary files (null byte) and .git skipped`,
    `- Per-file timeout: ${FILE_TIMEOUT_MS / 1000} s; wall time ${wall.toFixed(1)} s with ${concurrency} worker threads`,
    '',
    '## Secret-rule hits, labelled',
    '',
    `Every secret hit below was opened at its line and labelled by hand. Labels live in tools/fp-corpus-labels.json, keyed by repo, file, line and rule; a hit with no label shows as unreviewed.`,
    '',
    `- fixture: a hand-written fake credential (made-up password or token, elided key) in a test, docs or sample file: **${classes.fixture}**`,
    `- real-shaped: a complete value in the exact format the rule targets (parseable PEM key, signed JWT, DB URL or Basic header with a password) published as a test vector or docs example: **${classes['real-shaped']}**`,
    `- false positive: the matched text is not a credential at all (code, type name, placeholder, URN, CLI word); genuinely ambiguous hits are counted here: **${classes['false positive']}**`,
    ...(classes.unreviewed ? [`- unreviewed (rules or corpus changed since labelling): **${classes.unreviewed}**`] : []),
    `- PII hits (pii mode, not labelled): **${allPii.length}**`,
    '',
    '## Summary',
    '',
    ...summary,
    '',
    '## Secret labels per rule',
    '',
    ...perRuleLabel,
    '',
    '## Hits per rule and repo',
    '',
    ...perRule,
    '',
    '## Skipped files',
    '',
    ...skipped,
    ...results.filter((r) => r.fetchError).map((r) => `- ${r.repo}: fetch failed: ${r.fetchError}`),
    '',
    '## Secret hits',
    '',
    'Excerpt: up to 40 characters of the line before the hit, then the first 4 characters of the matched value followed by asterisks.',
    '',
    '| # | repo | file:line | rule | excerpt | label | note |',
    '|--:|---|---|---|---|---|---|',
    ...secretRows,
    '',
    '## PII hits',
    '',
    '| # | repo | file:line | rule | excerpt |',
    '|--:|---|---|---|---|',
    ...piiRows,
    '',
  ].join('\n')

  try {
    fs.writeFileSync(RESULTS, md)
  } catch (err) {
    console.error(`could not write ${RESULTS}: ${err.message}`)
  }

  const w = [40, 13, 7, 11, 7, 6, 8]
  console.log()
  console.log([pad('repo', w[0]), pad('sha', w[1]), pad('files', w[2]), pad('bytes', w[3]), pad('secret', w[4]), pad('pii', w[5]), 'seconds'].join(' '))
  for (const r of results) {
    console.log([pad(r.repo, w[0]), pad(r.sha.slice(0, 12), w[1]), pad(r.fetchError ? 'FAILED' : r.files, w[2]), pad(r.bytes, w[3]), pad(r.secret.length, w[4]), pad(r.pii.length, w[5]), r.seconds.toFixed(1)].join(' '))
  }
  console.log([pad('total', w[0]), pad('', w[1]), pad(totalFiles, w[2]), pad(totalBytes, w[3]), pad(allSecret.length, w[4]), pad(allPii.length, w[5]), wall.toFixed(1)].join(' '))
  console.log()
  console.log('secret hits:')
  for (const h of allSecret) console.log(`  [${labels[hitKey(h)]?.label ?? 'unreviewed'}] ${h.repo} ${h.file}:${h.line} ${h.id} ${h.excerpt}`)
  console.log()
  console.log(`pii hits: ${allPii.length}`)
  for (const h of allPii) console.log(`  ${h.repo} ${h.file}:${h.line} ${h.id} ${h.excerpt}`)
  console.log()
  console.log(`secret labels: fixture ${classes.fixture}, real-shaped ${classes['real-shaped']}, false positive ${classes['false positive']}, unreviewed ${classes.unreviewed}`)
  console.log(`wrote ${RESULTS}`)
}

// last, so the class and helpers above are initialised before main runs
if (isMainThread) {
  await main().catch((err) => {
    console.error('fp-corpus: unexpected error:', err?.stack ?? err)
  })
  process.exit(0)
}
