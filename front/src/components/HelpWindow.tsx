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
      <div className="help-loading">
        <HourglassLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="help-content help-error">
        <p className="text-error">Error: {error}</p>
      </div>
    );
  }

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      if (line.startsWith("# ")) {
        return <h1 key={index} className="help-h1">{line.substring(2)}</h1>;
      } else if (line.startsWith("## ")) {
        return <h2 key={index} className="help-h2">{line.substring(3)}</h2>;
      } else if (line.trim() === "") {
        return <br key={index} />;
      } else {
        return <p key={index} className="help-p">{line}</p>;
      }
    });
  };

  return (
    <div className="help-markdown">
      {content ? renderMarkdown(content) : <p>No content available</p>}
    </div>
  );
}
