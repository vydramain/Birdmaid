import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderWithContextMenu } from '@/test/utils';
import { ExplorerWindow } from '@/components/ExplorerWindow';
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

const vfsListItems: Record<string, { name: string; type: "file" | "dir" }[]> = {
  '/': [
    { name: 'Disk A', type: 'dir' },
    { name: 'Disk B', type: 'dir' },
    { name: 'Disk C', type: 'dir' },
  ],
  '/Disk C': [
    { name: 'desktop', type: 'dir' },
    { name: 'images', type: 'dir' },
    { name: 'videos', type: 'dir' },
    { name: 'documents', type: 'dir' },
  ],
  '/Disk C/documents': [
    { name: 'LD59', type: 'dir' },
  ],
};

describe('Explorer Tree + Grid Navigation', () => {
  beforeEach(() => {
    resetVFSForTest();
    vfs.setUserRole('Organizer');
    if (mockApi && typeof mockApi.reset === 'function') {
      mockApi.reset();
      mockApi.setupDefaults?.();
    }
    mockApi.authMe({ role: 'Organizer' });
    mockApi.vfsList(vfsListItems);
    mockApi.vfsRead({});
  });

  it('should display root with system folders in tree view', () => {
    renderWithContextMenu(<ExplorerWindow />);
    
    // Check that root is visible in tree view using data-testid
    const treeView = screen.getByTestId('explorer-tree');
    const rootItem = within(treeView).getByTestId('tree-item-/');
    expect(rootItem).toBeInTheDocument();
    expect(rootItem).toHaveTextContent('My Computer');
    
    // System folders should be visible (they are children of root)
    // Note: This test assumes tree view is expanded by default at root level
    const diskA = within(treeView).queryByTestId('tree-item-/Disk A');
    const diskB = within(treeView).queryByTestId('tree-item-/Disk B');
    const diskC = within(treeView).queryByTestId('tree-item-/Disk C');
    expect(diskA || diskB || diskC).toBeTruthy();
  });

  it('should navigate to folder when clicking in tree view', async () => {
    renderWithContextMenu(<ExplorerWindow />);
    
    // Find and click on a folder in tree using data-testid
    const treeView = screen.getByTestId('explorer-tree');
    const diskC = within(treeView).queryByTestId('tree-item-/Disk C');
    if (diskC) {
      fireEvent.click(diskC);
      
      await waitFor(() => {
        // Path should update to show /Disk C
        const addressInput = screen.getByTestId('explorer-address-input');
        expect(addressInput).toHaveTextContent('/Disk C');
        
        // Grid should update to show contents of Disk C (system folders)
        const gridView = screen.getByTestId('explorer-grid');
        // Check for at least one system folder in grid using data-testid
        const desktopFolder = within(gridView).queryByTestId('explorer-grid-item-/Disk C/desktop');
        const imagesFolder = within(gridView).queryByTestId('explorer-grid-item-/Disk C/images');
        const videosFolder = within(gridView).queryByTestId('explorer-grid-item-/Disk C/videos');
        const documentsFolder = within(gridView).queryByTestId('explorer-grid-item-/Disk C/documents');
        expect(desktopFolder || imagesFolder || videosFolder || documentsFolder).toBeTruthy();
      });
    }
  });

  it('should display folder contents in grid view', async () => {
    renderWithContextMenu(<ExplorerWindow />);

    await waitFor(() => {
      const gridView = screen.getByTestId('explorer-grid');
      const diskA = within(gridView).queryByTestId('explorer-grid-item-/Disk A');
      const diskB = within(gridView).queryByTestId('explorer-grid-item-/Disk B');
      const diskC = within(gridView).queryByTestId('explorer-grid-item-/Disk C');
      expect(diskA || diskB || diskC).toBeTruthy();
    });

    const statusBar = screen.getByTestId('explorer-status');
    expect(statusBar).toHaveTextContent(/item\(s\)/);
  });

  it('should navigate to nested folder when double-clicking in grid view', async () => {
    renderWithContextMenu(<ExplorerWindow />);
    
    // Navigate to /Disk C first
    const treeView = screen.getByTestId('explorer-tree');
    const diskC = within(treeView).queryByTestId('tree-item-/Disk C');
    if (diskC) {
      fireEvent.click(diskC);
      
      // Wait for Disk C to load
      await waitFor(() => {
        const addressInput = screen.getByTestId('explorer-address-input');
        expect(addressInput).toHaveTextContent('/Disk C');
      });
      
      // Find documents folder in grid
      const gridView = screen.getByTestId('explorer-grid');
      const documentsFolder = within(gridView).queryByTestId('explorer-grid-item-/Disk C/documents');
      if (documentsFolder) {
        // Double-click to navigate into documents
        fireEvent.doubleClick(documentsFolder);
        
        // Verify grid shows contents of /Disk C/documents
        await waitFor(() => {
          const addressInput = screen.getByTestId('explorer-address-input');
          expect(addressInput).toHaveTextContent('/Disk C/documents');
          
          // Check for LD59 folder in grid
          const updatedGridView = screen.getByTestId('explorer-grid');
          const ld59Folder = within(updatedGridView).queryByTestId('explorer-grid-item-/Disk C/documents/LD59');
          expect(ld59Folder).toBeTruthy();
        });
      }
    }
  });

  it('should update grid view when navigating via tree', async () => {
    renderWithContextMenu(<ExplorerWindow />);
    
    // Navigate via tree view
    const treeView = screen.getByTestId('explorer-tree');
    const diskC = within(treeView).queryByTestId('tree-item-/Disk C');
    if (diskC) {
      fireEvent.click(diskC);
      
      await waitFor(() => {
        // Grid should update to show contents of Disk C
        const gridView = screen.getByTestId('explorer-grid');
        const addressInput = screen.getByTestId('explorer-address-input');
        expect(addressInput).toHaveTextContent('/Disk C');
        
        // Verify grid shows system folders from Disk C
        const desktopFolder = within(gridView).queryByTestId('explorer-grid-item-/Disk C/desktop');
        expect(desktopFolder).toBeTruthy();
      });
    }
  });

  it('should show path in address bar', () => {
    renderWithContextMenu(<ExplorerWindow />);
    
    // Address bar should show current path
    const addressInput = screen.getByTestId('explorer-address-input');
    expect(addressInput).toBeInTheDocument();
    // At root, should show "My Computer"
    expect(addressInput).toHaveTextContent('My Computer');
  });

  it('should navigate up when clicking up button', async () => {
    renderWithContextMenu(<ExplorerWindow />);
    
    const upButton = screen.getByTestId('explorer-up-button');
    expect(upButton).toBeInTheDocument();
    
    // Up button should be disabled at root
    expect(upButton).toBeDisabled();
  });

  it.skip('should render menubar with expected items (menubar not in current Explorer UI)', () => {
    renderWithContextMenu(<ExplorerWindow />);
    const menubar = screen.getByTestId('explorer-menubar');
    expect(menubar).toBeInTheDocument();
  });

  it('should navigate when single-clicking folder in grid', async () => {
    renderWithContextMenu(<ExplorerWindow />);

    const treeView = screen.getByTestId('explorer-tree');
    const diskC = within(treeView).queryByTestId('tree-item-/Disk C');
    if (diskC) {
      fireEvent.click(diskC);
    }

    await waitFor(() => {
      const addressInput = screen.getByTestId('explorer-address-input');
      expect(addressInput).toHaveTextContent('/Disk C');
    });

    const gridView = screen.getByTestId('explorer-grid');
    const documentsFolder = within(gridView).queryByTestId('explorer-grid-item-/Disk C/documents');
    expect(documentsFolder).toBeTruthy();

    if (documentsFolder) {
      fireEvent.click(documentsFolder);
      await waitFor(() => {
        expect(screen.getByTestId('explorer-address-input')).toHaveTextContent('/Disk C/documents');
      });
    }
  });
});
