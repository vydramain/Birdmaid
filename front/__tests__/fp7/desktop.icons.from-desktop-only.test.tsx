import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderShell } from '@/test/utils';
import { DesktopPage } from '@/pages/DesktopPage';
import { vfs } from '@/os/fs/VirtualFileSystem';
import { resetVFSForTest } from "@/test/utils/vfs-test-utils";
import { mockApi } from "@/test/mocks/mockApi";

const mockOpenWindow = vi.fn();

vi.mock('@/os/wm/WindowRegistry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/os/wm/WindowRegistry')>();
  return {
    ...actual,
    useWindowRegistry: () => ({ openWindow: mockOpenWindow, closeWindow: vi.fn(), focusWindow: vi.fn() }),
  };
});

vi.mock('@/os/wm/WindowManager', () => ({
  WindowManager: () => <div>WindowManager</div>,
}));

describe('Desktop Icons Read from Desktop Only', () => {
  const itemsByPath: Record<string, { name: string; type: "file" | "dir" }[]> = {
    '/Disk C/desktop': [
      { name: 'My Computer.url', type: 'file' },
      { name: 'Explorer.url', type: 'file' },
    ],
  };

  const contentByKey: Record<string, string> = {
    '/Disk C/desktop/My Computer.url': JSON.stringify({ type: 'link', label: 'My Computer', target: 'explorer' }),
    '/Disk C/desktop/Explorer.url': JSON.stringify({ type: 'link', label: 'Explorer', target: 'explorer' }),
    '/Disk C/desktop/NewIcon.url': JSON.stringify({ type: 'link', label: 'New Icon', target: 'explorer' }),
  };

  beforeEach(() => {
    mockOpenWindow.mockClear();
    resetVFSForTest();
    vfs.setUserRole('Organizer');
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults?.();
    }
    mockApi.authMe({ role: 'Organizer' });
    itemsByPath['/Disk C/desktop'] = [
      { name: 'My Computer.url', type: 'file' },
      { name: 'Explorer.url', type: 'file' },
    ];
    mockApi.vfsList(itemsByPath);
    mockApi.vfsRead(contentByKey);
  });

  it('should only display icons from /Disk C/desktop', async () => {
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      const myComputerIcon = within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url');
      const explorerIcon = within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/Explorer.url');
      expect(myComputerIcon).toBeInTheDocument();
      expect(explorerIcon).toBeInTheDocument();
    });

    expect(screen.queryByTestId('desktop-icon-/Disk C/documents/file.txt')).not.toBeInTheDocument();
    expect(screen.queryByTestId('desktop-icon-/Disk C/images/image.png')).not.toBeInTheDocument();
    expect(screen.queryByTestId('desktop-icon-/Disk A/other-file.txt')).not.toBeInTheDocument();
  });

  it('should update icons when files are added to /Disk C/desktop', async () => {
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url')).toBeInTheDocument();
    });

    itemsByPath['/Disk C/desktop'].push({ name: 'NewIcon.url', type: 'file' });
    window.dispatchEvent(new CustomEvent('vfs:invalidated', { detail: { path: '/Disk C/desktop' } }));

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/NewIcon.url')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should update icons when files are removed from /Disk C/desktop', async () => {
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url')).toBeInTheDocument();
    });

    itemsByPath['/Disk C/desktop'] = itemsByPath['/Disk C/desktop'].filter((i) => i.name !== 'My Computer.url');
    window.dispatchEvent(new CustomEvent('vfs:invalidated', { detail: { path: '/Disk C/desktop' } }));

    await waitFor(() => {
      expect(screen.queryByTestId('desktop-icon-/Disk C/desktop/My Computer.url')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should not show files from /Disk C/documents on desktop', async () => {
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url')).toBeInTheDocument();
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/Explorer.url')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('desktop-icon-/Disk C/documents/file.txt')).not.toBeInTheDocument();
  });

  it('should not show files from /Disk A on desktop', async () => {
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url')).toBeInTheDocument();
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/Explorer.url')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('desktop-icon-/Disk A/other-file.txt')).not.toBeInTheDocument();
  });

  it('should open window on double-click desktop icon', async () => {
    localStorage.setItem('birdmaid_landing_seen', '1');
    renderShell(<DesktopPage />);

    await waitFor(() => {
      const desktopIcons = screen.getByTestId('desktop-icons');
      expect(within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url')).toBeInTheDocument();
    });

    mockOpenWindow.mockClear();
    const desktopIcons = screen.getByTestId('desktop-icons');
    const myComputerIcon = within(desktopIcons).getByTestId('desktop-icon-/Disk C/desktop/My Computer.url');
    fireEvent.doubleClick(myComputerIcon);

    expect(mockOpenWindow).toHaveBeenCalledWith('explorer');
  });
});
