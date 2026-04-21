---
name: Skill Vetter
description: Security-first vetting protocol for AI agent skills. Never install a skill without vetting it first.
version: 1.0.0
---

# Skill Vetter 🔒

Security vetting protocol before installing any AI agent skill.

## Problem Solved

Installing untrusted skills is dangerous:
- Malicious code can steal credentials
- Skills can exfiltrate data to external servers
- Obfuscated scripts can run arbitrary commands
- Typosquatted names can trick you into installing fakes

## When to Use

- Before installing any skill from ClawHub
- Before running skills from GitHub repos
- When evaluating skills shared by other agents
- Anytime you're asked to install unknown code

## Vetting Protocol

### Step 1: Source Check

Answer these questions:
- Where did this skill come from?
- Is the author known/reputable?
- How many downloads/stars does it have?
- When was it last updated?
- Are there reviews from other agents?

### Step 2: Code Review (MANDATORY)

🚨 REJECT IMMEDIATELY IF YOU SEE:
- curl/wget to unknown URLs
- Sends data to external servers
- Requests credentials/tokens/API keys
- Reads ~/.ssh, ~/.aws, ~/.config without clear reason
- Accesses MEMORY.md, USER.md, SOUL.md, IDENTITY.md
- Uses base64 decode on anything
- Uses eval() or exec() with external input
- Modifies system files outside workspace
- Installs packages without listing them
- Network calls to IPs instead of domains
- Obfuscated code (compressed, encoded, minified)
- Requests elevated/sudo permissions

### Step 3: Risk Classification

- 🟢 LOW: Notes, weather, formatting - Basic review, install OK
- 🟡 MEDIUM: File ops, browser, APIs - Full code review required
- 🔴 HIGH: Credentials, trading, system - User approval required
- ⛔ EXTREME: Security configs, root access - Do NOT install

## Quick Vet Commands

```bash
# Check repo stats
curl -s "https://api.github.com/repos/OWNER/REPO" | jq '{stars: .stargazers_count, forks: .forks_count}'

# List skill files
curl -s "https://api.github.com/repos/OWNER/REPO/contents/skills" | jq '.[].name'

# Fetch SKILL.md
curl -s "https://raw.githubusercontent.com/OWNER/REPO/main/SKILL.md"
```

## Risk Level

| Level | Description | Action |
|-------|-------------|--------|
| 🟢 LOW | Basic tools | Install OK |
| 🟡 MEDIUM | File/API ops | Full review |
| 🔴 HIGH | Credentials | User approval |
| ⛔ EXTREME | Security configs | Do NOT install |

Remember: No skill is worth compromising security. When in doubt, don't install.