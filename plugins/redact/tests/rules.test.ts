import { describe, expect, test } from 'claude-code/testing'
import { scan, RULES } from '../hooks/rules'

type Positive = { text: string; value: string }
type Case = { id: string; label: string; positives: Positive[]; negatives: string[] }

// Fixtures are joined from parts so secret scanners, push protection and this mod itself
// never see a whole token in the source file.
const cat = (...parts: string[]): string => parts.join('')

const AKIA = cat('AK', 'IAZ7Q2M4X6V3B5N7K2')
const ASIA = cat('AS', 'IAJ4T6Y2R5W3E7U2I4')
const ABIA = cat('AB', 'IAP3L5K7J2H4G6F3D5')
const AWS_SECRET = [
  cat('ulZfUvdsU7QV2eE8oDK9', '+LSGd1T8YaIeFAENK1Kk'),
  cat('bTYgFFTGDVgehX3E5P9w', '4T/LiR0g1c+xMMe6MnDl'),
  cat('dpeBYmPVRcKtWy0Ywn/8', 'RuVymwkIKHxGh92sKxb8'),
] as const
const GHP = cat('gh', 'p_', 'FsypJPdBdA4WCgo30YdzsLt4tEtEyxDDBuNQ')
const GHO = cat('gh', 'o_', 'DYQzQpf9hvbioqAEDLkEy2qLW2CwWiwlcmAR')
const GHU = cat('gh', 'u_', 'alg4prs802M7MaFdL1sPtAAQDLCTVfV4AX85')
const GH_PAT = cat('github', '_pat_', 'khqE2t30Uw8cDpslAsiqglOrmLxao2BFyLbFqWkin1NsCZVUfnj3W0528xzFSIfQVMmOB28JyF1zu1NS1o')
const GLPAT = [
  cat('gl', 'pat-', '6nHSchOA-GK-qzzztWjM'),
  cat('gl', 'pat-', 'dWY6vWcmIi4bgFMft1yj'),
  cat('gl', 'pat-', 'ZKlaXq8ChoiAgAqquwBPHG57ogd', '.01.', 'EXTlUFWc1'),
] as const
const SLACK = [
  cat('xo', 'xb-', '1234567890-1234567890123-', '4z8NsCjKayFmY7irzjkZ8wru'),
  cat('xo', 'xp-', '1234567890-1234567890-1234567890123-', 'cf9cb79a4f7480a8ebc3dab64044e06a'),
  cat('xo', 'xr-', '987654321098-', 'xgIxaRnUZmGr5RXP8JGakrmZGBLwzn'),
] as const
const HOOKS = [
  cat('https://hooks.', 'slack.com/services/', 'TFS9XEYDG/BK2FJMM70/', 'Sjo3rut1uVG9iWFRCetbd3ht'),
  cat('hooks.', 'slack.com/services/', 'T0K2FJMM7/B0FS9XEYD/', 'WKRNN3bxPj1VBXyp7R99teFV'),
  cat('https://hooks.', 'slack.com/workflows/', 'TFS9XEYDG/', 'd1UjPxcFWJ5aCO78qbq8R4AR3wD5DOJziGnGvfqW'),
] as const
const STRIPE = [
  cat('sk', '_live_', 'nwOFXOaYo6ChDQHBEY6SFY3e'),
  cat('rk', '_live_', 'YjLIkYyAEOeLrysbOF3Ay0Wt'),
  cat('sk', '_live_', '4Q7x2uFWZifv0fWOnNcg6JQTthGw24WHRFVmq5onoM9PI16esCWkQFcgAStqYQY2lkC25wSviAgFucip1OCtZwuVJMUZuqzzwrb'),
] as const
const SENDGRID = [
  cat('SG', '.e5knhnKB9adyvmiKcDbZgn', '.hJOPjamz5lwV3RCK_3OwkezFdfLzGClpVXhWzJxQwdw'),
  cat('SG', '.CB4ZnHeqiS4d77OqSXxFb5', '.putHI1V6l2H98CL3fHToINFwWo14oCAegYjusd2ufQg'),
  cat('SG', '.NYKceDvndzdOdZ2B9EV7P0', '.Nmz7J3OBtdp4bD565eY9yT10w56p4sy8-jAwrwzTOCK'),
] as const
const TWILIO = [
  cat('S', 'K4954f4c36546dc3ec8575ed4b156e487'),
  cat('S', 'K13ad849d37b9de5b487e24ef062d6d68'),
  cat('S', 'K62E6FA69548E8D63893E7D6659D17091'),
] as const
const GOOGLE_KEY = [
  cat('AI', 'za', 'Qdj6oeIuNOmvjq-eGPDkvLOdDu8cykSiT0X'),
  cat('AI', 'za', '7KUlwvsRdFgi4y4hX1miFAQUQlMkxoYa2aR'),
  cat('AI', 'za', 'pSw6lmCzVDjSa9SHtlxlJuLOBpLF4qQUrzo'),
] as const
const GOCSPX = [
  cat('GOC', 'SPX-', 'ULkh0aC1B-YsPCWOZCH4zuWWM9uA'),
  cat('GOC', 'SPX-', 'ooAMR1MiUvrh0m740qFiis59QGpJ'),
  cat('GOC', 'SPX-', 'VWNlnManj_ry-RhfKK7vQN0HdWLs'),
] as const
const ANTHROPIC = [
  cat('sk-', 'ant-api03-', 'FXuLycHaLR6x3bUKoVVNH56jYNyAAjdz_OFd6Wrjz1W83-bJ9QU1ny02_Cmft7BjM4J-CDW-AJiCHghFApFyS0ZFP0_ij', 'AA'),
  cat('sk-', 'ant-admin01-', '3rsiyv7L4tKWue4H-0NEeeNzzN34YDcGIwCQbSi49Bjq1ybIBvga5CDsT_j8ap62tQ6HWL5mykk_PXh6'),
  cat('sk-', 'ant-oat01-', 'qRP2wqK4JvUk1En9xsZoTO4IYR00OR8vzzpkPrphY1_2XaiifmajVI1GwAoZ9aoI1EnhUfVj2s2VDv-JBtv301vCVJ'),
] as const
const OPENAI = [
  cat('sk-', 'proj-', 'qYTyU3jMdkaT1mWtlZkPFlhdScFxMH2mn7PeZorOMnASxxbXgQS1SmD4rcL0SOdxXAaG-Rkl5u_QOfZyg8xg6Yl4dVv53LPVDIq0PjSLmp66PrH0VTsH2WRnej7c_ElpKmxlD5eb0wK5UGOEwxlAa0cLOKml'),
  cat('sk-', 'ToH0G9IQFqbqBDAHeD9T', 'T3Blbk', 'FJ', 'JNUcf8slJRxueFtuDHTN'),
  cat('sk-', 'Qni1h1fInfgw9mq2U4e2751hCrFlC7A00CbGgDVNaww5Wyhf'),
] as const
const HF = [
  cat('hf', '_', 'GdbEOAIQPbzbevwwdmEHYwhBJnolpVCLij'),
  cat('hf', '_', 'XgMPAtwFURotFKFjQazMjzyhjerhcpaFOz'),
  cat('hf', '_', 'sziHiOzgKxaJnCCSjqGefcIZTIiPHFrast'),
] as const
const NPM = [
  cat('npm', '_', '6M7LcSkGFbK7oqDlcLInEl1oiIOGGACjGcC4'),
  cat('npm', '_', 'JUG9uAbzLM58dvlzppWxJW85RKTjrXp3l2pd'),
  cat('npm', '_', 'I4YTHRu3kowQ2hZAPfWq6SBYARDJtJJlKm84'),
] as const
const PYPI_PREFIX = cat('pypi-', 'AgEIcHlwaS5vcmc')
const PYPI = [
  cat(PYPI_PREFIX, 'uXnsqsuBDBYQ8S65XqMU6ujnhYSW-CawB7uuZEncIfJQ17TKOEtlrVjCejWAuZJYfUKVXu4qcT7HKwjrAOqTxnzPgV6zr7XnbDKCavqT7yzQYmoAwaRjTICU'),
  cat(PYPI_PREFIX, 'bYKGfIUZYasaPu9xNiZ2ozCMEGdoyyYgfnDMDJwezrhPDwRWNeYqXaBAdMihZtoZ0gJlPk'),
  cat(PYPI_PREFIX, '4hWnlZflI0C11Ys4dXAEazn355k7M6Hyyj0tNXzoY6nIKpcLxSGxrGUS3PSFGJptXl1exJDDUC54MPVx3nFZvhMN6y104JRtWBzwlfvrzrPELs4XH3eLlfqRabLAwrESAWJCwN6KtWeyjTWw3F7G7krtcmzMmLsk'),
] as const
const AZURE = [
  cat('tZQDbrYHyvi/61fdOgWwjO6hhbdu/SyPpt2caNe9OQ1uKScn/', 'E9cZaTS3bkCfx4scIdx4GpIZV4dmvKGi9SSVt=='),
  cat('orcIIKKXkEAEJ4M3AWCIOu/kJqhx/Vet2zJpwzxxZ7po7i2Gb', 'Fi9t4rThVyklqQ0YqdpjD/Q/dD6OCa+ZzgNN3=='),
  cat('OIAv7gEehNejIFq68FWAe9jUDa+75BnhMWKrCikaxvY7vhagM', '/Q4GPcEhwSDMcnTbP2bNAxUfS0/ZWrzdIOhmw=='),
] as const
const JWTS = [
  cat('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0', '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'),
  cat('eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3Qta2V5LTEifQ', '.eyJpc3MiOiJodHRwczovL2lzc3Vlci5leGFtcGxlLnRlc3QiLCJhdWQiOiJkZW1vIn0', '.dGVzdC1zaWduYXR1cmUtbm90LXJlYWwtMDEyMzQ1Njc4OQ'),
  cat('eyJhbGciOiJub25lIn0', '.eyJ1c2VyIjoiZmFrZSIsInJvbGUiOiJ0ZXN0ZXIifQ', '.'),
] as const
const pem = (kind: string, body: string): string =>
  cat('-----BEGIN ', kind, 'PRIVATE KEY-----\n', body, '\n-----END ', kind, 'PRIVATE KEY-----')
const PEMS = [
  pem('RSA ', 'NzUDrjtWMlTaVU8fegcu4NGEGhSJVAKyvROGigfbStjS1QatbvuAu2TY7H8wwL/e\njNv2GzzFUCju0Nebd+Agw+PwbvYyCrEvpO4+/0zKPwueRumokDsoOAv0biO77Q3n'),
  pem('OPENSSH ', 'b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW\nnVTT+6/YRAc6ag9pSZKthcOLxBxCYRgp8xYIN4yj'),
  pem('EC ', 'MHcCAQEEIFakeFakeFakeKeyMaterialForTestsOnly0123456789oAoGCCqGSM49'),
  cat('-----BEGIN PGP ', 'PRIVATE KEY BLOCK-----\n\nlQOYBGFakeTestKeyBlockNotRealAtAll0123456789abcdef\n=AbCd\n-----END PGP ', 'PRIVATE KEY BLOCK-----'),
] as const
// random bytes, base64 encoded: shaped like key body lines, decode to nothing
const BODY = [
  'Cwt6LdVeAeNtMwcg7fRuJeOEthYUxl+wh4mkBtvO3jeUrw6g/pHKeeCB9SvYEYgX',
  '2XRFjCcxb2tTNclcj5+Awuv/ipA28sjg3IidDsJkO4EZ0M8p3rO6SkO/yxpz79Mp',
  'HyXFxEpnRzuEyKVCHLmrNOd9GUjm8me/zYZ+RHB5YE16DafnE9UIkFndQyUYyD9A',
  'viGE2jtGDOqocVvXf7VvHLl3tpKIB+p8hf6CiGv/uvUrdlJEeRoSuFctewnhJXtu',
  'Ic518be1I790YaKVaf0gfqFex/mBykHUdfbQSUzN+evjihRwMABG2U0zdsKdAIh1',
  'k4iArmiIAdr6UnWhHa2gH/vJyXDmdiDdZQZrZopClQ+Pg7e60BPGaz1dKx9Aabs8',
  'sjr/Cjgt0RnL0t6cEeSt8IfEDlbL8ciem3KvIJyTHO8UhYdDwJKUg2hxgJgBVfaj',
  '9nFanOPHPV8QKVqDlK/d+WKf46gmTUadKFa3B3EkndU9u1wL9D8V6RUkRlhsWF2b',
  'fCmL0O+VBHaA/x2aujB23ZHPitel+1fD8U8Ymf6KW3EMm3hPYohQizodYPiKwxBR',
  'T7x0W6hEG71ToPfYF+xcpwKxbc9zr0kya9rgeneHnojD5P89TH1HjyXLSz84iSgD',
] as const
// a body past the old 16384 character cap, as in a large PGP export
const LONG_BODY = Array.from({ length: 300 }, (_, i) => BODY[i % BODY.length]).join('\n')
const LONG_PGP = cat('-----BEGIN PGP ', 'PRIVATE KEY BLOCK-----\n\n', LONG_BODY, '\n=AbCd\n-----END PGP ', 'PRIVATE KEY BLOCK-----')
const head = (kind: string, sep: string, ...lines: string[]): string =>
  cat('-----BEGIN ', kind, 'PRIVATE KEY-----', ...lines.map((l) => sep + l))
const TRUNCATED = [
  head('RSA ', '\n', BODY[0], BODY[1], BODY[2]),
  head('RSA ', '\n', 'Proc-Type: 4,ENCRYPTED', 'DEK-Info: AES-256-CBC,0F9D4DAE9EC28C165D631F076B265F06', '', BODY[3], BODY[4]),
  head('', '\\n', BODY[5], BODY[6], BODY[7]),
  head('OPENSSH ', '\r\n', BODY[8], BODY[9]),
  head('EC ', '\n    ', BODY[1], BODY[3]),
  head('PGP ', '\n', 'Version: GnuPG v2', '', BODY[2], BODY[4]).replace('KEY-----', 'KEY BLOCK-----'),
] as const

const B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
// what `base64` or `base64 -w0` prints; url gives the unpadded url-safe form
const b64 = (s: string, url = false): string => {
  let out = ''
  for (let i = 0; i < s.length; i += 3) {
    const n = (s.charCodeAt(i) << 16) | ((i + 1 < s.length ? s.charCodeAt(i + 1) : 0) << 8) | (i + 2 < s.length ? s.charCodeAt(i + 2) : 0)
    const quad = [18, 12, 6, 0].map((shift) => B64_ALPHABET.charAt((n >> shift) & 63))
    const keep = i + 2 < s.length ? 4 : i + 1 < s.length ? 3 : 2
    out += quad.slice(0, keep).join('') + (url ? '' : '='.repeat(4 - keep))
  }
  return url ? out.replace(/\+/g, '-').replace(/\//g, '_') : out
}
const DB_URLS = [
  cat('postgres', '://admin:S3cr3tPa55w0rd', '@db.internal.test:5432/app'),
  cat('mongodb+srv', '://svc_user:Xk9mP2vL7qR4', '@cluster0.abcde.mongodb.net/prod?retryWrites=true'),
  cat('redis', '://:r3d1sP4ss!', '@cache.test:6379/0'),
  cat('amqp', '://guest:Gu3stPw77', '@mq.test:5672/vhost'),
] as const
const BEARER = cat('B7U3ts9mwuLTxQYen8gvFVIks', 'TqnsCWhAV3vAUlr')
const BASIC = cat('dXNlcjpwYXNz', 'd29yZDEyMw==')

const SECRET_CASES: Case[] = [
  {
    id: 'aws-access-key',
    label: 'AWS_KEY',
    positives: [
      { text: `aws_access_key_id = ${AKIA}`, value: AKIA },
      { text: `{"AccessKeyId": "${ASIA}", "Expiration": "2026-10-03"}`, value: ASIA },
      { text: `export AWS_ACCESS_KEY_ID=${ABIA}\n`, value: ABIA },
    ],
    negatives: [
      cat('aws_access_key_id = AKIA', 'IOSFODNN7EXAMPLE'),
      cat('key: AKIA', 'XXXXXXXXXXXXXXXX'),
      cat('id AKIA', '1234567890123456 is not base32'),
      `commit 3f786850e387550fdab836ed7e6dc881de23001b`,
      `${AKIA}Q is one character too long`,
    ],
  },
  {
    id: 'aws-secret-key',
    label: 'AWS_SECRET',
    positives: [
      { text: `aws_secret_access_key = ${AWS_SECRET[0]}`, value: AWS_SECRET[0] },
      { text: `{"SecretAccessKey": "${AWS_SECRET[1]}"}`, value: AWS_SECRET[1] },
      { text: `AWS_SECRET_ACCESS_KEY: ${AWS_SECRET[2]}\n`, value: AWS_SECRET[2] },
    ],
    negatives: [
      cat('aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/', 'bPxRfiCYEXAMPLEKEY'),
      'aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}',
      'secret_access_key: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'sha1 3f786850e387550fdab836ed7e6dc881de23001b',
    ],
  },
  {
    id: 'github-token',
    label: 'GITHUB_TOKEN',
    positives: [
      { text: `GITHUB_TOKEN=${GHP}`, value: GHP },
      { text: `Authorization: token ${GHO}`, value: GHO },
      { text: `{"access_token": "${GHU}"}`, value: GHU },
      { text: `fine-grained ${GH_PAT} expires soon`, value: GH_PAT },
    ],
    negatives: [
      cat('gh', 'p_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
      cat('gh', 'p_short123 in the docs'),
      cat('gh', 'x_FsypJPdBdA4WCgo30YdzsLt4tEtEyxDDBuNQ'),
      cat('github', '_pat_tooShort'),
      'merge 9fceb02d0ae598e95dc970b74767f19372d61af8',
    ],
  },
  {
    id: 'gitlab-pat',
    label: 'GITLAB_TOKEN',
    positives: [
      { text: `PRIVATE-TOKEN: ${GLPAT[0]}`, value: GLPAT[0] },
      { text: `git remote add origin https://oauth2:${GLPAT[1]}@gitlab.test/g/p.git`, value: GLPAT[1] },
      { text: `new format ${GLPAT[2]}.`, value: GLPAT[2] },
    ],
    negatives: [
      cat('gl', 'pat-short'),
      cat('gl', 'pat-xxxxxxxxxxxxxxxxxxxxxxxx'),
      cat('gl', 'pat_6nHSchOA-GK-qzzztWjM'),
      'see glpat- prefixed tokens in the GitLab docs',
    ],
  },
  {
    id: 'slack-token',
    label: 'SLACK_TOKEN',
    positives: [
      { text: `SLACK_BOT_TOKEN=${SLACK[0]}`, value: SLACK[0] },
      { text: `token: "${SLACK[1]}"`, value: SLACK[1] },
      { text: `refresh with ${SLACK[2]} then retry`, value: SLACK[2] },
    ],
    negatives: [
      cat('xo', 'xb-your-bot-token'),
      cat('xo', 'xb-0000000000-xxxxxxxxxxxx'),
      cat('xo', 'xz-1234567890-abcdefghijk'),
      cat('xo', 'x-1234567890-abcdefghijk'),
    ],
  },
  {
    id: 'slack-webhook',
    label: 'SLACK_WEBHOOK',
    positives: [
      { text: `SLACK_WEBHOOK_URL=${HOOKS[0]}`, value: HOOKS[0] },
      { text: `curl -X POST ${HOOKS[1]} -d '{}'`, value: HOOKS[1] },
      { text: `"url": "${HOOKS[2]}"`, value: HOOKS[2] },
    ],
    negatives: [
      cat('https://hooks.', 'slack.com/services/T000/B000/XXXX'),
      cat('https://hooks.', 'slack.com/'),
      'https://api.slack.com/apps/A0123456789/incoming-webhooks',
    ],
  },
  {
    id: 'stripe-live-key',
    label: 'STRIPE_KEY',
    positives: [
      { text: `STRIPE_SECRET_KEY=${STRIPE[0]}`, value: STRIPE[0] },
      { text: `stripe.api_key = "${STRIPE[1]}"`, value: STRIPE[1] },
      { text: `Stripe(${STRIPE[2]})`, value: STRIPE[2] },
    ],
    negatives: [
      cat('sk', '_test_nwOFXOaYo6ChDQHBEY6SFY3e'),
      cat('sk', '_live_xxxxxxxxxxxxxxxxxxxxxxxx'),
      cat('sk', '_live_short'),
      cat('pk', '_live_nwOFXOaYo6ChDQHBEY6SFY3e'),
    ],
  },
  {
    id: 'sendgrid-key',
    label: 'SENDGRID_KEY',
    positives: [
      { text: `SENDGRID_API_KEY=${SENDGRID[0]}`, value: SENDGRID[0] },
      { text: `sg = SendGridAPIClient("${SENDGRID[1]}")`, value: SENDGRID[1] },
      { text: `key ${SENDGRID[2]}\n`, value: SENDGRID[2] },
    ],
    negatives: [
      cat('S', 'G.short.value'),
      cat('S', 'G.xxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
      'SGX.e5knhnKB9adyvmiKcDbZgn',
      'the SG. prefix marks SendGrid keys',
    ],
  },
  {
    id: 'twilio-key',
    label: 'TWILIO_KEY',
    positives: [
      { text: `TWILIO_API_KEY=${TWILIO[0]}`, value: TWILIO[0] },
      { text: `client = Client("${TWILIO[1]}", secret)`, value: TWILIO[1] },
      { text: `sid ${TWILIO[2]}`, value: TWILIO[2] },
    ],
    negatives: [
      'md5 d41d8cd98f00b204e9800998ecf8427e',
      cat('S', 'K4954f4c36546dc3ec8575ed4b156e48'),
      cat('TAS', 'K4954f4c36546dc3ec8575ed4b156e487'),
      'SKU12345 in stock',
    ],
  },
  {
    id: 'google-api-key',
    label: 'GOOGLE_API_KEY',
    positives: [
      { text: `GOOGLE_API_KEY=${GOOGLE_KEY[0]}`, value: GOOGLE_KEY[0] },
      { text: `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY[1]}&callback=init`, value: GOOGLE_KEY[1] },
      { text: `"apiKey": "${GOOGLE_KEY[2]}",`, value: GOOGLE_KEY[2] },
    ],
    negatives: [
      cat('AI', 'zaQdj6oeIuNOmvjq-eGPDkvLOdDu8'),
      cat('AI', 'zaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'),
      cat('AI', 'ZAQdj6oeIuNOmvjq-eGPDkvLOdDu8cykSiT0X'),
    ],
  },
  {
    id: 'google-oauth-secret',
    label: 'GOOGLE_OAUTH_SECRET',
    positives: [
      { text: `GOOGLE_CLIENT_SECRET=${GOCSPX[0]}`, value: GOCSPX[0] },
      { text: `"client_secret":"${GOCSPX[1]}"`, value: GOCSPX[1] },
      { text: `secret ${GOCSPX[2]} rotated`, value: GOCSPX[2] },
    ],
    negatives: [
      cat('GOC', 'SPX-short'),
      cat('GOC', 'SPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
      cat('GOC', 'SPY-ULkh0aC1B-YsPCWOZCH4zuWWM9uA'),
    ],
  },
  {
    id: 'anthropic-key',
    label: 'ANTHROPIC_KEY',
    positives: [
      { text: `ANTHROPIC_API_KEY=${ANTHROPIC[0]}`, value: ANTHROPIC[0] },
      { text: `x-api-key: ${ANTHROPIC[1]}`, value: ANTHROPIC[1] },
      { text: `oauth ${ANTHROPIC[2]}\n`, value: ANTHROPIC[2] },
    ],
    negatives: [
      cat('sk-', 'ant-api03-short'),
      cat('sk-', 'ant-xxx'),
      cat('sk-', 'ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
    ],
  },
  {
    id: 'openai-key',
    label: 'OPENAI_KEY',
    positives: [
      { text: `OPENAI_API_KEY=${OPENAI[0]}`, value: OPENAI[0] },
      { text: `openai.api_key = '${OPENAI[1]}'`, value: OPENAI[1] },
      { text: `old key ${OPENAI[2]} revoked`, value: OPENAI[2] },
    ],
    negatives: [
      cat('sk-', 'proj-short'),
      cat('sk-', '1234'),
      cat('sk-', 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
      cat('task-', 'Qni1h1fInfgw9mq2U4e2751hCrFlC7A00CbGgDVNaww5Wyhf'),
    ],
  },
  {
    id: 'huggingface-token',
    label: 'HF_TOKEN',
    positives: [
      { text: `HF_TOKEN=${HF[0]}`, value: HF[0] },
      { text: `login(token="${HF[1]}")`, value: HF[1] },
      { text: `huggingface-cli login --token ${HF[2]}`, value: HF[2] },
    ],
    negatives: [
      'from huggingface_hub import hf_hub_download',
      cat('hf', '_GdbEOAIQPbzbevwwdmEHYwhBJnolpVCLi'),
      cat('hf', '_GdbEOAIQPbzbevwwdmEHYwhBJnolpVCL1j'),
      cat('hf', '_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'),
    ],
  },
  {
    id: 'npm-token',
    label: 'NPM_TOKEN',
    positives: [
      { text: `//registry.npmjs.org/:_authToken=${NPM[0]}`, value: NPM[0] },
      { text: `NPM_TOKEN: ${NPM[1]}`, value: NPM[1] },
      { text: `publish with ${NPM[2]} today`, value: NPM[2] },
    ],
    negatives: [
      'echo $npm_config_registry',
      cat('npm', '_6M7LcSkGFbK7oqDlcLInEl1oiIOGGACjGcC'),
      'process.env.npm_package_version',
    ],
  },
  {
    id: 'pypi-token',
    label: 'PYPI_TOKEN',
    positives: [
      { text: `password = ${PYPI[0]}`, value: PYPI[0] },
      { text: `TWINE_PASSWORD="${PYPI[1]}"`, value: PYPI[1] },
      { text: `uv publish --token ${PYPI[2]}`, value: PYPI[2] },
    ],
    negatives: [
      cat(PYPI_PREFIX, 'tooShort1234'),
      'username = __token__ and a pypi-token goes in password',
      cat('pypi-', 'AgEIcHlwaS5vcmd', 'uXnsqsuBDBYQ8S65XqMU6ujnhYSW-CawB7uuZEncIfJQ17TKOEt'),
    ],
  },
  {
    id: 'azure-storage-key',
    label: 'AZURE_STORAGE_KEY',
    positives: [
      {
        text: `DefaultEndpointsProtocol=https;AccountName=fakeacct;AccountKey=${AZURE[0]};EndpointSuffix=core.windows.net`,
        value: AZURE[0],
      },
      { text: `AZURE_STORAGE_KEY="${AZURE[1]}"`, value: AZURE[1] },
      { text: `storage_account_key: ${AZURE[2]}`, value: AZURE[2] },
    ],
    negatives: [
      'AccountName=fakeacct;AccountKey=${AZURE_KEY};EndpointSuffix=core.windows.net',
      'AccountKey=tZQDbrYHyvi/61fdOgWwjO6hhbdu/SyPpt2caNe9',
      `blob ${AZURE[0]}`,
    ],
  },
  {
    id: 'jwt',
    label: 'JWT',
    positives: [
      { text: `Authorization: Bearer ${JWTS[0]}`, value: JWTS[0] },
      { text: `{"id_token":"${JWTS[1]}"}`, value: JWTS[1] },
      { text: `unsigned ${JWTS[2]}`, value: JWTS[2] },
    ],
    negatives: [
      'eyJ0eXAiOiJKV1QiLCJraWQiOiJhYmMifQ.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmnop',
      'eyJhbGciIGJyb2tlbiBqc29u.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijklmnop',
      'version 1.2.3 and 10.0.19045',
      'eyJ.short.x',
    ],
  },
  {
    id: 'private-key',
    label: 'PRIVATE_KEY',
    positives: [
      { text: `key.pem:\n${PEMS[0]}\n`, value: PEMS[0] },
      { text: `"${PEMS[1]}"`, value: PEMS[1] },
      { text: `${PEMS[2]}`, value: PEMS[2] },
      { text: `gpg export\n${PEMS[3]}\ndone`, value: PEMS[3] },
      { text: `gpg --export-secret-keys --armor\n${LONG_PGP}\n`, value: LONG_PGP },
    ],
    negatives: [
      '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEFakePublicKeyMaterial\n-----END PUBLIC KEY-----',
      '-----BEGIN CERTIFICATE-----\nMIIBszCCAVmgAwIBAgIUFakeCertificateBody0123\n-----END CERTIFICATE-----',
      cat('-----BEGIN RSA ', 'PRIVATE KEY----- truncated, no end marker'),
    ],
  },
  {
    id: 'private-key-truncated',
    label: 'PRIVATE_KEY',
    positives: [
      { text: `$ head -4 id_rsa\n${TRUNCATED[0]}\n$ `, value: TRUNCATED[0] },
      { text: `${TRUNCATED[1]}\n... (40 more lines)`, value: TRUNCATED[1] },
      { text: `{"type": "service_account", "private_key": "${TRUNCATED[2]}`, value: TRUNCATED[2] },
      { text: `${TRUNCATED[3]}\r\n`, value: TRUNCATED[3] },
      { text: `tls:\n  key: |\n    ${TRUNCATED[4]}\n  cert: pending`, value: TRUNCATED[4] },
      { text: `${TRUNCATED[5]}`, value: TRUNCATED[5] },
    ],
    negatives: [
      cat('-----BEGIN RSA ', 'PRIVATE KEY-----\n', BODY[0], '\n(output truncated)'),
      cat('-----BEGIN PUBLIC KEY-----\n', BODY[1], '\n', BODY[2]),
      cat('-----BEGIN CERTIFICATE-----\n', BODY[3], '\n', BODY[4]),
      cat('-----BEGIN ', 'PRIVATE KEY-----\npaste the rest of the key here\nand keep the END line'),
      cat('-----BEGIN ', 'PRIVATE KEY-----\nMIIE\nshort\nlines'),
    ],
  },
  {
    id: 'db-connection-url',
    label: 'DB_URL',
    positives: [
      { text: `DATABASE_URL=${DB_URLS[0]}`, value: DB_URLS[0] },
      { text: `MONGO_URI="${DB_URLS[1]}"`, value: DB_URLS[1] },
      { text: `cache: ${DB_URLS[2]}`, value: DB_URLS[2] },
      { text: `broker_url = '${DB_URLS[3]}'`, value: DB_URLS[3] },
    ],
    negatives: [
      'DATABASE_URL=postgres://user:password@localhost/db',
      'postgres://localhost:5432/app',
      'mongodb://${DB_USER}:${DB_PASS}@mongo.test/db',
      'mysql://root:<password>@127.0.0.1:3306/app',
      'return sql.Open("postgres", fmt.Sprintf("postgres://postgres:%s@db:5432/example?sslmode=disable", string(bin)))',
      'dsn := fmt.Sprintf("mysql://app:%d@db.test:3306/app", port)',
      '`csvsql --insert --db "{{mysql://benutzer:passwort@host/datenbank}}" {{pfad/zu/datei.csv}}`',
      '`csvsql --insert --db "{{mysql://pengguna:kata_sandi@host/basis_data}}" {{jalan/menuju/data.csv}}`',
      'DATABASE_URL=postgres://app:{{db_password}}@db.test/app',
      'DATABASE_URL=mysql://root:PASSWORD@db.test/app',
    ],
  },
  {
    id: 'auth-header',
    label: 'AUTH_HEADER',
    positives: [
      { text: `Authorization: Bearer ${BEARER}`, value: BEARER },
      { text: `curl -H "Authorization: Basic ${BASIC}" https://api.test`, value: BASIC },
      { text: `{"Authorization": "Token ${TWILIO[0].slice(2)}"}`, value: TWILIO[0].slice(2) },
    ],
    negatives: [
      'Authorization: Bearer $TOKEN',
      'Authorization: Bearer <token>',
      'Authorization: Bearer YOUR_ACCESS_TOKEN',
      'Authorization: Basic',
    ],
  },
  {
    id: 'generic-secret-quoted',
    label: 'SECRET',
    positives: [
      { text: `password: "hunter2-Correct!"`, value: 'hunter2-Correct!' },
      { text: `const apiKey = '${cat('OWzE65iZIr', 'tvsKC8rnto')}'`, value: cat('OWzE65iZIr', 'tvsKC8rnto') },
      { text: `{"client_secret": "Zx8#kL2!pQ9@vR4$"}`, value: 'Zx8#kL2!pQ9@vR4$' },
      { text: `DB_PASSWORD="s0me-Pa55word"`, value: 's0me-Pa55word' },
      { text: `const clientSecret = "Zx8#kL2!pQ9@vR4$"`, value: 'Zx8#kL2!pQ9@vR4$' },
    ],
    negatives: [
      'password: "password"',
      'api_key: "<your-api-key>"',
      'token: "${GITHUB_TOKEN}"',
      'secret = "changeme"',
      '"token": "xxxxxxxxxxxxxxxx"',
      'password: "%DB_PASSWORD%"',
      "    apiKey: '__API_KEY__',",
      'password: "%(db_password)s"',
      '"api_key": "{{ secrets.API_KEY }}"',
      "token: '<paste-token-here>'",
    ],
  },
  {
    id: 'generic-secret',
    label: 'SECRET',
    positives: [
      { text: `API_KEY=${cat('46j0025ou', 'VvU0lcS')}`, value: cat('46j0025ou', 'VvU0lcS') },
      { text: `db_password: Tr0ub4dor&3xyz\n`, value: 'Tr0ub4dor&3xyz' },
      { text: `run --token=${cat('1e64c201a6ccba54', '93ddc9c2cb8a61df')} --verbose`, value: cat('1e64c201a6ccba54', '93ddc9c2cb8a61df') },
      { text: `export SECRET_KEY=k3J9mQ2xV7pL4nR8`, value: 'k3J9mQ2xV7pL4nR8' },
      { text: `dbPassword: Xk9mPqLvRtZw7`, value: 'Xk9mPqLvRtZw7' },
      { text: `SECRET_KEY=${cat('Zm9vYmFyYmF6cXV4MTIz', 'NDU2Nzg5MA==')}`, value: cat('Zm9vYmFyYmF6cXV4MTIz', 'NDU2Nzg5MA==') },
      { text: String.raw`dotenv.parse('SERVER=localhost\nPASSWORD=Tr0ub4dor&3xyz\nDB=tests\n')`, value: 'Tr0ub4dor&3xyz' },
    ],
    negatives: [
      'const token = getToken()',
      'password: ${DB_PASSWORD}',
      'apiKey: process.env.API_KEY',
      'auth=true',
      'secret: my-secret-name',
      'pwd = /usr/local/bin',
      'password=aaaaaaaaaaaa',
      'token: 1727950000',
      "// 'urn:ietf:params:oauth:jwk-thumbprint:sha-256:NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs'",
      'const uri = `urn:ietf:params:OAuth:jwk-thumbprint:sha-256:${thumbprint}`',
      '`sf force:auth:web:login --setalias {{organization}} --instanceurl {{organization_url}}`',
      "`qm remote-migrate {{vmid}} {{target_vmid}} 'apitoken=PVEAPIToken={{user}}@{{realm}}!{{token}}={{secret}},host={{address}}' --target-bridge {{bridge}}`",
      '      auth: options?.auth,',
      "            string alloyDBPassword = result.Payload.Data.ToStringUtf8().TrimEnd('\\r', '\\n');",
      " * const secret = jose.base64url.decode('Qm9sZEZha2VWYWx1ZUZvclRlc3RzT25seTEyMzQ')",
      'declare const secret: Uint8Array',
      '  secret: Uint8Array',
      String.raw`    'WINDIR="C:\\\\Users\\\\me\\\\"\nAPI_KEY=secret\nPORT=3000\n',`,
      String.raw`const RPayload = dotenv.parse(Buffer.from('SERVER=localhost\rPASSWORD=password\rDB=tests\r'))`,
      String.raw`const RNPayload = dotenv.parse(Buffer.from('SERVER=localhost\r\nPASSWORD=password\r\nDB=tests\r\n'))`,
    ],
  },
]

const PII_CASES: Case[] = [
  {
    id: 'email',
    label: 'EMAIL',
    positives: [
      { text: 'mail jane.doe@example.com today', value: 'jane.doe@example.com' },
      { text: 'contact: test+tag@sub.example.org', value: 'test+tag@sub.example.org' },
      { text: 'From: <a_b-c@mail.example.co.in>', value: 'a_b-c@mail.example.co.in' },
    ],
    negatives: ['icon@2x.png', 'ssh user@localhost', 'npm i @scope/pkg@1.2.3', '@Component decorator'],
  },
  {
    id: 'payment-card',
    label: 'CARD',
    positives: [
      { text: 'card 4111 1111 1111 1111 exp 12/30', value: '4111 1111 1111 1111' },
      { text: 'mc: 5555-5555-5555-4444', value: '5555-5555-5555-4444' },
      { text: 'amex=378282246310005', value: '378282246310005' },
      { text: '"pan": "6011111111111117"', value: '6011111111111117' },
    ],
    negatives: [
      'card 4111 1111 1111 1112',
      'charge 4242424242424241',
      'ts 1727950000123',
      'order 1234-5678-9012-3456',
      'mixed 4111 1111-1111 1111',
      'id 123e4567-e89b-12d3-a456-426614174000',
    ],
  },
  {
    id: 'aadhaar',
    label: 'AADHAAR',
    positives: [
      { text: 'aadhaar 2345 6789 0124', value: '2345 6789 0124' },
      { text: 'uid=987654321012', value: '987654321012' },
      { text: 'UID: 5555-1234-5673.', value: '5555-1234-5673' },
    ],
    negatives: ['aadhaar 2345 6789 0125', 'id 1234 5678 9012', 'ref 2345 6789 01245', 'mixed 2345-6789 0124'],
  },
  {
    id: 'us-ssn',
    label: 'SSN',
    positives: [
      { text: 'ssn 234-56-7890', value: '234-56-7890' },
      { text: 'SSN: 345-67-8901', value: '345-67-8901' },
      { text: 'ssn=456-78-9012;', value: '456-78-9012' },
    ],
    negatives: ['000-12-3456', '666-12-3456', '912-34-5678', '123-00-4567', '078-05-1120', 'date 2024-10-03'],
  },
  {
    id: 'iban',
    label: 'IBAN',
    positives: [
      { text: 'IBAN GB82WEST12345698765432', value: 'GB82WEST12345698765432' },
      { text: 'iban: DE89 3704 0044 0532 0130 00', value: 'DE89 3704 0044 0532 0130 00' },
      { text: '"FR1420041010050500013M02606"', value: 'FR1420041010050500013M02606' },
    ],
    negatives: ['IBAN GB82WEST12345698765433', 'DE88 3704 0044 0532 0130 00', 'GB82 only', 'ID AB12CDEFGHIJKLMN'],
  },
  {
    id: 'india-pan',
    label: 'PAN',
    positives: [
      { text: 'PAN ABCPE1234F', value: 'ABCPE1234F' },
      { text: 'pan: AAAPZ1234C', value: 'AAAPZ1234C' },
      { text: '"pan":"BNZCA5678K"', value: 'BNZCA5678K' },
    ],
    negatives: ['PAN ABCDE1234F', 'abcpe1234f', 'ABCPE12345', 'ABCPE1234'],
  },
  {
    id: 'phone',
    label: 'PHONE',
    positives: [
      { text: 'call +919876543210 now', value: '+919876543210' },
      { text: 'tel: +1 (415) 555-0132', value: '+1 (415) 555-0132' },
      { text: 'office +44 20 7946 0958', value: '+44 20 7946 0958' },
      { text: '(415) 555-0199 ext 2', value: '(415) 555-0199' },
      { text: 'mobile 98765 43210', value: '98765 43210' },
    ],
    negatives: [
      'ts 1727950000',
      'at 2024-10-03 12:34:56',
      'host 192.168.100.200',
      'v1.2.3',
      'id 123e4567-e89b-12d3-a456-426614174000',
      'dial +1 415',
    ],
  },
]

const CASES = [...SECRET_CASES, ...PII_CASES]

type Wrapped = { text: string; value: string; id: string; label: string }
const ENV_FILE = cat('AWS_REGION=us-east-1\nGITHUB_TOKEN=', GHP, '\nLOG_LEVEL=debug\n')
const SLACK_JSON = JSON.stringify({ api: 'https://api.test', token: SLACK[0] })
const WRAPPED: Wrapped[] = [
  { text: `echo ${b64(AKIA)} | base64 -d`, value: b64(AKIA), id: 'aws-access-key-base64', label: 'AWS_KEY' },
  { text: `ENV_FILE=${b64(ENV_FILE)}`, value: b64(ENV_FILE), id: 'github-token-base64', label: 'GITHUB_TOKEN' },
  { text: `{"config": "${b64(SLACK_JSON)}"}`, value: b64(SLACK_JSON), id: 'slack-token-base64', label: 'SLACK_TOKEN' },
  { text: `data:\n  tls.key: ${b64(PEMS[0])}\n`, value: b64(PEMS[0]), id: 'private-key-base64', label: 'PRIVATE_KEY' },
  { text: `?state=${b64(cat('db=', DB_URLS[0]), true)}&x=1`, value: b64(cat('db=', DB_URLS[0]), true), id: 'db-connection-url-base64', label: 'DB_URL' },
  { text: `{"auths":{"registry.test":{"auth":"${b64(cat('ci:', NPM[0]))}"}}}`, value: b64(cat('ci:', NPM[0])), id: 'npm-token-base64', label: 'NPM_TOKEN' },
]
const WRAPPED_NEGATIVES = [
  '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==">',
  '"integrity": "sha512-5M53BsOqcReBM10CEzSaGC4lddbxUMy9v+iLQ8GPQl2d27nb8yuN8GHr8JhtKZe3H3AIIBvsdZDfCqO8lqGa6Q=="',
  '"integrity": "sha1-kBRmpbtS7m3mPj44UoXmkNXLpCQ="',
  'blob: 6iji9g/bOXS4N9cXTAzcF1F5RhZEq7jDCEsKwJqtlYmyUJfjPNZYVP9wodu0PZLEAAbozl5ElVVTkFjFdxW+9nkr4wy2w4j/L+Giz4ML+Qz5vmSN/5TSr4o9cC7cec3E',
  'nonce=CX3Idgv6Qwremr1p7Ii0x5Uq4oPUfxTYXLE0qwH_qd_7',
  `msg: ${b64('build 4521 passed on the main branch, nothing to see here')}`,
  `doc: ${b64(cat('aws_access_key_id = AKIA', 'IOSFODNN7EXAMPLE'))}`,
  `cfg: ${b64('password=hunter2-Correct! and api_key=k3J9mQ2xV7pL4nR8')}`,
  `${b64(AKIA).slice(0, 20)} is too short to decode`,
]

function seeded(seed: number): () => number {
  return (): number => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function checkCase(c: Case): void {
  for (const p of c.positives) {
    const hits = scan(p.text, { pii: true })
    const hit = hits.find((h) => h.id === c.id)
    expect(hit, `${c.id} should match: ${p.text}`).toBeDefined()
    expect(hit?.value).toBe(p.value)
    expect(hit?.label).toBe(c.label)
    expect(p.text.slice(hit?.start ?? 0, hit?.end ?? 0)).toBe(p.value)
  }
  for (const n of c.negatives) {
    expect(scan(n, { pii: true }), `${c.id} should not match: ${n}`).toEqual([])
  }
}

describe('rules', () => {
  test('every rule has a case, a global pattern and a source URL', ($, on) => {
    const ids = CASES.map((c) => c.id)
    for (const rule of RULES) {
      expect(ids).toContain(rule.id)
      expect(rule.pattern.flags).toMatch(/g/)
      expect(rule.source).toMatch(/^https:\/\//)
      expect(rule.label).toMatch(/^[A-Z][A-Z0-9_]*$/)
    }
    expect(new Set(RULES.map((r) => r.id)).size).toBe(RULES.length)
  })

  for (const c of CASES) {
    test(`${c.id}: ${c.positives.length} positives, ${c.negatives.length} negatives`, ($, on) => {
      expect(c.positives.length).toBeGreaterThanOrEqual(3)
      expect(c.negatives.length).toBeGreaterThanOrEqual(3)
      checkCase(c)
    })
  }

  test(`base64-wrapped: ${WRAPPED.length} positives, ${WRAPPED_NEGATIVES.length} negatives`, ($, on) => {
    for (const w of WRAPPED) {
      const hits = scan(w.text, { pii: true })
      expect(hits, `one ${w.id} hit for: ${w.text}`).toEqual([
        { id: w.id, label: w.label, kind: 'secret', start: w.text.indexOf(w.value), end: w.text.indexOf(w.value) + w.value.length, value: w.value },
      ])
    }
    for (const n of WRAPPED_NEGATIVES) {
      expect(scan(n, { pii: true }), `base64 should not match: ${n}`).toEqual([])
    }
  })
})

describe('scan', () => {
  test('pii rules stay silent unless pii is on', ($, on) => {
    const text = 'jane.doe@example.com, 4111 1111 1111 1111, 234-56-7890, ABCPE1234F, +919876543210, GB82WEST12345698765432'
    expect(scan(text)).toEqual([])
    expect(scan(text, { pii: false })).toEqual([])
    const ids = scan(text, { pii: true }).map((h) => h.id)
    expect(ids).toEqual(['email', 'payment-card', 'us-ssn', 'india-pan', 'phone', 'iban'])
  })

  test('off skips the named rules only', ($, on) => {
    const text = `token ${GHP} and key ${AKIA}`
    expect(scan(text).map((h) => h.id)).toEqual(['github-token', 'aws-access-key'])
    expect(scan(text, { off: new Set(['github-token']) }).map((h) => h.id)).toEqual(['aws-access-key'])
    expect(scan('mail jane.doe@example.com', { pii: true, off: new Set(['email']) })).toEqual([])
    const wrapped = `raw ${AKIA} wrapped ${b64(AKIA)}`
    expect(scan(wrapped).map((h) => h.id)).toEqual(['aws-access-key', 'aws-access-key-base64'])
    expect(scan(wrapped, { off: new Set(['aws-access-key-base64']) }).map((h) => h.id)).toEqual(['aws-access-key'])
    expect(scan(wrapped, { off: new Set(['aws-access-key']) })).toEqual([])
  })

  test('an existing placeholder is never matched again', ($, on) => {
    expect(scan('aws_access_key_id = [REDACTED:AWS_KEY#a1b2c3]', { pii: true })).toEqual([])
    expect(scan('password=[REDACTED:SECRET#00ff] token: "[REDACTED:SECRET#abc123]"', { pii: true })).toEqual([])
    expect(scan('[REDACTED:AWS_KEY#a1b2c3][REDACTED:EMAIL#ffff]', { pii: true })).toEqual([])
    const text = `old [REDACTED:AWS_KEY#a1b2c3] new ${AKIA}`
    const hits = scan(text)
    expect(hits.length).toBe(1)
    expect(hits[0]?.value).toBe(AKIA)
    expect(hits[0]?.start).toBe(text.indexOf(AKIA))
  })

  test('overlapping rules give one hit, leftmost then longest', ($, on) => {
    const url = DB_URLS[0]
    const hits = scan(`DB_PASSWORD=${url}`)
    expect(hits).toEqual([{ id: 'db-connection-url', label: 'DB_URL', kind: 'secret', start: 12, end: 12 + url.length, value: url }])
    const nested = scan(`token: postgres://token:${cat('S3cr3tPa55', 'w0rd')}@db.test/app`)
    expect(nested.map((h) => h.id)).toEqual(['db-connection-url'])
    const sorted = scan(`${GHP} then ${AKIA} then ${BEARER}`)
    expect(sorted.map((h) => h.id)).toEqual(['github-token', 'aws-access-key'])
  })

  test('a whole PEM block wins over its truncated reading', ($, on) => {
    for (const block of [PEMS[0], PEMS[1], LONG_PGP, cat(TRUNCATED[1], '\n-----END RSA ', 'PRIVATE KEY-----')]) {
      const hits = scan(`key:\n${block}\n`)
      expect(hits.map((h) => h.id)).toEqual(['private-key'])
      expect(hits[0]?.value).toBe(block)
    }
  })

  test('a JWT stays a JWT, never base64-wrapped', ($, on) => {
    const claims = b64(JSON.stringify({ sub: 'ci', gh: GHP }), true)
    const token = cat(b64('{"alg":"HS256","typ":"JWT"}', true), '.', claims, '.', 'c2lnbmF0dXJlLW5vdC1yZWFsLTAxMjM0NQ')
    for (const jwt of [...JWTS, token]) {
      expect(scan(`Bearer ${jwt}`).map((h) => [h.id, h.value])).toEqual([['jwt', jwt]])
    }
  })

  test('2 MB of random base64 scans in under 1000 ms', ($, on) => {
    const next = seeded(0x2f6b1d3a)
    const chunks: string[] = []
    for (let i = 0; i < 2 * 1024 * 1024; i++) chunks.push(B64_ALPHABET.charAt(Math.floor(next() * 64)))
    const blob = chunks.join('')
    const t0 = performance.now()
    scan(blob, { pii: true })
    const ms = performance.now() - t0
    expect(ms).toBeLessThan(1000)
  })

  test('2 MB of near-miss keys and decodable base64 scans in under 1000 ms', ($, on) => {
    const next = seeded(0x51ed27a9)
    const line = (n: number): string => Array.from({ length: n }, () => B64_ALPHABET.charAt(Math.floor(next() * 64))).join('')
    const keys: string[] = []
    let size = 0
    while (size < 400 * 1024) {
      const part = cat('-----BEGIN ', 'PRIVATE KEY-----\n', Array.from({ length: 1100 }, () => line(64)).join('\n'), '\n', line(200), '\n')
      keys.push(part)
      size += part.length
    }
    const prose = Array.from({ length: 6000 }, (_, i) => String.fromCharCode(97 + (i % 26)) + (i % 7 === 0 ? ' ' : '')).join('').slice(0, 6000)
    const runs: string[] = []
    while (size < 2 * 1024 * 1024) {
      const run = b64(prose)
      runs.push(run)
      size += run.length + 1
    }
    const text = keys.join('') + runs.join(' ')
    const t0 = performance.now()
    scan(text, { pii: true })
    const ms = performance.now() - t0
    expect(ms).toBeLessThan(1000)
  })
})
