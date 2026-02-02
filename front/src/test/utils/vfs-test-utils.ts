import { vfs } from "../../os/fs/VirtualFileSystem";
import type { VFSNode } from "../../os/fs/VirtualFileSystem";

type VFSForTest = { root: VFSNode; initializeSystemFolders(): void };

/**
 * Reset VFS for tests (accesses internal API)
 */
export function resetVFSForTest() {
  (vfs as VFSForTest).root = { name: "", type: "dir", children: [] };
  (vfs as VFSForTest).initializeSystemFolders();
}
