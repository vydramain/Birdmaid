import { renderAppRoot, screen, waitFor } from "@/test/utils";
import { mockApi } from "@/test/mocks/mockApi";
import { makeGameSummary } from "@/test/fixtures/game";
import { describe, it, beforeEach, expect } from "vitest";

describe("Catalog cover images (FP5)", () => {
  beforeEach(() => {
    localStorage.clear();
    // Add safety check
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults();
    }
  });

  it("displays cover images correctly when backend returns signed URLs", async () => {
    mockApi.games([
      makeGameSummary({
        id: "1",
        title: "Game 1",
        cover_url: "https://s3.example.com/signed-url-1.jpg?signature=abc123",
        status: "published",
      }),
      makeGameSummary({
        id: "2",
        title: "Game 2",
        cover_url: "https://s3.example.com/signed-url-2.jpg?signature=def456",
        status: "published",
      }),
    ]);

    renderAppRoot({ route: "/catalog" });

    await waitFor(() => {
      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThan(0);
    });

    // Check that cover images are displayed (not showing error messages)
    const images = screen.getAllByRole("img");
    const coverImages = images.filter((img) => {
      const src = img.getAttribute("src") || "";
      return src.includes("cover") || src.includes("signed-url");
    });

    expect(coverImages.length).toBeGreaterThan(0);
    
    // Images should have valid signed URLs (not S3 keys)
    coverImages.forEach((img) => {
      const src = img.getAttribute("src") || "";
      expect(src).toMatch(/^https?:\/\//); // Should be full URL
      expect(src).not.toMatch(/^covers\//); // Should not be S3 key format
    });
  });

  it("does not show 'Invalid cover URL' error when signed URLs are returned", async () => {
    mockApi.games([
      makeGameSummary({
        id: "1",
        title: "Game 1",
        cover_url: "https://s3.example.com/signed-url.jpg?signature=abc123",
        status: "published",
      }),
    ]);

    renderAppRoot({ route: "/catalog" });

    await waitFor(() => {
      expect(screen.getByText("Game 1")).toBeInTheDocument();
    });

    // Should not show error message about invalid cover URL
    expect(screen.queryByText(/Invalid cover URL/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/S3 key received/i)).not.toBeInTheDocument();
  });
});
