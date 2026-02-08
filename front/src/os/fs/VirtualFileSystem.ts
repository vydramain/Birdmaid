type VFSNodeType = 'file' | 'dir';

export type UserRole = 'Guest' | 'Participant' | 'Organizer';

export interface VFSNode {
  name: string;
  type: VFSNodeType;
  content?: string | Blob;
  children?: VFSNode[];
  parent?: VFSNode;
  isSystemFolder?: boolean; // Mark system folders
}

export interface VFSChangeEvent {
  type: 'add' | 'remove' | 'update';
  path: string;
}

type Listener = (e: VFSChangeEvent) => void;

// Root-level system folders (immutable)
const ROOT_LEVEL_SYSTEM_FOLDERS = ['Disk A', 'Disk B', 'Disk C'];

// System subfolders inside Disk C (first-level, immutable)
const DISK_C_SYSTEM_FOLDERS = ['desktop', 'documents', 'images', 'videos', 'games'];

export class VirtualFileSystem {
  root: VFSNode;
  private listeners: Set<{ path: string; cb: Listener }> = new Set();
  private currentUserRole: UserRole = 'Guest'; // Default to Guest

  constructor() {
    this.root = {
      name: '',
      type: 'dir',
      children: [],
    };
    
    // Initialize root-level system folders (immutable)
    this.initializeSystemFolders();
  }

  /**
   * Initialize immutable root-level system folders
   */
  private initializeSystemFolders() {
    // Create root-level system folders
    for (const folderName of ROOT_LEVEL_SYSTEM_FOLDERS) {
      const systemNode: VFSNode = {
        name: folderName,
        type: 'dir',
        children: [],
        parent: this.root,
        isSystemFolder: true,
      };
      if (!this.root.children) this.root.children = [];
      this.root.children.push(systemNode);
    }

    // Create system subfolders inside Disk C
    const diskC = this.root.children?.find(c => c.name === 'Disk C');
    if (diskC && diskC.type === 'dir') {
      for (const subFolderName of DISK_C_SYSTEM_FOLDERS) {
        const subSystemNode: VFSNode = {
          name: subFolderName,
          type: 'dir',
          children: [],
          parent: diskC,
          isSystemFolder: true,
        };
        if (!diskC.children) diskC.children = [];
        diskC.children.push(subSystemNode);
      }
    }
  }

  /**
   * Set current user role for permission checks
   */
  setUserRole(role: UserRole) {
    this.currentUserRole = role;
  }

  /**
   * Get current user role
   */
  getUserRole(): UserRole {
    return this.currentUserRole;
  }

  /**
   * Check if path is a root-level system folder
   */
  private isRootLevelSystemFolder(path: string): boolean {
    const parts = path.split('/').filter(p => p);
    if (parts.length !== 1) return false;
    return ROOT_LEVEL_SYSTEM_FOLDERS.includes(parts[0]);
  }

  /**
   * Check if path is inside a system folder (but not the system folder itself)
   */
  private isInsideSystemFolder(path: string): boolean {
    const parts = path.split('/').filter(p => p);
    if (parts.length === 0) return false;
    // Check if first part is a root-level system folder
    return ROOT_LEVEL_SYSTEM_FOLDERS.includes(parts[0]);
  }

  /**
   * Check if operation is allowed based on role and path
   */
  private checkPermission(operation: 'read' | 'write' | 'delete' | 'rename' | 'move', path: string): void {
    // Read operations are always allowed
    if (operation === 'read') return;

    // Guest and Participant are read-only
    if (this.currentUserRole === 'Guest' || this.currentUserRole === 'Participant') {
      throw new Error('PermissionDenied: Read-only access for Guest/Participant');
    }

    // For write operations, check if we're trying to modify a system folder itself (not allowed)
    // Note: Operations inside system folders are allowed, only the system folders themselves are protected
    if (operation === 'write' || operation === 'delete' || operation === 'rename' || operation === 'move') {
      const node = this.resolve(path);
      // If node exists and is a system folder, deny
      if (node?.isSystemFolder) {
        throw new Error('PermissionDenied: Cannot modify system folders');
      }
      // For write operations on files that don't exist yet, check parent directory
      // We don't want to prevent writing files inside system folders, only modifying the folders themselves
      if (operation === 'write' && !node) {
        // Extract parent directory path
        const parts = path.split('/').filter(p => p);
        if (parts.length > 0) {
          parts.pop(); // Remove filename
          const parentPath = '/' + parts.join('/');
          const parentNode = this.resolve(parentPath);
          // If parent is a system folder, that's OK - we're writing inside it, not modifying it
          // Only deny if we're trying to write to a system folder path directly (which would be a directory)
        }
      }
    }
  }

  // --- Read Operations ---

  resolve(path: string): VFSNode | null {
    if (path === '/') return this.root;
    
    const parts = path.split('/').filter(p => p);
    let current = this.root;
    
    for (const part of parts) {
      if (!current.children) return null;
      const found = current.children.find(c => c.name === part);
      if (!found) return null;
      current = found;
    }
    
    return current;
  }

  readDir(path: string): VFSNode[] {
    const node = this.resolve(path);
    if (!node || node.type !== 'dir') throw new Error(`Path not found or not a directory: ${path}`);
    return node.children || [];
  }

  readFile(path: string): string | Blob | undefined {
    const node = this.resolve(path);
    if (!node || node.type !== 'file') throw new Error(`Path not found or not a file: ${path}`);
    return node.content;
  }

  stat(path: string): VFSNode | null {
    return this.resolve(path);
  }

  // --- Write Operations ---

  mkdir(path: string) {
    // Check if directory already exists
    const existing = this.resolve(path);
    if (existing && existing.type === 'dir') {
      // Directory already exists, no need to create or check permissions
      return;
    }
    
    this.checkPermission('write', path);
    
    const parts = path.split('/').filter(p => p);
    let current = this.root;
    
    for (const part of parts) {
      if (!current.children) current.children = [];
      let found = current.children.find(c => c.name === part);
      
      if (!found) {
        found = { name: part, type: 'dir', children: [], parent: current };
        current.children.push(found);
        this.emit('add', this.getPath(found));
      }
      
      current = found;
    }
  }

  writeFile(path: string, content: string | Blob) {
    this.checkPermission('write', path);
    
    const parts = path.split('/').filter(p => p);
    const fileName = parts.pop();
    if (!fileName) throw new Error('Invalid path');
    
    const dirPath = '/' + parts.join('/');
    // Ensure dir exists (this will also check permissions)
    this.mkdir(dirPath);
    
    const dirNode = this.resolve(dirPath);
    if (!dirNode || dirNode.type !== 'dir') throw new Error('Failed to resolve directory');
    
    if (!dirNode.children) dirNode.children = [];
    
    const existing = dirNode.children.find(c => c.name === fileName);
    if (existing) {
      existing.content = content;
      existing.type = 'file'; // Ensure type is file
      this.emit('update', path);
    } else {
      const newNode: VFSNode = { name: fileName, type: 'file', content, parent: dirNode };
      dirNode.children.push(newNode);
      this.emit('add', path);
    }
  }

  delete(path: string) {
    this.checkPermission('delete', path);
    
    const node = this.resolve(path);
    if (!node || !node.parent) {
      throw new Error('Cannot delete root or non-existent node');
    }
    
    // Check if trying to delete a system folder
    if (node.isSystemFolder) {
      throw new Error('PermissionDenied: Cannot delete system folders');
    }
    
    if (node.parent.children) {
      node.parent.children = node.parent.children.filter(c => c !== node);
      this.emit('remove', path);
    }
  }

  rename(oldPath: string, newName: string) {
    this.checkPermission('rename', oldPath);
    
    const node = this.resolve(oldPath);
    if (!node || !node.parent) {
      throw new Error('Cannot rename root or non-existent node');
    }
    
    // Check if trying to rename a system folder
    if (node.isSystemFolder) {
      throw new Error('PermissionDenied: Cannot rename system folders');
    }
    
    // Check if new name already exists
    if (node.parent.children?.some(c => c.name === newName && c !== node)) {
      throw new Error('File or folder with this name already exists');
    }
    
    node.name = newName;
    const newPath = this.getPath(node);
    this.emit('update', newPath);
  }

  move(oldPath: string, newPath: string) {
    this.checkPermission('move', oldPath);
    this.checkPermission('write', newPath);
    
    const node = this.resolve(oldPath);
    if (!node || !node.parent) {
      throw new Error('Cannot move root or non-existent node');
    }
    
    // Check if trying to move a system folder
    if (node.isSystemFolder) {
      throw new Error('PermissionDenied: Cannot move system folders');
    }
    
    // Parse new path
    const newParts = newPath.split('/').filter(p => p);
    const newFileName = newParts.pop();
    if (!newFileName) throw new Error('Invalid new path');
    
    const newDirPath = '/' + newParts.join('/');
    const newDirNode = this.resolve(newDirPath);
    if (!newDirNode || newDirNode.type !== 'dir') {
      throw new Error('Destination directory not found');
    }
    
    // Check if target already exists
    if (newDirNode.children?.some(c => c.name === newFileName)) {
      throw new Error('File or folder with this name already exists in destination');
    }
    
    // Remove from old location
    if (node.parent.children) {
      node.parent.children = node.parent.children.filter(c => c !== node);
    }
    
    // Add to new location
    if (!newDirNode.children) newDirNode.children = [];
    node.parent = newDirNode;
    node.name = newFileName;
    newDirNode.children.push(node);
    
    const finalPath = this.getPath(node);
    this.emit('update', finalPath);
  }

  // --- Events ---

  subscribe(path: string, cb: Listener): () => void {
    const listener = { path, cb };
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(type: 'add' | 'remove' | 'update', path: string) {
    this.listeners.forEach(l => {
      // Simple prefix matching for now
      // If listener is watching /desktop, it should get events for /desktop/file.txt
      if (path.startsWith(l.path)) {
        l.cb({ type, path });
      }
    });
  }

  private getPath(node: VFSNode): string {
    const parts = [];
    let current: VFSNode | undefined = node;
    while (current && current !== this.root) {
      parts.unshift(current.name);
      current = current.parent;
    }
    return '/' + parts.join('/');
  }
}

export const vfs = new VirtualFileSystem();
