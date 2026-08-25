import { pageMeta } from "../components/layout/page-meta";
import { Profile as ProfileScreen } from "../features/profile/Profile";
import { fictionalProfileService } from "../services/fictional/profile";

export function meta() {
  return pageMeta("My Profile", "Fictional Territory Desk profile route.");
}

export default function Profile() {
  return <ProfileScreen service={fictionalProfileService} />;
}
