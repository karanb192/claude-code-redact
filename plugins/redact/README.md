# redact

Redacts secrets and PII from every row Claude Code stores, before the model reads it and before the transcript keeps it, and puts the real value back only inside `Edit`, `Write` and `NotebookEdit` arguments so file edits still work.

Built on Claude Code 2.1.288. Proven on 2.1.288 (stages: validate, load, typecheck, test, command, isolation, plus a live interactive session with a real file write). Requires Claude Code 2.1.287 or later.

## What it can reach

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

1. `prompt.submit`: the typed prompt is scanned and each hit becomes `[REDACTED:LABEL#hash]` before the engine queues it.
2. `session.append`: every row the conversation stores is scanned the same way: tool results (file reads, shell output, MCP results), Claude's own blocks, attachments such as nested memory, notices. The rewritten row is what the model reads and what the session file keeps.
3. `tool.call` on `Edit`, `Write` and `NotebookEdit`: placeholders in the arguments are swapped back for the real value, so an edit to a line that held a key still matches the file. `Bash` never gets the real value.
4. `prompt.section`: one paragraph is appended to the environment section telling Claude the placeholders are opaque.
5. `/redact`: the session total by label and how many placeholders were restored.

The hash is FNV-1a over a per-session salt plus the value, so the same secret gets the same placeholder across rows, edits and compaction summaries, and a placeholder from another session means nothing here.

Detection is deterministic: 24 secret rules and 7 PII rules, regex plus checksums (Luhn, Verhoeff, IBAN mod-97, JWT header decode), no model call. The list with sources is in `RULES.md`.

## False positives on ordinary code

A redactor that fires on normal work gets uninstalled in a week, so the number to defend is the false-positive count, not the catch count. `tools/fp-corpus.mjs` shallow-fetches 11 public repositories at pinned commits (lockfiles, Go sums, Terraform, Markdown, minified JS, JWT and PEM test vectors, a dotenv test suite) and scans every text file with the secret rules:

| Files scanned | Secret-rule hits | Real test keys and vectors | Fake fixtures | False positives |
|---|---|---|---|---|
| 42,836 | 68 | 60 | 8 | 0 |

Every hit was opened at its line and labelled by hand; the labels live in `tools/fp-corpus-labels.json`, so a rerun that produces a new hit shows it as unreviewed instead of counting it. Rerun it yourself:

```
node tools/fp-corpus.mjs
```

The full per-hit list is in `tools/fp-corpus-results.md` at the repo root. The 60 real-shaped hits are complete private keys and signed JWTs published as test vectors, and demo database URLs with a password; a redactor should hide those. The PII rules, off by default, hit 650 times on the same corpus (mostly email addresses in docs), which is why they are opt-in.

## Install

One session: `claude --plugin-dir ./plugins/redact`. To keep it:

```
claude plugin marketplace add karanb192/claude-code-redact
claude plugin install redact@claude-code-redact
```

then `/reload-plugins` in an open session. Installed copies are cached by version: bump `version` before reinstalling.

## Options

Stored under `pluginConfigs` in settings; a change reloads the mod.

- `pii` (boolean, default `false`): also hide email, phone, payment cards, US SSN, Aadhaar, PAN and IBAN. Secrets are always hidden.
- `quiet` (boolean, default `false`): no `redact: hid ...` line in the transcript. `/redact` still reports totals.
- `off` (string, default empty): comma-separated rule ids to skip, for example `generic-secret,email`. Ids are in `RULES.md`.

## Limitations

- **Three host bookkeeping records are stored as made and can hold a raw value.** The engine lets a mod rewrite the conversation rows the model reads, not the records around them. (a) The `toolUseResult` record of a `Write`, `Edit` or `NotebookEdit` call keeps the file content as written, so a value restored into a file lands there in clear. (b) A slash command's `args` stamp keeps the typed arguments. (c) In headless `claude -p` only, the `queue-operation` record keeps the typed prompt, because it is written before `prompt.submit` runs; an interactive session writes no such record. None of the three is sent to the model.
- **`tool_use` blocks are not rewritable.** The engine puts the model's own tool call blocks back as made; a mod may rewrite text blocks and tool results only. The model only ever sees placeholders, so a raw value in a tool call means it came from text the rules missed.
- **A secret the rules do not know stays visible.** Generic `key=value` detection needs the value to look like a secret (length and entropy): `password=hunter2` is caught, `token=abc` is not.
- **A secret split across two rows, or shown partially** (the last four characters), is not caught.
- **Images are not scanned.** A screenshot of a key goes through.
- **Claude cannot search for a secret by value.** `Grep` for a placeholder finds nothing. Search by the line around it.
- **Plugins loaded ahead of this one** see the row before it is rewritten.
- **The screen may show a row just before its rewrite.** The model and the session file never see that form.
- **Nothing is drawn in `claude -p`, the SDK, the VS Code panel or cloud sessions.** The `redact: hid ...` line arrives as `ui_log` there. `/redact` works everywhere.
- **A pattern guard is not a permission rule.** A determined prompt can describe a secret in words the rules do not match.

## Uninstall

Disable it in `/plugin`. It leaves nothing: no store keys, no files.
