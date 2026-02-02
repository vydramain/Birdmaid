import { useEffect, useState } from "react";
import { VFSNode } from "../fs/VirtualFileSystem";
import { vfs } from "../fs/VirtualFileSystem";
import { HourglassLoader } from "../../components/win95/HourglassLoader";

type NotepadProps = {
  content?: {
    node?: VFSNode;
    path?: string;
    text?: string; // Direct text content
  };
};

/**
 * Notepad: Windows 95 style text editor/viewer
 * - Read-only for Guest/Participant
 * - Editable for Organizer
 * - Supports Markdown rendering for .md files (safe render)
 */
export function Notepad({ content }: NotepadProps) {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    const loadText = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if editable (Organizer only)
        const userRole = vfs.getUserRole();
        setIsEditable(userRole === "Organizer");

        // If direct text provided, use it
        if (content?.text) {
          setText(content.text);
          setIsMarkdown(false);
          setLoading(false);
          return;
        }

        // If VFS node provided, read content
        if (content?.node && content.node.type === "file") {
          const fileContent = content.node.content;
          const fileName = content.node.name;

          // Check if it's markdown
          setIsMarkdown(fileName.endsWith(".md"));

          if (typeof fileContent === "string") {
            setText(fileContent);
            setLoading(false);
            return;
          } else if (fileContent instanceof Blob) {
            // Convert blob to text
            const textContent = await fileContent.text();
            setText(textContent);
            setLoading(false);
            return;
          }
        }

        // If path provided, try to read from VFS
        if (content?.path) {
          try {
            const node = vfs.stat(content.path);
            if (node && node.type === "file") {
              const fileContent = vfs.readFile(content.path);
              const fileName = node.name;

              setIsMarkdown(fileName.endsWith(".md"));

              if (typeof fileContent === "string") {
                setText(fileContent);
              } else if (fileContent instanceof Blob) {
                const textContent = await fileContent.text();
                setText(textContent);
              }
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error("Error reading file:", err);
            setError(err instanceof Error ? err.message : "Failed to read file");
            setLoading(false);
            return;
          }
        }

        setError("No text content provided");
        setLoading(false);
      } catch (err) {
        console.error("Error loading text:", err);
        setError(err instanceof Error ? err.message : "Failed to load text");
        setLoading(false);
      }
    };

    loadText();
  }, [content]);

  // Safe Markdown rendering (basic, no dangerous HTML)
  const renderMarkdown = (text: string): string => {
    // Very basic markdown rendering - only safe elements
    // No script execution, no dangerous HTML
    const html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");

    return html;
  };

  if (loading) {
    return (
      <div className="viewer-loading">
        <HourglassLoader />
      </div>
    );
  }

  if (error) {
    return <div className="viewer-error">Error: {error}</div>;
  }

  return (
    <div className="notepad-container">
      {isMarkdown && !isEditable ? (
        // Markdown preview (read-only)
        <div
          className="notepad-preview"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
        />
      ) : (
        // Plain text editor/viewer
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          readOnly={!isEditable}
          className="notepad-textarea"
        />
      )}
    </div>
  );
}
