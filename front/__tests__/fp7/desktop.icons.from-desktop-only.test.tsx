import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { DesktopPage } from '@/pages/DesktopPage';
import { VirtualFileSystem } from '@/os/fs/VirtualFileSystem';
import { vfs } from '@/os/fs/VirtualFileSystem';

// Mock WindowRegistry
vi.mock('@/os/wm/WindowRegistry', () => ({
  useWindowRegistry: () => ({
    openWindow: vi.fn(),
  }),
}));

// Mock WindowManager
vi.mock('@/os/wm/WindowManager', () => ({
  WindowManager: () => <div>WindowManager</div>,
}));

describe('Desktop Icons Read from Desktop Only', () => {
  beforeEach(() => {
    // Reset VFS
    (vfs as any).root = {
      name: '',
      type: 'dir',
      children: [],
    };
    (vfs as any).initializeSystemFolders();
    vfs.setUserRole('Organizer');
    
    // Create icons in /Disk C/desktop (correct location)
    vfs.writeFile('/Disk C/desktop/My Computer.url', JSON.stringify({
      type: 'link',
      label: 'My Computer',
      target: 'explorer'
    }));
    
    vfs.writeFile('/Disk C/desktop/Explorer.url', JSON.stringify({
      type: 'link',
      label: 'Explorer',
      target: 'explorer'
    }));
    
    // Create files in other locations (should NOT appear on desktop)
    vfs.writeFile('/Disk C/documents/file.txt', 'content');
    vfs.writeFile('/Disk C/images/image.png', 'image data');
    vfs.writeFile('/Disk A/other-file.txt', 'other content');
  });

  it('should only display icons from /Disk C/desktop', async () => {
    render(<DesktopPage />);
    
    await waitFor(() => {
      // Should show icons from /Disk C/desktop using data-testid
      const desktopIcons = screen.getByTestId('desktop-icons');
      const myComputerIcon = within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url');
      const explorerIcon = within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/Explorer.url');
      expect(myComputerIcon).toBeInTheDocument();
      expect(explorerIcon).toBeInTheDocument();
    });
    
    // Should NOT show files from other locations
    expect(screen.queryByTestId('desktop-icon-/Disk C/documents/file.txt')).not.toBeInTheDocument();
    expect(screen.queryByTestId('desktop-icon-/Disk C/images/image.png')).not.toBeInTheDocument();
    expect(screen.queryByTestId('desktop-icon-/Disk A/other-file.txt')).not.toBeInTheDocument();
  });

  it('should update icons when files are added to /Disk C/desktop', async () => {
    render(<DesktopPage />);
    
    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url')).toBeInTheDocument();
    });
    
    // Add new icon to desktop
    vfs.writeFile('/Disk C/desktop/NewIcon.url', JSON.stringify({
      type: 'link',
      label: 'New Icon',
      target: 'explorer'
    }));
    
    // Wait for VFS event to propagate
    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/NewIcon.url')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should update icons when files are removed from /Disk C/desktop', async () => {
    render(<DesktopPage />);
    
    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url')).toBeInTheDocument();
    });
    
    // Remove icon from desktop
    vfs.delete('/Disk C/desktop/My Computer.url');
    
    // Wait for VFS event to propagate
    await waitFor(() => {
      expect(screen.queryByTestId('desktop-icon-/Disk C/desktop/My Computer.url')).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should not show files from /Disk C/documents on desktop', async () => {
    render(<DesktopPage />);
    
    await waitFor(() => {
      // Desktop icons should be loaded
      const desktopIcons = screen.getByTestId('desktop-icons');
      // Check each icon separately using data-testid
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url')).toBeInTheDocument();
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/Explorer.url')).toBeInTheDocument();
    });
    
    // File in documents should not appear
    expect(screen.queryByTestId('desktop-icon-/Disk C/documents/file.txt')).not.toBeInTheDocument();
  });

  it('should not show files from /Disk A on desktop', async () => {
    render(<DesktopPage />);
    
    await waitFor(() => {
      // Desktop icons should be loaded
      const desktopIcons = screen.getByTestId('desktop-icons');
      // Check each icon separately using data-testid
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url')).toBeInTheDocument();
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/Explorer.url')).toBeInTheDocument();
    });
    
    // File in Disk A should not appear
    expect(screen.queryByTestId('desktop-icon-/Disk A/other-file.txt')).not.toBeInTheDocument();
  });
});
