import { describe, it, expect, beforeEach } from 'vitest';
import { VirtualFileSystem } from '@/os/fs/VirtualFileSystem';

describe('VFS Organizer Nested Operations', () => {
  let vfs: VirtualFileSystem;

  beforeEach(() => {
    vfs = new VirtualFileSystem();
    vfs.setUserRole('Organizer');
  });

  it('should allow creating deep nested folders inside system folders', () => {
    // Create deep structure: /Disk C/documents/LD58/level1/level2/level3
    vfs.mkdir('/Disk C/documents/LD58');
    vfs.mkdir('/Disk C/documents/LD58/level1');
    vfs.mkdir('/Disk C/documents/LD58/level1/level2');
    vfs.mkdir('/Disk C/documents/LD58/level1/level2/level3');
    
    const deepFolder = vfs.stat('/Disk C/documents/LD58/level1/level2/level3');
    expect(deepFolder).not.toBeNull();
    expect(deepFolder?.type).toBe('dir');
  });

  it('should allow uploading files to deep nested folders', () => {
    vfs.mkdir('/Disk C/images/LD58');
    vfs.mkdir('/Disk C/images/LD58/subfolder');
    vfs.mkdir('/Disk C/images/LD58/subfolder/deep');
    
    vfs.writeFile('/Disk C/images/LD58/subfolder/deep/image.png', 'fake image data');
    
    const file = vfs.readFile('/Disk C/images/LD58/subfolder/deep/image.png');
    expect(file).toBe('fake image data');
  });

  it('should allow moving files within nested structure', () => {
    // Create structure
    vfs.mkdir('/Disk C/documents/LD59');
    vfs.mkdir('/Disk C/documents/LD59/folder1');
    vfs.mkdir('/Disk C/documents/LD59/folder2');
    vfs.writeFile('/Disk C/documents/LD59/folder1/file.txt', 'content');
    
    // Move file
    vfs.move('/Disk C/documents/LD59/folder1/file.txt', '/Disk C/documents/LD59/folder2/file.txt');
    
    const movedFile = vfs.readFile('/Disk C/documents/LD59/folder2/file.txt');
    expect(movedFile).toBe('content');
    
    // Original should be gone
    expect(() => {
      vfs.readFile('/Disk C/documents/LD59/folder1/file.txt');
    }).toThrow();
  });

  it('should allow renaming files in nested structure', () => {
    vfs.mkdir('/Disk C/videos/LD62');
    vfs.writeFile('/Disk C/videos/LD62/video1.mp4', 'video data');
    
    vfs.rename('/Disk C/videos/LD62/video1.mp4', 'video2.mp4');
    
    const renamedFile = vfs.readFile('/Disk C/videos/LD62/video2.mp4');
    expect(renamedFile).toBe('video data');
    
    // Original should be gone
    expect(() => {
      vfs.readFile('/Disk C/videos/LD62/video1.mp4');
    }).toThrow();
  });

  it('should allow deleting files from nested structure', () => {
    vfs.mkdir('/Disk C/documents/LD59');
    vfs.mkdir('/Disk C/documents/LD59/command1');
    vfs.writeFile('/Disk C/documents/LD59/command1/game', 'game data');
    
    vfs.delete('/Disk C/documents/LD59/command1/game');
    
    const folder = vfs.readDir('/Disk C/documents/LD59/command1');
    expect(folder.length).toBe(0);
  });

  it('should allow deleting nested folders', () => {
    vfs.mkdir('/Disk C/documents/LD59');
    vfs.mkdir('/Disk C/documents/LD59/command1');
    vfs.mkdir('/Disk C/documents/LD59/command1/subfolder');
    vfs.writeFile('/Disk C/documents/LD59/command1/subfolder/file.txt', 'content');
    
    vfs.delete('/Disk C/documents/LD59/command1/subfolder');
    
    const folder = vfs.readDir('/Disk C/documents/LD59/command1');
    expect(folder.length).toBe(0);
  });

  it('should allow moving nested folders', () => {
    vfs.mkdir('/Disk C/documents/LD59');
    vfs.mkdir('/Disk C/documents/LD59/folder1');
    vfs.mkdir('/Disk C/documents/LD59/folder1/subfolder');
    vfs.writeFile('/Disk C/documents/LD59/folder1/subfolder/file.txt', 'content');
    
    vfs.mkdir('/Disk C/documents/LD59/folder2');
    vfs.move('/Disk C/documents/LD59/folder1/subfolder', '/Disk C/documents/LD59/folder2/subfolder');
    
    const movedFolder = vfs.readDir('/Disk C/documents/LD59/folder2/subfolder');
    expect(movedFolder.length).toBe(1);
    expect(movedFolder[0].name).toBe('file.txt');
    
    // Original should be gone
    const originalFolder = vfs.readDir('/Disk C/documents/LD59/folder1');
    expect(originalFolder.length).toBe(0);
  });
});
