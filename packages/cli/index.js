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
        if (response.auth)
            features.push("auth");
        if (response.lemonsqueezy)
            features.push("lemonsqueezy");
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
            // If Auth.js was selected, copy the login page
            if (feature === "auth") {
                console.log("🧩 Adding login page template.");
                const loginPagePath = path_1.default.join(__dirname, "../templates/auth");
                const loginTargetPath = path_1.default.join(projectPath, "src");
                yield fs_extra_1.default.copy(loginPagePath, loginTargetPath);
                console.log("🔐 Installing next-auth...");
                yield (0, execa_1.execa)("npm", ["install", "next-auth@beta"], {
                    cwd: projectPath,
                    stdio: "ignore",
                });
                console.log("🔑 Generating Auth secret...");
                const secret = crypto_1.default.randomBytes(32).toString("hex");
                const envPath = path_1.default.join(projectPath, ".env");
                const envContent = yield fs_extra_1.default.readFile(envPath, "utf-8");
                if (!envContent.includes("AUTH_SECRET=")) {
                    const newEnv = `${envContent}\nAUTH_SECRET=${secret}\n`;
                    yield fs_extra_1.default.writeFile(envPath, newEnv);
                    console.log("🔐 AUTH_SECRET added to .env file.");
                }
                else {
                    console.log("⚠️  AUTH_SECRET already exists in .env. Skipped.");
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
                        if (!envContent.includes("MAILGUN_BASE_URL="))
                            linesToAdd.push("MAILGUN_BASE_URL=https://api.mailgun.net");
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
                console.log("ℹ️  Remember to set MAILGUN_API_KEY, MAILGUN_DOMAIN, and MAILGUN_BASE_URL in your .env file. US: https://api.mailgun.net, EU: https://api.eu.mailgun.net");
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
