/**
 * FP3 M2: list C:/ contains system folders + boot files.
 * T-M2.2: Windows 98 default — WINDOWS, Program Files, My Documents, Recycled + boot files.
 *
 * Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d
 */

const API_BASE = "http://api.shell.local";

async function fetchApi(path: string, opts?: RequestInit) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    return await fetch(`${API_BASE}${path}`, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

const REQUIRED_SYSTEM_FOLDERS = ["WINDOWS", "Program Files", "My Documents", "Recycled"];

const REQUIRED_BOOT_FILES = [
  "MSDOS.SYS",
  "IO.SYS",
  "COMMAND.COM",
  "AUTOEXEC.BAT",
  "CONFIG.SYS",
  "BOOTLOG.TXT",
  "SETUPLOG.TXT",
  "SUHDLOG.DAT",
  "WIN386.SWP",
];

describe("FP3 M2: list C:/ (T-M2.2)", () => {
  beforeAll(async () => {
    const res = await fetchApi("/health").catch(() => null);
    if (!res || res.status !== 200) {
      throw new Error(
        "Prerequisite: docker compose -f infra/docker-compose.dev.yml up -d. api.shell.local must be reachable."
      );
    }
  });

  it("list C:/ contains required system folders", async () => {
    const res = await fetchApi("/api/fs/list?path=/@root/DISK_C/");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("items");
    const names = body.items.map((i: { name: string }) => i.name);
    for (const folder of REQUIRED_SYSTEM_FOLDERS) {
      expect(names).toContain(folder);
    }
  });

  it("list C:/ contains required boot files", async () => {
    const res = await fetchApi("/api/fs/list?path=/@root/DISK_C/");
    expect(res.status).toBe(200);
    const body = await res.json();
    const names = body.items.map((i: { name: string }) => i.name);
    for (const file of REQUIRED_BOOT_FILES) {
      expect(names).toContain(file);
    }
  });
});
