import { useEffect, useState } from "react";
import { VFSNode } from "../fs/VirtualFileSystem";
import { HourglassLoader } from "../../components/win95/HourglassLoader";

type VideoViewerProps = {
  content?: {
    node?: VFSNode;
    path?: string;
    src?: string; // Direct URL (for API-loaded content)
  };
};

/**
 * VideoViewer: Windows 95 style video viewer with HTML5 video controls
 */
export function VideoViewer({ content }: VideoViewerProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true);
      setError(null);

      try {
        // If direct src URL provided, use it
        if (content?.src) {
          setVideoSrc(content.src);
          setLoading(false);
          return;
        }

        // If VFS node provided, create blob URL
        if (content?.node && content.node.type === "file") {
          const fileContent = content.node.content;
          if (fileContent instanceof Blob) {
            const blobUrl = URL.createObjectURL(fileContent);
            setVideoSrc(blobUrl);
            setLoading(false);
            return () => {
              URL.revokeObjectURL(blobUrl);
            };
          } else if (typeof fileContent === "string") {
            // If it's a string (URL), use it directly
            setVideoSrc(fileContent);
            setLoading(false);
            return;
          }
        }

        // If path provided, try to load from API
        if (content?.path) {
          // TODO: Load from API endpoint when VFS/S3 integration is ready
          setError("Video loading from path not yet implemented");
          setLoading(false);
          return;
        }

        setError("No video source provided");
        setLoading(false);
      } catch (err) {
        console.error("Error loading video:", err);
        setError(err instanceof Error ? err.message : "Failed to load video");
        setLoading(false);
      }
    };

    loadVideo();
  }, [content]);

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

  if (!videoSrc) {
    return <div className="viewer-empty">No video to display</div>;
  }

  return (
    <div className="viewer-video-container">
      <video
        src={videoSrc}
        controls
        className="viewer-video"
        onLoadedData={() => setLoading(false)}
        onError={() => {
          setError("Failed to load video");
          setLoading(false);
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
