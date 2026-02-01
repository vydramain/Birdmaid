import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { DesktopPage } from '@/pages/DesktopPage';
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

describe('Desktop Help Files Visibility', () => {
  beforeEach(() => {
    // Reset VFS
    (vfs as any).root = {
      name: '',
      type: 'dir',
      children: [],
    };
    (vfs as any).initializeSystemFolders();
    
    // Set role to Organizer for setup (to allow writing files)
    vfs.setUserRole('Organizer');
    
    // Create help files in /Disk C/desktop
    vfs.writeFile('/Disk C/desktop/help.txt', '# Birdmaid Help\n\nWelcome to Birdmaid OS.');
    vfs.writeFile('/Disk C/desktop/admin_help.txt', '# Birdmaid Admin Help\n\nWelcome, Organizer!');
    
    // Create other desktop icons
    vfs.writeFile('/Disk C/desktop/My Computer.url', JSON.stringify({
      type: 'link',
      label: 'My Computer',
      target: 'explorer'
    }));
  });

  it('should show help.txt for Guest', async () => {
    vfs.setUserRole('Guest');
    
    render(<DesktopPage />);
    
    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
    });
  });

  it('should NOT show admin_help.txt for Guest', async () => {
    vfs.setUserRole('Guest');
    
    render(<DesktopPage />);
    
    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
    });
    
    // admin_help.txt should NOT be visible
    expect(screen.queryByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).not.toBeInTheDocument();
  });

  it('should NOT show admin_help.txt for Participant', async () => {
    vfs.setUserRole('Participant');
    
    render(<DesktopPage />);
    
    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
    });
    
    // admin_help.txt should NOT be visible
    expect(screen.queryByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).not.toBeInTheDocument();
  });

  it('should show admin_help.txt for Organizer', async () => {
    vfs.setUserRole('Organizer');
    
    render(<DesktopPage />);
    
    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).toBeInTheDocument();
    });
  });

  it('should show both help.txt and admin_help.txt for Organizer', async () => {
    vfs.setUserRole('Organizer');
    
    render(<DesktopPage />);
    
    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      // Both files should be visible
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).toBeInTheDocument();
    });
  });

  it('should update visibility when role changes', async () => {
    // Start as Guest
    vfs.setUserRole('Guest');
    render(<DesktopPage />);
    
    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
    });
    
    // admin_help.txt should NOT be visible
    expect(screen.queryByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).not.toBeInTheDocument();
    
    // Change to Organizer and trigger a VFS update by writing a dummy file
    vfs.setUserRole('Organizer');
    // Write a file to trigger VFS event which will cause DesktopPage to re-check role
    vfs.writeFile('/Disk C/desktop/.role-update-trigger', '');
    vfs.delete('/Disk C/desktop/.role-update-trigger');
    
    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      // Now both should be visible
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
