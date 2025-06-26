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
            message: "Include Auth.js (Email/Password)?",
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
    ]);

    // Convert yes/no answers to an array of selected features
    const features = [];
    if (response.auth) features.push("auth");
    if (response.lemonsqueezy) features.push("lemonsqueezy");

    const { projectName } = response;
    const projectPath = path.join(process.cwd(), projectName);

    console.log("📦 Copying base template...");
    await fs.copy(path.join(__dirname, "../templates/base"), projectPath).then(() => {
        // Now run the .env copy
        copyEnvFile(projectPath);
    });

    for (const feature of features) {
        console.log(`🔧 Adding ${feature}...`);

        // If Auth.js was selected, copy the login page
        if (feature === "auth") {
            console.log("🧩 Adding login page template.");
            const loginPagePath = path.join(__dirname, "../templates/auth");
            const loginTargetPath = path.join(projectPath, "src");
            await fs.copy(loginPagePath, loginTargetPath);

            console.log("🔐 Installing next-auth...");
            await execa("npm", ["install", "next-auth@beta"], {
                cwd: projectPath,
                stdio: "ignore",
            });


            console.log("🔑 Generating Auth secret...");
            const secret = crypto.randomBytes(32).toString("hex");

            const envPath = path.join(projectPath, ".env");
            const envContent = await fs.readFile(envPath, "utf-8");

            if (!envContent.includes("AUTH_SECRET=")) {
                const newEnv = `${envContent}\nAUTH_SECRET=${secret}\n`;
                await fs.writeFile(envPath, newEnv);
                console.log("🔐 AUTH_SECRET added to .env file.");
            } else {
                console.log("⚠️  AUTH_SECRET already exists in .env. Skipped.");
            }


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