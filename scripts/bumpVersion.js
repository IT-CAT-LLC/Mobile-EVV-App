#!/usr/bin/env node
/**
 * Auto-increment version in app.config.ts and package.json, then commit
 * 
 * Usage:
 *   node scripts/bumpVersion.js          # bump patch (1.1.3 -> 1.1.4)
 *   node scripts/bumpVersion.js minor    # bump minor (1.1.3 -> 1.2.0)
 *   node scripts/bumpVersion.js major    # bump major (1.1.3 -> 2.0.0)
 *   node scripts/bumpVersion.js --no-commit  # bump without committing
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const APP_CONFIG_PATH = path.join(__dirname, "..", "app.config.ts");
const PACKAGE_JSON_PATH = path.join(__dirname, "..", "package.json");

function getCurrentVersion() {
  const content = fs.readFileSync(APP_CONFIG_PATH, "utf8");
  const match = content.match(/version:\s*["'](\d+\.\d+\.\d+)["']/);
  if (!match) {
    throw new Error("Could not find version in app.config.ts");
  }
  return match[1];
}

function bumpVersion(currentVersion, type = "patch") {
  const [major, minor, patch] = currentVersion.split(".").map(Number);
  
  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

function updateAppConfig(newVersion) {
  let content = fs.readFileSync(APP_CONFIG_PATH, "utf8");
  content = content.replace(
    /version:\s*["']\d+\.\d+\.\d+["']/,
    `version: "${newVersion}"`
  );
  fs.writeFileSync(APP_CONFIG_PATH, content);
}

function updatePackageJson(newVersion) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));
  pkg.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2) + "\n");
}

function commitVersion(newVersion) {
  try {
    execSync(`git add app.config.ts package.json`, { stdio: "inherit" });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: "inherit" });
    console.log(`✅ Committed version ${newVersion}`);
  } catch (error) {
    console.error("❌ Failed to commit:", error.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
const bumpType = args.find(arg => ["major", "minor", "patch"].includes(arg)) || "patch";
const shouldCommit = !args.includes("--no-commit");

try {
  const currentVersion = getCurrentVersion();
  const newVersion = bumpVersion(currentVersion, bumpType);
  
  console.log(`📦 Bumping version: ${currentVersion} → ${newVersion} (${bumpType})`);
  
  updateAppConfig(newVersion);
  console.log(`✅ Updated app.config.ts`);
  
  updatePackageJson(newVersion);
  console.log(`✅ Updated package.json`);
  
  if (shouldCommit) {
    commitVersion(newVersion);
  } else {
    console.log(`ℹ️  Skipping commit (--no-commit)`);
  }
  
  console.log(`\n🎉 Version bumped to ${newVersion}`);
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
