/**
 * FP4 M3: Media Player OPEN_FILE with playlist enables Prev/Next.
 * Unit: simulate OPEN_FILE; assert prev/next buttons enabled.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("FP4 Media Player — OPEN_FILE playlist (M3)", () => {
  let container: HTMLDivElement;
  let playStub: ReturnType<typeof vi.spyOn>;
  let loadStub: ReturnType<typeof vi.spyOn>;
  let pauseStub: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    playStub = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    loadStub = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    pauseStub = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    container = document.createElement("div");
    container.innerHTML = `
      <div id="player-root">
        <div id="player-video-area" class="hidden"><video id="player-video"></video></div>
        <div id="player-audio-area"></div>
        <div id="player-press-play" style="display:none"></div>
        <div class="player-controls">
          <button id="btn-prev" disabled>◀</button>
          <button id="btn-play">▶</button>
          <button id="btn-pause">⏸</button>
          <button id="btn-stop">⏹</button>
          <button id="btn-next" disabled>▶</button>
          <button id="btn-mute">Mute</button>
          <input type="range" id="volume-slider" min="0" max="100" value="100" />
        </div>
      </div>
    `;
    document.body.appendChild(container);
    Object.defineProperty(window, "parent", { value: {}, configurable: true });
  });

  afterEach(() => {
    container.remove();
    Object.defineProperty(window, "parent", { value: window, configurable: true });
    playStub.mockRestore();
    loadStub.mockRestore();
    pauseStub.mockRestore();
  });

  it("T-FP4-M3-MP-PLAYLIST: OPEN_FILE with 2+ items enables Prev/Next", async () => {
    const url1 = "http://s3.shell.local/a.mp3";
    const url2 = "http://s3.shell.local/b.mp3";
    const blob = new Blob([], { type: "audio/mpeg" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "Content-Type": "audio/mpeg" }),
        blob: () => Promise.resolve(blob),
      })
    );
    await import("../../apps/media-player/main");

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "OPEN_FILE",
          payload: {
            initialPath: "/@root/DISK_C/Music/a.mp3",
            initialUrl: url1,
            playlist: [
              { path: "/@root/DISK_C/Music/a.mp3", url: url1 },
              { path: "/@root/DISK_C/Music/b.mp3", url: url2 },
            ],
          },
        },
        origin: "null",
      })
    );

    const prevBtn = document.getElementById("btn-prev") as HTMLButtonElement;
    const nextBtn = document.getElementById("btn-next") as HTMLButtonElement;
    expect(prevBtn).toBeTruthy();
    expect(nextBtn).toBeTruthy();
    expect(prevBtn.disabled).toBe(false);
    expect(nextBtn.disabled).toBe(false);
  });

  it("T-FP4-M3-MP-NEXT-PREV-URL: OPEN_FILE initial load + next/prev changes media src (playlist nav)", async () => {
    const url1 = "http://s3.shell.local/a.mp3";
    const url2 = "http://s3.shell.local/b.mp3";
    const url3 = "http://s3.shell.local/c.mp3";
    const blob = new Blob([], { type: "audio/mpeg" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "Content-Type": "audio/mpeg" }),
      blob: () => Promise.resolve(blob),
    });
    vi.stubGlobal("fetch", fetchMock);
    await import("../../apps/media-player/main");

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "OPEN_FILE",
          payload: {
            initialPath: "/@root/DISK_C/Music/b.mp3",
            initialUrl: url2,
            playlist: [
              { path: "/@root/DISK_C/Music/a.mp3", url: url1 },
              { path: "/@root/DISK_C/Music/b.mp3", url: url2 },
              { path: "/@root/DISK_C/Music/c.mp3", url: url3 },
            ],
          },
        },
        origin: "null",
      })
    );

    const prevBtn = document.getElementById("btn-prev") as HTMLButtonElement;
    const nextBtn = document.getElementById("btn-next") as HTMLButtonElement;
    await vi.waitFor(
      () => {
        const audio = document.querySelector("#player-audio") as HTMLAudioElement;
        expect(audio).toBeTruthy();
        expect(audio.src).toMatch(/^blob:/);
      },
      { timeout: 1000 }
    );

    nextBtn.click();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledWith(url3, expect.any(Object)), {
      timeout: 500,
    });

    nextBtn.click();
    expect(fetchMock).toHaveBeenCalledWith(url1, expect.any(Object));

    prevBtn.click();
    expect(fetchMock).toHaveBeenCalledWith(url3, expect.any(Object));

    prevBtn.click();
    expect(fetchMock).toHaveBeenCalledWith(url2, expect.any(Object));
  });
});
