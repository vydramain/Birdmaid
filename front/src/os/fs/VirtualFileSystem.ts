type VFSNodeType = 'file' | 'dir';

export interface VFSNode {
  name: string;
  type: VFSNodeType;
  content?: string | Blob;
  children?: VFSNode[];
  parent?: VFSNode;
}

export interface VFSChangeEvent {
  type: 'add' | 'remove' | 'update';
  path: string;
}

type Listener = (e: VFSChangeEvent) => void;

export class VirtualFileSystem {
  root: VFSNode;
  private listeners: Set<{ path: string; cb: Listener }> = new Set();

  constructor() {
    this.root = {
      name: '',
      type: 'dir',
      children: [],
    };
    
    // Initialize default structure
    this.mkdir('/desktop');
    this.mkdir('/documents');
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

  // --- Write Operations (Admin/System only for now) ---

  mkdir(path: string) {
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
    const parts = path.split('/').filter(p => p);
    const fileName = parts.pop();
    if (!fileName) throw new Error('Invalid path');
    
    const dirPath = '/' + parts.join('/');
    // Ensure dir exists
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
    const node = this.resolve(path);
    if (!node || !node.parent) return; // Cannot delete root or non-existent
    
    if (node.parent.children) {
      node.parent.children = node.parent.children.filter(c => c !== node);
      this.emit('remove', path);
    }
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
