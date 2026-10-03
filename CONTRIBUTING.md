# Contributing

## Run the checks

```
claude plugin validate plugins/redact --strict
claude plugin test plugins/redact
```

Both need Claude Code 2.1.287 or later on PATH and no login. The test kit runs the mod's hooks in the real engine.

For type checking, load the mod once so Claude Code writes the type declarations for your build, then run tsc:

```
claude -p "/redact" --plugin-dir plugins/redact
npx -y -p typescript tsc -p plugins/redact
```

## Add or change a rule

Rules live in `plugins/redact/hooks/rules.ts`, one literal per rule, and are listed in `plugins/redact/RULES.md`. A rule change ships with:

- at least three positive fixtures and three look-alike negatives in `plugins/redact/tests/rules.test.ts`, built from pieces so no whole token sits in the source;
- the row in `RULES.md` with the public source of the pattern (the gitleaks config, the provider's docs, a spec);
- a bounded pattern: no unbounded nested quantifiers, and the 2 MB performance test still under one second.

A rule that fires on ordinary code is worse than a rule that misses a rare token. When in doubt, tighten the verify function instead of widening the regex.

## Report a miss or a false positive

Open an issue with the shape of the text (a fake value in the same format), the rule you expected, and what happened. Never paste a real secret into an issue.

## Scope

The mod stays at reach L0: no network, no processes, no files, no model calls. A change that adds any of those needs a reason in `DECISIONS.md` and a new line in the threat model, and will usually be declined.
