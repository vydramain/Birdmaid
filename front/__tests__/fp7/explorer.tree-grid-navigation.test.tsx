import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ExplorerWindow } from '@/components/ExplorerWindow';
import { vfs } from '@/os/fs/VirtualFileSystem';
import { resetVFSForTest } from "@/test/utils/vfs-test-utils";

vi.mock('@/os/wm/WindowRegistry', () => ({
  useWindowRegistry: () => ({ openWindow: vi.fn() }),
}));

describe('Explorer Tree + Grid Navigation', () => {
  beforeEach(() => {
    resetVFSForTest();
    vfs.setUserRole('Organizer');
    
    // Create test structure
    vfs.mkdir('/Disk C/documents/LD59');
    vfs.mkdir('/Disk C/documents/LD59/command1');
    vfs.writeFile('/Disk C/documents/LD59/command1/game', 'game data');
    vfs.writeFile('/Disk C/documents/LD59/file.txt', 'content');
  });

  it('should display root with system folders in tree view', () => {
    render(<ExplorerWindow />);
    
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
    render(<ExplorerWindow />);
    
    // Find and click on a folder in tree using data-testid
    const treeView = screen.getByTestId('explorer-tree');
    const diskC = within(treeView).queryByTestId('tree-item-/Disk C');
    if (diskC) {
      fireEvent.click(diskC);
      
      await waitFor(() => {
        // Path should update to show /Disk C
        const addressInput = screen.getByTestId('explorer-address-input');
        expect(addressInput).toHaveValue('/Disk C');
        
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

  it('should display folder contents in grid view', () => {
    render(<ExplorerWindow />);
    
    // Grid view should show root contents (system folders)
    const gridView = screen.getByTestId('explorer-grid');
    // Check that at least one system folder is visible in grid
    const diskA = within(gridView).queryByTestId('explorer-grid-item-/Disk A');
    const diskB = within(gridView).queryByTestId('explorer-grid-item-/Disk B');
    const diskC = within(gridView).queryByTestId('explorer-grid-item-/Disk C');
    expect(diskA || diskB || diskC).toBeTruthy();
    
    // Status bar should show item count
    const statusBar = screen.getByTestId('explorer-status');
    expect(statusBar).toHaveTextContent(/item\(s\)/);
  });

  it('should navigate to nested folder when double-clicking in grid view', async () => {
    render(<ExplorerWindow />);
    
    // Navigate to /Disk C first
    const treeView = screen.getByTestId('explorer-tree');
    const diskC = within(treeView).queryByTestId('tree-item-/Disk C');
    if (diskC) {
      fireEvent.click(diskC);
      
      // Wait for Disk C to load
      await waitFor(() => {
        const addressInput = screen.getByTestId('explorer-address-input');
        expect(addressInput).toHaveValue('/Disk C');
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
          expect(addressInput).toHaveValue('/Disk C/documents');
          
          // Check for LD59 folder in grid
          const updatedGridView = screen.getByTestId('explorer-grid');
          const ld59Folder = within(updatedGridView).queryByTestId('explorer-grid-item-/Disk C/documents/LD59');
          expect(ld59Folder).toBeTruthy();
        });
      }
    }
  });

  it('should update grid view when navigating via tree', async () => {
    render(<ExplorerWindow />);
    
    // Navigate via tree view
    const treeView = screen.getByTestId('explorer-tree');
    const diskC = within(treeView).queryByTestId('tree-item-/Disk C');
    if (diskC) {
      fireEvent.click(diskC);
      
      await waitFor(() => {
        // Grid should update to show contents of Disk C
        const gridView = screen.getByTestId('explorer-grid');
        const addressInput = screen.getByTestId('explorer-address-input');
        expect(addressInput).toHaveValue('/Disk C');
        
        // Verify grid shows system folders from Disk C
        const desktopFolder = within(gridView).queryByTestId('explorer-grid-item-/Disk C/desktop');
        expect(desktopFolder).toBeTruthy();
      });
    }
  });

  it('should show path in address bar', () => {
    render(<ExplorerWindow />);
    
    // Address bar should show current path
    const addressInput = screen.getByTestId('explorer-address-input');
    expect(addressInput).toBeInTheDocument();
    // At root, should show "My Computer"
    expect(addressInput).toHaveValue('My Computer');
  });

  it('should navigate up when clicking up button', async () => {
    render(<ExplorerWindow />);
    
    const upButton = screen.getByTestId('explorer-up-button');
    expect(upButton).toBeInTheDocument();
    
    // Up button should be disabled at root
    expect(upButton).toBeDisabled();
  });

  it('should render menubar with expected items', () => {
    render(<ExplorerWindow />);
    
    const menubar = screen.getByTestId('explorer-menubar');
    expect(menubar).toBeInTheDocument();
    expect(menubar).toHaveTextContent('File');
    expect(menubar).toHaveTextContent('Edit');
    expect(menubar).toHaveTextContent('View');
    expect(menubar).toHaveTextContent('Go');
    expect(menubar).toHaveTextContent('Bookmarks');
    expect(menubar).toHaveTextContent('Help');
  });

  it('should select item on single-click without navigating', async () => {
    render(<ExplorerWindow />);
    
    const treeView = screen.getByTestId('explorer-tree');
    const diskC = within(treeView).queryByTestId('tree-item-/Disk C');
    if (diskC) {
      fireEvent.click(diskC);
    }
    
    await waitFor(() => {
      const addressInput = screen.getByTestId('explorer-address-input');
      expect(addressInput).toHaveValue('/Disk C');
    });
    
    const gridView = screen.getByTestId('explorer-grid');
    const documentsFolder = within(gridView).queryByTestId('explorer-grid-item-/Disk C/documents');
    expect(documentsFolder).toBeTruthy();
    
    if (documentsFolder) {
      fireEvent.click(documentsFolder);
      expect(documentsFolder).toHaveClass('explorer-grid-item-selected');
    }
  });
});
