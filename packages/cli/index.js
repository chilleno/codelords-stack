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
                initial: 1,
            },
        ]);
        // Convert yes/no answers to an array of selected features
        const features = [];
        if (response.auth)
            features.push("auth");
        if (response.lemonsqueezy)
            features.push("lemonsqueezy");
        const { projectName } = response;
        const projectPath = path_1.default.join(process.cwd(), projectName);
        console.log("📦 Copying base template...");
        yield fs_extra_1.default.copy(path_1.default.join(__dirname, "../templates/base"), projectPath).then(() => {
            // Now run the .env copy
            copyEnvFile(projectPath);
        });
        for (const feature of features) {
            console.log(`🔧 Adding ${feature}...`);
            yield fs_extra_1.default.copy(path_1.default.join(__dirname, `../templates/${feature}`), projectPath, {
                overwrite: true,
            });
        }
        console.log("📥 Installing dependencies...");
        yield (0, execa_1.execa)("npm", ["install"], { cwd: projectPath, stdio: "inherit" });
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
