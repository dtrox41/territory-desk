import { useLocation } from "react-router";

import { pageMeta } from "../components/layout/page-meta";
import { RepresentativeDirectory } from "../features/directory/RepresentativeDirectory";
import { fictionalRepresentativeDirectoryService } from "../services/fictional/representative-directory";

export function meta() {
  return pageMeta(
    "Representative Directory",
    "Find fictional cross-department representatives without using customer information or bypassing territory validation.",
  );
}

export default function Directory() {
  const location = useLocation();

  return (
    <RepresentativeDirectory
      directoryService={fictionalRepresentativeDirectoryService}
      key={location.search}
    />
  );
}
