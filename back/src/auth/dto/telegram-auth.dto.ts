export class TelegramAuthDto {
  telegramId!: string;
  hash!: string;
  auth_date?: number; // Unix timestamp
  firstName?: string;
  lastName?: string;
  username?: string;
}
