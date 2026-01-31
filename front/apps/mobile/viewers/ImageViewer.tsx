import { useState, useEffect } from "react";
import { VFSNode } from "@/os/fs/VirtualFileSystem";
import { apiClient } from "@/api/client";

interface ImageViewerProps {
  content: VFSNode;
  onBack: () => void;
}

/**
 * ImageViewer - Mobile viewer for images (WM6 style).
 */
export function ImageViewer({ content, onBack }: ImageViewerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (content.content instanceof Blob) {
          const url = URL.createObjectURL(content.content);
          setImageUrl(url);
          return;
        }

        // Load from API
        const path = content.name;
        const response = await apiClient.request(`/api/vfs/read?key=${encodeURIComponent(path)}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        }
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    };

    loadImage();

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
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

      {/* Image Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        overflow: 'auto',
        padding: '8px',
      }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={content.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div style={{ color: 'white', textAlign: 'center' }}>Loading...</div>
        )}
      </div>
    </div>
  );
}
