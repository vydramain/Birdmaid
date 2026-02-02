#!/usr/bin/env node

/**
 * Script to check for inline styles without allow-tag v2 comment, absolute units, and disallowed patterns
 * This script is used in pre-commit hook to enforce style guardrails
 *
 * Allow-tag v2 format: // inline-style: allowed (reason: X; why: <runtime dynamic>; revisit: <milestone>)
 *
 * Usage:
 *   node scripts/check-inline-styles.cjs [file1] [file2] ...
 *   If no files provided, scans entire src directory
 */

const fs = require("fs");
const path = require("path");

// Allow-tag v2: reason + why + revisit required
const ALLOW_TAG_V2_PATTERN = /inline-style:\s*allowed\s*\(\s*reason:\s*(drag\/resize|layout-calc|performance)\s*;\s*why:\s*[^;)]+\s*;\s*revisit:\s*[^)]+\s*\)/i;
const ALLOW_TAG_V2_REASON_CAPTURE = /inline-style:\s*allowed\s*\(\s*reason:\s*(drag\/resize|layout-calc|performance)\s*;/i;

// Legacy v1 (missing why/revisit) - used to detect and reject
const ALLOW_TAG_V1_PATTERN = /inline-style:\s*allowed\s*\(reason:\s*(drag\/resize|layout-calc|performance)\s*\)/i;

// Evidence of measurement APIs (required for reason=layout-calc)
const LAYOUT_CALC_EVIDENCE_PATTERN = /getBoundingClientRect|ResizeObserver|visualViewport|window\.inner(Width|Height)|clientWidth|clientHeight|offsetWidth|offsetHeight/;

// Runtime value indicator: template literal or variable reference
const RUNTIME_VALUE_PATTERN = /\$\{|\.current\b|useState\b|useRef\b|state\.|ref\.|props\./;

// Absolute units that are forbidden (px, pt, pc, in, cm, mm, q, Q)
const ABSOLUTE_UNITS_PATTERN = /\b\d+(\.\d+)?(px|pt|pc|in|cm|mm|[qQ])\b/gi;

// Disallowed: fixed fullscreen backdrop (position: fixed + inset/top/left/right/bottom: 0)
const DISALLOWED_BACKDROP_PATTERN = /position:\s*["']fixed["'].*?(?:inset|top|left|right|bottom):\s*0|(?:inset|top|left|right|bottom):\s*0.*?position:\s*["']fixed["']/is;

// Disallowed: zIndex magic numbers (4+ digits, e.g. 9998, 9999)
const DISALLOWED_ZINDEX_PATTERN = /zIndex:\s*\d{4,}/;

function collectStyleBlock(lines, startIdx) {
  let block = lines[startIdx];
  let depth = (block.match(/\{/g) || []).length - (block.match(/\}/g) || []).length;
  let j = startIdx;
  while (depth > 0 && j < lines.length - 1) {
    j += 1;
    block += "\n" + lines[j];
    depth += (lines[j].match(/\{/g) || []).length - (lines[j].match(/\}/g) || []).length;
  }
  return block;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("style={{") || line.includes('style={{"')) {
      // Check previous lines for allow-tag v2 (within 4 lines)
      let hasAllowV2 = false;
      let allowTagReason = null;
      let hasAllowV1Only = false;
      for (let j = Math.max(0, i - 4); j < i; j++) {
        const v2Match = lines[j].match(ALLOW_TAG_V2_PATTERN);
        if (v2Match) {
          hasAllowV2 = true;
          const reasonMatch = lines[j].match(ALLOW_TAG_V2_REASON_CAPTURE);
          if (reasonMatch) allowTagReason = reasonMatch[1].toLowerCase();
          break;
        }
        if (ALLOW_TAG_V1_PATTERN.test(lines[j]) && !ALLOW_TAG_V2_PATTERN.test(lines[j])) {
          hasAllowV1Only = true;
        }
      }

      if (hasAllowV1Only && !hasAllowV2) {
        errors.push({
          file: filePath,
          line: i + 1,
          message: `Allow-tag v2 required. Add why and revisit: // inline-style: allowed (reason: X; why: <runtime dynamic>; revisit: <milestone>)`,
        });
      } else if (!hasAllowV2) {
        errors.push({
          file: filePath,
          line: i + 1,
          message: `Inline style found without allow-tag v2. Add: // inline-style: allowed (reason: drag/resize|layout-calc|performance; why: <runtime dynamic>; revisit: <milestone>)`,
        });
      }

      const styleBlock = collectStyleBlock(lines, i);

      // layout-calc: require evidence of measurement APIs in file
      if (hasAllowV2 && allowTagReason === "layout-calc") {
        if (!LAYOUT_CALC_EVIDENCE_PATTERN.test(content)) {
          errors.push({
            file: filePath,
            line: i + 1,
            message: `reason=layout-calc requires evidence of measurement APIs (getBoundingClientRect, ResizeObserver, visualViewport, window.innerWidth/Height, clientWidth/Height, offsetWidth/Height) in file.`,
          });
        }
      }

      // Literal-only: fail if all values are literals (no runtime) even with allow-tag
      if (hasAllowV2 && !RUNTIME_VALUE_PATTERN.test(styleBlock)) {
        errors.push({
          file: filePath,
          line: i + 1,
          message: `Inline style with allow-tag forbidden when all values are literals. Values must depend on runtime (state, refs, template literals, measurement APIs).`,
        });
      }

      // Check for absolute units in inline styles (px in transform/translate is allowed for drag)
      const blockWithoutTranslate = styleBlock
        .replace(/translate3d\s*\([^)]*\)/g, "")
        .replace(/translate\s*\([^)]*\)/g, "");
      const absoluteUnitsMatch = blockWithoutTranslate.match(ABSOLUTE_UNITS_PATTERN);
      if (absoluteUnitsMatch) {
        const units = [...new Set(absoluteUnitsMatch.map((m) => m.match(/(px|pt|pc|in|cm|mm|[qQ])$/i)?.[0]).filter(Boolean))];
        errors.push({
          file: filePath,
          line: i + 1,
          message: `Absolute units found in inline style: ${units.join(", ")}. Use relative units (rem, em, %, vh, vw, vmin, vmax, ch, ex) or px only in transform/translate for drag.`,
        });
      }

      // Disallowed patterns: fixed fullscreen backdrop, zIndex magic numbers
      if (DISALLOWED_BACKDROP_PATTERN.test(styleBlock)) {
        errors.push({
          file: filePath,
          line: i + 1,
          message: `Disallowed pattern: fixed fullscreen backdrop/overlay. Use CSS class + z-index token instead.`,
        });
      }
      if (DISALLOWED_ZINDEX_PATTERN.test(styleBlock)) {
        errors.push({
          file: filePath,
          line: i + 1,
          message: `Disallowed pattern: zIndex magic number (4+ digits). Use z-index tokens/classes instead.`,
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
  : findTsxFiles(path.join(__dirname, "..", "src")).filter((p) => {
      const normalized = p.replace(/\\/g, "/");
      return !normalized.includes("__tests__/style-guardrails/");
    });

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
  console.error("    - Inline styles require allow-tag v2: (reason: X; why: <runtime dynamic>; revisit: <milestone>)");
  console.error("    - Disallowed: fixed fullscreen backdrop, zIndex magic numbers (4+ digits)");
  console.error("    - Absolute units (px, pt, pc...) forbidden except px in transform/translate for drag.\n");
  process.exit(1);
} else {
  if (filesToCheck.length > 0) {
    console.log("✅ Style Guardrails: No inline style violations found");
  }
  process.exit(0);
}
