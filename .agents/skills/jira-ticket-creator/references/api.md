# Jira API Reference (Project-Specific)

This file contains project-specific API details for the SCRUM project.
AI already knows standard Jira REST API — this documents **only what's unique to this instance**.

---

## Authentication

```
Email:    official.xantivation.studio.etc@gmail.com
Token:    from mcp_config.json → atlassian-mcp-server → env.JIRA_API_TOKEN
Base URL: https://official-xantivation-studio.atlassian.net
Header:   Authorization: Basic ${Buffer.from(email:token).toString('base64')}
```

---

## Project-Specific Notes

- **Next-gen (team-managed)** project — uses `parent` field for both Epic linking AND Subtask parenting
- **No `customfield_10014`** — do not use Epic Link custom field
- **Search endpoint**: `POST /rest/api/3/search/jql` (old GET `/search` is removed)

---

## Available Fields

| Field ID | Name | Type | Example |
|---|---|---|---|
| `summary` | Summary | string | **Required** |
| `issuetype` | Issue Type | object | **Required** — `{ name: "Task" }` |
| `project` | Project | object | **Required** — `{ key: "SCRUM" }` |
| `parent` | Parent | object | `{ key: "SCRUM-1" }` |
| `description` | Description | ADF object | See ADF section |
| `priority` | Priority | object | `{ name: "High" }` |
| `labels` | Labels | string[] | `["frontend", "lead"]` |
| `assignee` | Assignee | object | `{ accountId: "712020:fef541db-..." }` |
| `duedate` | Due date | string | `"2026-08-15"` |
| `customfield_10016` | Story points | number | `3` |
| `customfield_10015` | Start date | string | `"2026-08-01"` |
| `customfield_10020` | Sprint | object | Sprint object |

---

## Priorities

| Name | ID | Color | Use |
|---|---|---|---|
| Highest | `1` | 🔴 | Blocks progress, crash, data loss |
| High | `2` | 🟠 | Serious, could block progress |
| Medium | `3` | 🟡 | Potential to affect progress |
| Low | `4` | ⚪ | Minor, easily worked around |
| Lowest | `5` | ⚪ | Trivial, cosmetic |

---

## Status Transitions

| Name | Transition ID | Status ID | Category |
|---|---|---|---|
| To Do | `11` | `10000` | New (blue-gray) |
| Progress | `21` | `10001` | In Progress (yellow) |
| Review | `31` | `10002` | In Progress (yellow) |
| Done | `41` | `10003` | Done (green) |

```javascript
// Transition an issue
await fetch(`${BASE}/rest/api/3/issue/SCRUM-1/transitions`, {
  method: "POST", headers,
  body: JSON.stringify({ transition: { id: "21" } })  // → Progress
});
```

---

## Issue Link Types

| Name | ID | Outward | Inward |
|---|---|---|---|
| Blocks | `10000` | "blocks" | "is blocked by" |
| Cloners | `10001` | "clones" | "is cloned by" |
| Duplicate | `10002` | "duplicates" | "is duplicated by" |
| Relates | `10003` | "relates to" | "relates to" |

```javascript
// Link two issues
await fetch(`${BASE}/rest/api/3/issueLink`, {
  method: "POST", headers,
  body: JSON.stringify({
    type: { name: "Duplicate" },
    inwardIssue: { key: "SCRUM-3" },
    outwardIssue: { key: "SCRUM-5" }
  })
});
```

---

## Comments

```javascript
// Add comment to issue
await fetch(`${BASE}/rest/api/3/issue/SCRUM-1/comment`, {
  method: "POST", headers,
  body: JSON.stringify({
    body: {
      type: "doc", version: 1,
      content: [{ type: "paragraph", content: [{ type: "text", text: "Comment text" }] }]
    }
  })
});
```

---

## ADF (Atlassian Document Format)

Descriptions and comments use ADF JSON:

```json
{ "type": "doc", "version": 1, "content": [ /* block nodes */ ] }
```

| Node | Usage |
|---|---|
| `heading` | `{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Title" }] }` |
| `paragraph` | `{ type: "paragraph", content: [{ type: "text", text: "Content" }] }` |
| `bulletList` | Contains `listItem` → `paragraph` children |
| `orderedList` | Contains `listItem` → `paragraph` children |
| `codeBlock` | `{ type: "codeBlock", attrs: { language: "js" }, content: [...] }` |

Inline marks: `strong` (bold), `em` (italic), `code` (monospace).
