import { Test, TestingModule } from "@nestjs/testing";
import { VfsService } from "../../src/vfs/vfs.service";
import { S3Service } from "../../src/vfs/s3.service";
import { ForbiddenException, BadRequestException } from "@nestjs/common";
import { UserRole } from "../../src/users/users.repository";

describe("VFS System Folders Immutability", () => {
  let vfsService: VfsService;
  let s3Service: S3Service;
  const organizerRole: UserRole = "Organizer";

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

  describe("Root-level system folders cannot be deleted", () => {
    it("should prevent deleting /Disk A", async () => {
      await expect(vfsService.delete("/Disk A", organizerRole)).rejects.toThrow(
        ForbiddenException
      );
      await expect(vfsService.delete("/Disk A", organizerRole)).rejects.toThrow(
        "Cannot delete root-level system folders"
      );
    });

    it("should prevent deleting /Disk B", async () => {
      await expect(vfsService.delete("/Disk B", organizerRole)).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should prevent deleting /Disk C", async () => {
      await expect(vfsService.delete("/Disk C", organizerRole)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe("Root-level system folders cannot be moved", () => {
    it("should prevent moving /Disk A", async () => {
      await expect(
        vfsService.move("/Disk A", "/Disk B/Disk A", organizerRole)
      ).rejects.toThrow(ForbiddenException);
      await expect(
        vfsService.move("/Disk A", "/Disk B/Disk A", organizerRole)
      ).rejects.toThrow("Cannot move root-level system folders");
    });

    it("should prevent moving /Disk B", async () => {
      await expect(
        vfsService.move("/Disk B", "/Disk C/Disk B", organizerRole)
      ).rejects.toThrow(ForbiddenException);
    });

    it("should prevent moving /Disk C", async () => {
      await expect(
        vfsService.move("/Disk C", "/Disk A/Disk C", organizerRole)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("Root-level system folders cannot be uploaded to", () => {
    it("should prevent uploading directly to /Disk A", async () => {
      const mockFile = {
        originalname: "test.txt",
        buffer: Buffer.from("test"),
        mimetype: "text/plain",
        size: 4,
      } as Express.Multer.File;

      await expect(vfsService.upload("/Disk A", mockFile, organizerRole)).rejects.toThrow(
        ForbiddenException
      );
      await expect(vfsService.upload("/Disk A", mockFile, organizerRole)).rejects.toThrow(
        "Cannot upload to root-level system folder"
      );
    });
  });

  describe("Organizer can work inside system folders", () => {
    it("should allow operations inside /Disk C/desktop", async () => {
      (s3Service.upload as jest.Mock).mockResolvedValue(undefined);
      (s3Service.move as jest.Mock).mockResolvedValue(undefined);
      (s3Service.delete as jest.Mock).mockResolvedValue(undefined);

      // Upload inside system folder
      const mockFile = {
        originalname: "test.txt",
        buffer: Buffer.from("test"),
        mimetype: "text/plain",
        size: 4,
      } as Express.Multer.File;
      await expect(
        vfsService.upload("/Disk C/desktop", mockFile, organizerRole)
      ).resolves.toBeDefined();

      // Move inside system folder
      await expect(
        vfsService.move(
          "/Disk C/desktop/file1.txt",
          "/Disk C/desktop/file2.txt",
          organizerRole
        )
      ).resolves.toBeUndefined();

      // Delete inside system folder
      await expect(
        vfsService.delete("/Disk C/desktop/file.txt", organizerRole)
      ).resolves.toBeUndefined();
    });

    it("should allow deep nested operations", async () => {
      (s3Service.upload as jest.Mock).mockResolvedValue(undefined);
      (s3Service.delete as jest.Mock).mockResolvedValue(undefined);

      const mockFile = {
        originalname: "test.txt",
        buffer: Buffer.from("test"),
        mimetype: "text/plain",
        size: 4,
      } as Express.Multer.File;

      // Upload to deep nested path
      await expect(
        vfsService.upload("/Disk C/images/LD58/subfolder", mockFile, organizerRole)
      ).resolves.toBeDefined();

      // Delete from deep nested path
      await expect(
        vfsService.delete("/Disk C/images/LD58/subfolder/test.txt", organizerRole)
      ).resolves.toBeUndefined();
    });
  });

  describe("Invalid paths outside system folders", () => {
    it("should reject operations outside system folders", async () => {
      const mockFile = {
        originalname: "test.txt",
        buffer: Buffer.from("test"),
        mimetype: "text/plain",
        size: 4,
      } as Express.Multer.File;

      // Upload outside system folder
      await expect(vfsService.upload("/random/path", mockFile, organizerRole)).rejects.toThrow(
        BadRequestException
      );
      await expect(vfsService.upload("/random/path", mockFile, organizerRole)).rejects.toThrow(
        "Files must be uploaded inside system folders"
      );

      // Move outside system folder
      await expect(
        vfsService.move("/random/file1.txt", "/random/file2.txt", organizerRole)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
