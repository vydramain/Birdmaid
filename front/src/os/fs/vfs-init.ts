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
      icon: '💻',
      label: 'My Computer',
      target: 'explorer'
    }));
    
    vfs.writeFile('/Disk C/desktop/Explorer.url', JSON.stringify({
      type: 'link',
      icon: '📁',
      label: 'Explorer',
      target: 'explorer'
    }));

    vfs.writeFile('/Disk C/desktop/help.txt', `# Birdmaid Help
    
Welcome to Birdmaid OS.
This is a portfolio project demonstrating React performance optimization.
`);

    // 2. Documents (in /Disk C/documents)
    vfs.writeFile('/Disk C/documents/todo.txt', '1. Build VFS\n2. Refactor Windows\n3. Profit');
    
    console.log("[VFS] Seed complete.");
  } finally {
    // Restore original role
    vfs.setUserRole(originalRole);
  }
}
