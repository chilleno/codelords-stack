#!/usr/bin/env node
import prompts from "prompts";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

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
            const loginPagePath = path.join(__dirname, "../templates/auth");
            const loginTargetPath = path.join(projectPath, "src/app");
            await fs.copy(loginPagePath, loginTargetPath);
            console.log("🧩 Added login page template.");
        }
    }

    console.log("📥 Installing dependencies...");
    await execa("npm", ["install"], { cwd: projectPath, stdio: "inherit" });

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