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
            initial: 1,
        },
    ]);

    // Convert yes/no answers to an array of selected features
    const features = [];
    if (response.auth) features.push("auth");
    if (response.lemonsqueezy) features.push("lemonsqueezy");

    const { projectName } = response;
    const projectPath = path.join(process.cwd(), projectName);

    console.log("📦 Copying base template...");
    await fs.copy(path.join(__dirname, "../templates/base"), projectPath);

    for (const feature of features) {
        console.log(`🔧 Adding ${feature}...`);
        await fs.copy(path.join(__dirname, `../templates/${feature}`), projectPath, {
            overwrite: true,
        });
    }

    console.log("📥 Installing dependencies...");
    await execa("npm", ["install"], { cwd: projectPath, stdio: "inherit" });

    console.log("✅ Codelords Stack is ready!");
}

main();