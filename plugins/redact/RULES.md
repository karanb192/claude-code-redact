# Detection rules

Every rule lives in `hooks/rules.ts`. Secret rules always run. PII rules run only when PII redaction is on. Any rule can be switched off by its id.

How a scan settles conflicts:

- A hit covers only the value (the capture group), not the key name or quotes around it.
- When two hits overlap, the leftmost wins, then the longest, then the rule listed first below.
- Text inside an existing `[REDACTED:LABEL#hex]` placeholder is never matched again.
- Every quantifier is bounded, so a 2 MB blob of random base64 scans in well under a second.

All examples below are fake. They have the right shape and nothing else.

## Secret rules

| id | label | kind | what it catches | example that matches | source |
| --- | --- | --- | --- | --- | --- |
| `aws-access-key` | `AWS_KEY` | secret | AWS access key id: `AKIA`, `ASIA`, `ABIA` or `ACCA` plus 16 base32 characters; ids ending in `EXAMPLE` are skipped | `AKIAFAKE2345TEST6767` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `aws-secret-key` | `AWS_SECRET` | secret | 40-character AWS secret access key assigned to an `aws_secret_access_key` style name | `aws_secret_access_key = FAKEfake0123456789abcdefghijklmnopqrstuv` | [AWS docs](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) |
| `github-token` | `GITHUB_TOKEN` | secret | GitHub tokens: `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_` and fine-grained `github_pat_` | `ghp_0123456789abcdefghijklmnopqrstuvwxyz` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `gitlab-pat` | `GITLAB_TOKEN` | secret | GitLab personal access token `glpat-`, including the newer dotted form | `glpat-FAKE0123456789abcdef` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `slack-token` | `SLACK_TOKEN` | secret | Slack bot, user, app, refresh and session tokens (`xoxa-`, `xoxb-`, `xoxp-`, `xoxr-`, `xoxs-`) | `xoxb-1234567890-1234567890123-FAKEfakeFAKEfake01234567` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `slack-webhook` | `SLACK_WEBHOOK` | secret | Slack incoming webhook, workflow and trigger URLs | `https://hooks.slack.com/services/TFAKE0001/BFAKE0002/FAKEfake0123456789abcdef` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `stripe-live-key` | `STRIPE_KEY` | secret | Stripe live secret and restricted keys (`sk_live_`, `rk_live_`); test keys are left alone | `sk_live_FAKE0123456789abcdefghij` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `sendgrid-key` | `SENDGRID_KEY` | secret | SendGrid API key: `SG.` plus a 22 and a 43 character segment | `SG.FAKE0123456789abcdefgh.FAKE0123456789abcdefghijklmnopqrstuvwxyzABC` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `twilio-key` | `TWILIO_KEY` | secret | Twilio API key SID: `SK` plus 32 hex characters | `SK0123456789abcdef0123456789abcdef` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `google-api-key` | `GOOGLE_API_KEY` | secret | Google API key: `AIza` plus 35 characters | `AIzaFAKE0123456789abcdefghijklmnopqrstu` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `google-oauth-secret` | `GOOGLE_OAUTH_SECRET` | secret | Google OAuth client secret: `GOCSPX-` plus 28 characters | `GOCSPX-FAKE0123456789abcdefghijklmn` | [GitHub secret scanning patterns](https://docs.github.com/en/code-security/secret-scanning/introduction/supported-secret-scanning-patterns) |
| `anthropic-key` | `ANTHROPIC_KEY` | secret | Anthropic API, admin and OAuth keys (`sk-ant-api03-`, `sk-ant-admin01-`, `sk-ant-oat01-`) | `sk-ant-api03-FAKE0123456789abcdefghijklmnopqrstuvwxyz-FAKE` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `openai-key` | `OPENAI_KEY` | secret | OpenAI keys: `sk-proj-`, `sk-svcacct-`, `sk-admin-`, the `T3BlbkFJ` legacy form and 48-character `sk-` keys | `sk-proj-FAKE0123456789abcdefghijklmnopqrstuvwxyzABCD` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `huggingface-token` | `HF_TOKEN` | secret | Hugging Face access token: `hf_` plus 34 letters | `hf_FAKEfakeABCDEFGHIJKLMNOPQRSTUVWXYZ` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `npm-token` | `NPM_TOKEN` | secret | npm access token: `npm_` plus 36 characters | `npm_FAKE0123456789abcdefghijklmnopqrstuv` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `pypi-token` | `PYPI_TOKEN` | secret | PyPI upload token: `pypi-AgEIcHlwaS5vcmc` plus at least 50 characters | `pypi-AgEIcHlwaS5vcmcFAKE0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `azure-storage-key` | `AZURE_STORAGE_KEY` | secret | Azure storage account key (86 base64 characters plus `==`) after `AccountKey=` or a storage key name | `AccountKey=FAKEfake0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/FAKEfake012345==` | [Microsoft Learn](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string) |
| `jwt` | `JWT` | secret | JSON Web Token: three base64url segments whose header decodes to JSON with an `alg` field | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c` | [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) |
| `private-key` | `PRIVATE_KEY` | secret | Whole PEM private key block (RSA, EC, DSA, OPENSSH, ENCRYPTED, PGP), across lines | `-----BEGIN RSA PRIVATE KEY-----MIIEFAKEFAKEFAKE0123-----END RSA PRIVATE KEY-----` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `db-connection-url` | `DB_URL` | secret | postgres, postgresql, mysql, mariadb, mongodb, mongodb+srv, redis, rediss, amqp and amqps URLs that carry `user:password@`; placeholder passwords are skipped | `postgres://admin:FakePassw0rd1@db.example.test:5432/app` | [GitHub secret scanning patterns](https://docs.github.com/en/code-security/secret-scanning/introduction/supported-secret-scanning-patterns) |
| `auth-header` | `AUTH_HEADER` | secret | Value of an `Authorization: Bearer`, `Basic` or `Token` header | `Authorization: Bearer FAKE0123456789abcdef` | [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110#name-authorization) |
| `generic-secret-quoted` | `SECRET` | secret | Quoted value of 8+ characters assigned to a name containing api key, secret, token, password, passwd, pwd, auth or credential | `password: "Fake-Passw0rd!"` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |
| `generic-secret` | `SECRET` | secret | Same names with a bare value; skips booleans, placeholders, env references, paths, code identifiers and values under 3.0 bits per character of entropy | `API_KEY=fake0123456789abcdef` | [gitleaks](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) |

## PII rules (opt-in)

| id | label | kind | what it catches | example that matches | source |
| --- | --- | --- | --- | --- | --- |
| `email` | `EMAIL` | pii | Email address; skips URL userinfo (`user:token@host`) and asset names like `icon@2x.png` | `jane.doe@example.com` | [RFC 5322](https://www.rfc-editor.org/rfc/rfc5322#section-3.4.1) |
| `payment-card` | `CARD` | pii | 13 to 19 digit card number starting 2 to 6, plain or with one kind of separator, checked with Luhn | `4111 1111 1111 1111` | [Luhn algorithm](https://en.wikipedia.org/wiki/Luhn_algorithm) |
| `aadhaar` | `AADHAAR` | pii | India Aadhaar: 12 digits starting 2 to 9, optional 4-4-4 grouping, checked with Verhoeff | `2345 6789 0124` | [UIDAI](https://uidai.gov.in/en/my-aadhaar/about-your-aadhaar.html) |
| `us-ssn` | `SSN` | pii | US SSN as `xxx-xx-xxxx`; skips area 000, 666 and 900 to 999, group 00, serial 0000 and known published numbers | `234-56-7890` | [SSA](https://www.ssa.gov/employer/randomization.html) |
| `iban` | `IBAN` | pii | IBAN, compact or in groups of four, checked with mod-97 | `GB82WEST12345698765432` | [IBAN](https://en.wikipedia.org/wiki/International_Bank_Account_Number) |
| `india-pan` | `PAN` | pii | India PAN: 5 letters, 4 digits, 1 letter, with a valid holder type (A, B, C, F, G, H, J, L, P, T) as the 4th letter | `ABCPE1234F` | [PAN](https://en.wikipedia.org/wiki/Permanent_account_number) |
| `phone` | `PHONE` | pii | E.164 numbers and common formatted forms with 10 to 15 digits; skips timestamps, dates, IP addresses and digits inside longer runs | `+919876543210` | [ITU E.164](https://www.itu.int/rec/T-REC-E.164) |
