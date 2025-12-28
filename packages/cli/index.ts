#!/usr/bin/env node
import prompts from "prompts";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import crypto from "crypto";

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
            name: "lemonsqueezy",
            message: "Include LemonSqueezy Payments?",
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
    ]);

    // Convert yes/no answers to an array of selected features
    const features = [];
    if (response.auth) features.push("auth");
    if (response.lemonsqueezy) features.push("lemonsqueezy");
    if (response.mailgun) features.push("mailgun");

    const { projectName } = response;
    const projectPath = path.join(process.cwd(), projectName);

    console.log("📦 Copying base template...");
    await fs.copy(path.join(__dirname, "../templates/base"), projectPath).then(() => {
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
            await execa("npm", ["install", "better-auth"], {
                cwd: projectPath,
                stdio: "ignore",
            });


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
            await execa("npm", ["install", "mailgun.js@^11", "form-data@^4"], {
                cwd: projectPath,
                stdio: "ignore",
            });

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

    console.log("📥 Installing dependencies...");
    await execa("npm", ["install"], { cwd: projectPath, stdio: "ignore" });

    console.log("✅ Codelords Stack is ready!");
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