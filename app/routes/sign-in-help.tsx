import { pageMeta } from "../components/layout/page-meta";
import { SignInHelp } from "../features/authentication/SignInHelp";

export function meta() {
  return pageMeta(
    "Sign-in help",
    "Privacy-minimized fictional Territory Desk sign-in recovery.",
  );
}

export default function SignInHelpRoute() {
  return <SignInHelp />;
}
