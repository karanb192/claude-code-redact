# Security

This mod runs inside Claude Code with your own access. It makes no network call, starts no process, writes no file, and calls no model. The validator prints that reach before any code runs:

```
claude plugin validate plugins/redact --strict
```

## Report a problem

Email karan@karanbansal.in. Include the Claude Code version (`claude --version`), the mod version from `plugins/redact/.claude-plugin/plugin.json`, and the shape of the text involved with fake values. Never send a real secret.

A bypass (text the rules should catch and do not) is a bug, not a vulnerability; open a public issue for it unless it also leaks something already hidden. A way to make a hidden value leave the machine, or to make the mod store a raw value it reported as hidden, is a vulnerability; email it.

## What is in scope

- A placeholder restored outside `Edit`, `Write` and `NotebookEdit` arguments.
- A row stored raw after the mod reported it hidden.
- A crafted row that makes the mod call anything beyond `$.command.register`, `$.state`, and `$.ui.log`.
- A regex that can be made to run past the ten-second hook budget.

## What is out of scope

- Secrets in formats the rules do not know. See `plugins/redact/README.md` under Limitations and open an issue.
- Engine bookkeeping records the hooks cannot rewrite (the `queue-operation` record and a command's `args` stamp). Those are documented and not sent to the model.
