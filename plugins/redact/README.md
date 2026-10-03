# redact

Redacts secrets and PII from every row Claude Code stores, before the model reads it and before the transcript keeps it, and puts the real value back only inside `Edit`, `Write` and `NotebookEdit` arguments so file edits still work.

Built on Claude Code 2.1.288. Proven on 2.1.288 (stages: validate, load, typecheck, test, command, isolation). Requires Claude Code 2.1.287 or later.

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

Detection is deterministic: 23 secret rules and 7 PII rules, regex plus checksums (Luhn, Verhoeff, IBAN mod-97, JWT header decode), no model call. The list with sources is in `RULES.md`.

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

- Two engine bookkeeping records in the session file are stored as made and can keep the typed prompt: the `queue-operation` record written at enqueue, and a command's `args` stamp. Neither is sent to the model. In the headless `-p` path the queue record is written before `prompt.submit` runs.
- A secret the rules do not know stays visible. Generic `key=value` detection needs the value to look like a secret (length and entropy); `password=hunter2` is caught, `token=abc` is not.
- A secret split across two rows, or shown partially (the last four characters), is not caught.
- Images are not scanned. A screenshot of a key goes through.
- Claude cannot search for a secret by value: `Grep` for a placeholder finds nothing. Search by the line around it.
- Plugins loaded ahead of this one see the row before it is rewritten.
- The screen may show a row just before its rewrite; the model and the session file never see that form.
- Nothing is drawn in `claude -p`, the SDK, the VS Code panel or cloud sessions; the `redact: hid ...` line arrives as `ui_log` there, and `/redact` works everywhere.
- A pattern guard is not a permission rule. A determined prompt can describe a secret in words the rules do not match.

## Uninstall

Disable it in `/plugin`. It leaves nothing: no store keys, no files.
