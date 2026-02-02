#!/usr/bin/env ts-node
/**
 * FP7 Legacy Cleanup Migration Script
 * 
 * Removes legacy auth and domain entities from MongoDB:
 * - Drops collections: teams, games, comments, builds
 * - Removes fields from users: isSuperAdmin, recoveryCode
 * - Keeps: users (with role field), organizerWhitelist, jams, help
 * 
 * Usage:
 *   MONGO_URL=mongodb://localhost:27017/birdmaid npm run migrate:fp7-cleanup
 * 
 * Dev-safe: Only runs if NODE_ENV !== 'production'
 */

import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/birdmaid";
const NODE_ENV = process.env.NODE_ENV || "development";

async function main() {
  // Safety check: don't run in production
  if (NODE_ENV === "production") {
    console.error("❌ ERROR: This migration cannot run in production!");
    console.error("   Set NODE_ENV to 'development' or 'test' to proceed.");
    process.exit(1);
  }

  console.log(`[FP7 Legacy Cleanup] Starting migration...`);
  console.log(`  MONGO_URL: ${MONGO_URL}`);
  console.log(`  NODE_ENV: ${NODE_ENV}`);
  console.log("");

  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Step 1: Drop legacy domain collections
    console.log("[Step 1] Dropping legacy domain collections...");
    const collectionsToDrop = ["teams", "games", "comments", "builds"];
    
    for (const collectionName of collectionsToDrop) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        if (count > 0) {
          console.log(`  - Dropping collection '${collectionName}' (${count} documents)`);
          await collection.drop();
          console.log(`    ✅ Dropped '${collectionName}'`);
        } else {
          console.log(`  - Collection '${collectionName}' is empty or doesn't exist, skipping`);
        }
      } catch (error: any) {
        if (error.codeName === "NamespaceNotFound") {
          console.log(`  - Collection '${collectionName}' doesn't exist, skipping`);
        } else {
          console.error(`  ❌ Error dropping '${collectionName}':`, error.message);
          throw error;
        }
      }
    }
    
    // Step 2: Remove legacy fields from users collection
    console.log("");
    console.log("[Step 2] Removing legacy fields from users collection...");
    const usersCollection = db.collection("users");
    
    // Remove isSuperAdmin field
    const isSuperAdminResult = await usersCollection.updateMany(
      { isSuperAdmin: { $exists: true } },
      { $unset: { isSuperAdmin: "" } }
    );
    console.log(`  - Removed 'isSuperAdmin' field from ${isSuperAdminResult.modifiedCount} documents`);
    
    // Remove recoveryCode field
    const recoveryCodeResult = await usersCollection.updateMany(
      { recoveryCode: { $exists: true } },
      { $unset: { recoveryCode: "" } }
    );
    console.log(`  - Removed 'recoveryCode' field from ${recoveryCodeResult.modifiedCount} documents`);
    
    // Note: password field is kept for backward compatibility but not used for auth
    
    // Step 3: Drop indexes on legacy fields (if any)
    console.log("");
    console.log("[Step 3] Dropping indexes on legacy fields...");
    try {
      const indexes = await usersCollection.indexes();
      for (const index of indexes) {
        const indexKeys = Object.keys(index.key || {});
        // Drop indexes that reference legacy fields
        if (indexKeys.includes("isSuperAdmin") || indexKeys.includes("recoveryCode")) {
          console.log(`  - Dropping index: ${index.name}`);
          await usersCollection.dropIndex(index.name);
          console.log(`    ✅ Dropped index: ${index.name}`);
        }
      }
    } catch (error: any) {
      console.log(`  - No legacy indexes found or error: ${error.message}`);
    }
    
    // Step 4: Verify collections that should remain
    console.log("");
    console.log("[Step 4] Verifying remaining collections...");
    const remainingCollections = ["users", "organizerWhitelist", "jams", "help"];
    const allCollections = await db.listCollections().toArray();
    const collectionNames = allCollections.map(c => c.name);
    
    for (const collectionName of remainingCollections) {
      if (collectionNames.includes(collectionName)) {
        const count = await db.collection(collectionName).countDocuments();
        console.log(`  ✅ Collection '${collectionName}' exists (${count} documents)`);
      } else {
        console.log(`  ⚠️  Collection '${collectionName}' doesn't exist (will be created on first use)`);
      }
    }
    
    // Step 5: Summary
    console.log("");
    console.log("[Summary] Migration completed successfully!");
    console.log("  ✅ Legacy collections dropped: teams, games, comments, builds");
    console.log("  ✅ Legacy fields removed from users: isSuperAdmin, recoveryCode");
    console.log("  ✅ Remaining collections: users, organizerWhitelist, jams, help");
    console.log("");
    console.log("Next steps:");
    console.log("  1. Restart backend server");
    console.log("  2. Run smoke test: dev auth → /me ok");
    console.log("  3. Verify project starts with clean DB");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
