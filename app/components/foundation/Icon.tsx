import type { ReactNode } from "react";

export type IconName =
  | "bell"
  | "briefcase"
  | "chart"
  | "close"
  | "database"
  | "directory"
  | "help"
  | "home"
  | "leads"
  | "menu"
  | "profile"
  | "send"
  | "territory";

type IconProps = {
  name: IconName;
  size?: "small" | "medium" | "large";
};

const paths: Record<IconName, ReactNode> = {
  bell: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 5 2 5.5 2 5.5h-15s2-.5 2-5.5Z" />
      <path d="M9.5 18.5a2.8 2.8 0 0 0 5 0" />
    </>
  ),
  briefcase: (
    <>
      <rect height="12" rx="2" width="18" x="3" y="7" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3 11.5h18M10 11.5v2h4v-2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
      <path d="m3.5 6 5-3 6 4 5-4" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  database: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </>
  ),
  directory: (
    <>
      <path d="M4 4h13a2 2 0 0 1 2 2v14H4zM7 2v4M16 2v4" />
      <circle cx="11.5" cy="10.5" r="2.2" />
      <path d="M7.5 17c.6-2 2-3 4-3s3.4 1 4 3" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.7 9a2.5 2.5 0 1 1 3.2 2.4c-.9.4-1.4 1-1.4 2.1M12 17h.01" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6" />
    </>
  ),
  leads: (
    <>
      <path d="M7 3h10v4H7zM5 5H3v16h18V5h-2" />
      <path d="M7 11h10M7 15h7" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  send: (
    <>
      <path d="m3 11 18-8-7 18-3-7z" />
      <path d="M11 14 21 3" />
    </>
  ),
  territory: (
    <>
      <path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6-3z" />
      <path d="M9 7v13M15 4v13" />
    </>
  ),
};

export function Icon({ name, size = "medium" }: IconProps) {
  const pixelSize = size === "small" ? 16 : size === "large" ? 24 : 20;

  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={pixelSize}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={pixelSize}
    >
      {paths[name]}
    </svg>
  );
}
