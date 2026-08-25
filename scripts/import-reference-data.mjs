import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const [sourceArgument, projectArgument = "."] = process.argv.slice(2);

if (!sourceArgument) {
  console.error(
    "Usage: node scripts/import-reference-data.mjs <reference-index.html> [project-root]",
  );
  process.exit(1);
}

const sourcePath = resolve(sourceArgument);
const projectRoot = resolve(projectArgument);
const sourceText = readFileSync(sourcePath, "utf8");
const marker = "const ZIP_DATA = ";
const markerIndex = sourceText.indexOf(marker);

if (markerIndex < 0) {
  throw new Error("The reference file does not contain the ZIP_DATA marker.");
}

const arrayStart = sourceText.indexOf("[", markerIndex + marker.length);

function findArrayEnd(text, startIndex) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const character = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
    } else if (character === "[") {
      depth += 1;
    } else if (character === "]") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw new Error("The ZIP_DATA array is not balanced.");
}

const arrayEnd = findArrayEnd(sourceText, arrayStart);
const sourceRecords = JSON.parse(sourceText.slice(arrayStart, arrayEnd + 1));

if (!Array.isArray(sourceRecords)) {
  throw new Error("ZIP_DATA did not parse as an array.");
}

const requiredFields = [
  "zip",
  "city",
  "state",
  "division",
  "location",
  "rep",
  "source",
  "phone",
  "email",
];

const validationErrors = [];

for (const [index, record] of sourceRecords.entries()) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    validationErrors.push(`Record ${index} is not an object.`);
    continue;
  }

  for (const field of requiredFields) {
    if (!(field in record)) {
      validationErrors.push(`Record ${index} is missing ${field}.`);
    }
  }
}

if (validationErrors.length > 0) {
  throw new Error(
    `Source validation failed with ${validationErrors.length} error(s).`,
  );
}

const trim = (value) => String(value ?? "").trim();
const collapseWhitespace = (value) => trim(value).replace(/\s+/g, " ");
const hash = (value) => createHash("sha256").update(value).digest("hex");

function normalizePhone(value) {
  const digits = trim(value).replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

function normalizeEmail(value) {
  const email = trim(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

const representatives = new Map();
const assignments = new Map();
let invalidZipCount = 0;
let invalidPhoneCount = 0;
let invalidEmailCount = 0;

for (const sourceRecord of sourceRecords) {
  const displayName = collapseWhitespace(sourceRecord.rep);
  const email = normalizeEmail(sourceRecord.email);
  const phone = normalizePhone(sourceRecord.phone);
  const identityKey = `${displayName.toLowerCase()}|${email ?? ""}`;
  const representativeId = `rep-${hash(identityKey).slice(0, 12)}`;
  const zip = trim(sourceRecord.zip).padStart(5, "0");

  if (!/^\d{5}$/.test(zip)) invalidZipCount += 1;
  if (trim(sourceRecord.phone) && !phone) invalidPhoneCount += 1;
  if (trim(sourceRecord.email) && !email) invalidEmailCount += 1;

  const existingRepresentative = representatives.get(representativeId) ?? {
    id: representativeId,
    displayName,
    phone,
    email,
    divisions: new Set(),
    locations: new Set(),
  };

  existingRepresentative.divisions.add(collapseWhitespace(sourceRecord.division));
  if (trim(sourceRecord.location)) {
    existingRepresentative.locations.add(trim(sourceRecord.location));
  }
  representatives.set(representativeId, existingRepresentative);

  const normalizedAssignment = {
    zip,
    city: collapseWhitespace(sourceRecord.city),
    citySearch: collapseWhitespace(sourceRecord.city).toLowerCase(),
    state: trim(sourceRecord.state).toUpperCase(),
    division: collapseWhitespace(sourceRecord.division),
    location: trim(sourceRecord.location),
    representativeId,
    source: collapseWhitespace(sourceRecord.source),
  };

  const assignmentKey = JSON.stringify(normalizedAssignment);
  assignments.set(assignmentKey, normalizedAssignment);
}

const normalizedRepresentatives = [...representatives.values()]
  .map((representative) => ({
    ...representative,
    divisions: [...representative.divisions].sort(),
    locations: [...representative.locations].sort(),
  }))
  .sort((left, right) => left.displayName.localeCompare(right.displayName));

const normalizedAssignments = [...assignments.values()].sort(
  (left, right) =>
    left.zip.localeCompare(right.zip) ||
    left.division.localeCompare(right.division) ||
    left.representativeId.localeCompare(right.representativeId),
);

const rawJson = `${JSON.stringify(sourceRecords, null, 2)}\n`;
const assignmentsJson = `${JSON.stringify(normalizedAssignments, null, 2)}\n`;
const representativesJson = `${JSON.stringify(normalizedRepresentatives, null, 2)}\n`;

const rawPath = join(
  projectRoot,
  "src/data/import-source/territory-assignments.raw.json",
);
const assignmentsPath = join(
  projectRoot,
  "src/data/private/territory-assignments.normalized.json",
);
const representativesPath = join(
  projectRoot,
  "src/data/private/representatives.normalized.json",
);
const metadataPath = join(projectRoot, "src/data/import-metadata.json");

for (const outputPath of [
  rawPath,
  assignmentsPath,
  representativesPath,
  metadataPath,
]) {
  mkdirSync(dirname(outputPath), { recursive: true });
}

writeFileSync(rawPath, rawJson);
writeFileSync(assignmentsPath, assignmentsJson);
writeFileSync(representativesPath, representativesJson);

const states = [...new Set(normalizedAssignments.map((record) => record.state))].sort();
const divisions = [
  ...new Set(normalizedAssignments.map((record) => record.division)),
].sort();
const locations = [
  ...new Set(
    normalizedAssignments.map((record) => record.location).filter(Boolean),
  ),
].sort();
const zipCodes = new Set(normalizedAssignments.map((record) => record.zip));
const cityStates = new Set(
  normalizedAssignments.map((record) => `${record.city}|${record.state}`),
);
const routingGroups = new Map();
const zipCities = new Map();
const representativeNameContacts = new Map();
const emailNames = new Map();

for (const assignment of normalizedAssignments) {
  const routingKey = `${assignment.zip}|${assignment.state}|${assignment.division}`;
  const routingRepresentatives = routingGroups.get(routingKey) ?? new Set();
  routingRepresentatives.add(assignment.representativeId);
  routingGroups.set(routingKey, routingRepresentatives);

  const zipKey = `${assignment.zip}|${assignment.state}`;
  const cities = zipCities.get(zipKey) ?? new Set();
  cities.add(assignment.city);
  zipCities.set(zipKey, cities);
}

for (const representative of normalizedRepresentatives) {
  const nameKey = representative.displayName.toLowerCase();
  const contacts = representativeNameContacts.get(nameKey) ?? new Set();
  contacts.add(`${representative.email ?? ""}|${representative.phone ?? ""}`);
  representativeNameContacts.set(nameKey, contacts);

  if (representative.email) {
    const names = emailNames.get(representative.email) ?? new Set();
    names.add(nameKey);
    emailNames.set(representative.email, names);
  }
}

const countSetsLargerThanOne = (collection) =>
  [...collection.values()].filter((values) => values.size > 1).length;
const updatedMatch = sourceText.match(/updated\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);

const metadata = {
  schemaVersion: 1,
  source: {
    project: "territory-lookup",
    file: "index.html",
    commit: process.env.SOURCE_COMMIT || "unrecorded",
    commitDate: process.env.SOURCE_COMMIT_DATE || "unrecorded",
    sourceUpdatedDate: updatedMatch?.[1] ?? "unrecorded",
    copiedDate: process.env.COPY_DATE || new Date().toISOString().slice(0, 10),
    sourceFileSha256: hash(sourceText),
  },
  counts: {
    sourceRecords: sourceRecords.length,
    normalizedAssignments: normalizedAssignments.length,
    exactDuplicateAssignmentsRemoved:
      sourceRecords.length - normalizedAssignments.length,
    representatives: normalizedRepresentatives.length,
    zipCodes: zipCodes.size,
    cityStates: cityStates.size,
    states: states.length,
    divisions: divisions.length,
    locations: locations.length,
  },
  coverage: {
    states,
    divisions,
    locations,
  },
  validation: {
    missingRequiredFields: validationErrors.length,
    invalidZipCount,
    invalidPhoneCount,
    invalidEmailCount,
  },
  qualitySignals: {
    routingGroupsWithMultipleRepresentatives:
      countSetsLargerThanOne(routingGroups),
    zipCodesWithMultipleCityNames: countSetsLargerThanOne(zipCities),
    representativeNamesWithMultipleContactRecords: countSetsLargerThanOne(
      representativeNameContacts,
    ),
    emailsSharedAcrossRepresentativeNames: countSetsLargerThanOne(emailNames),
  },
  checksums: {
    rawRecordsSha256: hash(rawJson),
    normalizedAssignmentsSha256: hash(assignmentsJson),
    normalizedRepresentativesSha256: hash(representativesJson),
  },
  privacy: {
    sourceAndContactsAreGitIgnored: true,
    metadataContainsRepresentativeContactDetails: false,
    prototypeDataPolicy: "fictional-only",
  },
};

writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      sourceRecords: metadata.counts.sourceRecords,
      normalizedAssignments: metadata.counts.normalizedAssignments,
      representatives: metadata.counts.representatives,
      zipCodes: metadata.counts.zipCodes,
      states: metadata.counts.states,
      divisions: metadata.counts.divisions,
      validation: metadata.validation,
      qualitySignals: metadata.qualitySignals,
    },
    null,
    2,
  ),
);
