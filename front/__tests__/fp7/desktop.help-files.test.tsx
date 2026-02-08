import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { renderShell } from '@/test/utils';
import { DesktopPage } from '@/pages/DesktopPage';
import { vfs } from '@/os/fs/VirtualFileSystem';
import { resetVFSForTest } from "@/test/utils/vfs-test-utils";
import { mockApi } from "@/test/mocks/mockApi";

vi.mock('@/os/wm/WindowRegistry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/os/wm/WindowRegistry')>();
  return {
    ...actual,
    useWindowRegistry: () => ({ openWindow: vi.fn(), closeWindow: vi.fn(), focusWindow: vi.fn() }),
  };
});

vi.mock('@/os/wm/WindowManager', () => ({
  WindowManager: () => <div>WindowManager</div>,
}));

describe('Desktop Help Files Visibility', () => {
  const itemsByPath: Record<string, { name: string; type: "file" | "dir" }[]> = {
    '/Disk C/desktop': [
      { name: 'help.txt', type: 'file' },
      { name: 'admin_help.txt', type: 'file' },
      { name: 'My Computer.url', type: 'file' },
    ],
  };

  const contentByKey: Record<string, string> = {
    '/Disk C/desktop/My Computer.url': JSON.stringify({ type: 'link', label: 'My Computer', target: 'explorer' }),
  };

  beforeEach(() => {
    resetVFSForTest();
    vfs.setUserRole('Organizer');
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults?.();
    }
    mockApi.authMe({ role: 'Organizer' });
    itemsByPath['/Disk C/desktop'] = [
      { name: 'help.txt', type: 'file' },
      { name: 'admin_help.txt', type: 'file' },
      { name: 'My Computer.url', type: 'file' },
    ];
    mockApi.vfsList(itemsByPath);
    mockApi.vfsRead(contentByKey);
  });

  it('should show help.txt for Guest', async () => {
    vfs.setUserRole('Guest');
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
    });
  });

  it('should NOT show admin_help.txt for Guest', async () => {
    vfs.setUserRole('Guest');
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).not.toBeInTheDocument();
  });

  it('should NOT show admin_help.txt for Participant', async () => {
    vfs.setUserRole('Participant');
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).not.toBeInTheDocument();
  });

  it('should show admin_help.txt for Organizer', async () => {
    vfs.setUserRole('Organizer');
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).toBeInTheDocument();
    });
  });

  it('should show both help.txt and admin_help.txt for Organizer', async () => {
    vfs.setUserRole('Organizer');
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).toBeInTheDocument();
    });
  });

  it('should update visibility when role changes', async () => {
    vfs.setUserRole('Guest');
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).not.toBeInTheDocument();

    vfs.setUserRole('Organizer');
    window.dispatchEvent(new CustomEvent('vfs:invalidated', { detail: { path: '/Disk C/desktop' } }));

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/help.txt')).toBeInTheDocument();
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/admin_help.txt')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
