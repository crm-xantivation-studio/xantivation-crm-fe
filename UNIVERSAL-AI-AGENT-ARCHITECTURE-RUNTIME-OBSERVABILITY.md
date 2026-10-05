# Universal Interactive AI Agent Architecture & Runtime Observability WebUI

> A reusable implementation specification for building a visual WebUI that explains **what an AI Agent system contains, how its components connect, and what the Agent is doing at runtime**.
>
> This document intentionally avoids binding the implementation to a specific framework, cloud provider, repository structure, model provider, or tool system. The implementation must inspect the target project and adapt the visualization to its real architecture and runtime behavior.

---

## 1. Core Objective

Build an interactive **AI Agent Architecture & Runtime Observability WebUI**.

The UI must answer two different questions:

### Architecture — “Hệ thống có gì?”

Show:

- What components exist?
- What responsibilities does each component have?
- How are components connected?
- What data moves between them?
- Which components belong to which architectural layer?
- Where does each component live in the source repository?
- What external systems, storage, APIs, tools, or channels are involved?

### Runtime — “Hệ thống đang làm gì?”

Show:

- What the Main Agent is currently doing.
- How a large task is decomposed into Sub-Agents.
- Which Sub-Agent is working on which task.
- Which Agents are running in parallel.
- Which Agent is waiting for another Agent.
- Which tools are being called.
- Which shell/terminal commands are executing.
- Which files are being read, created, or modified.
- Which external APIs/MCP tools/services are being used.
- How tool results return to the Agent.
- How Sub-Agent results return to the parent Agent.
- How the final result is aggregated and returned.

The final product should feel like an **interactive observability layer for an AI system**, rather than a static architecture diagram.

---

# 2. Design Principles

## 2.1 Architecture-Agnostic

Do not hard-code assumptions about:

- Cloud provider
- Backend framework
- Frontend framework
- Database
- LLM provider
- Agent framework
- Tool protocol
- Repository structure
- Deployment model

First inspect the target project.

Then derive the visualization from:

- Source code
- Configuration
- Agent definitions
- Tool definitions
- Service boundaries
- Runtime events
- Data flow
- Existing documentation
- Existing architecture rules

---

## 2.2 Static Architecture and Runtime Execution Are Different Layers

Do not mix the two concepts.

### Static Architecture Graph

Represents the known system topology:

```text
User
  ↓
API / Gateway
  ↓
Agent Runtime
  ├── Context / Memory
  ├── Model
  ├── Tool Registry
  ├── Sub-Agent Manager
  └── Persistence
       ↓
External Services
```

### Runtime Execution Graph

Represents what is happening during one specific execution:

```text
Main Agent
   │
   ├── Sub-Agent A
   │     ├── Tool Call
   │     └── Tool Result
   │
   ├── Sub-Agent B
   │     └── Shell Command
   │
   └── Tool Call
         ↓
      Result
```

The architecture graph is relatively stable.

The runtime graph changes continuously.

---

# 3. Primary WebUI Views

The WebUI should contain at least two major modes.

## View A — System Architecture

Purpose:

> Understand the complete system and how its components are connected.

Show:

- Application boundaries
- Agent runtime
- Backend services
- Storage
- Model providers
- Tool systems
- External APIs
- User/client channels
- Queues/event systems where applicable
- Authentication/security boundaries
- Internal service connections

### Required interactions

- Pan
- Zoom
- Search
- Filter by architectural layer
- Filter by component type
- Highlight connected components
- Highlight a complete path
- Click node
- Click connection
- Reset viewport
- Fit-to-screen
- Toggle labels/details

---

## View B — Agent Execution / Turn Loop

Purpose:

> Understand what happens during one Agent execution.

A generic execution may look like:

```text
Input
  ↓
Context Load
  ↓
Agent Reasoning / Decision
  ↓
Task Planning
  ↓
Delegation / Tool Selection
  ↓
Tool / Sub-Agent Execution
  ↓
Result Processing
  ↓
Context / State Update
  ↓
Response / Action
```

Do not assume every project follows this exact sequence.

The actual flow must be derived from the target system.

---

# 4. Agent Execution Tree

This is the most important addition beyond a traditional architecture diagram.

The UI must visualize the **hierarchical execution structure of Agents**.

## 4.1 Main Agent

Every execution begins with a root Agent:

```text
Main Agent
└── User Task
```

The Main Agent may:

- Analyze the task
- Plan work
- Call tools
- Create Sub-Agents
- Wait for Sub-Agent results
- Combine results
- Continue execution
- Return the final response

---

## 4.2 Dynamic Sub-Agent Creation

When the Main Agent decides that a task should be delegated, the UI must visibly show:

```text
Main Agent
     │
     ├── delegate()
     │
     └──────────────→ Sub-Agent A
```

The visualization should animate the creation of the Sub-Agent.

Example:

```text
Main Agent
    │
    │ delegation event
    ▼
[Creating Sub-Agent]
    │
    ▼
[Sub-Agent A]
```

The user should be able to understand:

> “The Agent created another Agent to handle part of the task.”

---

## 4.3 Recursive Sub-Agents

Sub-Agents may create additional Sub-Agents.

Example:

```text
Main Agent
├── Research Agent
│   ├── Search Agent
│   └── Analysis Agent
│
├── Coding Agent
│   ├── File Agent
│   └── Test Agent
│
└── Review Agent
```

The UI must support arbitrary execution depth.

Do not limit the implementation to only:

```text
Main Agent → Sub-Agent
```

It should support:

```text
Agent
└── Agent
    └── Agent
        └── Agent
```

---

# 5. Parallel Agent Execution

Multiple Sub-Agents may execute simultaneously.

Example:

```text
                 ┌── Research Agent ────────┐
                 │                          │
Main Agent ──────┼── Coding Agent ──────────┼──→ Aggregation
                 │                          │
                 └── Testing Agent ────────┘
```

The UI should clearly communicate:

- Which Agents are active.
- Which Agents are waiting.
- Which Agents finished.
- Which Agents failed.
- Which Agents are executing in parallel.
- Which results are dependencies for another Agent.

Avoid representing parallel execution as a simple sequential list.

---

# 6. Agent Execution States

Each Agent should have a visible runtime state.

Recommended states:

```text
idle
queued
starting
planning
delegating
running
waiting
tool_call
waiting_for_tool
waiting_for_agent
aggregating
completed
failed
cancelled
retrying
```

The implementation may adapt these states to the actual runtime.

Example:

```text
Main Agent
● running

Research Agent
● completed

Coding Agent
● tool_call

Testing Agent
● waiting
```

State transitions should be animated when possible.

---

# 7. Tool Execution Visualization

Agents frequently interact with tools.

The UI must make Tool execution visible instead of hiding it inside the Agent node.

Example:

```text
Agent
  │
  ├── Tool Call
  │      │
  │      ▼
  │   Search Tool
  │      │
  │      ▼
  │   Tool Result
  │      │
  └──────┘
```

Possible tool categories:

- Search
- Browser
- Database
- API
- File system
- Shell
- Terminal
- Code execution
- Git
- MCP tools
- External services
- Internal services
- Retrieval / RAG
- Memory
- Human approval

Do not hard-code this list if the project has different tool categories.

---

# 8. Shell / Terminal Visualization

When an Agent executes shell commands, the UI should show a dedicated execution activity.

Example:

```text
Coding Agent
      │
      ▼
Shell
$ npm test
      │
      ▼
Process Output
✓ 42 tests passed
```

The UI may expose:

- Command
- Working directory
- Start time
- Duration
- Exit code
- Streaming output
- Final result
- Error output

Do not expose secrets, credentials, tokens, or sensitive environment variables.

---

# 9. File Operation Visualization

Agent file activity should be visible.

Examples:

```text
Coding Agent
   │
   ├── Read
   │    └── src/agent/runtime.ts
   │
   ├── Modify
   │    └── src/ui/ArchitectureView.tsx
   │
   └── Create
        └── tests/runtime.test.ts
```

Possible operations:

- Read
- Create
- Modify
- Delete
- Rename
- Search
- Diff
- Patch

Where available, display:

- File path
- Operation
- Agent responsible
- Timestamp
- Duration
- Optional diff summary

---

# 10. Agent-to-Agent Communication

The visualization should show communication between Agents.

Example:

```text
Research Agent
      │
      │ result
      ▼
Main Agent
      │
      │ task
      ▼
Coding Agent
```

Show:

- Sender
- Receiver
- Message/event type
- Timestamp
- Status
- Result summary

Do not expose hidden chain-of-thought.

Show only safe structured metadata and concise result summaries.

---

# 11. Result Aggregation

When multiple Agents complete their work, show how the parent Agent aggregates the results.

Example:

```text
Research Agent ───────┐
                      │
Coding Agent ─────────┼──→ Main Agent
                      │       │
Testing Agent ────────┘       ▼
                         Final Response
```

The UI should make dependencies visible.

If one Agent is waiting for another, the relationship should be obvious.

---

# 12. Live Runtime Activity Feed

In addition to the visual graph, provide a chronological activity feed.

Example:

```text
12:04:21  Main Agent started
12:04:22  Main Agent created Research Agent
12:04:22  Main Agent created Coding Agent
12:04:23  Research Agent called Search Tool
12:04:25  Search Tool completed
12:04:26  Research Agent completed
12:04:27  Coding Agent executed shell command
12:04:31  Shell command completed
12:04:32  Main Agent aggregated results
12:04:34  Main Agent completed
```

Each event should be clickable.

Clicking an event should focus the related node/connection.

---

# 13. Claude-Like Progressive Execution Visualization

The UI should provide a visual experience similar in spirit to modern Agent interfaces where execution gradually appears as the Agent works.

The goal is not to clone any specific product.

The important behaviors are:

### Progressive disclosure

Do not show every internal detail immediately.

Start with:

```text
Main Agent
   ↓
Working...
```

Then reveal:

```text
Main Agent
├── Planning
├── Research Agent
├── Coding Agent
└── Tool Call
```

Then allow the user to expand deeper details.

### Expandable execution nodes

Example:

```text
Main Agent
├── Research Agent           [completed]
│   ├── Search Tool          [completed]
│   └── Analysis             [completed]
│
├── Coding Agent             [running]
│   ├── Read file            [completed]
│   └── Shell command        [running]
│
└── Final aggregation        [waiting]
```

---

# 14. Execution Timeline

Every execution should have a timeline.

Example:

```text
00:00  Main Agent started
00:02  Planning
00:04  Spawn Research Agent
00:04  Spawn Coding Agent
00:05  Research Agent → Search
00:08  Search → Result
00:09  Research Agent completed
00:10  Coding Agent → Shell
00:15  Shell → Result
00:16  Coding Agent completed
00:17  Main Agent aggregation
00:19  Final response
```

Use the timeline to communicate:

- Duration
- Parallelism
- Waiting periods
- Tool latency
- Agent latency
- Errors
- Retries
- Dependencies

---

# 15. Live Data Flow Animation

Connections should be able to display activity.

Example:

```text
Agent ───────●────────→ Tool
             ↑
        moving data
```

The moving indicator represents an actual runtime event.

Possible event types:

- Request
- Response
- Tool call
- Tool result
- Agent delegation
- Agent result
- Database operation
- Event/message
- Stream chunk

Do not animate arbitrary connections just for visual effect.

Animations should correspond to real or simulated runtime events.

---

# 16. Simulation Mode

Provide a simulation mode when real runtime events are unavailable.

Example controls:

```text
[Reset] [Previous] [Play] [Next]
```

Simulation should demonstrate:

```text
Input
 ↓
Context
 ↓
Agent
 ↓
Delegation
 ↓
Sub-Agent
 ↓
Tool
 ↓
Result
 ↓
Aggregation
 ↓
Response
```

The simulation must use the same visualization components as real runtime execution.

This ensures that:

> Simulation is a fallback data source, not a separate UI implementation.

---

# 17. Real Runtime Integration

When the project exposes runtime events, use them.

Potential mechanisms include:

- WebSocket
- Server-Sent Events
- Event stream
- Message bus
- Logs
- Tracing
- Structured runtime callbacks
- Database events
- Existing observability APIs

The WebUI should consume normalized events.

Example:

```ts
type RuntimeEvent = {
  id: string
  executionId: string
  timestamp: number
  type: RuntimeEventType
  sourceAgentId?: string
  targetAgentId?: string
  nodeId?: string
  toolId?: string
  parentEventId?: string
  status?: string
  metadata?: Record<string, unknown>
}
```

---

# 18. Runtime Event Types

A generic event model may contain:

```text
execution.started
execution.completed
execution.failed

agent.created
agent.started
agent.waiting
agent.completed
agent.failed

agent.delegated
agent.result

tool.called
tool.started
tool.completed
tool.failed

shell.started
shell.output
shell.completed

file.read
file.created
file.modified
file.deleted

message.sent
message.received

context.loaded
context.updated

model.requested
model.completed

storage.read
storage.write

error.occurred
retry.started
retry.completed
```

The actual project may use different events.

Normalize them into a UI-oriented event model.

---

# 19. Architecture Data Model

Create a normalized architecture model.

Example:

```ts
type ArchitectureNode = {
  id: string
  name: string
  type: string

  layer?: string
  description?: string

  responsibilities?: string[]
  invariants?: string[]

  sourcePaths?: string[]

  metadata?: Record<string, unknown>
}

type ArchitectureEdge = {
  id: string
  source: string
  target: string

  type?: string
  label?: string

  direction?: "one-way" | "two-way"

  protocol?: string
  dataType?: string

  metadata?: Record<string, unknown>
}
```

The model should be generic enough to represent:

- Agents
- Services
- Workers
- APIs
- Databases
- Queues
- Storage
- Tools
- External systems
- UI clients
- Model providers

---

# 20. Runtime Execution Data Model

Keep runtime state separate from architecture.

Example:

```ts
type AgentExecution = {
  id: string
  executionId: string

  parentAgentId?: string

  agentType?: string
  name: string

  task?: string

  status: AgentExecutionStatus

  startedAt?: number
  completedAt?: number

  children?: string[]
}

type ToolExecution = {
  id: string

  agentId: string
  toolName: string

  status: string

  startedAt?: number
  completedAt?: number

  inputSummary?: string
  outputSummary?: string
}
```

This separation is important.

### Architecture

```text
What exists?
```

### Runtime

```text
What is happening?
```

---

# 21. Architecture ↔ Runtime Relationship

Runtime entities should reference architecture entities whenever possible.

Example:

```text
ArchitectureNode
     │
     │ nodeId
     ▼
Runtime Agent Execution
```

This allows the user to move from:

> “What is this component?”

to:

> “What is this component doing right now?”

Example interaction:

1. Click Agent Runtime node.
2. Open architecture inspector.
3. Show responsibilities.
4. Show source paths.
5. Show current executions.
6. Highlight active tools.
7. Highlight connected services.

---

# 22. Node Inspector

Clicking any architecture node should open an inspector.

Recommended sections:

### Identity

```text
Name
Type
Layer
Status
```

### Responsibilities

```text
- Accepts Agent requests
- Manages execution
- Coordinates tools
```

### Connections

```text
Incoming
Outgoing
Protocols
Data types
```

### Architecture Invariants

```text
- Must not access another tenant's data
- Must validate internal requests
```

Only show invariants that are actually supported by the target project's architecture/documentation.

### Source

```text
src/agent/runtime.ts
src/services/tool-manager.ts
```

### Runtime

```text
Active executions
Current state
Recent events
```

---

# 23. Connection Inspector

Clicking a connection should reveal:

```text
Source
Target
Connection type
Protocol
Direction
Data/event type
Authentication mechanism
Relevant source paths
Recent runtime activity
```

Example:

```text
Agent Runtime
     ↓
Tool Gateway

Protocol:
Internal RPC

Data:
ToolRequest / ToolResult

Recent activity:
12 calls
2.3s average latency
```

Do not invent values when runtime telemetry is unavailable.

---

# 24. Search and Filtering

The architecture view should support search.

Example:

```text
Search: "memory"
```

Highlight:

```text
Memory Service
Memory Store
Agent Context
```

Filters may include:

```text
Layer
Component type
Agent
Tool
Storage
External service
Runtime status
Active execution
```

The filters should be dynamically derived when possible.

---

# 25. Focus Mode

When a user selects a node, provide a focus mode.

Example:

```text
Selected:
Coding Agent

Show:
Coding Agent
   ↓
File System
   ↓
Shell
   ↓
Test Runner
```

Dim unrelated nodes.

This prevents large architecture graphs from becoming visually overwhelming.

---

# 26. Execution Replay

Persist or retain execution events sufficiently to replay an execution.

Controls:

```text
[Reset]
[Play]
[Pause]
[Previous]
[Next]
[Speed 1×]
```

The user should be able to replay:

```text
Agent created
↓
Sub-Agent created
↓
Tool called
↓
Tool completed
↓
Sub-Agent completed
↓
Parent Agent resumed
↓
Final response
```

---

# 27. Multiple Execution Sessions

Support more than one execution session.

Example:

```text
Execution #1042
Execution #1041
Execution #1040
```

A session should contain:

- Root execution
- Agents
- Tools
- Events
- Timeline
- Errors
- Final status

The UI may allow switching between sessions.

---

# 28. Error and Retry Visualization

Errors must be part of the execution graph.

Example:

```text
Coding Agent
     │
     ▼
Shell
     │
     ✕
  failed
     │
     ▼
Retry
     │
     ▼
Shell
     │
     ✓
completed
```

Show:

- Error source
- Error type
- Retry count
- Retry relationship
- Final outcome

Errors should not disappear into logs.

---

# 29. Security / Chain-of-Thought Boundary

The UI is an observability tool.

It must **not expose private hidden chain-of-thought** or sensitive internal reasoning.

Instead of showing:

```text
[private internal reasoning]
```

show safe structured activities such as:

```text
Planning task
Delegating research task
Calling Search Tool
Waiting for Tool Result
Aggregating results
Preparing final response
```

This gives useful observability without exposing private reasoning.

Also protect:

- API keys
- Tokens
- Passwords
- Secrets
- Private environment variables
- Sensitive user data
- Internal credentials

Sensitive values should be redacted before reaching the UI.

---

# 30. Visual Language

The UI should feel like a professional developer/observability product.

Recommended characteristics:

- Clean
- Technical
- Premium
- Dense but readable
- Dark-mode friendly
- Strong hierarchy
- Minimal decoration
- Clear state indicators
- Smooth transitions
- Subtle animations
- No unnecessary gradients
- No excessive cards
- No decorative AI imagery

The architecture should remain readable even when the system is complex.

---

# 31. Recommended Layout

A practical layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
│ Architecture | Runtime | Executions | Search | Filters     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Main Graph Canvas                        │
│                                                             │
│              Architecture / Runtime Graph                  │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Runtime Timeline / Activity Feed                            │
└─────────────────────────────────────────────────────────────┘
```

When selecting a node:

```text
┌───────────────────────────────┬─────────────────────────────┐
│                               │ Node Inspector              │
│       Graph Canvas            │                             │
│                               │ Responsibilities            │
│                               │ Connections                 │
│                               │ Source Paths                │
│                               │ Runtime                     │
│                               │ Events                      │
└───────────────────────────────┴─────────────────────────────┘
```

---

# 32. Main Runtime Mental Model

The UI should visually communicate this hierarchy:

```text
SYSTEM
│
├── ARCHITECTURE
│   ├── Components
│   ├── Connections
│   ├── Services
│   ├── Storage
│   ├── Tools
│   └── External Systems
│
└── RUNTIME
    │
    └── EXECUTION
        │
        └── MAIN AGENT
            │
            ├── Planning
            │
            ├── Sub-Agent A
            │   ├── Tool
            │   └── Result
            │
            ├── Sub-Agent B
            │   ├── Shell
            │   └── File Operations
            │
            ├── Tool Call
            │
            └── Aggregation
                │
                └── Final Response
```

This hierarchy should be the foundation of the UX.

---

# 33. Project Inspection Before Implementation

Before implementing the UI, inspect the target project.

Identify:

### Architecture

- Applications
- Services
- Packages
- Workers
- APIs
- Databases
- Storage
- Queues
- External integrations

### Agent System

- Main Agent
- Sub-Agent definitions
- Agent lifecycle
- Delegation mechanism
- Tool registry
- Tool execution
- Model invocation
- Context/memory
- Persistence

### Runtime

- Execution lifecycle
- Events
- Logs
- Streaming
- Agent state
- Tool state
- Errors
- Retries

### Repository

Find relevant source paths and map them to architecture nodes.

Do not create fake architecture based only on filenames.

---

# 34. Implementation Strategy

## Phase 1 — Discover

Inspect the repository and produce:

```text
Architecture Map
Runtime Map
Agent Map
Tool Map
Event Map
Source Map
```

## Phase 2 — Normalize

Create:

```text
ArchitectureNode[]
ArchitectureEdge[]

RuntimeExecution
AgentExecution[]
ToolExecution[]
RuntimeEvent[]
```

## Phase 3 — Build Static Architecture View

Implement:

- Graph
- Pan/Zoom
- Search
- Filters
- Inspector
- Connection inspector
- Focus mode

## Phase 4 — Build Runtime View

Implement:

- Execution tree
- Agent states
- Tool activity
- Shell activity
- File activity
- Timeline
- Activity feed

## Phase 5 — Connect Real Runtime Events

Use the project's actual event/stream/telemetry mechanism.

## Phase 6 — Add Simulation

Use deterministic mock events only when real runtime data is unavailable.

## Phase 7 — Replay

Allow recorded events to be replayed through the same runtime UI.

---

# 35. Reusability Requirements

The implementation should be reusable for different AI systems.

It should support at least these conceptual patterns:

```text
Single Agent
Multi-Agent
Agent + Tools
Agent + RAG
Agent + Memory
Agent + MCP
Agent + Sub-Agents
Agent + Human Approval
Agent + External APIs
Agent + Code Execution
```

It should also remain useful for non-Agent system topology where appropriate.

---

# 36. Avoid These Mistakes

Do not:

- Build only a static diagram.
- Hard-code the graph to one project's components.
- Fake runtime events when real events exist.
- Animate unrelated connections.
- Treat Sub-Agents as ordinary static services.
- Hide tool execution.
- Hide errors and retries.
- Mix architecture and runtime state into one data model.
- Expose private chain-of-thought.
- Expose credentials or secrets.
- Create excessive decorative UI.
- Build a separate simulator that does not use the real visualization components.
- Invent responsibilities, invariants, protocols, or source paths that cannot be verified.

---

# 37. Definition of Done

The feature is complete when a user can:

### Architecture

- Open the architecture view.
- Understand the major system components.
- Understand component relationships.
- Search for a component.
- Filter the graph.
- Zoom and pan.
- Inspect a node.
- Inspect a connection.
- Find the relevant source code.

### Runtime

- Start or observe an execution.
- See the Main Agent.
- See task decomposition.
- See Sub-Agents being created.
- See nested Sub-Agents.
- See parallel execution.
- See Agent state changes.
- See tool calls.
- See shell execution.
- See file operations.
- See Agent-to-Agent communication.
- See results returning.
- See aggregation.
- See final completion.

### Observability

- See a live activity feed.
- See an execution timeline.
- See active data flow.
- See errors.
- See retries.
- Replay an execution.
- Switch between execution sessions.

### Safety

- No private chain-of-thought is exposed.
- Secrets are redacted.
- Sensitive data is protected.

### Engineering

- Architecture and runtime data are separated.
- Real runtime events are preferred over fake events.
- Simulation uses the same UI components.
- The implementation is derived from the actual project.
- No project-specific assumptions leak into the generic visualization layer.

---

# 38. Final Implementation Instruction

> **Inspect this project first, then build an interactive AI Agent Architecture & Runtime Observability WebUI based on the project's actual architecture and execution behavior.**
>
> The WebUI must visualize both:
>
> 1. **Static Architecture** — what components exist and how they connect.
> 2. **Runtime Execution** — what the Agent is doing right now.
>
> Runtime visualization must include the Main Agent, dynamic Sub-Agent creation, recursive delegation, parallel execution, Agent states, Tool execution, Shell/Terminal activity, File operations, Agent-to-Agent communication, result aggregation, errors, retries, and execution timeline.
>
> The UI should provide a progressive, interactive experience where execution appears and evolves as events occur, similar in spirit to modern Agent development interfaces, while remaining an original implementation.
>
> Do not expose hidden chain-of-thought. Show only safe, structured runtime activities and summaries.
>
> Use the actual project architecture, source code, runtime events, and existing conventions as the source of truth. Do not invent components, relationships, protocols, invariants, or runtime behavior.
>
> Architecture data and runtime execution data must remain separate but connected through stable identifiers.
>
> Prefer real runtime events whenever available. If the project does not expose sufficient runtime events, implement a deterministic simulation/replay layer using the same visualization components.
>
> The result should feel like a professional **AI system observability environment**, allowing a developer to understand:
>
> ```text
> What exists?
>        ↓
> How is it connected?
>        ↓
> What is executing?
>        ↓
> Which Agent delegated what?
>        ↓
> Which Tools / Sub-Agents are active?
>        ↓
> What results are returning?
>        ↓
> How was the final result produced?
> ```
>
> Do not implement a decorative architecture diagram. Build a genuinely interactive architecture + runtime observability system.
