import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const projectRoot = resolve(process.argv[2] ?? ".");
const readText = (relativePath) =>
  readFileSync(join(projectRoot, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(readText(relativePath));
const hash = (value) => createHash("sha256").update(value).digest("hex");

const metadataText = readText("src/data/import-metadata.json");
const rawText = readText(
  "src/data/import-source/territory-assignments.raw.json",
);
const assignmentsText = readText(
  "src/data/private/territory-assignments.normalized.json",
);
const representativesText = readText(
  "src/data/private/representatives.normalized.json",
);

const metadata = JSON.parse(metadataText);
const rawRecords = JSON.parse(rawText);
const assignments = JSON.parse(assignmentsText);
const representatives = JSON.parse(representativesText);
const failures = [];

const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

expect(rawRecords.length === metadata.counts.sourceRecords, "Raw count mismatch.");
expect(
  assignments.length === metadata.counts.normalizedAssignments,
  "Normalized assignment count mismatch.",
);
expect(
  representatives.length === metadata.counts.representatives,
  "Representative count mismatch.",
);
expect(
  hash(rawText) === metadata.checksums.rawRecordsSha256,
  "Raw-record checksum mismatch.",
);
expect(
  hash(assignmentsText) === metadata.checksums.normalizedAssignmentsSha256,
  "Normalized-assignment checksum mismatch.",
);
expect(
  hash(representativesText) ===
    metadata.checksums.normalizedRepresentativesSha256,
  "Normalized-representative checksum mismatch.",
);

const representativeIds = new Set(representatives.map(({ id }) => id));
expect(
  representativeIds.size === representatives.length,
  "Representative IDs are not unique.",
);

const assignmentKeys = new Set(assignments.map((assignment) => JSON.stringify(assignment)));
expect(
  assignmentKeys.size === assignments.length,
  "Normalized assignments contain exact duplicates.",
);

for (const assignment of assignments) {
  expect(/^\d{5}$/.test(assignment.zip), "An assignment has an invalid ZIP.");
  expect(
    representativeIds.has(assignment.representativeId),
    "An assignment references a missing representative.",
  );
}

const sensitiveMetadataPattern =
  /"(?:displayName|email|phone)"\s*:|@|\+1\d{10}/i;
expect(
  !sensitiveMetadataPattern.test(metadataText),
  "Trackable metadata appears to contain representative contact details.",
);

expect(
  metadata.privacy.sourceAndContactsAreGitIgnored === true,
  "Metadata does not record the local-only privacy boundary.",
);
expect(
  metadata.privacy.prototypeDataPolicy === "fictional-only",
  "Prototype data policy is not fictional-only.",
);

if (failures.length > 0) {
  console.error(`Import validation failed with ${failures.length} issue(s).`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      result: "passed",
      sourceRecords: rawRecords.length,
      normalizedAssignments: assignments.length,
      representatives: representatives.length,
      qualitySignals: metadata.qualitySignals,
    },
    null,
    2,
  ),
);
