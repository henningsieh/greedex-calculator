# `CONTEXT.md` versus `DOMAIN-GLOSSARY.md`

## Question

Is `CONTEXT.md` a special agent-reserved filename, and is it the right name for Greendex's domain wording glossary?

## Findings

- `AGENTS.md` is the documented repository-wide agent-instruction mechanism in the agents.md project. It describes the file as a predictable place for agent context and instructions: <https://github.com/agentsmd/agents.md>.
- GitHub documents `AGENTS.md` as agent instructions, `.github/copilot-instructions.md` as repository-wide Copilot instructions, and `NAME.instructions.md` files as path-specific instructions. It does not list `CONTEXT.md` as an agent instruction filename: <https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot>.
- Claude Code documents `CLAUDE.md` and `.claude/rules/` as project instruction mechanisms. It also distinguishes project instructions from auto-memory and says that project context Claude cannot derive from code can be stored in memory. It does not assign a special meaning to `CONTEXT.md`: <https://code.claude.com/docs/en/memory>.
- `CONTEXT.md` is nevertheless an emerging, optional convention. The context.md project proposes a repository context layer stored as `context.md` or `.repo/context.md`, containing intent, constraints, and an evolved-context ledger: <https://github.com/kerbelp/context-md>.
- Before this decision, this repository's local domain documentation defined `CONTEXT.md` as a glossary location and explicitly told agents to consult it: `docs/agents/domain.md`. The external domain-modeling skill still uses `CONTEXT.md` as its default glossary filename, so this repository now overrides that convention explicitly in its own domain documentation.

## Recommendation

Use **`DOMAIN-GLOSSARY.md`** at the repository root for Greendex's canonical domain language.

Why:

1. It says exactly what the file contains: domain terms and preferred wording.
2. It avoids conflating a glossary with agent instructions, project state, architectural context, or an evolving learning ledger.
3. It is more discoverable for humans searching for wording guidance than a generic `CONTEXT.md`.
4. The repository already has `AGENTS.md` and `.github/instructions/` for agent instructions, so a second context-sounding filename is unnecessary.

Keep the glossary strictly language-only. Put implementation rules in `AGENTS.md` or scoped instructions, architectural trade-offs in ADRs, and durable project facts in normal documentation.

## Migration implication

Adopted: the root glossary is now `DOMAIN-GLOSSARY.md`; `docs/agents/domain.md` is the repository-local discovery link. No `CONTEXT-MAP.md` is needed unless the repository later develops multiple independent domain contexts. The external domain-modeling skill may still mention `CONTEXT.md`, but repository-local documentation is authoritative for this project.
