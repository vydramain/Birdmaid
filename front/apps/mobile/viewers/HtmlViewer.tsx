import { useState, useEffect } from "react";
import { VFSNode } from "@/os/fs/VirtualFileSystem";
import { apiClient } from "@/api/client";

interface HtmlViewerProps {
  content: VFSNode;
  onBack: () => void;
}

/**
 * HtmlViewer - Mobile viewer for HTML files (WM6 style).
 */
export function HtmlViewer({ content, onBack }: HtmlViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    const loadHtml = async () => {
      try {
        if (typeof content.content === 'string') {
          setHtmlContent(content.content);
          return;
        }

        if (content.content instanceof Blob) {
          const text = await content.content.text();
          setHtmlContent(text);
          return;
        }

        // Load from API
        const path = content.name;
        const response = await apiClient.request(`/api/vfs/read?key=${encodeURIComponent(path)}`);
        if (response.ok) {
          const text = await response.text();
          setHtmlContent(text);
        }
      } catch (error) {
        console.error('Failed to load HTML:', error);
      }
    };

    loadHtml();
  }, [content]);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#C0C0C0',
    }}>
      {/* WM6 Header */}
      <div style={{
        backgroundColor: '#0054E3',
        color: 'white',
        padding: '8px 12px',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span>{content.name}</span>
        <button
          onClick={onBack}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          Back
        </button>
      </div>

      {/* HTML Content */}
      <iframe
        srcDoc={htmlContent}
        style={{
          flex: 1,
          border: 'none',
          backgroundColor: 'white',
        }}
        sandbox="allow-scripts allow-same-origin allow-forms"
        title={content.name}
      />
    </div>
  );
}
