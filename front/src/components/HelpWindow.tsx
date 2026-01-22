import { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { HourglassLoader } from "./win95/HourglassLoader";

export function HelpWindow() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    void loadHelp();
  }, []);

  const loadHelp = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.json<{ content: string }>("/help");
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load help");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <HourglassLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "12px" }}>
        <p style={{ color: "var(--win-red)" }}>Error: {error}</p>
      </div>
    );
  }

  // Simple markdown rendering (basic implementation)
  // In production, use react-markdown library
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("# ")) {
        return <h1 key={index} style={{ fontSize: "16px", fontWeight: "bold", margin: "8px 0" }}>{line.substring(2)}</h1>;
      } else if (line.startsWith("## ")) {
        return <h2 key={index} style={{ fontSize: "14px", fontWeight: "bold", margin: "6px 0" }}>{line.substring(3)}</h2>;
      } else if (line.trim() === "") {
        return <br key={index} />;
      } else {
        return <p key={index} style={{ margin: "4px 0", fontSize: "12px" }}>{line}</p>;
      }
    });
  };

  return (
    <div
      style={{
        padding: "12px",
        fontFamily: "monospace",
        fontSize: "12px",
        whiteSpace: "pre-wrap",
        backgroundColor: "var(--win-white)",
        minHeight: "200px",
      }}
    >
      {content ? renderMarkdown(content) : <p>No content available</p>}
    </div>
  );
}
