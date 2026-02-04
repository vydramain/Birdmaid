/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** When 'true', Login window "Telegram..." button calls devAuth instead of opening Telegram OAuth. Requires backend AUTH_MODE=dev. */
  readonly VITE_DEV_AUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

