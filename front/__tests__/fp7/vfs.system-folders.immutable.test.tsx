import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFileSystem, UserRole } from '@/os/fs/VirtualFileSystem';

describe('VFS System Folders Immutability', () => {
  let vfs: VirtualFileSystem;

  beforeEach(() => {
    vfs = new VirtualFileSystem();
    vfs.setUserRole('Organizer'); // Set to Organizer for write operations
  });

  it('should initialize root-level system folders', () => {
    const root = vfs.stat('/');
    expect(root).not.toBeNull();
    expect(root?.children).toBeDefined();
    
    const systemFolders = root?.children?.filter(c => c.isSystemFolder) || [];
    expect(systemFolders.length).toBeGreaterThanOrEqual(3);
    
    const folderNames = systemFolders.map(f => f.name);
    expect(folderNames).toContain('Disk A');
    expect(folderNames).toContain('Disk B');
    expect(folderNames).toContain('Disk C');
  });

  it('should prevent deleting root-level system folders', () => {
    expect(() => {
      vfs.delete('/Disk A');
    }).toThrow(/PermissionDenied.*system folders/);
    
    expect(() => {
      vfs.delete('/Disk B');
    }).toThrow(/PermissionDenied.*system folders/);
    
    expect(() => {
      vfs.delete('/Disk C');
    }).toThrow(/PermissionDenied.*system folders/);
  });

  it('should prevent renaming root-level system folders', () => {
    expect(() => {
      vfs.rename('/Disk A', 'NewName');
    }).toThrow(/PermissionDenied.*system folders/);
    
    expect(() => {
      vfs.rename('/Disk B', 'NewName');
    }).toThrow(/PermissionDenied.*system folders/);
    
    expect(() => {
      vfs.rename('/Disk C', 'NewName');
    }).toThrow(/PermissionDenied.*system folders/);
  });

  it('should prevent moving root-level system folders', () => {
    expect(() => {
      vfs.move('/Disk A', '/Disk B/Disk A');
    }).toThrow(/PermissionDenied.*system folders/);
    
    expect(() => {
      vfs.move('/Disk C', '/Disk A/Disk C');
    }).toThrow(/PermissionDenied.*system folders/);
  });

  it('should prevent Guest from modifying system folders', () => {
    vfs.setUserRole('Guest');
    
    expect(() => {
      vfs.delete('/Disk A');
    }).toThrow('PermissionDenied: Read-only access for Guest/Participant');
    
    expect(() => {
      vfs.rename('/Disk A', 'NewName');
    }).toThrow('PermissionDenied: Read-only access for Guest/Participant');
  });

  it('should prevent Participant from modifying system folders', () => {
    vfs.setUserRole('Participant');
    
    expect(() => {
      vfs.delete('/Disk A');
    }).toThrow('PermissionDenied: Read-only access for Guest/Participant');
    
    expect(() => {
      vfs.rename('/Disk A', 'NewName');
    }).toThrow('PermissionDenied: Read-only access for Guest/Participant');
  });
});
