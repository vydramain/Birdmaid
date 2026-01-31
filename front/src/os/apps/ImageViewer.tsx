import { useEffect, useState } from "react";
import { VFSNode } from "../fs/VirtualFileSystem";
import { HourglassLoader } from "../../components/win95/HourglassLoader";

type ImageViewerProps = {
  content?: {
    node?: VFSNode;
    path?: string;
    src?: string; // Direct URL (for API-loaded content)
  };
};

/**
 * ImageViewer: Windows 95 style image viewer with fit-to-window logic
 */
export function ImageViewer({ content }: ImageViewerProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(null);

      try {
        // If direct src URL provided, use it
        if (content?.src) {
          setImageSrc(content.src);
          setLoading(false);
          return;
        }

        // If VFS node provided, create blob URL
        if (content?.node && content.node.type === 'file') {
          const fileContent = content.node.content;
          if (fileContent instanceof Blob) {
            const blobUrl = URL.createObjectURL(fileContent);
            setImageSrc(blobUrl);
            setLoading(false);
            return () => {
              URL.revokeObjectURL(blobUrl);
            };
          } else if (typeof fileContent === 'string') {
            // If it's a string (URL or base64), use it directly
            setImageSrc(fileContent);
            setLoading(false);
            return;
          }
        }

        // If path provided, try to load from API
        if (content?.path) {
          // TODO: Load from API endpoint when VFS/S3 integration is ready
          // For now, try to create a blob URL from VFS
          setError("Image loading from path not yet implemented");
          setLoading(false);
          return;
        }

        setError("No image source provided");
        setLoading(false);
      } catch (err) {
        console.error("Error loading image:", err);
        setError(err instanceof Error ? err.message : "Failed to load image");
        setLoading(false);
      }
    };

    loadImage();
  }, [content]);

  if (loading) {
    return (
      <div style={{ 
        width: "100%", 
        height: "100%", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        backgroundColor: "var(--win-white)"
      }}>
        <HourglassLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: "20px", 
        color: "var(--win-red)",
        backgroundColor: "var(--win-white)"
      }}>
        Error: {error}
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div style={{ 
        padding: "20px", 
        color: "var(--win-gray-dark)",
        backgroundColor: "var(--win-white)"
      }}>
        No image to display
      </div>
    );
  }

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      backgroundColor: "var(--win-gray)",
      overflow: "auto",
      padding: "8px"
    }}>
      <img
        src={imageSrc}
        alt={content?.node?.name || "Image"}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain", // Fit-to-window: maintain aspect ratio, fit within container
          imageRendering: "auto"
        }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError("Failed to load image");
          setLoading(false);
        }}
      />
    </div>
  );
}
