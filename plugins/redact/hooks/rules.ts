export type RuleKind = 'secret' | 'pii'

export type Rule = {
  id: string
  label: string
  kind: RuleKind
  pattern: RegExp
  group?: number
  verify?: (value: string) => boolean
  source: string
}

export type Hit = { id: string; label: string; kind: RuleKind; start: number; end: number; value: string }

const GITLEAKS = 'https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml'
const GITHUB_PATTERNS = 'https://docs.github.com/en/code-security/secret-scanning/introduction/supported-secret-scanning-patterns'

function entropy(s: string): number {
  if (s.length === 0) return 0
  const counts = new Map<string, number>()
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  let bits = 0
  for (const n of counts.values()) {
    const p = n / s.length
    bits -= p * Math.log2(p)
  }
  return bits
}

function luhn(digits: string): boolean {
  let sum = 0
  let double = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48
    if (double) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
    double = !double
  }
  return digits.length > 0 && sum % 10 === 0
}

const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

function verhoeff(digits: string): boolean {
  let c = 0
  for (let i = 0; i < digits.length; i++) {
    const d = digits.charCodeAt(digits.length - 1 - i) - 48
    c = VERHOEFF_D[c]![VERHOEFF_P[i % 8]![d]!]!
  }
  return digits.length > 0 && c === 0
}

function ibanValid(raw: string): boolean {
  const iban = raw.replace(/ /g, '')
  if (iban.length < 15 || iban.length > 34) return false
  const moved = iban.slice(4) + iban.slice(0, 4)
  let rem = 0
  for (const ch of moved) {
    const code = ch.charCodeAt(0)
    const n = code >= 65 ? code - 55 : code - 48
    rem = n > 9 ? (rem * 100 + n) % 97 : (rem * 10 + n) % 97
  }
  return rem === 1
}

const B64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

function base64urlDecode(s: string): string | null {
  let acc = 0
  let bits = 0
  let out = ''
  for (const ch of s.replace(/=+$/, '')) {
    let v = B64URL.indexOf(ch)
    if (ch === '+') v = 62
    else if (ch === '/') v = 63
    if (v < 0) return null
    acc = ((acc << 6) | v) & 0xffffff
    bits += 6
    if (bits >= 8) {
      bits -= 8
      out += String.fromCharCode((acc >> bits) & 0xff)
    }
  }
  return out
}

function jwtHeaderHasAlg(token: string): boolean {
  const decoded = base64urlDecode(token.slice(0, token.indexOf('.')))
  if (decoded === null) return false
  try {
    const header = JSON.parse(decoded)
    return header !== null && typeof header === 'object' && typeof header.alg === 'string'
  } catch {
    return false
  }
}

const NOT_SECRETS = new Set([
  'true', 'false', 'null', 'none', 'nil', 'undefined', 'changeme', 'password', 'passw0rd',
  'secret', 'token', 'placeholder', 'redacted', 'example', 'default', 'required', 'optional',
])

function plausibleSecret(v: string): boolean {
  const lower = v.toLowerCase()
  if (NOT_SECRETS.has(lower)) return false
  if (/^\$\{[^}]*\}$|^\$\(?[A-Za-z_]\w*\)?$|^%[A-Za-z_]\w*%$|^\{\{.*\}\}$|^<.*>$/.test(v)) return false
  if (v.includes('${') || v.includes('{{')) return false
  if (/^(?:\/|\.{1,2}\/|~\/|[A-Za-z]:\\|\.\w)/.test(v)) return false
  if (/^(?:https?|file):\/\//i.test(lower)) return false
  if (/^(?:process\.env|os\.environ|env\.|import\.meta\.env)/.test(v)) return false
  if (/^(.)\1*$/.test(v)) return false
  if (/x{4,}|\*{3,}|\.{3}|your[_-]?|example|placeholder|changeme|redacted|dummy|sample|insert[_-]?/i.test(v)) return false
  return true
}

function notFiller(v: string): boolean {
  return entropy(v) >= 2.5 && !/x{6,}|X{6,}|0{8,}|EXAMPLE/.test(v)
}

function quotedSecret(v: string): boolean {
  // lowercase words joined by - _ . with no digit read as enum values ('same-origin', 'github_webhook')
  return plausibleSecret(v) && entropy(v) >= 2.0 && !/^[a-z]+(?:[-_.][a-z]*)+$/.test(v)
}

function bareSecret(v: string): boolean {
  if (!plausibleSecret(v) || entropy(v) < 3.0) return false
  // a code identifier or member chain with no digit (getToken, process.env.KEY, my-secret-name) is not a value
  if (!/\d/.test(v) && /^[A-Za-z_$][\w$]*(?:[.\-][A-Za-z_$][\w$]*)*$/.test(v)) return false
  return true
}

function dbUrlHasRealPassword(url: string): boolean {
  const password = /^[^:]+:\/\/[^:@\/]*:([^@\/]*)@/.exec(url)?.[1] ?? ''
  return password.length > 0 && plausibleSecret(password) && !/^(?:pass|pwd|secret)$/i.test(password)
}

const FILE_TLDS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'pdf', 'js', 'mjs', 'ts', 'tsx', 'jsx', 'css', 'json',
  'html', 'md', 'txt', 'yaml', 'yml', 'xml', 'zip', 'gz', 'py', 'rb', 'go', 'rs', 'java', 'lock', 'map',
])

function emailPlausible(v: string): boolean {
  const at = v.lastIndexOf('@')
  const local = v.slice(0, at)
  const tld = v.slice(v.lastIndexOf('.') + 1).toLowerCase()
  return !local.endsWith('.') && !local.includes('..') && !FILE_TLDS.has(tld)
}

function digitsOf(v: string): string {
  return v.replace(/\D/g, '')
}

function phonePlausible(v: string): boolean {
  const d = digitsOf(v)
  if (d.length < 10 || d.length > 15) return false
  if (/^(\d)\1+$/.test(d)) return false
  if (/^\d+$/.test(v) && v.startsWith('1') && (v.length === 10 || v.length === 13)) return false
  if (/^\d{4}[-.\/]\d{2}[-.\/]\d{2}/.test(v)) return false
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(v)) return false
  return true
}

function cardPlausible(v: string): boolean {
  const d = digitsOf(v)
  if (d.length < 13 || d.length > 19) return false
  if (/ /.test(v) && /-/.test(v)) return false
  if (/^(\d)\1+$/.test(d)) return false
  return luhn(d)
}

function ssnPlausible(v: string): boolean {
  return !['078-05-1120', '219-09-9999', '123-45-6789'].includes(v)
}

export const RULES: readonly Rule[] = [
  {
    id: 'aws-access-key',
    label: 'AWS_KEY',
    kind: 'secret',
    pattern: /\b(?:AKIA|ASIA|ABIA|ACCA)[A-Z2-7]{16}\b/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'aws-secret-key',
    label: 'AWS_SECRET',
    kind: 'secret',
    pattern: /(?:aws[_.-]?secret[_.-]?(?:access[_.-]?)?key|secret[_.-]?access[_.-]?key)["'`]?[ \t]{0,5}(?::=|=>|[=:])[ \t]{0,5}["'`]?([A-Za-z0-9\/+]{40})(?![A-Za-z0-9\/+=])/gi,
    group: 1,
    verify: (v) => entropy(v) >= 3.5 && !/EXAMPLE/.test(v),
    source: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
  },
  {
    id: 'github-token',
    label: 'GITHUB_TOKEN',
    kind: 'secret',
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,255}|github_pat_[A-Za-z0-9_]{82,255})\b/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'gitlab-pat',
    label: 'GITLAB_TOKEN',
    kind: 'secret',
    pattern: /\bglpat-[A-Za-z0-9_-]{20,128}(?:\.[A-Za-z0-9_-]{2,128}){0,3}(?![\w-])/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'slack-token',
    label: 'SLACK_TOKEN',
    kind: 'secret',
    pattern: /\bxox[abprs]-[0-9]{8,14}-[A-Za-z0-9-]{10,250}(?![\w-])/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'slack-webhook',
    label: 'SLACK_WEBHOOK',
    kind: 'secret',
    pattern: /(?:https?:\/\/)?hooks\.slack\.com\/(?:services|workflows|triggers)\/[A-Za-z0-9+\/]{43,56}(?![A-Za-z0-9+\/])/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'stripe-live-key',
    label: 'STRIPE_KEY',
    kind: 'secret',
    pattern: /\b(?:sk|rk)_live_[A-Za-z0-9]{16,247}\b/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'sendgrid-key',
    label: 'SENDGRID_KEY',
    kind: 'secret',
    pattern: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}(?![\w-])/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'twilio-key',
    label: 'TWILIO_KEY',
    kind: 'secret',
    pattern: /\bSK[0-9a-fA-F]{32}\b/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'google-api-key',
    label: 'GOOGLE_API_KEY',
    kind: 'secret',
    pattern: /\bAIza[0-9A-Za-z_-]{35}(?![\w-])/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'google-oauth-secret',
    label: 'GOOGLE_OAUTH_SECRET',
    kind: 'secret',
    pattern: /\bGOCSPX-[A-Za-z0-9_-]{28}(?![\w-])/g,
    verify: notFiller,
    source: GITHUB_PATTERNS,
  },
  {
    id: 'anthropic-key',
    label: 'ANTHROPIC_KEY',
    kind: 'secret',
    pattern: /\bsk-ant-[a-z]{3,8}\d{2}-[A-Za-z0-9_-]{32,200}(?![\w-])/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'openai-key',
    label: 'OPENAI_KEY',
    kind: 'secret',
    pattern: /\bsk-(?:(?:proj|svcacct|admin)-[A-Za-z0-9_-]{40,250}|[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}|[A-Za-z0-9]{48})(?![\w-])/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'huggingface-token',
    label: 'HF_TOKEN',
    kind: 'secret',
    pattern: /\bhf_[A-Za-z]{34}\b/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'npm-token',
    label: 'NPM_TOKEN',
    kind: 'secret',
    pattern: /\bnpm_[A-Za-z0-9]{36}\b/g,
    verify: notFiller,
    source: GITLEAKS,
  },
  {
    id: 'pypi-token',
    label: 'PYPI_TOKEN',
    kind: 'secret',
    pattern: /\bpypi-AgEIcHlwaS5vcmc[A-Za-z0-9_-]{50,1000}(?![\w-])/g,
    source: GITLEAKS,
  },
  {
    id: 'azure-storage-key',
    label: 'AZURE_STORAGE_KEY',
    kind: 'secret',
    pattern: /(?:AccountKey|azure[_.-]?storage[_.-]?(?:account[_.-]?)?key|storage[_.-]?account[_.-]?key)["'`]?[ \t]{0,5}[=:][ \t]{0,5}["'`]?([A-Za-z0-9+\/]{86}==)/gi,
    group: 1,
    verify: notFiller,
    source: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string',
  },
  {
    id: 'jwt',
    label: 'JWT',
    kind: 'secret',
    pattern: /\beyJ[A-Za-z0-9_-]{10,4096}\.ey[A-Za-z0-9_-]{10,16384}\.[A-Za-z0-9_-]{0,4096}(?![\w-])/g,
    verify: jwtHeaderHasAlg,
    source: 'https://datatracker.ietf.org/doc/html/rfc7519',
  },
  {
    id: 'private-key',
    label: 'PRIVATE_KEY',
    kind: 'secret',
    // the body never holds five dashes, so a BEGIN without an END stops at the next marker instead of scanning 16 KB
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED |PGP )?PRIVATE KEY(?: BLOCK)?-----(?:[^-]|-{1,4}(?!-)){16,16384}?-----END (?:RSA |EC |DSA |OPENSSH |ENCRYPTED |PGP )?PRIVATE KEY(?: BLOCK)?-----/g,
    source: GITLEAKS,
  },
  {
    id: 'db-connection-url',
    label: 'DB_URL',
    kind: 'secret',
    pattern: /\b(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|rediss?|amqps?):\/\/[^\s:@\/'"`<>]{0,128}:[^\s@\/'"`<>]{1,256}@[^\s\/'"`<>?#@(){}\[\],;]{1,256}(?:[\/?#][^\s'"`<>(){}\[\],;]{0,1024})?/gi,
    verify: dbUrlHasRealPassword,
    source: GITHUB_PATTERNS,
  },
  {
    id: 'auth-header',
    label: 'AUTH_HEADER',
    kind: 'secret',
    pattern: /\bAuthorization["']?[ \t]{0,5}[:=][ \t]{0,5}["']?(?:Bearer|Basic|Token)[ \t]{1,5}([A-Za-z0-9._~+\/=-]{8,4096})/gi,
    group: 1,
    verify: plausibleSecret,
    source: 'https://www.rfc-editor.org/rfc/rfc9110#name-authorization',
  },
  {
    id: 'generic-secret-quoted',
    label: 'SECRET',
    kind: 'secret',
    pattern: /(?:api[_-]?key|secret(?:[_-]?key)?|token|password|passwd|pwd|auth|credential)s?["'`]?[ \t]{0,5}(?::=|=>|[=:])[ \t]{0,5}["'`]([^\s"'`]{8,256})["'`]/gi,
    group: 1,
    verify: quotedSecret,
    source: GITLEAKS,
  },
  {
    id: 'generic-secret',
    label: 'SECRET',
    kind: 'secret',
    pattern: /(?:api[_-]?key|secret(?:[_-]?key)?|token|password|passwd|pwd|auth|credential)s?["'`]?[ \t]{0,5}(?::=|=>|[=:])[ \t]{0,5}([^\s"'`;,(){}<>\[\]]{8,256})(?![^\s"'`;,(){}<>\[\]])/gi,
    group: 1,
    verify: bareSecret,
    source: GITLEAKS,
  },
  {
    id: 'email',
    label: 'EMAIL',
    kind: 'pii',
    // a colon or slash before the local part means URL userinfo (user:token@host), not an address
    pattern: /(?:^|mailto:|[^\w.%+\/:-])([A-Za-z0-9][A-Za-z0-9._%+-]{0,63}@(?:[A-Za-z0-9-]{1,63}\.){1,8}[A-Za-z]{2,24})\b/gm,
    group: 1,
    verify: emailPlausible,
    source: 'https://www.rfc-editor.org/rfc/rfc5322#section-3.4.1',
  },
  {
    id: 'payment-card',
    label: 'CARD',
    kind: 'pii',
    pattern: /(?:^|[^\w.+\/-])([2-6](?:[ -]?\d){12,18})(?![\w-]|[ -]\d)/gm,
    group: 1,
    verify: cardPlausible,
    source: 'https://en.wikipedia.org/wiki/Luhn_algorithm',
  },
  {
    id: 'aadhaar',
    label: 'AADHAAR',
    kind: 'pii',
    pattern: /(?:^|[^\w.+\/-])([2-9]\d{3}([ -]?)\d{4}\2\d{4})(?![\w-]|[ -]\d)/gm,
    group: 1,
    verify: (v) => verhoeff(digitsOf(v)),
    source: 'https://uidai.gov.in/en/my-aadhaar/about-your-aadhaar.html',
  },
  {
    id: 'us-ssn',
    label: 'SSN',
    kind: 'pii',
    pattern: /(?:^|[^\w.\/-])((?!000|666|9\d\d)\d{3}-(?!00)\d{2}-(?!0000)\d{4})(?![\w-]|\.\d)/gm,
    group: 1,
    verify: ssnPlausible,
    source: 'https://www.ssa.gov/employer/randomization.html',
  },
  {
    id: 'iban',
    label: 'IBAN',
    kind: 'pii',
    pattern: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){2,7}(?: ?[A-Z0-9]{1,3})?\b/g,
    verify: ibanValid,
    source: 'https://en.wikipedia.org/wiki/International_Bank_Account_Number',
  },
  {
    id: 'india-pan',
    label: 'PAN',
    kind: 'pii',
    pattern: /\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b/g,
    source: 'https://en.wikipedia.org/wiki/Permanent_account_number',
  },
  {
    id: 'phone',
    label: 'PHONE',
    kind: 'pii',
    pattern: /(?:^|[^\w+.\/@#-])(\+[1-9]\d{9,14}|\+[1-9]\d{0,2}[ .-]?\(?\d{1,4}\)?(?:[ .-]\d{2,5}){1,4}|\(\d{3}\)[ .-]?\d{3}[ .-]\d{4}|\d{3}([.-])\d{3}\2\d{4}|[6-9]\d{4}[ -]\d{5}|0\d{2,4}[ -]\d{3,4}[ -]\d{3,4})(?![\w-]|[ .)]\d)/gm,
    group: 1,
    verify: phonePlausible,
    source: 'https://www.itu.int/rec/T-REC-E.164',
  },
]

const PLACEHOLDER = /\[REDACTED:[A-Z0-9_]{1,64}#[0-9a-fA-F]{1,64}\]/g

type Compiled = { re: RegExp; indexed: boolean }
const compiled = new Map<RegExp, Compiled>()

function compile(pattern: RegExp): Compiled {
  let c = compiled.get(pattern)
  if (c) return c
  const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'
  try {
    c = { re: new RegExp(pattern.source, flags.includes('d') ? flags : flags + 'd'), indexed: true }
  } catch {
    c = { re: new RegExp(pattern.source, flags), indexed: false }
  }
  compiled.set(pattern, c)
  return c
}

type Ranked = Hit & { order: number }

export function scan(text: string, opts: { pii?: boolean; off?: ReadonlySet<string> } = {}): Hit[] {
  const spans: [number, number][] = []
  PLACEHOLDER.lastIndex = 0
  let masked = text
  for (let m = PLACEHOLDER.exec(text); m !== null; m = PLACEHOLDER.exec(text)) {
    spans.push([m.index, m.index + m[0].length])
  }
  if (spans.length > 0) {
    // spaces keep every offset stable while no rule can match through a placeholder
    let out = ''
    let at = 0
    for (const [s, e] of spans) {
      out += text.slice(at, s) + ' '.repeat(e - s)
      at = e
    }
    masked = out + text.slice(at)
  }

  const found: Ranked[] = []
  RULES.forEach((rule, order) => {
    if (rule.kind === 'pii' && !opts.pii) return
    if (opts.off?.has(rule.id)) return
    const { re, indexed } = compile(rule.pattern)
    const g = rule.group ?? 0
    re.lastIndex = 0
    for (let m = re.exec(masked); m !== null; m = re.exec(masked)) {
      if (m[0] === '') {
        re.lastIndex++
        continue
      }
      const raw = m[g]
      if (raw === undefined || raw === '') continue
      const start = indexed ? (m.indices?.[g]?.[0] ?? -1) : m.index + m[0].lastIndexOf(raw)
      if (start < 0) continue
      const end = start + raw.length
      const value = text.slice(start, end)
      const inPlaceholder = spans.some(([s, e]) => start < e && end > s)
      if (inPlaceholder || (rule.verify && !rule.verify(value))) {
        re.lastIndex = m.index + 1
        continue
      }
      found.push({ id: rule.id, label: rule.label, kind: rule.kind, start, end, value, order })
    }
    re.lastIndex = 0
  })

  found.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start) || a.order - b.order)
  const hits: Hit[] = []
  let lastEnd = -1
  for (const h of found) {
    if (h.start < lastEnd) continue
    hits.push({ id: h.id, label: h.label, kind: h.kind, start: h.start, end: h.end, value: h.value })
    lastEnd = h.end
  }
  return hits
}
