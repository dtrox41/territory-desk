import { pageMeta } from "../components/layout/page-meta";
import { AuthenticationReturn } from "../features/authentication/AuthenticationReturn";
import { fictionalAuthenticationService } from "../services/fictional/authentication";

export function meta() {
  return pageMeta(
    "Completing sign-in",
    "Completing fictional Territory Desk demo access.",
  );
}

export default function AuthenticationReturnRoute() {
  return <AuthenticationReturn service={fictionalAuthenticationService} />;
}
