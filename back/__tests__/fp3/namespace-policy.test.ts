/**
 * M1: Namespace policy enforcement.
 * Tests that create S3 artifacts under My Documents MUST use getTestNamespace().
 * This test fails if api-fs-write or api-fs-upload use hardcoded basePath.
 */

import fs from "fs";
import path from "path";

const POLLUTING_FILES = [
  "back/__tests__/fp3/api-fs-write.integration.test.ts",
  "back/__tests__/fp3/api-fs-upload.integration.test.ts",
];

describe("M1: Namespace policy", () => {
  it("M1-NS: polluting tests must import getTestNamespace", () => {
    const root = path.resolve(process.cwd());
    const violations: string[] = [];
    for (const rel of POLLUTING_FILES) {
      const filePath = path.join(root, rel);
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, "utf-8");
      const usesNamespace = content.includes("getTestNamespace");
      const usesHardcodedBase =
        content.includes('basePath = "/@root/DISK_C/My Documents/"') ||
        content.includes("basePath = '/@root/DISK_C/My Documents/'");
      if (usesHardcodedBase && !usesNamespace) {
        violations.push(`${rel}: uses hardcoded basePath, must use getTestNamespace()`);
      }
    }
    expect(violations).toEqual(
      [],
      `Namespace policy violation: ${violations.join("; ")}. Use getTestNamespace() from back/__tests__/helpers/test-namespace.ts`
    );
  });
});
