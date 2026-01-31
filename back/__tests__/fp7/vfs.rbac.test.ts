import { Test, TestingModule } from "@nestjs/testing";
import { VfsService } from "../../src/vfs/vfs.service";
import { S3Service } from "../../src/vfs/s3.service";
import { ForbiddenException } from "@nestjs/common";
import { UserRole } from "../../src/users/users.repository";

describe("VFS RBAC", () => {
  let vfsService: VfsService;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VfsService,
        {
          provide: S3Service,
          useValue: {
            list: jest.fn(),
            read: jest.fn(),
            upload: jest.fn(),
            move: jest.fn(),
            delete: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    vfsService = module.get<VfsService>(VfsService);
    s3Service = module.get<S3Service>(S3Service);
  });

  describe("Guest (read-only)", () => {
    const guestRole: UserRole = "Guest";

    it("should allow list operation", async () => {
      (s3Service.list as jest.Mock).mockResolvedValue([]);

      await expect(vfsService.list("/", guestRole)).resolves.toBeDefined();
      expect(s3Service.list).toHaveBeenCalled();
    });

    it("should allow read operation", async () => {
      (s3Service.read as jest.Mock).mockResolvedValue({
        body: Buffer.from("test"),
        contentType: "text/plain",
      });

      await expect(vfsService.read("/Disk C/desktop/file.txt", guestRole)).resolves.toBeDefined();
      expect(s3Service.read).toHaveBeenCalled();
    });

    it("should deny upload operation", async () => {
      const mockFile = {
        originalname: "test.txt",
        buffer: Buffer.from("test"),
        mimetype: "text/plain",
        size: 4,
      } as Express.Multer.File;

      await expect(
        vfsService.upload("/Disk C/desktop", mockFile, guestRole)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        vfsService.upload("/Disk C/desktop", mockFile, guestRole)
      ).rejects.toThrow("upload requires Organizer role");
    });

    it("should deny move operation", async () => {
      await expect(
        vfsService.move("/Disk C/desktop/file1.txt", "/Disk C/desktop/file2.txt", guestRole)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        vfsService.move("/Disk C/desktop/file1.txt", "/Disk C/desktop/file2.txt", guestRole)
      ).rejects.toThrow("move requires Organizer role");
    });

    it("should deny delete operation", async () => {
      await expect(vfsService.delete("/Disk C/desktop/file.txt", guestRole)).rejects.toThrow(
        ForbiddenException
      );
      await expect(vfsService.delete("/Disk C/desktop/file.txt", guestRole)).rejects.toThrow(
        "delete requires Organizer role"
      );
    });
  });

  describe("Participant (read-only)", () => {
    const participantRole: UserRole = "Participant";

    it("should allow list operation", async () => {
      (s3Service.list as jest.Mock).mockResolvedValue([]);

      await expect(vfsService.list("/", participantRole)).resolves.toBeDefined();
    });

    it("should allow read operation", async () => {
      (s3Service.read as jest.Mock).mockResolvedValue({
        body: Buffer.from("test"),
        contentType: "text/plain",
      });

      await expect(vfsService.read("/Disk C/desktop/file.txt", participantRole)).resolves.toBeDefined();
    });

    it("should deny write operations", async () => {
      const mockFile = {
        originalname: "test.txt",
        buffer: Buffer.from("test"),
        mimetype: "text/plain",
        size: 4,
      } as Express.Multer.File;

      await expect(
        vfsService.upload("/Disk C/desktop", mockFile, participantRole)
      ).rejects.toThrow("upload requires Organizer role");

      await expect(
        vfsService.move("/Disk C/desktop/file1.txt", "/Disk C/desktop/file2.txt", participantRole)
      ).rejects.toThrow("move requires Organizer role");

      await expect(vfsService.delete("/Disk C/desktop/file.txt", participantRole)).rejects.toThrow(
        "delete requires Organizer role"
      );
    });
  });

  describe("Organizer (full control)", () => {
    const organizerRole: UserRole = "Organizer";

    it("should allow all operations in subtree", async () => {
      (s3Service.list as jest.Mock).mockResolvedValue([]);
      (s3Service.upload as jest.Mock).mockResolvedValue(undefined);
      (s3Service.move as jest.Mock).mockResolvedValue(undefined);
      (s3Service.delete as jest.Mock).mockResolvedValue(undefined);

      // List
      await expect(vfsService.list("/Disk C/desktop", organizerRole)).resolves.toBeDefined();

      // Read
      (s3Service.read as jest.Mock).mockResolvedValue({
        body: Buffer.from("test"),
        contentType: "text/plain",
      });
      await expect(vfsService.read("/Disk C/desktop/file.txt", organizerRole)).resolves.toBeDefined();

      // Upload
      const mockFile = {
        originalname: "test.txt",
        buffer: Buffer.from("test"),
        mimetype: "text/plain",
        size: 4,
      } as Express.Multer.File;
      await expect(
        vfsService.upload("/Disk C/desktop", mockFile, organizerRole)
      ).resolves.toBeDefined();

      // Move
      await expect(
        vfsService.move("/Disk C/desktop/file1.txt", "/Disk C/desktop/file2.txt", organizerRole)
      ).resolves.toBeUndefined();

      // Delete
      await expect(vfsService.delete("/Disk C/desktop/file.txt", organizerRole)).resolves.toBeUndefined();
    });
  });
});
