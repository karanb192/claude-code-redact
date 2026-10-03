# redact for Claude Code

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

**Every key a developer pastes into Claude Code goes to the model and stays in a session file on disk. redact swaps it for a placeholder inside Claude Code, before the model reads it and before the transcript keeps it, with zero network reach.**

Site: [redact.aidojo.si](https://redact.aidojo.si). It is a Claude Code [mod](https://code.claude.com/docs/en/plugins/mods/overview): a plugin of TypeScript function hooks that runs in the Claude Code process.

## What happens

```
# Headless `claude -p` run on Claude Code 2.1.288. The prompt held a fake AWS access key id.
# Typed (key masked here):
my aws key is AKIA**************** please remember it
# The user row as stored in the session file:
my aws key is [REDACTED:AWS_KEY#20fae26c] please remember it
# The stored system-prompt snapshot carried the redaction notice that tells Claude the placeholder is opaque.
```

The same value gets the same placeholder for the whole session. When Claude later edits a file that holds it, redact puts the real value back inside the `Edit`, `Write` or `NotebookEdit` arguments only.

## Install

```
claude plugin marketplace add karanb192/claude-code-redact
claude plugin install redact@claude-code-redact
```

Then run `/reload-plugins` in an open session. Requires Claude Code 2.1.287 or later. Type `/redact` to see what it hid.

To try it for one session without installing: `claude --plugin-dir ./plugins/redact`.

## What makes it safe to run

- **Reach L0.** It runs no process, reads no file, env var or setting, and writes no file. The validator lines in [What it reaches](#what-it-reaches) list every hook, call and state key.
- **No network.** Nothing leaves the machine. It starts no daemon and calls no scanner binary.
- **No model call.** Detection never asks a model. A redactor that sent your text to a model to find secrets would defeat its own purpose.
- **Deterministic rules.** 23 secret rules and 7 opt-in PII rules: regex plus checksums (Luhn, Verhoeff, IBAN mod-97, JWT header decode). The same input gives the same output. Every quantifier is bounded.
- **Reversible only inside `Edit`, `Write` and `NotebookEdit`.** Placeholders turn back into real values only in those arguments, so an edit to a line that held a key still matches the file. `Bash` never gets the real value, so the model cannot echo a placeholder into a network command and send the secret out.
- **Fail closed.** A row that makes the scanner throw is replaced with `[redact withheld this content: the redactor failed while scanning it]`. It is never stored raw.
- **The transcript file too.** It rewrites at `session.append`, the one event that sees every row before it is stored and sent: prompts, tool results, Claude's own blocks, attachments, notices. The model and the session file get the same rewritten row.
- **Proof files.** The repo ships the threat model below, [`RULES.md`](plugins/redact/RULES.md) with a public source for every rule, and [`DECISIONS.md`](plugins/redact/DECISIONS.md) with every rejected option and every assumption not yet checked.

## Proof so far

From a run on Claude Code 2.1.288 with the mod-builder harness:

- `claude plugin validate` passed.
- The module loaded with events `session.start`, `prompt.submit`, `session.append`, `tool.call`, `prompt.section`, `command.run`.
- `tsc` passed.
- 60 kit tests pass (`claude plugin test`).
- `/redact` answered in a headless run.
- A headless `claude -p` run with a fake AWS key stored the user row as shown in [What happens](#what-happens), and the stored system-prompt snapshot carried the redaction notice.

Not done yet: a live interactive run with a logged-in session and a real file edit by the model. The kit tests cover the argument rewrite in `Edit`, `Write` and `NotebookEdit`. A real edit end to end has not been run.

## What it reaches

    ❯ ./register.ts hooks: session.start, prompt.submit, session.append, tool.call{tool=Edit|Write|NotebookEdit}, prompt.section{name=env_info_simple}, command.run{command=redact}
    ❯ ./register.ts calls: $.command.register, $.state.get, $.state.set, $.ui.log
    ❯ ./register.ts state writes: redact.counts, redact.restored, redact.salt, redact.vault
    ❯ ./register.ts state reads: redact.counts, redact.restored, redact.salt, redact.vault

Reach L0, draws and remembers.

```
Threat model for redact (reach L0, draws and remembers)
1. Reads:    the text of every prompt and every stored row (prompts, tool results, Claude's blocks, attachments, notices) and the arguments of Edit, Write and NotebookEdit calls, in memory; state keys redact.vault, redact.salt, redact.counts, redact.restored; no files, no env vars, no settings
2. Runs:     nothing
3. Sends:    nothing leaves the machine; no network call, no model call
4. Persists: placeholder-to-value pairs, the salt and counters in $.state for this session only (reset by /clear, /resume, /branch; gone at exit); nothing in $.store, no files
5. Hostile input: a crafted row can only change what gets redacted; the rule set is fixed in source and nothing reaches a process, a file, the network or the model. A crafted placeholder in a tool argument restores only a value this session hid itself; an unknown one passes through unchanged. A row that makes the scanner throw is withheld from the model, never stored raw
```

## How it works

1. **`prompt.submit`.** The typed prompt is scanned. Each hit becomes `[REDACTED:LABEL#hash]` before the engine queues it.
2. **`session.append`.** Every row the conversation stores is scanned the same way: file reads, shell output, MCP results, Claude's own blocks, attachments such as nested memory, notices. The rewritten row is what the model reads and what the session file keeps. If the scanner throws, the row is replaced with `[redact withheld this content: the redactor failed while scanning it]`. It fails closed.
3. **`tool.call` on `Edit`, `Write`, `NotebookEdit`.** Placeholders in the arguments are swapped back for the real value, so an edit to a line that held a key still matches the file. `Bash` never gets the real value.
4. **`prompt.section`.** One paragraph is appended to the environment section. It tells Claude the placeholders are opaque, so it does not ask you for the hidden value.
5. **`/redact`.** Shows the session total by label and how many placeholders were restored.

The hash is FNV-1a over a per-session salt plus the value:

```ts
export function placeholder(hit: Hit, salt: string): string {
  return `[REDACTED:${hit.label}#${fnv1a(salt + hit.value)}]`
}
```

The same secret gets the same placeholder across rows, edits and compaction summaries. A placeholder from another session means nothing here. The value map lives in `$.state` for this session only, never on disk.

## What it catches

Secrets, always on: AWS access keys and secret keys, GitHub, GitLab, Slack tokens and webhooks, Stripe live keys, SendGrid, Twilio, Google API keys and OAuth secrets, Anthropic, OpenAI, Hugging Face, npm and PyPI tokens, Azure storage keys, JWTs, PEM private keys, database URLs with a password, `Authorization` header values, and generic `password=` / `api_key=` style assignments.

PII, opt-in with `pii: true`: email, payment cards (Luhn), India Aadhaar (Verhoeff), US SSN, IBAN (mod-97), India PAN, phone numbers.

Every rule, with its id, a fake example and its source: [`RULES.md`](plugins/redact/RULES.md).

## Options

Stored under `pluginConfigs` in settings. A change reloads the mod.

- `pii` (boolean, default `false`): also hide email, phone, payment cards, US SSN, Aadhaar, PAN and IBAN. Secrets are always hidden.
- `quiet` (boolean, default `false`): no `redact: hid ...` line in the transcript. `/redact` still reports totals.
- `off` (string, default empty): comma-separated rule ids to skip, for example `generic-secret,email`. Ids are in [`RULES.md`](plugins/redact/RULES.md).

## Limitations

- Two engine bookkeeping records in the session file are stored as made and can keep the typed prompt: the `queue-operation` record written at enqueue, and a command's `args` stamp. Neither is sent to the model. In the headless `-p` run above, both still held the typed text. In the headless path the queue record is written before `prompt.submit` runs. This is a known gap.
- A secret the rules do not know stays visible. Generic `key=value` detection needs the value to look like a secret (length and entropy): `password=hunter2` is caught, `token=abc` is not.
- A secret split across two rows, or shown partially (the last four characters), is not caught.
- Images are not scanned. A screenshot of a key goes through.
- Claude cannot search for a secret by value: `Grep` for a placeholder finds nothing. Search by the line around it.
- Plugins loaded ahead of this one see the row before it is rewritten.
- The screen may show a row just before its rewrite. The model and the session file never see that form.
- Nothing is drawn in `claude -p`, the SDK, the VS Code panel or cloud sessions. The `redact: hid ...` line arrives as `ui_log` there. `/redact` still reports totals; it answered in the headless run.
- A pattern guard is not a permission rule. A determined prompt can describe a secret in words the rules do not match.

Assumptions not yet checked (subagent rows, restore after `/reload-plugins`, the interactive queue record) are listed with a way to check each one in [`DECISIONS.md`](plugins/redact/DECISIONS.md).

## For teams

- **Distribute it from a managed marketplace.** Add this repo, or your fork of it, to the marketplace your organization already manages, so every developer installs the same reviewed copy.
- **Pin a version.** Installed copies are cached by `version`. Review a release, then pin it. Upgrade on purpose.
- **Set the policy in `pluginConfigs`.** Turn on `pii` if your code and logs carry customer data. Use `off` to drop a rule that fires on your own fixtures, by id.
- **Know the limit of self-install.** A developer can disable any plugin they installed themselves. Org-wide enforcement needs managed settings. See Anthropic's [plugin admin docs](https://code.claude.com/docs/en/plugins/mods/admin).
- **Read the threat model before rollout.** It is five lines, above. The hook code is [`hooks/register.ts`](plugins/redact/hooks/register.ts) (127 lines) and [`hooks/scrub.ts`](plugins/redact/hooks/scrub.ts) (98 lines). The rules live in [`hooks/rules.ts`](plugins/redact/hooks/rules.ts).

## Uninstall

Disable it in `/plugin`. It leaves nothing: no store keys, no files.

## Contributing

New rules and fixes are welcome. A rule PR needs:

1. The rule in [`hooks/rules.ts`](plugins/redact/hooks/rules.ts) with bounded quantifiers.
2. A row in [`RULES.md`](plugins/redact/RULES.md): id, label, what it catches, a fake example, and a public source for the format.
3. Fixtures in [`tests/rules.test.ts`](plugins/redact/tests/rules.test.ts): at least one fake value that must match and one near miss that must not.
4. A green `claude plugin test plugins/redact` and `claude plugin validate plugins/redact --strict`.

Never put a real secret in a fixture. Fake values with the right shape are enough.

Built with the mod-builder skill from [claude-code-mods](https://github.com/karanb192/claude-code-mods).

## License

MIT
