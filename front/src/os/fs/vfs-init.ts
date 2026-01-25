import { vfs } from "./VirtualFileSystem";

export function initVFS() {
  console.log("[VFS] Seeding initial data...");
  
  // 1. Desktop
  vfs.writeFile('/desktop/games.url', JSON.stringify({
    type: 'link',
    icon: '🎮',
    label: 'Игры',
    target: 'explorer' // Temporary until games app
  }));
  
  vfs.writeFile('/desktop/explorer.url', JSON.stringify({
    type: 'link',
    icon: '📁',
    label: 'Explorer',
    target: 'explorer'
  }));

  vfs.writeFile('/desktop/help.txt', `# Birdmaid Help
  
Welcome to Birdmaid OS.
This is a portfolio project demonstrating React performance optimization.
`);

  // 2. Documents
  vfs.writeFile('/documents/todo.txt', '1. Build VFS\n2. Refactor Windows\n3. Profit');
  
  console.log("[VFS] Seed complete.");
}
