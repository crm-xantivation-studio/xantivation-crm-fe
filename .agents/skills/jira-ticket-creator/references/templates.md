# Description Templates

Use these structures when writing Jira ticket descriptions.
Convert to ADF JSON format before sending to the API (see [api.md](./api.md) for ADF reference).

---

## Bug

```markdown
## What happened
Brief description of the defect.

## Steps to Reproduce
1. Navigate to [page/module]
2. Perform [action]
3. Observe [unexpected behavior]

## Expected Behavior
What should happen instead.

## Actual Behavior
What actually happens. Include error messages, console logs, or status codes if available.

## Environment
- Module: [module name, e.g., Lead, Deal, Contact]
- Source: [FE / BE / FS]
- Browser: [if FE-related]
- API endpoint: [if BE-related]
```

---

## Task

```markdown
## Objective
What needs to be done and why.

## Scope
- Item 1
- Item 2
- Item 3

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3
```

---

## Epic

```markdown
## Overview
High-level description of the initiative.

## Goals
- Goal 1
- Goal 2

## Modules Affected
- [Module 1] — what changes
- [Module 2] — what changes

## Child Tickets
Will be broken into individual Task/Bug tickets.
```

---

## Story

```markdown
## User Story
As a [role], I want [feature], so that [benefit].

## Acceptance Criteria
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
```

---

## Notes

- **Keep descriptions practical** — don't over-template if the user provides enough context
- **AI should fill in what it knows** — if AI just debugged the bug, it already knows steps to reproduce, expected vs actual behavior
- **Short is OK** — a 2-line description with clear info beats a long template with placeholder text
