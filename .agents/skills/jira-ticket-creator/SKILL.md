---
name: jira-ticket-creator
description: >
  Create and manage Jira tickets with full lifecycle automation.
  Supports keyword trigger, screenshot analysis, proactive suggestion,
  duplicate detection, auto-fill fields, and post-creation management.
---

# Jira Ticket Creator

## When to Activate

- User says: "tạo ticket", "log bug", "create issue", "báo lỗi", or similar (fuzzy match, typos OK)
- Keyword trigger: message starts with `bug:`, `task:`, `feature:`, `lỗi:`, etc.
- Screenshot + short description ("lỗi này", "bug này")
- **Proactive**: After AI debugs/fixes/reviews code → ask user: *"Bạn muốn tạo ticket để track không?"*
- **Batch**: User says "test xong" → summarize issues from conversation → offer to create all

> These triggers are examples, not exact-match. Use NLU to detect intent.

> **IMPORTANT**: Never auto-create. Always ask user for confirmation first.

---

## Config

| Key | Value |
|---|---|
| Base URL | `https://official-xantivation-studio.atlassian.net` |
| Project | `SCRUM` (CRM-XAN) |
| Auth | Basic Auth — email + API token from `mcp_config.json` → `atlassian-mcp-server` → `env` |
| Assignee | `712020:fef541db-25f6-4658-ba5f-03cca2a3a6ed` |

### Work Types

| Type | ID | Use |
|---|---|---|
| Epic | `10001` | Large initiative, groups other tickets |
| Task | `10003` | Actionable work item |
| Story | `10004` | User story |
| Bug | `10006` | Defect found during testing |
| Subtask | `10002` | Child of any work type above |

All 4 main types (Epic, Task, Story, Bug) are **equal-level**.

---

## Ticket Creation Flow

### Step 1: Duplicate Check (REQUIRED)

Before creating ANY ticket, search for existing similar tickets:

```
Search JQL: project = SCRUM AND summary ~ "keyword1" AND summary ~ "keyword2"
```

Extract 2-3 keywords from the user's description (module name + key symptom).

**If potential duplicate found:**
> "Đã có SCRUM-15 `[FE][Lead] Detail page 404` tương tự. Bạn muốn:
> 1. Comment thêm info vào ticket cũ
> 2. Tạo ticket mới
> 3. Link duplicate"

### Step 2: Auto-fill Fields

AI should automatically determine these fields — do NOT ask user for each one:

| Field | How AI determines | Fallback |
|---|---|---|
| `priority` | Crash/data loss = Highest, broken feature = High, UI glitch = Medium, cosmetic = Low | Medium |
| `labels` | Extract from prefix + module: `[FE][Lead]` → `["frontend", "lead"]` | `[]` |
| `duedate` | Highest = +2 days, High = +5 days, Medium = +7 days, Low = +14 days | No duedate |
| `customfield_10016` (story points) | AI estimates: quick fix = 1, moderate = 3, complex = 5 | Skip |
| `assignee` | Default assignee from config | Default |

### Step 3: Create Ticket

Use [create-ticket.js](./scripts/create-ticket.js) or call API directly.
See [api.md](./references/api.md) for field details and ADF format.

### Step 4: Post-creation Actions

After creating, AI should automatically:

| Action | When | How |
|---|---|---|
| **Add technical comment** | AI has debug info, stack trace, root cause | `POST /issue/{key}/comment` |
| **Link related tickets** | Bug relates to existing task/epic | `POST /issueLink` |
| **Suggest status transition** | AI just fixed the code | Ask: "Chuyển SCRUM-X sang Progress/Done?" |

---

## Title Convention

Format: `[FE|BE|FS][Module?] Concise English description`

- `[FE]` Frontend, `[BE]` Backend, `[FS]` Full Stack
- Module tag optional: `[FE][Lead]`, `[BE][Deal]`
- English, max ~80 chars, no `[BUG]`/`[TASK]` prefix

---

## Parent-Child Structure

| Scenario | Structure |
|---|---|
| Module overhaul | Epic → multiple Tasks |
| Standalone bug or task | Bug / Task (no parent) |
| Complex multi-part fix | Bug → Subtasks |
| Batch bugs from test session | Task (parent) → Subtasks per bug |

Link via `parent` field (next-gen project, no `customfield_10014`).

---

## Status Transitions

| Transition | ID | From → To |
|---|---|---|
| To Do | `11` | Any → To Do |
| Progress | `21` | Any → In Progress |
| Review | `31` | Any → Review |
| Done | `41` | Any → Done |

AI should suggest transitions when:
- AI starts working on a bug → "Chuyển sang Progress?"
- AI finishes fix → "Chuyển sang Review/Done?"
- User confirms fix works → "Close ticket?"

---

## Issue Links

| Link Type | ID | Usage |
|---|---|---|
| Blocks | `10000` | "SCRUM-3 blocks SCRUM-5" |
| Duplicate | `10002` | Mark duplicate tickets |
| Relates | `10003` | Related issues |

When duplicate is detected after creation → link as duplicate + ask to close one.

---

## Response Format

After creating a ticket:
```
✅ Created: SCRUM-XX — Title
🔗 https://official-xantivation-studio.atlassian.net/browse/SCRUM-XX
📋 Type: Bug | Task | Epic    📌 Priority: High
🏷️ Labels: frontend, lead     🏷️ Parent: SCRUM-YY (if any)
```

---

## References

- [API Reference](./references/api.md) — endpoints, fields, ADF format, project-specific config
- [Description Templates](./references/templates.md) — Bug/Task/Epic description structures
- [create-ticket.js](./scripts/create-ticket.js) — helper script