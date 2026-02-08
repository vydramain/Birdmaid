/**
 * VfsApiClient — единый клиент для всех операций с backend VFS.
 * Backend (S3 via /api/vfs/*) — единственный источник правды.
 *
 * @see docs/fps/FP7.md
 * @see docs/style/GUIDE_STYLE.md — backend-only VFS rule
 */

import { apiClient } from "../../api/client";

export type VfsNodeKind = "dir" | "text" | "image" | "video" | "html" | "webappBundle" | "archive" | "other";

export interface VfsListItem {
  name: string;
  type: "file" | "dir";
  kind?: VfsNodeKind;
  path?: string;
  size?: number;
  modified?: Date;
  s3Key?: string;
  contentType?: string;
}

export interface VfsMkdirResponse {
  success: boolean;
  item?: { name: string; type: string; path: string; s3Key: string };
}

export interface VfsUploadResponse {
  key: string;
  item: VfsListItem;
}

const VFS_CHANNEL = "birdmaid:vfs";

/**
 * Dispatch VFS change event for multi-tab sync.
 * Other tabs should invalidate cache and refetch.
 */
export function notifyVfsChanged(path: string): void {
  try {
    const channel = new BroadcastChannel(VFS_CHANNEL);
    channel.postMessage({ type: "changed", path });
    channel.close();
  } catch {
    // BroadcastChannel not supported (e.g. old browser)
  }
}

/**
 * Subscribe to VFS change events from other tabs.
 * Call invalidate(path) and refetch when notified.
 */
export function onVfsChanged(callback: (path: string) => void): () => void {
  try {
    const channel = new BroadcastChannel(VFS_CHANNEL);
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "changed" && typeof e.data.path === "string") {
        callback(e.data.path);
      }
    };
    channel.addEventListener("message", handler);
    return () => {
      channel.removeEventListener("message", handler);
      channel.close();
    };
  } catch {
    return () => {};
  }
}

export const vfsApiClient = {
  /**
   * List files and folders in path.
   * GET /api/vfs/list?path=...
   */
  async list(path: string): Promise<VfsListItem[]> {
    const normalized = path === "/" ? "/" : path.replace(/\/+$/, "") || "/";
    const data = await apiClient.json<{ items: VfsListItem[] }>(
      `/api/vfs/list?path=${encodeURIComponent(normalized)}`
    );
    return data.items ?? [];
  },

  /**
   * Read file content.
   * GET /api/vfs/read?key=...
   */
  async read(key: string): Promise<ArrayBuffer> {
    const res = await apiClient.request(
      `/api/vfs/read?key=${encodeURIComponent(key)}`
    );
    return res.arrayBuffer();
  },

  /**
   * Create directory.
   * POST /api/vfs/mkdir   Body: { path: string }
   */
  async mkdir(path: string): Promise<VfsMkdirResponse> {
    const normalized = path.replace(/\/+$/, "");
    if (!normalized) {
      throw new Error("path is required");
    }
    const fullPath = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return apiClient.json<VfsMkdirResponse>("/api/vfs/mkdir", {
      method: "POST",
      body: JSON.stringify({ path: fullPath }),
    });
  },

  /**
   * Upload file to directory.
   * POST /api/vfs/upload?path=...   Body: multipart/form-data with file
   */
  async upload(path: string, file: File): Promise<VfsUploadResponse> {
    const normalized = path.replace(/^\/+|\/+$/g, "") || "Disk C/desktop";
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.request(
      `/api/vfs/upload?path=${encodeURIComponent(normalized)}`,
      { method: "POST", body: formData }
    );
    return res.json();
  },

  /**
   * Move item.
   * POST /api/vfs/move   Body: { oldKey: string, newKey: string }
   */
  async move(oldKey: string, newKey: string): Promise<{ success: boolean }> {
    return apiClient.json("/api/vfs/move", {
      method: "POST",
      body: JSON.stringify({ oldKey, newKey }),
    });
  },

  /**
   * Delete item.
   * DELETE /api/vfs/delete?key=...
   */
  async delete(key: string): Promise<void> {
    await apiClient.request(
      `/api/vfs/delete?key=${encodeURIComponent(key)}`
    );
  },
};
