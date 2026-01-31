#!/usr/bin/env node

/**
 * Script to check for inline styles without allow-tag comment and absolute units
 * This script is used in pre-commit hook to enforce style guardrails
 * 
 * Format: // inline-style: allowed (reason: drag/resize|layout-calc|performance)
 * 
 * Usage:
 *   node scripts/check-inline-styles.cjs [file1] [file2] ...
 *   If no files provided, scans entire src directory
 */

const fs = require("fs");
const path = require("path");

// Format: // inline-style: allowed (reason: drag/resize|layout-calc|performance)
const ALLOW_TAG_PATTERN = /inline-style:\s*allowed\s*\(reason:\s*(drag\/resize|layout-calc|performance)\)/i;

// Absolute units that are forbidden (px, pt, pc, in, cm, mm, q, Q)
const ABSOLUTE_UNITS_PATTERN = /\b\d+(\.\d+)?(px|pt|pc|in|cm|mm|[qQ])\b/gi;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line contains style={{ or style={{
    if (line.includes("style={{") || line.includes('style={{"')) {
      // Check previous lines for allow-tag comment (within 4 lines to allow for empty lines/comments)
      let hasAllowComment = false;
      for (let j = Math.max(0, i - 4); j < i; j++) {
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

      // Check for absolute units in inline styles (even if allow-tag is present)
      // Absolute units are forbidden everywhere, including inline styles
      const absoluteUnitsMatch = line.match(ABSOLUTE_UNITS_PATTERN);
      if (absoluteUnitsMatch) {
        const units = [...new Set(absoluteUnitsMatch.map(m => m.match(/(px|pt|pc|in|cm|mm|[qQ])$/i)?.[0]).filter(Boolean))];
        errors.push({
          file: filePath,
          line: i + 1,
          message: `Absolute units found in inline style: ${units.join(", ")}. Use relative units (rem, em, %, vh, vw, vmin, vmax, ch, ex) instead.`,
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
      // Skip canary test files - they are meant to fail and are tested separately
      // Check both relative and absolute paths
      const normalizedPath = fullPath.replace(/\\/g, "/");
      if (normalizedPath.includes("__tests__/style-guardrails/") || normalizedPath.includes("/style-guardrails/")) {
        return false;
      }
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
  console.error("\n❌ Style Guardrails: Issues found:\n");
  allErrors.forEach((error) => {
    console.error(`  ${error.file}:${error.line}`);
    console.error(`    ${error.message}\n`);
  });
  console.error("  Rules:");
  console.error("    - Inline styles require allow-tag: // inline-style: allowed (reason: drag/resize|layout-calc|performance)");
  console.error("    - Absolute units (px, pt, pc, in, cm, mm, q, Q) are forbidden. Use relative units (rem, em, %, vh, vw, vmin, vmax, ch, ex) instead.\n");
  process.exit(1);
} else {
  if (filesToCheck.length > 0) {
    console.log("✅ Style Guardrails: No inline style violations found");
  }
  process.exit(0);
}
