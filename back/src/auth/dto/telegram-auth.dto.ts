export class TelegramAuthDto {
  telegramId!: string;
  hash!: string;
  // Add other Telegram auth fields as needed
  firstName?: string;
  lastName?: string;
  username?: string;
}
