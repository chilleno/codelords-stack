#!/usr/bin/env node

/**
 * E2E test for codelords-stack CLI.
 *
 * Scaffolds a test project with all features enabled, verifies the generated
 * file structure, starts the Next.js dev server, and exits. Playwright browser
 * checks are run separately via MCP after this script reports success.
 *
 * Usage:
 *   node scripts/test-e2e.mjs                # full run (scaffolds + starts server)
 *   node scripts/test-e2e.mjs --skip-cleanup  # keep test project after run
 *   node scripts/test-e2e.mjs --verify-only   # skip scaffold, just verify existing project
 */

import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PROJECT_NAME = "test-skills-project";
const PROJECT_PATH = join(ROOT, PROJECT_NAME);
const SKIP_CLEANUP = process.argv.includes("--skip-cleanup");
const VERIFY_ONLY = process.argv.includes("--verify-only");

let failures = 0;

function pass(msg) {
  console.log(`  ✅ ${msg}`);
}

function fail(msg) {
  console.log(`  ❌ ${msg}`);
  failures++;
}

function check(condition, msg) {
  condition ? pass(msg) : fail(msg);
}

function fileExists(relativePath) {
  return existsSync(join(PROJECT_PATH, relativePath));
}

function fileContains(relativePath, text) {
  if (!fileExists(relativePath)) return false;
  const content = readFileSync(join(PROJECT_PATH, relativePath), "utf-8");
  return content.includes(text);
}

// ── Step 1: Build CLI ──────────────────────────────────────────────────────
if (!VERIFY_ONLY) {
  console.log("\n🔨 Building CLI...");
  execSync("npm run build", { cwd: ROOT, stdio: "inherit" });

  // ── Step 2: Scaffold test project ──────────────────────────────────────
  if (existsSync(PROJECT_PATH)) {
    console.log("🧹 Removing previous test project...");
    rmSync(PROJECT_PATH, { recursive: true, force: true });
  }

  console.log(`\n📦 Scaffolding ${PROJECT_NAME} (all features enabled)...\n`);

  // prompts.inject() pre-fills answers: projectName, auth, mailgun, claudeCode, nextSkills
  const injectScript = `
    const prompts = require('prompts');
    prompts.inject(['${PROJECT_NAME}', true, false, true, true]);
    require('./packages/cli/index.js');
  `;

  execSync(`node -e "${injectScript.replace(/\n/g, " ")}"`, {
    cwd: ROOT,
    stdio: "inherit",
    timeout: 300000, // 5 min (git clones + npm install)
  });
}

// ── Step 3: Verify file structure ────────────────────────────────────────
console.log("\n🔍 Verifying generated project structure...\n");

// Anthropic skills
const anthropicSkills = [
  "claude-api",
  "frontend-design",
  "web-artifacts-builder",
  "mcp-builder",
  "doc-coauthoring",
];
for (const skill of anthropicSkills) {
  check(
    fileExists(`.claude/skills/${skill}/SKILL.md`),
    `Anthropic skill: ${skill}`
  );
}

// Vercel Next.js skills
const nextSkills = [
  "next-best-practices",
  "next-cache-components",
  "next-upgrade",
];
for (const skill of nextSkills) {
  check(
    fileExists(`.claude/skills/${skill}/SKILL.md`),
    `Next.js skill: ${skill}`
  );
}

// CLAUDE.md
check(fileExists("CLAUDE.md"), "CLAUDE.md exists");
check(
  fileContains("CLAUDE.md", "Better Auth"),
  "CLAUDE.md contains Better Auth section"
);
check(
  !fileContains("CLAUDE.md", "Mailgun"),
  "CLAUDE.md does NOT contain Mailgun section (mailgun was disabled)"
);
check(
  fileContains("CLAUDE.md", "getPrismaClient"),
  "CLAUDE.md contains Prisma pattern"
);

// Auth template files
check(fileExists("src/app/login/page.tsx"), "Login page exists");
check(fileExists("src/app/register/page.tsx"), "Register page exists");
check(
  fileExists("src/app/api/auth/[...all]/route.ts"),
  "Auth API route exists"
);

// .env
check(fileExists(".env"), ".env file exists");
check(
  fileContains(".env", "BETTER_AUTH_SECRET="),
  ".env has BETTER_AUTH_SECRET"
);
check(
  fileContains(".env", "BETTER_AUTH_URL="),
  ".env has BETTER_AUTH_URL"
);

// Base template
check(fileExists("src/app/page.tsx"), "Home page exists");
check(fileExists("prisma/schema.prisma"), "Prisma schema exists");
check(fileExists("package.json"), "package.json exists");
check(fileExists("node_modules"), "node_modules installed");

// ── Step 4: Summary ─────────────────────────────────────────────────────
console.log("");
if (failures > 0) {
  console.log(`\n💥 ${failures} check(s) failed.\n`);
  if (!SKIP_CLEANUP) {
    rmSync(PROJECT_PATH, { recursive: true, force: true });
  }
  process.exit(1);
} else {
  console.log("🎉 All file structure checks passed!\n");
}

// ── Step 5: Start dev server for Playwright testing ─────────────────────
console.log("🚀 Starting Next.js dev server on port 3000...");
console.log("   Waiting for server to be ready...\n");

const server = spawn("npm", ["run", "dev"], {
  cwd: PROJECT_PATH,
  stdio: "pipe",
  detached: false,
});

server.stdout.on("data", (data) => {
  const text = data.toString();
  process.stdout.write(`   [next] ${text}`);
  if (text.includes("Ready") || text.includes("localhost:3000")) {
    console.log("\n✅ Dev server is ready at http://localhost:3000");
    console.log("   Run Playwright tests now. Press Ctrl+C to stop.\n");
  }
});

server.stderr.on("data", (data) => {
  process.stderr.write(`   [next] ${data}`);
});

// Cleanup on exit
function cleanup() {
  console.log("\n🛑 Stopping dev server...");
  server.kill("SIGTERM");
  if (!SKIP_CLEANUP) {
    console.log("🧹 Removing test project...");
    rmSync(PROJECT_PATH, { recursive: true, force: true });
  }
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
