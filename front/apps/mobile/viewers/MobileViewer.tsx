import { VFSNode } from "@/os/fs/VirtualFileSystem";
import { ImageViewer } from "./ImageViewer";
import { VideoViewer } from "./VideoViewer";
import { TextViewer } from "./TextViewer";
import { HtmlViewer } from "./HtmlViewer";
import { WebappViewer } from "./WebappViewer";
import { appRegistry } from "@/os/apps/AppRegistry";

interface MobileViewerProps {
  content: VFSNode | null;
  onBack: () => void;
}

/**
 * MobileViewer - Router for mobile content viewers.
 * 
 * Determines content type and opens appropriate viewer.
 */
export function MobileViewer({ content, onBack }: MobileViewerProps) {
  if (!content || content.type !== 'file') {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>No content to display</p>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  const fileName = content.name;
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  
  // Determine content type
  const contentType = appRegistry.resolveAppForFile(fileName);
  const app = contentType ? appRegistry.get(contentType) : null;

  // Route to appropriate viewer
  if (extension === '.png' || extension === '.jpg' || extension === '.jpeg' || extension === '.gif' || extension === '.webp') {
    return <ImageViewer content={content} onBack={onBack} />;
  }
  
  if (extension === '.mp4' || extension === '.webm' || extension === '.ogg') {
    return <VideoViewer content={content} onBack={onBack} />;
  }
  
  if (extension === '.txt' || extension === '.md') {
    return <TextViewer content={content} onBack={onBack} />;
  }
  
  if (extension === '.html' || extension === '.htm') {
    return <HtmlViewer content={content} onBack={onBack} />;
  }
  
  if (extension === '.app' || contentType === 'webapp') {
    return <WebappViewer content={content} onBack={onBack} />;
  }

  // Default: text viewer
  return <TextViewer content={content} onBack={onBack} />;
}
