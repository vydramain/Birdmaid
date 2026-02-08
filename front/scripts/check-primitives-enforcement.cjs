#!/usr/bin/env node

/**
 * Enforces Win95 primitive usage: no ad-hoc hover/active/disabled outside primitives,
 * no transitions in win-* namespace, no direct color values in primitives.
 *
 * Primitives path: front/src/styles/** (allowed to define states)
 * App paths: front/src/** except styles (forbidden to define :hover/:active/:focus for controls)
 *
 * @see docs/style/GUIDE_STYLE.md
 * @see docs/style/WIN95_SPEC.md
 */

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "src");

// Control-related selectors that MUST only be in primitives (styles/)
const CONTROL_STATE_PATTERN = /&\s*:(hover|active|focus|focus-visible|disabled)\b/g;

// Forbidden in win-* primitives
const TRANSITION_PATTERN = /\btransition\s*:/;
const ANIMATION_PATTERN = /\banimation\s*:/;

// Direct color values (hex, rgb, rgba) - primitives must use var()
const DIRECT_COLOR_PATTERN = /(#[0-9a-fA-F]{3,8}\b|rgb\s*\(|rgba\s*\()/;

function collectScssFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!["node_modules", "dist", "coverage", ".git"].includes(file)) {
        collectScssFiles(filePath, fileList);
      }
    } else if (file.endsWith(".scss") || file.endsWith(".css")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function isInPrimitivesLayer(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.includes("/src/styles/");
}

function isThemeFile(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return normalized.includes("/themes/");
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const errors = [];
  const inPrimitives = isInPrimitivesLayer(filePath);
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes("{")) braceDepth += (line.match(/{/g) || []).length;
    if (line.includes("}")) braceDepth -= (line.match(/}/g) || []).length;

    // A) Outside primitives: no :hover/:active/:focus for button/input/checkbox/menu
    if (!inPrimitives && braceDepth > 0) {
      if (CONTROL_STATE_PATTERN.test(line)) {
        errors.push({
          file: filePath,
          line: i + 1,
          message: `:hover/:active/:focus/:disabled outside primitives. Move to front/src/styles/ or use primitive classes.`,
        });
      }
    }

    // B) In win-* primitives: no transition/animation
    if (inPrimitives && (line.includes(".win-") || line.includes(".win95-"))) {
      if (TRANSITION_PATTERN.test(line) || ANIMATION_PATTERN.test(line)) {
        errors.push({
          file: filePath,
          line: i + 1,
          message: `transition/animation forbidden in Win95 primitives. Use instant state changes.`,
        });
      }
    }

    // C) In primitives: no direct color values (must use var())
    // Exclude: theme files (define tokens), comments, var() fallbacks
    if (inPrimitives && !isThemeFile(filePath) && braceDepth > 0) {
      const noComments = line.replace(/\/\/.*$/, "").replace(/\/\*[\s\S]*?\*\//g, "");
      const noVarFallbacks = noComments.replace(/var\s*\([^)]+\)/g, "");
      if (DIRECT_COLOR_PATTERN.test(noVarFallbacks)) {
        errors.push({
          file: filePath,
          line: i + 1,
          message: `Direct color value (hex/rgb) in primitives. Use var(--token) instead.`,
        });
      }
    }
  }

  return errors;
}

const scssFiles = collectScssFiles(SRC_DIR).filter(
  (p) => !p.includes("__tests__") && !p.includes("node_modules")
);

const allErrors = [];
scssFiles.forEach((file) => {
  allErrors.push(...checkFile(file));
});

if (allErrors.length > 0) {
  console.error("\n❌ Primitives enforcement: Issues found:\n");
  allErrors.forEach((e) => {
    console.error(`  ${e.file}:${e.line}`);
    console.error(`    ${e.message}\n`);
  });
  console.error("  Rules:");
  console.error("    - :hover/:active/:focus only in front/src/styles/ (primitives)");
  console.error("    - No transition/animation in win-* primitives");
  console.error("    - No direct colors in primitives; use var(--token)\n");
  process.exit(1);
}

console.log("✅ Primitives enforcement: No violations found");
process.exit(0);
