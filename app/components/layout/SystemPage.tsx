import type { ReactNode } from "react";
import { Link } from "react-router";

import { BrandIdentity } from "../foundation/BrandIdentity";

type SystemPageProps = {
  actionLabel?: string;
  actionTo?: string;
  children?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function SystemPage({
  actionLabel,
  actionTo,
  children,
  description,
  eyebrow,
  title,
}: SystemPageProps) {
  return (
    <main className="system-page" id="main-content">
      <div className="system-page__card">
        <BrandIdentity showDescriptor variant="compact" />
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="system-page__description">{description}</p>
        {children}
        {actionLabel && actionTo ? (
          <Link className="system-page__action" to={actionTo}>
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </main>
  );
}
