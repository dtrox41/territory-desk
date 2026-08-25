import { pageMeta } from "../components/layout/page-meta";
import { SignIn } from "../features/authentication/SignIn";
import { fictionalAuthenticationService } from "../services/fictional/authentication";

export function meta() {
  return pageMeta(
    "Sign in",
    "Enter the public fictional Territory Desk prototype without credentials.",
  );
}

export default function SignInRoute() {
  return <SignIn service={fictionalAuthenticationService} />;
}
