interface ImportMetaEnv {
  readonly VITE_PUBLIC_BUILD_ID?: string;
  readonly VITE_PUBLIC_RELEASED_AT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
