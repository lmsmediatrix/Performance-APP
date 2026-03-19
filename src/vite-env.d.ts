/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_ENV: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_LMS_BASE_URL: string;
  readonly VITE_LMS_APP_URL: string;
  readonly VITE_PROD_API_URL: string;
  readonly VITE_DEV_API_URL: string;
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
