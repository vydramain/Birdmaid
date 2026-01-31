#!/usr/bin/env node

/**
 * Script to check for inline styles without allow-tag comment
 * This script is used in pre-commit hook to enforce style guardrails
 * 
 * Format: // inline-style: allowed (reason: drag/resize|layout-calc|performance)
 * 
 * Usage:
 *   node scripts/check-inline-styles.js [file1] [file2] ...
 *   If no files provided, scans entire src directory
 */

const fs = require("fs");
const path = require("path");

// Format: // inline-style: allowed (reason: drag/resize|layout-calc|performance)
const ALLOW_TAG_PATTERN = /inline-style:\s*allowed\s*\(reason:\s*(drag\/resize|layout-calc|performance)\)/i;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line contains style={{ or style={{
    if (line.includes("style={{") || line.includes('style={{"')) {
      // Check previous lines for allow-tag comment (within 2 lines)
      let hasAllowComment = false;
      for (let j = Math.max(0, i - 2); j < i; j++) {
        if (ALLOW_TAG_PATTERN.test(lines[j])) {
          hasAllowComment = true;
          break;
        }
      }

      if (!hasAllowComment) {
        errors.push({
          file: filePath,
          line: i + 1,
          message: `Inline style found without allow-tag comment. Add: // inline-style: allowed (reason: drag/resize|layout-calc|performance)`,
        });
      }
    }
  }

  return errors;
}

function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, coverage
      if (!["node_modules", "dist", "coverage", ".git"].includes(file)) {
        findTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
// lint-staged passes files as arguments
const args = process.argv.slice(2);
const filesToCheck = args.length > 0
  ? args.filter((arg) => {
      const fullPath = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);
      return fs.existsSync(fullPath) && (arg.endsWith(".tsx") || arg.endsWith(".ts"));
    })
  : findTsxFiles(path.join(__dirname, "..", "src"));

const allErrors = [];

filesToCheck.forEach((file) => {
  const fullPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;
  
  const errors = checkFile(fullPath);
  allErrors.push(...errors);
});

if (allErrors.length > 0) {
  console.error("\n❌ Style Guardrails: Inline styles found without allow-tag comment:\n");
  allErrors.forEach((error) => {
    console.error(`  ${error.file}:${error.line}`);
    console.error(`    ${error.message}\n`);
  });
  console.error("  Allowed reasons: drag/resize, layout-calc, performance\n");
  process.exit(1);
} else {
  if (filesToCheck.length > 0) {
    console.log("✅ Style Guardrails: No inline styles without allow-tag found");
  }
  process.exit(0);
}
