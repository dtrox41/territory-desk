import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="#0B4B91" name="theme-color" />
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
    <main className="system-page" id="main-content">
      <p className="eyebrow">Fictional prototype</p>
      <h1>Territory Desk</h1>
      <p role="status">Loading the application foundation…</p>
    </main>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="system-page" id="main-content">
      <p className="eyebrow">Territory Desk</p>
      <h1>{notFound ? "Page not found" : "Territory Desk is unavailable"}</h1>
      <p>
        {notFound
          ? "This fictional prototype page does not exist."
          : "The application could not load this page. No business action was completed."}
      </p>
      <Link to="/">Return to the prototype home</Link>
    </main>
  );
}
