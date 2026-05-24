# MCP Server Setup + Token-Saving Guide for Claude Code

> **MCP = Model Context Protocol.** It is the standard that lets Claude Code
> talk to external services (GitHub, Postman, Supabase, Figma, Google Drive, etc.)
> without leaving your terminal.
>
> Every MCP server costs you tokens on every turn — Claude Code lists the
> server's available tools in its prompt context. So the goal is: enable
> the few you actually use, scope them to projects that need them, and
> disable the rest globally.

---

## TABLE OF CONTENTS

- [1. How MCP Servers Cost You Tokens](#1-how-mcp-servers-cost-you-tokens)
- [2. Settings File Locations (Global vs Project)](#2-settings-file-locations-global-vs-project)
- [3. Currently Active in Your Setup](#3-currently-active-in-your-setup)
- [4. The Recommended Setup for TrustBase](#4-the-recommended-setup-for-trustbase)
- [5. Adding the Postman MCP Server (Global)](#5-adding-the-postman-mcp-server-global)
- [6. Other Useful MCP Servers](#6-other-useful-mcp-servers)
- [7. Disabling MCPs You Don't Use](#7-disabling-mcps-you-dont-use)
- [8. Scoping MCPs Per Project](#8-scoping-mcps-per-project)
- [9. Verifying Changes Took Effect](#9-verifying-changes-took-effect)
- [10. Troubleshooting](#10-troubleshooting)

---

## 1. How MCP Servers Cost You Tokens

Each MCP server registers a list of "tools" with Claude Code. Those tool
schemas are injected into the system prompt **on every single turn** of your
conversation. So a 200-line tool schema for an MCP you never use is 200 lines
of wasted tokens forever.

Concrete numbers (rough):
- Google Drive MCP: ~8 tools × ~50 lines each = ~400 lines
- Gmail / Calendar / Gamma: ~2 tools each ≈ 100 lines each
- GitHub MCP: ~30 tools ≈ 1500 lines
- VS Code IDE MCP: 2 tools ≈ 60 lines

For TrustBase development, the Google Drive / Calendar / Gmail / Gamma servers
are not needed. Removing them from your global config saves roughly 600 tokens
per turn × ~50 turns/day = **30,000 tokens/day** you stop wasting.

---

## 2. Settings File Locations (Global vs Project)

There are three places MCP servers can be defined. Claude Code merges them in
this order (later = higher priority):

| Scope | File | When to use |
|---|---|---|
| Global | `C:\Users\HP\.claude\settings.json` | Servers you want in every project |
| Project | `<project>\.claude\settings.json` | Servers only for this project (checked in) |
| Project local | `<project>\.claude\settings.local.json` | Servers only for this project (your machine only — gitignored) |

**Schema for any of these files:**

```json
{
  "mcpServers": {
    "<server-name>": {
      "command": "npx",
      "args": ["-y", "<package-name>"],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

> The most common mistake: putting an API key in the **project** file and
> committing it to GitHub. **Always put secrets in `settings.local.json`**
> (which is git-ignored) or in your global `settings.json` (which lives
> outside the repo).

---

## 3. Currently Active in Your Setup

Inspect your global config with:

```sh
notepad C:\Users\HP\.claude\settings.json
```

You will likely see entries for (these are eating tokens right now whether
you use them or not):

- `Google_Drive` — file search/read/write on Drive
- `Google_Calendar` — events read/write
- `Gmail` — email read/send
- `Gamma` — slide-deck generation
- `ide` (VS Code) — `executeCode`, `getDiagnostics` for the AntiGravity extension

The VS Code `ide` MCP is the only one of those you actively need for TrustBase
work — it powers "Send to Claude" from the Problems panel.

---

## 4. The Recommended Setup for TrustBase

**Global config (`C:\Users\HP\.claude\settings.json`) — minimal, cheap:**

```json
{
  "mcpServers": {
    "ide": {
      "command": "claude",
      "args": ["mcp", "ide"],
      "env": {}
    }
  }
}
```

> Keep only the VS Code IDE MCP global. Everything else moves to per-project
> configs.

**TrustBase project config (`trust pilot\trustbase\.claude\settings.json`) —
checked in, no secrets:**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

**TrustBase local secrets (`trust pilot\trustbase\.claude\settings.local.json`)
— gitignored, holds the actual tokens:**

```json
{
  "env": {
    "GITHUB_TOKEN": "ghp_your_actual_token",
    "POSTMAN_API_KEY": "PMAK-your-actual-key",
    "TRUSTBASE_DB_URL": "postgresql://postgres:..."
  },
  "mcpServers": {
    "supabase-db": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${TRUSTBASE_DB_URL}"
      }
    },
    "postman": {
      "command": "npx",
      "args": ["-y", "@postman/mcp-server"],
      "env": {
        "POSTMAN_API_KEY": "${POSTMAN_API_KEY}"
      }
    }
  }
}
```

Add `.claude/settings.local.json` to your `.gitignore`.

---

## 5. Adding the Postman MCP Server (Global)

Postman's official MCP server lets Claude read your Postman collections,
run requests, view environments, and inspect history. Useful when you have
the TrustBase API surface defined as a Postman collection and you want
Claude to test endpoints without you copy-pasting curls.

### Step 1 — Get a Postman API key

1. Sign in at **postman.com**
2. Click your avatar → **Settings** → **API Keys** (left sidebar)
3. Click **Generate API Key** → name it `claude-code-mcp`
4. Copy the key — it starts with `PMAK-`
5. Save it to your password manager

### Step 2 — Verify the package name

The Postman team has shipped (and renamed) their MCP package a few times.
Check the latest before installing:

```sh
npm search "postman mcp"
```

As of writing, the maintained packages are:
- `@postman/mcp-server` (official, beta)
- `postman-mcp` (community wrapper)

If neither exists by that exact name on your machine, run:

```sh
npx -y @postman/mcp-server --help
```

If `npx` can fetch it and print help, the package is current. If not,
visit `https://github.com/postmanlabs` and find the active repo.

### Step 3 — Add to global config

Open `C:\Users\HP\.claude\settings.json` and add under `mcpServers`:

```json
"postman": {
  "command": "npx",
  "args": ["-y", "@postman/mcp-server"],
  "env": {
    "POSTMAN_API_KEY": "PMAK-your-key-here"
  }
}
```

> **Better:** put the key in `settings.local.json` per the structure in
> Section 4 so it never ends up on GitHub.

### Step 4 — Reload Claude Code

Close every Claude Code terminal completely. Reopen. The Postman MCP
loads on startup.

### Step 5 — Verify it works

In a fresh Claude Code session, ask: *"List my Postman workspaces."*

If the MCP loaded correctly, Claude calls the Postman tool and returns
your workspace list. If it errors with "Unauthorized," the API key is
wrong. If Claude says "I don't have a Postman tool available," the MCP
didn't register — re-check the JSON syntax in `settings.json`.

---

## 6. Other Useful MCP Servers

### GitHub MCP (highly recommended for TrustBase)

```json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token"
  }
}
```

Token scopes needed: `repo`, `read:org`, `read:user`.
Generate at: GitHub → Settings → Developer settings → Personal access tokens.

### Supabase / Postgres MCP

```json
"supabase-db": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "POSTGRES_CONNECTION_STRING": "postgresql://postgres:PWD@db.PROJ.supabase.co:5432/postgres"
  }
}
```

Use the **test** project connection string here, not production. Worth
the cost during Phase 2 (schema validation) and Phase 11 (test data setup).

### Figma MCP (only if you have a Figma design)

```json
"figma": {
  "command": "npx",
  "args": ["-y", "figma-developer-mcp"],
  "env": {
    "FIGMA_API_KEY": "figd_your_token"
  }
}
```

### Filesystem MCP (rarely needed in TrustBase)

Claude Code already has full read/write on your project directory.
Only add this if you're navigating files outside the project.

### Brave Search MCP (web search during coding)

```json
"brave-search": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "your-key-from-api.search.brave.com"
  }
}
```

Replace this with Claude Code's built-in `WebSearch` tool which uses no
extra API key — usually a better choice.

---

## 7. Disabling MCPs You Don't Use

Three ways, from heaviest to lightest:

### Option A — Remove from `settings.json` (permanent)

Delete the entry from `mcpServers` in `C:\Users\HP\.claude\settings.json`.
The server won't start the next time Claude Code launches. Use this for
servers you'll never need again.

### Option B — Move to project-scoped config (selective)

Move the server's JSON entry out of the global file and into a project's
`.claude/settings.json`. Now it only loads when you open Claude Code from
inside that project directory. Use this for MCPs that are only relevant to
specific repos (e.g., Supabase MCP only for TrustBase, not for unrelated
projects).

### Option C — Disable for the current session (`/mcp` command)

In an active Claude Code session, type:

```
/mcp
```

You'll get an interactive menu of all loaded MCPs with toggle controls.
Disabling one here only affects this session — the next time you start
Claude Code, it loads again.

### Recommended cleanup for your machine

Edit `C:\Users\HP\.claude\settings.json` and remove:
- `Google_Drive`
- `Gmail`
- `Google_Calendar`
- `Gamma`

These four eat ~600 tokens/turn and you never use them for TrustBase.
If you need any of them later, re-add to the global config or move them
to projects where you do use them.

---

## 8. Scoping MCPs Per Project

This is the cleanest way to keep your global token cost low. Every project
declares only the MCPs it needs.

### Step-by-step

1. Create the project's `.claude` directory:
   ```sh
   cd "C:\Users\HP\Documents\GitHub\trust pilot\trustbase"
   mkdir .claude
   ```

2. Create `.claude/settings.json` (checked in — no secrets):
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
         }
       }
     }
   }
   ```

3. Create `.claude/settings.local.json` (NOT checked in — has secrets):
   ```json
   {
     "env": {
       "GITHUB_TOKEN": "ghp_your_actual_token_here"
     }
   }
   ```

4. Add to `.gitignore`:
   ```
   .claude/settings.local.json
   ```

5. Restart Claude Code from inside the project directory.

### How merging works

If both your global `settings.json` AND `<project>/.claude/settings.json`
define an MCP server with the same name, the **project** one wins.
If you define a server in `settings.local.json`, it overrides both.

Use this to upgrade a global MCP for a specific project (e.g., point the
global Postgres MCP at a different DB for TrustBase only).

---

## 9. Verifying Changes Took Effect

After any settings edit:

1. Close every Claude Code terminal completely (not just `Ctrl+C` —
   close the terminal window).
2. Reopen Claude Code.
3. Type `/mcp` to see what's currently loaded.
4. The list should match your `mcpServers` config exactly.

If a server doesn't appear:
- Check `settings.json` is valid JSON (trailing commas break it)
- Check the `command` and `args` actually resolve to a runnable program
  (try `npx -y <package> --help` in a terminal)
- Check the Claude Code logs: `%APPDATA%\Claude\logs\` on Windows

---

## 10. Troubleshooting

### "MCP server failed to start"

Open a terminal and run the exact command from your config:
```sh
npx -y @postman/mcp-server
```
If this errors, the package name is wrong or your network can't reach npm.

### "Tool returns Unauthorized"

The API key in the `env` block is wrong, expired, or missing scopes.
Regenerate the key and update `settings.local.json`.

### "Claude doesn't see the new MCP after I added it"

You probably edited `settings.json` while Claude Code was already running.
Servers only register at startup. Close all Claude Code windows, reopen.

### "JSON parse error in settings.json"

Most common cause: trailing comma. JSON disallows them.

Wrong:
```json
{
  "foo": "bar",
}
```

Right:
```json
{
  "foo": "bar"
}
```

Use a JSON formatter like `npx prettier --write settings.json` to autofix.

### "I added the Postman MCP and now every turn feels slower"

Each MCP adds tool schemas to the context — that's tokens being read on
every turn. If you only use Postman once a week, move it from global to
the specific project where you need it. Or disable it via `/mcp` until
you actively need it.

---

## Appendix — Reference Settings Files

### Global recommended (`C:\Users\HP\.claude\settings.json`)

```json
{
  "mcpServers": {
    "ide": {
      "command": "claude",
      "args": ["mcp", "ide"],
      "env": {}
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token"
      }
    }
  }
}
```

### TrustBase project (`trust pilot\trustbase\.claude\settings.json`) — committed

```json
{
  "mcpServers": {
    "supabase-db": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${TRUSTBASE_DB_URL}"
      }
    },
    "postman": {
      "command": "npx",
      "args": ["-y", "@postman/mcp-server"],
      "env": {
        "POSTMAN_API_KEY": "${POSTMAN_API_KEY}"
      }
    }
  }
}
```

### TrustBase secrets (`trust pilot\trustbase\.claude\settings.local.json`) — gitignored

```json
{
  "env": {
    "TRUSTBASE_DB_URL": "postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres",
    "POSTMAN_API_KEY": "PMAK-your-key"
  }
}
```
