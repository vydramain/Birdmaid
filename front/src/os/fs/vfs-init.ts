import { vfs } from "./VirtualFileSystem";

export function initVFS() {
  console.log("[VFS] Seeding initial data...");
  
  // Set role to Organizer for initialization (system operation)
  const originalRole = vfs.getUserRole();
  vfs.setUserRole('Organizer');
  
  try {
    // 1. Desktop Icons (in /Disk C/desktop)
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

    vfs.writeFile('/Disk C/desktop/help.txt', `# Birdmaid Help

Welcome to Birdmaid OS.

## Navigation
- Double-click Desktop icons to open files and applications
- Use Explorer to browse the file system
- Click on folders in Explorer to navigate

## Opening Files
- Double-click any file to open it in the appropriate viewer
- Image files (.png, .jpg) open in ImageViewer
- Video files (.mp4, .webm) open in VideoViewer
- Text files (.txt, .md) open in Notepad
- HTML files (.html) open in Internet Explorer

## Explorer Usage
- Tree view (left): Navigate folder structure
- Grid view (right): View contents of selected folder
- Single-click to select, double-click to open

## Login
- Click the User Icon in the Taskbar (bottom right)
- Use the User Panel to view your account information
- Log out using the Log out button
`);

    vfs.writeFile('/Disk C/desktop/admin_help.txt', `# Birdmaid Admin Help

Welcome, Organizer!

## Content Management
- Upload files: Use Explorer to navigate to a folder, then use upload functionality
- Move files: Select a file and move it to another folder
- Delete files: Select a file and delete it
- Create folders: Create new folders within system folders

## Folder Creation Rules
- You can create folders anywhere inside system folders (Disk A, Disk B, Disk C)
- You can create nested folders of any depth
- Root-level system folders (Disk A, Disk B, Disk C) are immutable and cannot be deleted, renamed, or moved

## Immutable Root-Level Constraints
- Root-level system folders cannot be:
  - Deleted
  - Renamed
  - Moved
  - Modified in structure
- All content operations must happen within these system folders

## System Folders
- /Disk C/desktop - Desktop icons (visible to all users)
- /Disk C/images - Image files
- /Disk C/videos - Video files
- /Disk C/documents - Documents and games
`);

    // 2. Documents (in /Disk C/documents)
    vfs.writeFile('/Disk C/documents/todo.txt', '1. Build VFS\n2. Refactor Windows\n3. Profit');
    
    console.log("[VFS] Seed complete.");
  } finally {
    // Restore original role
    vfs.setUserRole(originalRole);
  }
}
