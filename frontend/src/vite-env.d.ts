/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // thêm biến khác nếu có
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}