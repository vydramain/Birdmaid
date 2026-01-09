import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersRepository } from "../users/users.repository";
import { EmailService } from "./email.service";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersRepo: UsersRepository,
    private emailService: EmailService
  ) {}

  async hashPassword(password: string): Promise<string> {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);
    return bcrypt.hash(password, rounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateToken(user: { id: string; email: string; login: string; isSuperAdmin: boolean }): Promise<string> {
    const payload = {
      userId: user.id,
      email: user.email,
      login: user.login,
      isSuperAdmin: user.isSuperAdmin,
    };
    return this.jwtService.signAsync(payload);
  }

  async register(email: string, login: string, password: string) {
    if (password.length < 6) {
      throw new BadRequestException("Password must be at least 6 characters");
    }

    const existingEmail = await this.usersRepo.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException("Email already exists");
    }

    const existingLogin = await this.usersRepo.findByLogin(login);
    if (existingLogin) {
      throw new ConflictException("Login already exists");
    }

    const hashedPassword = await this.hashPassword(password);
    const user = await this.usersRepo.create({
      email,
      login,
      password: hashedPassword,
      isSuperAdmin: false,
    });

    const token = await this.generateToken({
      id: user._id,
      email: user.email,
      login: user.login,
      isSuperAdmin: user.isSuperAdmin,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        login: user.login,
      },
      token,
    };
  }

  async login(identifier: string, password: string) {
    const user = await this.usersRepo.findByEmailOrLogin(identifier);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await this.verifyPassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = await this.generateToken({
      id: user._id,
      email: user.email,
      login: user.login,
      isSuperAdmin: user.isSuperAdmin,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        login: user.login,
        isSuperAdmin: user.isSuperAdmin,
      },
      token,
    };
  }

  async requestRecovery(email: string) {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.usersRepo.updateRecoveryCode(email, code);

    await this.emailService.sendRecoveryCode(email, code);

    return { message: "Recovery code sent" };
  }

  async getRecoveryCode(email: string): Promise<string | null> {
    return this.usersRepo.getRecoveryCode(email);
  }

  async verifyRecovery(email: string, code: string, newPassword: string) {
    if (newPassword.length < 6) {
      throw new BadRequestException("Password must be at least 6 characters");
    }

    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const storedCode = await this.usersRepo.getRecoveryCode(email);
    if (!storedCode || storedCode !== code) {
      throw new UnauthorizedException("Invalid recovery code");
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await this.usersRepo.updatePassword(email, hashedPassword);

    const token = await this.generateToken({
      id: user._id,
      email: user.email,
      login: user.login,
      isSuperAdmin: user.isSuperAdmin,
    });

    return {
      message: "Password reset",
      token,
    };
  }
}

