#!/usr/bin/env node

/**
 * Check that internal relative links in docs resolve.
 * Does NOT fail on external links being down (only verifies format).
 *
 * Usage (from repo root):
 *   node tools/check-doc-links.cjs
 *   node tools/check-doc-links.cjs docs/
 *
 * Exit codes:
 *   0 - All internal links resolve
 *   1 - Broken internal links found
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");
const DOCS_DIR = process.argv[2] || PROJECT_ROOT;

// Match markdown links: [text](path) or [text](path#anchor)
const LINK_RE = /\[([^\]]*)\]\(([^#)]+)(#[^)]*)?\)/g;

function resolveLink(fromFile, link) {
  const fromDir = path.dirname(fromFile);
  const resolved = path.resolve(fromDir, link);
  const rel = path.relative(PROJECT_ROOT, resolved);
  if (rel.startsWith("..")) return null;
  return path.join(PROJECT_ROOT, rel);
}

function exists(target) {
  const withoutAnchor = target.split("#")[0];
  const fullPath = path.join(PROJECT_ROOT, withoutAnchor);
  if (fs.existsSync(fullPath)) return true;
  if (fs.existsSync(fullPath + ".md")) return true;
  return false;
}

function isExternal(href) {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");
}

function* walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") {
      yield* walkDir(full);
    } else if (e.isFile() && /\.(md|mdx)$/i.test(e.name)) {
      yield full;
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const relPath = path.relative(PROJECT_ROOT, filePath);
  const errors = [];
  let m;
  LINK_RE.lastIndex = 0;
  while ((m = LINK_RE.exec(content)) !== null) {
    const href = m[2];
    if (isExternal(href)) continue;
    const target = resolveLink(filePath, href);
    if (!target) continue;
    const targetRel = path.relative(PROJECT_ROOT, target);
    if (!exists(targetRel)) {
      errors.push({ from: relPath, link: href, target: targetRel });
    }
  }
  return errors;
}

function main() {
  const baseDir = path.isAbsolute(DOCS_DIR) ? DOCS_DIR : path.join(PROJECT_ROOT, DOCS_DIR);
  if (!fs.existsSync(baseDir)) {
    console.error("Directory not found:", baseDir);
    process.exit(1);
  }

  let total = 0;
  for (const file of walkDir(baseDir)) {
    const errors = checkFile(file);
    for (const e of errors) {
      console.error(`BROKEN: ${e.from} -> ${e.link} (resolves to ${e.target})`);
      total++;
    }
  }

  if (total > 0) {
    console.error(`\n${total} broken internal link(s) found.`);
    process.exit(1);
  }
  console.log("All internal doc links resolve.");
}

main();
