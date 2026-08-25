import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { SystemPage } from "./components/layout/SystemPage";
import { FictionalSessionProvider } from "./features/authentication/FictionalSessionProvider";
import { SystemStatePage } from "./features/authentication/SystemStatePage";
import type { Route } from "./+types/root";
import "./app.css";

const publicBasePath = import.meta.env.BASE_URL;
const publicBuildId = import.meta.env.VITE_PUBLIC_BUILD_ID?.trim();
const publicReleasedAt = import.meta.env.VITE_PUBLIC_RELEASED_AT?.trim();

export const links: Route.LinksFunction = () => [
  {
    href: `${publicBasePath}manifest.webmanifest`,
    rel: "manifest",
  },
  {
    href: `${publicBasePath}icons/territory-desk-180.png`,
    rel: "apple-touch-icon",
    sizes: "180x180",
  },
  {
    href: `${publicBasePath}icons/territory-desk-icon.svg`,
    rel: "icon",
    type: "image/svg+xml",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="#0B4B91" name="theme-color" />
        <meta content="Territory Desk" name="application-name" />
        {publicBuildId ? (
          <meta content={publicBuildId} name="territory-desk-build-id" />
        ) : null}
        {publicReleasedAt ? (
          <meta content={publicReleasedAt} name="territory-desk-released-at" />
        ) : null}
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta
          content="black-translucent"
          name="apple-mobile-web-app-status-bar-style"
        />
        <meta content="Territory Desk" name="apple-mobile-web-app-title" />
        <meta content="telephone=no" name="format-detection" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <SystemPage
      description="Preparing the fictional cross-division collaboration workspace."
      eyebrow="Fictional prototype"
      title="Loading Territory Desk"
    >
      <p className="system-page__status" role="status">
        Loading application shell…
      </p>
    </SystemPage>
  );
}

export default function App() {
  return (
    <FictionalSessionProvider>
      <Outlet />
    </FictionalSessionProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <SystemStatePage state={notFound ? "not-found" : "unexpected-error"} />
  );
}
