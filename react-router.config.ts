import type { Config } from "@react-router/dev/config";

const publicBasePath = process.env.VITE_PUBLIC_BASE_PATH?.trim() || "/";
const basename =
  publicBasePath === "/"
    ? "/"
    : `/${publicBasePath.replace(/^\/+|\/+$/g, "")}/`;

export default {
  basename,
  routeDiscovery: { mode: "initial" },
  ssr: false,
} satisfies Config;
