import { VFSNode } from "@/os/fs/VirtualFileSystem";

interface TextViewerProps {
  content: VFSNode;
  onBack: () => void;
}

/**
 * TextViewer - Mobile viewer for text files (WM6 style).
 */
export function TextViewer({ content, onBack }: TextViewerProps) {
  const textContent = typeof content.content === 'string' 
    ? content.content 
    : content.content instanceof Blob
    ? 'Binary content' 
    : '';

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

      {/* Text Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: 'white',
        padding: '12px',
        fontSize: '14px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
      }}>
        {textContent || 'Empty file'}
      </div>
    </div>
  );
}
