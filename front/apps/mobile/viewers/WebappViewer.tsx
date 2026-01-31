import { useState, useEffect } from "react";
import { VFSNode } from "@/os/fs/VirtualFileSystem";
import { apiClient } from "@/api/client";

interface WebappViewerProps {
  content: VFSNode;
  onBack: () => void;
}

/**
 * WebappViewer - Mobile viewer for webapp/game content (WM6 style).
 */
export function WebappViewer({ content, onBack }: WebappViewerProps) {
  const [appUrl, setAppUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadWebapp = async () => {
      try {
        // For webapp, try to get URL from content or metadata
        if (typeof content.content === 'string') {
          // Assume it's a URL
          setAppUrl(content.content);
          return;
        }

        // Try to load index.html from the app folder
        const path = content.name.endsWith('.app') 
          ? content.name.replace('.app', '/index.html')
          : `${content.name}/index.html`;
        
        const response = await apiClient.request(`/api/vfs/read?key=${encodeURIComponent(path)}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setAppUrl(url);
        } else {
          // Fallback: try to construct URL from path
          const basePath = content.name.replace(/\.app$/, '');
          setAppUrl(`/api/vfs/read?key=${encodeURIComponent(basePath)}`);
        }
      } catch (error) {
        console.error('Failed to load webapp:', error);
      }
    };

    loadWebapp();

    return () => {
      if (appUrl && appUrl.startsWith('blob:')) {
        URL.revokeObjectURL(appUrl);
      }
    };
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

      {/* Webapp Content */}
      <iframe
        src={appUrl || undefined}
        style={{
          flex: 1,
          border: 'none',
          backgroundColor: 'white',
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title={content.name}
      />
    </div>
  );
}
