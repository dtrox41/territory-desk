import { reactRouter } from "@react-router/dev/vite";
import { defineConfig, loadEnv } from "vite";

const normalizeBasePath = (value: string | undefined) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue || trimmedValue === "/") {
    return "/";
  }

  return `/${trimmedValue.replace(/^\/+|\/+$/g, "")}/`;
};

export default defineConfig(({ mode }) => {
  const publicEnvironment = loadEnv(mode, process.cwd(), "VITE_PUBLIC_");

  return {
    base: normalizeBasePath(publicEnvironment.VITE_PUBLIC_BASE_PATH),
    plugins: [reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
