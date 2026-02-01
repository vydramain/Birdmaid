#!/usr/bin/env node

/**
 * Script to check that all assets in front/public have entries in ASSET_PROVENANCE.md
 * This script is used in pre-commit hook and CI to enforce asset license compliance
 * 
 * Usage:
 *   node scripts/check-asset-provenance.cjs
 * 
 * Exit codes:
 *   0 - All assets are documented
 *   1 - Missing assets or invalid format
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "front", "public");
const PROVENANCE_FILE = path.join(PROJECT_ROOT, "docs", "compliance", "ASSET_PROVENANCE.md");

// Asset directories to check
const ASSET_DIRS = [
  "icons",
  "fonts",
  "cursors",
  "sounds"
];

// File extensions to check
const ASSET_EXTENSIONS = [
  ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", // Images
  ".woff", ".woff2", ".ttf", ".otf", ".eot", // Fonts
  ".cur", ".ani", // Cursors
  ".wav", ".mp3", ".ogg", ".m4a", ".flac" // Sounds
];

/**
 * Recursively find all asset files in a directory
 */
function findAssetFiles(dir, baseDir = dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
    
    if (entry.isDirectory()) {
      // Skip .git and node_modules
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }
      files.push(...findAssetFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ASSET_EXTENSIONS.includes(ext)) {
        files.push(relativePath);
      }
    }
  }
  
  return files;
}

/**
 * Parse ASSET_PROVENANCE.md and extract all documented paths
 */
function parseProvenanceFile() {
  if (!fs.existsSync(PROVENANCE_FILE)) {
    console.error(`❌ Provenance file not found: ${PROVENANCE_FILE}`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(PROVENANCE_FILE, "utf-8");
  const documentedPaths = new Set();
  
  // Parse markdown table: | Local Path | Source | License | ...
  // Match lines that start with | and contain a path
  const lines = content.split("\n");
  let inTable = false;
  
  for (const line of lines) {
    // Detect table start (header row with "Local Path")
    if (line.includes("| Local Path") && line.includes("|")) {
      inTable = true;
      continue;
    }
    
    // Skip separator row (|---|---|)
    if (inTable && /^\|[\s-:]+\|/.test(line)) {
      continue;
    }
    
    // Parse table rows
    if (inTable && line.startsWith("|")) {
      const cells = line.split("|").map(c => c.trim()).filter(c => c);
      if (cells.length >= 1) {
        const localPath = cells[0];
        // Skip header row
        if (localPath !== "Local Path" && localPath && !localPath.startsWith("---")) {
          // Remove backticks if present
          const cleanPath = localPath.replace(/^`|`$/g, "");
          documentedPaths.add(cleanPath);
        }
      }
    }
    
    // Stop at end of table (empty line or new section)
    if (inTable && line.trim() === "" && documentedPaths.size > 0) {
      // Check if next non-empty line is a heading
      const nextLineIdx = lines.indexOf(line) + 1;
      if (nextLineIdx < lines.length) {
        const nextLine = lines[nextLineIdx].trim();
        if (nextLine.startsWith("#") || nextLine.startsWith("##")) {
          inTable = false;
        }
      }
    }
  }
  
  return documentedPaths;
}

/**
 * Main check function
 */
function checkAssetProvenance() {
  console.log("🔍 Checking asset provenance...\n");
  
  // Find all asset files
  const allAssets = new Set();
  
  for (const assetDir of ASSET_DIRS) {
    const assetPath = path.join(PUBLIC_DIR, assetDir);
    const files = findAssetFiles(assetPath, PUBLIC_DIR);
    files.forEach(file => {
      // Normalize path: remove front/public/ prefix
      const normalized = file.replace(/^front\/public\//, "");
      allAssets.add(normalized);
    });
  }
  
  // Parse documented assets
  const documentedAssets = parseProvenanceFile();
  
  // Find missing assets
  const missingAssets = [];
  for (const asset of allAssets) {
    // Check exact match or wildcard match (e.g., "icons/chicago95-default/16x16/*.svg")
    let found = documentedAssets.has(asset);
    
    if (!found) {
      // Check for wildcard patterns
      for (const documented of documentedAssets) {
        if (documented.includes("*")) {
          // Convert wildcard to regex
          // ** matches any number of directories
          // * matches any characters except /
          let pattern = documented
            .replace(/\*\*/g, "___DOUBLE_STAR___")
            .replace(/\*/g, "[^/]*")
            .replace(/___DOUBLE_STAR___/g, ".*")
            .replace(/\//g, "\\/");
          const regex = new RegExp(`^${pattern}$`);
          if (regex.test(asset)) {
            found = true;
            break;
          }
        }
      }
    }
    
    if (!found) {
      missingAssets.push(asset);
    }
  }
  
  // Report results
  if (missingAssets.length > 0) {
    console.error("❌ Asset Provenance Check Failed\n");
    console.error(`Found ${missingAssets.length} asset(s) without provenance entries:\n`);
    missingAssets.forEach(asset => {
      console.error(`  - ${asset}`);
    });
    console.error("\nPlease add entries to docs/compliance/ASSET_PROVENANCE.md");
    console.error("See docs/compliance/ASSET_POLICY.md for allowed licenses.\n");
    process.exit(1);
  } else {
    console.log(`✅ All ${allAssets.size} asset(s) are documented in ASSET_PROVENANCE.md\n`);
    process.exit(0);
  }
}

// Run check
checkAssetProvenance();
