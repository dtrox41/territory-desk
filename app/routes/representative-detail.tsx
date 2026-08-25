import { useLoaderData } from "react-router";

import { pageMeta } from "../components/layout/page-meta";
import { RepresentativeDetail as RepresentativeDetailScreen } from "../features/directory/RepresentativeDetail";
import { fictionalRepresentativeDirectoryService } from "../services/fictional/representative-directory";
import type { Route } from "./+types/representative-detail";

export function meta() {
  return pageMeta(
    "Representative Detail",
    "Review an authorized fictional representative profile without exposing contacts in page metadata.",
  );
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return fictionalRepresentativeDirectoryService.getRepresentative(
    params.representativeId,
  );
}

clientLoader.hydrate = true as const;

export default function RepresentativeDetail() {
  const representative = useLoaderData<typeof clientLoader>();

  return <RepresentativeDetailScreen representative={representative} />;
}
