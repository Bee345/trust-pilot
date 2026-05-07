# MCP Server Setup Guide for Claude Code
# MCP = Model Context Protocol — extends Claude Code with external tool integrations.
# These let Claude directly interact with GitHub, Google Drive, Figma, etc.

---

## What MCP Servers Are

Without MCP: Claude Code can only read/write your local files, run terminal commands.
With MCP: Claude Code can also search GitHub issues, read Figma designs,
          access Google Drive docs, query databases, and much more.

Each MCP server is a small program that Claude Code runs in the background
and communicates with using a standard protocol (JSON-RPC over stdio or HTTP).

---

## Where to Configure MCP Servers

### For all projects (global — recommended for most servers)
File: `C:\Users\HP\.claude\settings.json`
Add an "mcpServers" section.

### For this project only (local)
File: `C:\Users\HP\Documents\GitHub\trust pilot\trustbase\.claude\settings.json`
Create this file if it doesn't exist.

### Settings format:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}
```

---

## YOUR CURRENT MCP SERVERS (already active in this session)

These are already connected to your Claude Code:

### 1. Google Drive
Tools available:
  - read_file_content — read any Drive file
  - search_files — search your Drive
  - list_recent_files — see recently modified files
  - create_file, copy_file, download_file_content
  - get_file_metadata, get_file_permissions

### 2. Google Calendar
Tools available:
  - Authentication flow (need to auth first)

### 3. Gmail
Tools available:
  - Authentication flow (need to auth first)

### 4. Gamma (presentation tool)
Tools available:
  - Authentication flow

### 5. VS Code IDE Integration (mcp__ide)
Tools available:
  - executeCode — run code snippets in VS Code
  - getDiagnostics — get VS Code problems/errors
  This is what powers the "Send to Agent" feature in VS Code extensions.

---

## ADDING NEW MCP SERVERS

### GitHub MCP Server

**What it does:** Claude can read your repositories, create/comment on issues,
manage pull requests, search code — all without leaving Claude Code.

**Install:**
```sh
# In your terminal
npm install -g @modelcontextprotocol/server-github
```

**Configure in `C:\Users\HP\.claude\settings.json`:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**Get your GitHub token:**
1. github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → select scopes: repo, read:org, read:user
3. Copy the token (starts with ghp_)

**What you can then ask Claude:**
- "Look at my open GitHub issues and tell me which ones are blocking the TrustBase deploy"
- "Create a GitHub issue for the ESM/CJS bug we fixed"
- "What PRs are open on the trust-pilot repo?"

---

### Figma MCP Server

**What it does:** Claude can read your Figma designs and translate them
directly into React/CSS code. Perfect for implementing TrustBase UI screens.

**Configure:**
```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key", "your-figma-token"],
      "env": {}
    }
  }
}
```

**Get Figma token:**
1. figma.com → Settings → Security → Personal access tokens → Generate token

**What you can then ask Claude:**
- "Read this Figma frame [URL] and implement it as a React component"
- "What are the font sizes and colors used in my TrustBase Figma design?"

---

### PostgreSQL / Supabase MCP Server

**What it does:** Claude can query your database directly, see table structures,
run SQL — very useful during Phase 2 (schema setup) and debugging.

**Configure:**
```json
{
  "mcpServers": {
    "supabase-db": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres:password@db.project.supabase.co:5432/postgres"
      }
    }
  }
}
```

**What you can then ask Claude:**
- "Show me all reports in the database with risk_level = 'high'"
- "How many users have is_verified = true?"
- "Check if the reports table has the right indexes"

---

### File System MCP (for structured file access)

Useful for large projects where Claude needs to navigate many folders:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\HP\\Documents\\GitHub\\trust pilot"
      ]
    }
  }
}
```

---

### Brave Search MCP (web search during coding)

Lets Claude search the web for documentation, error solutions, etc.:
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-key-from-api.search.brave.com"
      }
    }
  }
}
```

---

### For AWS S3 — No Official MCP Yet

There is no stable official AWS S3 MCP server as of May 2026.
Options:
1. Use the AWS CLI through Bash tool: `aws s3 ls s3://your-bucket`
2. Use the official AWS SDK in your code: `npm install @aws-sdk/client-s3`
3. Check npmjs.com for community MCP servers: search "mcp server aws"

For TrustBase, S3 would be useful for storing evidence photos uploaded
in the ReportScam flow (Phase 10 enhancement, not in current scope).

---

### For Google Cloud

No single official GCP MCP server, but you can use:
```json
{
  "mcpServers": {
    "gcloud": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-cloud"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "C:\\path\\to\\service-account.json"
      }
    }
  }
}
```

For TrustBase specifically, Google Cloud isn't in the current tech stack.
Supabase + Railway + Vercel covers all hosting needs.

---

## How to Apply MCP Settings

After editing `settings.json`:
1. Close Claude Code completely (close terminal, not just Ctrl+C)
2. Reopen Claude Code
3. The new MCP servers start automatically in the background

To verify an MCP server loaded:
- In Claude Code, type: "list available tools" or just try using the tool
- If it worked, Claude can see and use those tools immediately

---

## TrustBase Recommended MCP Setup

For day-to-day TrustBase development, add these to global settings:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_TOKEN"
      }
    },
    "supabase-db": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "YOUR_DATABASE_URL"
      }
    }
  }
}
```

This lets Claude:
- Create GitHub issues for bugs
- Query your Supabase database directly for debugging
- Check PR status without leaving the terminal
