import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: smtpPort === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }
  }

  async sendRecoveryCode(email: string, code: string): Promise<void> {
    if (!this.transporter) {
      // In test/dev mode without SMTP, just log
      console.log(`[EmailService] Recovery code for ${email}: ${code}`);
      return;
    }

    const from = process.env.SMTP_FROM || "noreply@birdmaid.local";
    await this.transporter.sendMail({
      from,
      to: email,
      subject: "Password Recovery Code",
      text: `Your password recovery code is: ${code}`,
      html: `<p>Your password recovery code is: <strong>${code}</strong></p>`,
    });
  }
}

