/**
 * Jira Ticket Lifecycle Script
 *
 * Functions:
 *   - searchDuplicates(keywords) — find similar tickets before creating
 *   - createIssue(opts)          — create a ticket with auto-filled fields
 *   - addComment(issueKey, text) — add a comment to an issue
 *   - transitionIssue(key, id)   — change issue status
 *   - linkIssues(outward, inward, type) — link two issues
 *
 * CLI Usage:
 *   node create-ticket.js --type Bug --prefix "[FE][Lead]" --title "Fix X" --desc "..."
 *   node create-ticket.js --type Subtask --parent SCRUM-1 --title "Sub item"
 *   node create-ticket.js --search "Lead 404"
 *   node create-ticket.js --comment SCRUM-1 "Root cause found: ..."
 *   node create-ticket.js --transition SCRUM-1 21
 *   node create-ticket.js --link SCRUM-3 SCRUM-5 Duplicate
 *   node create-ticket.js --list-epics
 */

const JIRA_URL =
  process.env.JIRA_URL ||
  "https://official-xantivation-studio.atlassian.net";
const JIRA_EMAIL =
  process.env.JIRA_EMAIL || "official.xantivation.studio.etc@gmail.com";
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || "";
const PROJECT_KEY = "SCRUM";
const DEFAULT_ASSIGNEE = "712020:fef541db-25f6-4658-ba5f-03cca2a3a6ed";

// --- Auth ---

function getAuth() {
  if (!JIRA_API_TOKEN) {
    console.error("ERROR: JIRA_API_TOKEN is not set.");
    process.exit(1);
  }
  return Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");
}

function getHeaders() {
  return {
    Authorization: `Basic ${getAuth()}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

// --- ADF Helpers ---

function textToADF(text) {
  const lines = text.split("\n");
  const content = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("## ")) {
      content.push({
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: trimmed.slice(3) }],
      });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      content.push({
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: trimmed.slice(2) }],
              },
            ],
          },
        ],
      });
    } else if (/^\d+\.\s/.test(trimmed)) {
      content.push({
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: trimmed.replace(/^\d+\.\s/, "") },
                ],
              },
            ],
          },
        ],
      });
    } else {
      content.push({
        type: "paragraph",
        content: [{ type: "text", text: trimmed }],
      });
    }
  }
  return { type: "doc", version: 1, content };
}

// --- Auto-fill Helpers ---

/**
 * Extract labels from prefix like "[FE][Lead]" → ["frontend", "lead"]
 */
function extractLabels(prefix) {
  const tags = prefix.match(/\[([^\]]+)\]/g) || [];
  return tags.map((tag) => {
    const val = tag.slice(1, -1).toLowerCase();
    if (val === "fe") return "frontend";
    if (val === "be") return "backend";
    if (val === "fs") return "fullstack";
    return val;
  });
}

/**
 * Calculate due date based on priority name
 */
function calculateDueDate(priorityName) {
  const daysMap = {
    Highest: 2,
    High: 5,
    Medium: 7,
    Low: 14,
    Lowest: 21,
  };
  const days = daysMap[priorityName] || 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

// --- Core Functions ---

/**
 * Search for potential duplicate tickets
 */
async function searchDuplicates(keywords) {
  const terms = keywords
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 3);
  const jqlParts = terms.map((t) => `summary ~ "${t}"`);
  const jql = `project = ${PROJECT_KEY} AND ${jqlParts.join(" AND ")} ORDER BY created DESC`;

  const response = await fetch(`${JIRA_URL}/rest/api/3/search/jql`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ jql, maxResults: 5 }),
  });
  const data = await response.json();

  if (data.issues && data.issues.length > 0) {
    console.log(`\n⚠️  Found ${data.issues.length} similar ticket(s):`);
    for (const issue of data.issues) {
      console.log(
        `  ${issue.key} — ${issue.fields.summary} [${issue.fields.status.name}]`
      );
    }
    console.log(
      "\nConsider commenting on an existing ticket instead of creating a duplicate."
    );
    return data.issues;
  } else {
    console.log("✅ No duplicates found.");
    return [];
  }
}

/**
 * Create a Jira issue with auto-filled fields
 */
async function createIssue({
  type,
  summary,
  description,
  parent,
  epic,
  priority,
  labels,
  storyPoints,
}) {
  const fields = {
    project: { key: PROJECT_KEY },
    summary,
    issuetype: { name: type },
    assignee: { accountId: DEFAULT_ASSIGNEE },
  };

  // Auto-fill priority
  if (priority) {
    fields.priority = { name: priority };
    fields.duedate = calculateDueDate(priority);
  }

  // Auto-fill labels from prefix
  if (labels && labels.length > 0) {
    fields.labels = labels;
  }

  // Story points
  if (storyPoints) {
    fields.customfield_10016 = storyPoints;
  }

  // Description
  if (description) {
    fields.description = textToADF(description);
  }

  // Link to parent Epic or parent Task
  if (parent && type !== "Epic") {
    fields.parent = { key: parent };
  }
  if (epic && !parent && type !== "Epic") {
    fields.parent = { key: epic };
  }

  const response = await fetch(`${JIRA_URL}/rest/api/3/issue`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ fields }),
  });
  const data = await response.json();

  if (data.key) {
    console.log(`\n✅ Created: ${data.key} — ${summary}`);
    console.log(`🔗 ${JIRA_URL}/browse/${data.key}`);
    console.log(`📋 Type: ${type}`);
    if (priority) console.log(`📌 Priority: ${priority}`);
    if (fields.labels?.length)
      console.log(`🏷️  Labels: ${fields.labels.join(", ")}`);
    if (fields.duedate) console.log(`📅 Due: ${fields.duedate}`);
    if (parent) console.log(`🏷️  Parent: ${parent}`);
    return data;
  } else {
    console.error("❌ Failed:", JSON.stringify(data, null, 2));
    return null;
  }
}

/**
 * Add a comment to an issue
 */
async function addComment(issueKey, text) {
  const response = await fetch(
    `${JIRA_URL}/rest/api/3/issue/${issueKey}/comment`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ body: textToADF(text) }),
    }
  );
  const data = await response.json();
  if (data.id) {
    console.log(`💬 Comment added to ${issueKey}`);
  } else {
    console.error("❌ Failed to add comment:", JSON.stringify(data));
  }
  return data;
}

/**
 * Transition an issue to a new status
 * IDs: 11=To Do, 21=Progress, 31=Review, 41=Done
 */
async function transitionIssue(issueKey, transitionId) {
  const names = { 11: "To Do", 21: "Progress", 31: "Review", 41: "Done" };
  const response = await fetch(
    `${JIRA_URL}/rest/api/3/issue/${issueKey}/transitions`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ transition: { id: String(transitionId) } }),
    }
  );
  if (response.status === 204) {
    console.log(
      `🔄 ${issueKey} → ${names[transitionId] || transitionId}`
    );
  } else {
    const data = await response.json();
    console.error("❌ Transition failed:", JSON.stringify(data));
  }
}

/**
 * Link two issues
 * Types: "Blocks", "Duplicate", "Relates", "Cloners"
 */
async function linkIssues(outwardKey, inwardKey, linkType) {
  const response = await fetch(`${JIRA_URL}/rest/api/3/issueLink`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      type: { name: linkType },
      outwardIssue: { key: outwardKey },
      inwardIssue: { key: inwardKey },
    }),
  });
  if (response.status === 201) {
    console.log(
      `🔗 Linked: ${outwardKey} ${linkType.toLowerCase()} ${inwardKey}`
    );
  } else {
    const data = await response.json();
    console.error("❌ Link failed:", JSON.stringify(data));
  }
}

/**
 * Search issues by JQL
 */
async function searchIssues(jql, maxResults = 20) {
  const response = await fetch(`${JIRA_URL}/rest/api/3/search/jql`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ jql, maxResults }),
  });
  return response.json();
}

/**
 * List all Epics in the project
 */
async function listEpics() {
  const data = await searchIssues(
    `project = ${PROJECT_KEY} AND issuetype = Epic ORDER BY created DESC`
  );
  if (data.issues) {
    console.log("\n📂 Epics:");
    for (const issue of data.issues) {
      console.log(`  ${issue.key} — ${issue.fields.summary}`);
    }
  }
  return data;
}

// --- CLI Entry Point ---

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  };

  // --list-epics
  if (args.includes("--list-epics")) {
    await listEpics();
    return;
  }

  // --search "keywords"
  const searchQuery = getArg("--search");
  if (searchQuery) {
    await searchDuplicates(searchQuery);
    return;
  }

  // --comment SCRUM-1 "text"
  const commentKey = getArg("--comment");
  if (commentKey) {
    const text = args[args.indexOf("--comment") + 2] || "";
    await addComment(commentKey, text);
    return;
  }

  // --transition SCRUM-1 21
  const transKey = getArg("--transition");
  if (transKey) {
    const transId = args[args.indexOf("--transition") + 2] || "21";
    await transitionIssue(transKey, transId);
    return;
  }

  // --link SCRUM-3 SCRUM-5 Duplicate
  const linkOut = getArg("--link");
  if (linkOut) {
    const linkIdx = args.indexOf("--link");
    const linkIn = args[linkIdx + 2] || "";
    const linkType = args[linkIdx + 3] || "Relates";
    await linkIssues(linkOut, linkIn, linkType);
    return;
  }

  // Create issue
  const type = getArg("--type") || "Task";
  const prefix = getArg("--prefix") || "";
  const title = getArg("--title") || "";
  const desc = getArg("--desc") || "";
  const parent = getArg("--parent");
  const epic = getArg("--epic");
  const priority = getArg("--priority") || "Medium";
  const points = getArg("--points");

  if (!title) {
    console.log("Usage:");
    console.log(
      '  node create-ticket.js --type Bug --prefix "[FE][Lead]" --title "Fix X" --desc "..." --priority High'
    );
    console.log(
      '  node create-ticket.js --type Subtask --parent SCRUM-1 --title "Sub item"'
    );
    console.log('  node create-ticket.js --search "Lead 404"');
    console.log(
      '  node create-ticket.js --comment SCRUM-1 "Root cause: ..."'
    );
    console.log("  node create-ticket.js --transition SCRUM-1 41");
    console.log(
      "  node create-ticket.js --link SCRUM-3 SCRUM-5 Duplicate"
    );
    console.log("  node create-ticket.js --list-epics");
    return;
  }

  const summary = prefix ? `${prefix} ${title}` : title;
  const labels = extractLabels(prefix);

  await createIssue({
    type,
    summary,
    description: desc,
    parent,
    epic,
    priority,
    labels,
    storyPoints: points ? Number(points) : undefined,
  });
}

main().catch(console.error);
