#!/usr/bin/env node
import prompts from "prompts";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import crypto from "crypto";
import os from "os";

type PackageManager = "pnpm" | "npm";

// Detect the package manager to use for the generated project: prefer pnpm,
// fall back to npm when pnpm is not installed on the user's machine.
async function detectPackageManager(): Promise<PackageManager> {
    try {
        await execa("pnpm", ["--version"]);
        return "pnpm";
    } catch {
        return "npm";
    }
}

// Install the full dependency set, retrying with npm if pnpm fails.
async function installAll(pm: PackageManager, cwd: string) {
    try {
        await execa(pm, ["install"], { cwd, stdio: "inherit" });
    } catch (err) {
        if (pm !== "pnpm") throw err;
        console.log(chalk.yellow("⚠️  pnpm install failed — retrying with npm..."));
        await execa("npm", ["install"], { cwd, stdio: "inherit" });
    }
}

// Add dependencies (pnpm uses `add`, npm uses `install`), retrying with npm if pnpm fails.
async function addDeps(pm: PackageManager, pkgs: string[], cwd: string) {
    const args = pm === "pnpm" ? ["add", ...pkgs] : ["install", ...pkgs];
    try {
        await execa(pm, args, { cwd, stdio: "inherit" });
    } catch (err) {
        if (pm !== "pnpm") throw err;
        console.log(chalk.yellow("⚠️  pnpm failed — retrying with npm..."));
        await execa("npm", ["install", ...pkgs], { cwd, stdio: "inherit" });
    }
}

// Clear the console and display the logo
console.clear();
const logo = chalk.cyan(`
 ▗▄▄▖ ▗▄▖ ▗▄▄▄  ▗▄▄▄▖▗▖    ▗▄▖ ▗▄▄▖ ▗▄▄▄   ▗▄▄▖     ▗▄▄▖▗▄▄▄▖▗▄▖  ▗▄▄▖▗▖ ▗▖
▐▌   ▐▌ ▐▌▐▌  █ ▐▌   ▐▌   ▐▌ ▐▌▐▌ ▐▌▐▌  █ ▐▌       ▐▌     █ ▐▌ ▐▌▐▌   ▐▌▗▞▘
▐▌   ▐▌ ▐▌▐▌  █ ▐▛▀▀▘▐▌   ▐▌ ▐▌▐▛▀▚▖▐▌  █  ▝▀▚▖     ▝▀▚▖  █ ▐▛▀▜▌▐▌   ▐▛▚▖ 
▝▚▄▄▖▝▚▄▞▘▐▙▄▄▀ ▐▙▄▄▖▐▙▄▄▖▝▚▄▞▘▐▌ ▐▌▐▙▄▄▀ ▗▄▄▞▘    ▗▄▄▞▘  █ ▐▌ ▐▌▝▚▄▄▖▐▌ ▐▌
`);

const footer = chalk.gray("                          codelords.cl by Chillenow\n");

console.log(logo);
console.log(footer);

// Main function to handle the CLI logic
async function main() {
    const response = await prompts([
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
    if (response.auth) features.push("auth");
if (response.mailgun) features.push("mailgun");

    const { projectName } = response;
    const projectPath = path.join(process.cwd(), projectName);

    const pm = await detectPackageManager();

    console.log("📦 Copying base template...");
    await fs.copy(path.join(__dirname, "../templates/base"), projectPath, {
        // Never copy local dev artifacts into the generated project.
        filter: (src) => {
            const name = path.basename(src);
            return (
                name !== "node_modules" &&
                name !== ".next" &&
                name !== "package-lock.json" &&
                name !== ".DS_Store"
            );
        },
    }).then(() => {
        // Now run the .env copy
        copyEnvFile(projectPath);
    });

    for (const feature of features) {
        console.log(`🔧 Adding ${feature}...`);

        // If Better Auth was selected, copy the auth templates
        if (feature === "auth") {
            console.log("🧩 Adding auth templates.");
            const loginPagePath = path.join(__dirname, "../templates/auth");
            const loginTargetPath = path.join(projectPath, "src");
            await fs.copy(loginPagePath, loginTargetPath);

            console.log("🔐 Installing better-auth...");
            await addDeps(pm, ["better-auth"], projectPath);


            console.log("🔑 Generating Better Auth secret...");
            const secret = crypto.randomBytes(32).toString("hex");

            const envPath = path.join(projectPath, ".env");
            const envContent = await fs.readFile(envPath, "utf-8");

            if (!envContent.includes("BETTER_AUTH_SECRET=")) {
                const newEnv = `${envContent}\nBETTER_AUTH_SECRET=${secret}\nBETTER_AUTH_URL=http://localhost:3000\n`;
                await fs.writeFile(envPath, newEnv);
                console.log("🔐 BETTER_AUTH_SECRET and BETTER_AUTH_URL added to .env file.");
            } else {
                console.log("⚠️  BETTER_AUTH_SECRET already exists in .env. Skipped.");
            }


        }
        // If Mailgun was selected, copy the lib and install deps
        if (feature === "mailgun") {
            console.log("✉️  Adding Mailgun library...");

            // Ensure lib directory exists and copy file
            const mailgunTemplatePath = path.join(
                __dirname,
                "../templates/mailgun/mailgun.ts"
            );
            const libTargetDir = path.join(projectPath, "src", "lib");
            await fs.ensureDir(libTargetDir);
            await fs.copy(mailgunTemplatePath, path.join(libTargetDir, "mailgun.ts"));
            console.log("📄 Copied mailgun.ts to src/lib.");

            console.log("📦 Installing mailgun.js and form-data...");
            await addDeps(pm, ["mailgun.js@^11", "form-data@^4"], projectPath);

            // Add helpful .env placeholders if missing
            try {
                const envPath = path.join(projectPath, ".env");
                const envExists = await fs.pathExists(envPath);
                if (envExists) {
                    const envContent = await fs.readFile(envPath, "utf-8");
                    const linesToAdd: string[] = [];
                    if (!envContent.includes("MAILGUN_API_KEY=")) linesToAdd.push("MAILGUN_API_KEY=");
                    if (!envContent.includes("MAILGUN_DOMAIN=")) linesToAdd.push("MAILGUN_DOMAIN=");
                    if (!envContent.includes("MAILGUN_FROM_NAME=")) linesToAdd.push("MAILGUN_FROM_NAME=");
                    if (linesToAdd.length) {
                        await fs.appendFile(envPath, "\n" + linesToAdd.join("\n") + "\n");
                        console.log("🔧 Added MAILGUN_* placeholders to .env.");
                    }
                }
            } catch (err) {
                // Non-fatal; just inform
                console.log("⚠️  Could not update .env with MAILGUN_* placeholders.");
            }

            console.log(
                "ℹ️  Remember to set MAILGUN_API_KEY, MAILGUN_DOMAIN and MAILGUN_FROM_NAME in your .env file."
            );
        }
    }

    // Claude Code skills & rules
    if (response.claudeCode) {
        console.log(chalk.cyan("🤖 Adding Claude Code skills & rules..."));

        const tmpDir = path.join(os.tmpdir(), `codelords-skills-${Date.now()}`);
        const skillNames = [
            "claude-api",
            "frontend-design",
            "web-artifacts-builder",
            "mcp-builder",
            "doc-coauthoring",
        ];

        try {
            console.log("📡 Fetching Claude Code skills from GitHub...");
            await execa("git", ["clone", "--depth", "1", "https://github.com/anthropics/skills.git", tmpDir], {
                stdio: "ignore",
            });

            const skillsTargetDir = path.join(projectPath, ".claude", "skills");
            await fs.ensureDir(skillsTargetDir);

            for (const skillName of skillNames) {
                const src = path.join(tmpDir, "skills", skillName);
                const dest = path.join(skillsTargetDir, skillName);
                await fs.copy(src, dest);
            }

            console.log(`📦 Copied ${skillNames.length} Anthropic skills to .claude/skills/.`);
        } catch (err) {
            console.log(chalk.yellow("⚠️  Could not fetch Anthropic skills (network issue?). Skipping."));
        } finally {
            await fs.remove(tmpDir).catch(() => {});
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

        await fs.writeFile(path.join(projectPath, "CLAUDE.md"), claudeMd);
        console.log("✅ CLAUDE.md created with project-specific rules.");
    }

    // Vercel Next.js skills
    if (response.nextSkills) {
        console.log(chalk.cyan("⚡ Adding Vercel Next.js skills..."));

        const tmpDirNext = path.join(os.tmpdir(), `codelords-next-skills-${Date.now()}`);
        const nextSkillNames = [
            "next-best-practices",
            "next-cache-components",
            "next-upgrade",
        ];

        try {
            console.log("📡 Fetching Next.js skills from GitHub...");
            await execa("git", ["clone", "--depth", "1", "https://github.com/vercel-labs/next-skills.git", tmpDirNext], {
                stdio: "ignore",
            });

            const skillsTargetDir = path.join(projectPath, ".claude", "skills");
            await fs.ensureDir(skillsTargetDir);

            for (const skillName of nextSkillNames) {
                const src = path.join(tmpDirNext, "skills", skillName);
                const dest = path.join(skillsTargetDir, skillName);
                await fs.copy(src, dest);
            }

            console.log(`📦 Copied ${nextSkillNames.length} Next.js skills to .claude/skills/.`);
        } catch (err) {
            console.log(chalk.yellow("⚠️  Could not fetch Next.js skills (network issue?). Skipping."));
        } finally {
            await fs.remove(tmpDirNext).catch(() => {});
        }
    }

    console.log(`📥 Installing dependencies with ${pm}...`);
    await installAll(pm, projectPath);

    console.log("✅ Codelords Stack is ready!");
    console.log(chalk.cyan(`\n  cd ${projectName} && ${pm} dev\n`));
}

// Function to copy the .env.example file to .env in the project directory
async function copyEnvFile(projectPath: string) {
    const templateEnvPath = path.join(__dirname, '../templates/base/env.example');
    const projectEnvPath = path.join(projectPath, '.env');

    try {
        const envAlreadyExists = await fs.pathExists(projectEnvPath);

        if (!envAlreadyExists) {
            await fs.copy(templateEnvPath, projectEnvPath);
            console.log("🔧 .env created from template.");
        } else {
            console.log("⚠️  Skipped .env creation — file already exists.");
        }
    } catch (err) {
        console.error("❌ Failed to copy .env:", err);
    }
}

main();