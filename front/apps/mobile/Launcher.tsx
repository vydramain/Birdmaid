import { Icon } from "@/ui/icons";
import type { IconType } from "@/ui/icons";

/**
 * Launcher - Windows Mobile 6.0 styled app launcher.
 * 
 * Displays list of apps/content items in WM6 style.
 */
interface LauncherProps {
  apps: Array<{ id: string; name: string; icon: IconType; path: string }>;
  onOpenContent: (path: string) => void;
}

export function Launcher({ apps, onOpenContent }: LauncherProps) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#C0C0C0',
    }}>
      {/* WM6 Header */}
      <div style={{
        backgroundColor: '#0054E3', // WM6 blue header
        color: 'white',
        padding: '8px 12px',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span>Programs</span>
        <span style={{ fontSize: '12px' }}>Menu</span>
      </div>

      {/* App List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px',
      }}>
        {apps.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#666',
            fontSize: '14px',
          }}>
            No applications available
          </div>
        ) : (
          apps.map((app) => (
            <div
              key={app.id}
              onClick={() => onOpenContent(app.path)}
              style={{
                backgroundColor: 'white',
                border: '1px solid #808080',
                borderRadius: '2px',
                padding: '12px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                boxShadow: 'inset 1px 1px 0px #000, inset -1px -1px 0px #808080',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.boxShadow = 'inset 1px 1px 2px #000';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = 'inset 1px 1px 0px #000, inset -1px -1px 0px #808080';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'inset 1px 1px 0px #000, inset -1px -1px 0px #808080';
              }}
            >
              <div style={{ marginRight: '12px', display: 'inline-flex' }}>
                <Icon type={app.icon} size="32x32" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 'normal' }}>{app.name}</span>
            </div>
          ))
        )}
      </div>

      {/* WM6 Footer/Status Bar */}
      <div style={{
        backgroundColor: '#C0C0C0',
        borderTop: '1px solid #808080',
        padding: '4px 8px',
        fontSize: '11px',
        color: '#000',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>Start</span>
        <span>{apps.length} items</span>
      </div>
    </div>
  );
}
