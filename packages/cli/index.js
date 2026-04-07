#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prompts_1 = __importDefault(require("prompts"));
const execa_1 = require("execa");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const crypto_1 = __importDefault(require("crypto"));
const os_1 = __importDefault(require("os"));
// Clear the console and display the logo
console.clear();
const logo = chalk_1.default.cyan(`
 ▗▄▄▖ ▗▄▖ ▗▄▄▄  ▗▄▄▄▖▗▖    ▗▄▖ ▗▄▄▖ ▗▄▄▄   ▗▄▄▖     ▗▄▄▖▗▄▄▄▖▗▄▖  ▗▄▄▖▗▖ ▗▖
▐▌   ▐▌ ▐▌▐▌  █ ▐▌   ▐▌   ▐▌ ▐▌▐▌ ▐▌▐▌  █ ▐▌       ▐▌     █ ▐▌ ▐▌▐▌   ▐▌▗▞▘
▐▌   ▐▌ ▐▌▐▌  █ ▐▛▀▀▘▐▌   ▐▌ ▐▌▐▛▀▚▖▐▌  █  ▝▀▚▖     ▝▀▚▖  █ ▐▛▀▜▌▐▌   ▐▛▚▖ 
▝▚▄▄▖▝▚▄▞▘▐▙▄▄▀ ▐▙▄▄▖▐▙▄▄▖▝▚▄▞▘▐▌ ▐▌▐▙▄▄▀ ▗▄▄▞▘    ▗▄▄▞▘  █ ▐▌ ▐▌▝▚▄▄▖▐▌ ▐▌
`);
const footer = chalk_1.default.gray("                          codelords.cl by Chillenow\n");
console.log(logo);
console.log(footer);
// Main function to handle the CLI logic
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, prompts_1.default)([
            {
                type: "text",
                name: "projectName",
                message: "🛠️  Project name:",
            },
            {
                type: "select",
                name: "auth",
                message: "Include Better Auth (Email/Password)?",
                choices: [
                    { title: "Yes", value: true },
                    { title: "No", value: false },
                ],
                initial: 0,
            },
            {
                type: "select",
                name: "mailgun",
                message: "Include Mailgun (email sending)?",
                choices: [
                    { title: "Yes", value: true },
                    { title: "No", value: false },
                ],
                initial: 0,
            },
            {
                type: "select",
                name: "claudeCode",
                message: "Include Claude Code skills & rules?",
                choices: [
                    { title: "Yes", value: true },
                    { title: "No", value: false },
                ],
                initial: 0,
            },
            {
                type: "select",
                name: "nextSkills",
                message: "Include Vercel Next.js skills?",
                choices: [
                    { title: "Yes", value: true },
                    { title: "No", value: false },
                ],
                initial: 0,
            },
        ]);
        // Convert yes/no answers to an array of selected features
        const features = [];
        if (response.auth)
            features.push("auth");
        if (response.mailgun)
            features.push("mailgun");
        const { projectName } = response;
        const projectPath = path_1.default.join(process.cwd(), projectName);
        console.log("📦 Copying base template...");
        yield fs_extra_1.default.copy(path_1.default.join(__dirname, "../templates/base"), projectPath).then(() => {
            // Now run the .env copy
            copyEnvFile(projectPath);
        });
        for (const feature of features) {
            console.log(`🔧 Adding ${feature}...`);
            // If Better Auth was selected, copy the auth templates
            if (feature === "auth") {
                console.log("🧩 Adding auth templates.");
                const loginPagePath = path_1.default.join(__dirname, "../templates/auth");
                const loginTargetPath = path_1.default.join(projectPath, "src");
                yield fs_extra_1.default.copy(loginPagePath, loginTargetPath);
                console.log("🔐 Installing better-auth...");
                yield (0, execa_1.execa)("npm", ["install", "better-auth"], {
                    cwd: projectPath,
                    stdio: "ignore",
                });
                console.log("🔑 Generating Better Auth secret...");
                const secret = crypto_1.default.randomBytes(32).toString("hex");
                const envPath = path_1.default.join(projectPath, ".env");
                const envContent = yield fs_extra_1.default.readFile(envPath, "utf-8");
                if (!envContent.includes("BETTER_AUTH_SECRET=")) {
                    const newEnv = `${envContent}\nBETTER_AUTH_SECRET=${secret}\nBETTER_AUTH_URL=http://localhost:3000\n`;
                    yield fs_extra_1.default.writeFile(envPath, newEnv);
                    console.log("🔐 BETTER_AUTH_SECRET and BETTER_AUTH_URL added to .env file.");
                }
                else {
                    console.log("⚠️  BETTER_AUTH_SECRET already exists in .env. Skipped.");
                }
            }
            // If Mailgun was selected, copy the lib and install deps
            if (feature === "mailgun") {
                console.log("✉️  Adding Mailgun library...");
                // Ensure lib directory exists and copy file
                const mailgunTemplatePath = path_1.default.join(__dirname, "../templates/mailgun/mailgun.ts");
                const libTargetDir = path_1.default.join(projectPath, "src", "lib");
                yield fs_extra_1.default.ensureDir(libTargetDir);
                yield fs_extra_1.default.copy(mailgunTemplatePath, path_1.default.join(libTargetDir, "mailgun.ts"));
                console.log("📄 Copied mailgun.ts to src/lib.");
                console.log("📦 Installing mailgun.js and form-data...");
                yield (0, execa_1.execa)("npm", ["install", "mailgun.js@^11", "form-data@^4"], {
                    cwd: projectPath,
                    stdio: "ignore",
                });
                // Add helpful .env placeholders if missing
                try {
                    const envPath = path_1.default.join(projectPath, ".env");
                    const envExists = yield fs_extra_1.default.pathExists(envPath);
                    if (envExists) {
                        const envContent = yield fs_extra_1.default.readFile(envPath, "utf-8");
                        const linesToAdd = [];
                        if (!envContent.includes("MAILGUN_API_KEY="))
                            linesToAdd.push("MAILGUN_API_KEY=");
                        if (!envContent.includes("MAILGUN_DOMAIN="))
                            linesToAdd.push("MAILGUN_DOMAIN=");
                        if (!envContent.includes("MAILGUN_FROM_NAME="))
                            linesToAdd.push("MAILGUN_FROM_NAME=");
                        if (linesToAdd.length) {
                            yield fs_extra_1.default.appendFile(envPath, "\n" + linesToAdd.join("\n") + "\n");
                            console.log("🔧 Added MAILGUN_* placeholders to .env.");
                        }
                    }
                }
                catch (err) {
                    // Non-fatal; just inform
                    console.log("⚠️  Could not update .env with MAILGUN_* placeholders.");
                }
                console.log("ℹ️  Remember to set MAILGUN_API_KEY, MAILGUN_DOMAIN and MAILGUN_FROM_NAME in your .env file.");
            }
        }
        // Claude Code skills & rules
        if (response.claudeCode) {
            console.log(chalk_1.default.cyan("🤖 Adding Claude Code skills & rules..."));
            const tmpDir = path_1.default.join(os_1.default.tmpdir(), `codelords-skills-${Date.now()}`);
            const skillNames = [
                "claude-api",
                "frontend-design",
                "web-artifacts-builder",
                "mcp-builder",
                "doc-coauthoring",
            ];
            try {
                console.log("📡 Fetching Claude Code skills from GitHub...");
                yield (0, execa_1.execa)("git", ["clone", "--depth", "1", "https://github.com/anthropics/skills.git", tmpDir], {
                    stdio: "ignore",
                });
                const skillsTargetDir = path_1.default.join(projectPath, ".claude", "skills");
                yield fs_extra_1.default.ensureDir(skillsTargetDir);
                for (const skillName of skillNames) {
                    const src = path_1.default.join(tmpDir, "skills", skillName);
                    const dest = path_1.default.join(skillsTargetDir, skillName);
                    yield fs_extra_1.default.copy(src, dest);
                }
                console.log(`📦 Copied ${skillNames.length} Anthropic skills to .claude/skills/.`);
            }
            catch (err) {
                console.log(chalk_1.default.yellow("⚠️  Could not fetch Anthropic skills (network issue?). Skipping."));
            }
            finally {
                yield fs_extra_1.default.remove(tmpDir).catch(() => { });
            }
            // Generate CLAUDE.md with stack-specific rules
            console.log("📝 Generating CLAUDE.md with stack-specific rules...");
            let claudeMd = `# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this project.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Prisma 6
- Tailwind CSS 4
- shadcn/ui (New York style)
- next-themes

## Key Patterns

### Import Aliases

\`@/*\` maps to \`src/*\`. Always use this alias for imports:
\`\`\`typescript
import { Component } from "@/components/component";
\`\`\`

### Prisma Client

Always use the factory function, never instantiate directly:
\`\`\`typescript
import { getPrismaClient } from "@/lib/prisma";
const prisma = await getPrismaClient();
\`\`\`
Do NOT use \`new PrismaClient()\` — the factory handles connection pooling and edge runtime compatibility.
`;
            if (response.auth) {
                claudeMd += `
## Better Auth

This project uses Better Auth for authentication (email/password).

- **Server config**: \`src/lib/auth.ts\` — uses \`prismaAdapter\` for database storage
- **Client helpers**: \`src/lib/auth-client.ts\` — exports \`signIn\`, \`signUp\`, \`signOut\`, \`useSession\`
- **API route**: \`src/app/api/auth/[...all]/route.ts\` — catch-all handler

Usage in server components / API routes:
\`\`\`typescript
import { auth } from "@/lib/auth";
const session = await auth.api.getSession({ headers: await headers() });
\`\`\`

Usage in client components:
\`\`\`typescript
import { useSession, signIn, signOut } from "@/lib/auth-client";
const { data: session } = useSession();
\`\`\`

To customize roles or add OAuth providers, modify \`src/lib/auth.ts\`.
`;
            }
            if (response.mailgun) {
                claudeMd += `
## Mailgun

Email sending is configured via \`src/lib/mailgun.ts\`.

\`\`\`typescript
import { sendSimpleMessage } from "@/lib/mailgun";
await sendSimpleMessage(name, email, subject, text, html);
\`\`\`

Environment variables required: \`MAILGUN_API_KEY\`, \`MAILGUN_DOMAIN\`, \`MAILGUN_FROM_NAME\`.
`;
            }
            yield fs_extra_1.default.writeFile(path_1.default.join(projectPath, "CLAUDE.md"), claudeMd);
            console.log("✅ CLAUDE.md created with project-specific rules.");
        }
        // Vercel Next.js skills
        if (response.nextSkills) {
            console.log(chalk_1.default.cyan("⚡ Adding Vercel Next.js skills..."));
            const tmpDirNext = path_1.default.join(os_1.default.tmpdir(), `codelords-next-skills-${Date.now()}`);
            const nextSkillNames = [
                "next-best-practices",
                "next-cache-components",
                "next-upgrade",
            ];
            try {
                console.log("📡 Fetching Next.js skills from GitHub...");
                yield (0, execa_1.execa)("git", ["clone", "--depth", "1", "https://github.com/vercel-labs/next-skills.git", tmpDirNext], {
                    stdio: "ignore",
                });
                const skillsTargetDir = path_1.default.join(projectPath, ".claude", "skills");
                yield fs_extra_1.default.ensureDir(skillsTargetDir);
                for (const skillName of nextSkillNames) {
                    const src = path_1.default.join(tmpDirNext, "skills", skillName);
                    const dest = path_1.default.join(skillsTargetDir, skillName);
                    yield fs_extra_1.default.copy(src, dest);
                }
                console.log(`📦 Copied ${nextSkillNames.length} Next.js skills to .claude/skills/.`);
            }
            catch (err) {
                console.log(chalk_1.default.yellow("⚠️  Could not fetch Next.js skills (network issue?). Skipping."));
            }
            finally {
                yield fs_extra_1.default.remove(tmpDirNext).catch(() => { });
            }
        }
        console.log("📥 Installing dependencies...");
        yield (0, execa_1.execa)("npm", ["install"], { cwd: projectPath, stdio: "ignore" });
        console.log("✅ Codelords Stack is ready!");
    });
}
// Function to copy the .env.example file to .env in the project directory
function copyEnvFile(projectPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const templateEnvPath = path_1.default.join(__dirname, '../templates/base/env.example');
        const projectEnvPath = path_1.default.join(projectPath, '.env');
        try {
            const envAlreadyExists = yield fs_extra_1.default.pathExists(projectEnvPath);
            if (!envAlreadyExists) {
                yield fs_extra_1.default.copy(templateEnvPath, projectEnvPath);
                console.log("🔧 .env created from template.");
            }
            else {
                console.log("⚠️  Skipped .env creation — file already exists.");
            }
        }
        catch (err) {
            console.error("❌ Failed to copy .env:", err);
        }
    });
}
main();
