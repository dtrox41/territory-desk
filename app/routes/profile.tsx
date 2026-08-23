import { PlaceholderPage } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";

export function meta() {
  return pageMeta("My Profile", "Fictional Territory Desk profile route.");
}

export default function Profile() {
  return (
    <PlaceholderPage
      description="Review the current fictional identity, access, and approved notification preferences."
      title="My Profile"
    />
  );
}
