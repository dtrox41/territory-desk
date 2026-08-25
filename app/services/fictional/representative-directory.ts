import {
  directoryDepartments,
  normalizeDirectoryQuery,
  searchDirectoryRepresentatives,
  type DirectoryContact,
  type DirectoryContactMethod,
  type DirectoryDepartment,
  type DirectoryRepresentative,
} from "../../domain/representative-directory";
import type { RepresentativeDirectoryService } from "../representative-directory-service";

const sourceUpdatedLabel = "August 20, 2026";
const departmentByCode = new Map(
  directoryDepartments.map((department) => [department.code, department]),
);

const department = (code: DirectoryDepartment["code"]): DirectoryDepartment => {
  const match = departmentByCode.get(code);
  if (!match) throw new Error(`Missing fictional department: ${code}`);
  return match;
};

const available = (value: string): DirectoryContact => ({
  availability: "available",
  value,
});
const unavailable = (): DirectoryContact => ({ availability: "unavailable" });
const restricted = (): DirectoryContact => ({ availability: "restricted" });

const contacts = (
  call: DirectoryContact,
  email: DirectoryContact,
  text: DirectoryContact,
): Record<DirectoryContactMethod, DirectoryContact> => ({ call, email, text });

export const fictionalDirectoryRepresentatives: DirectoryRepresentative[] = [
  {
    canReceiveHandoffs: true,
    contact: contacts(
      available("(314) 555-0101"),
      available("jordan.lee@example.com"),
      unavailable(),
    ),
    coverage: [
      {
        cities: ["St. Louis"],
        divisions: ["Facility Services"],
        state: "MO",
        zipCount: 14,
      },
    ],
    departments: [department("facility-services")],
    displayName: "Jordan Lee",
    id: "rep-jordan-lee",
    lastVerifiedLabel: "August 21, 2026",
    locations: [
      { label: "Demo Location 101", number: "demo-101", state: "MO" },
    ],
    sourceDivisions: ["Facility Services"],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(
      available("(314) 555-0102"),
      available("avery.morgan@example.com"),
      available("(314) 555-0102"),
    ),
    coverage: [
      {
        cities: ["St. Louis"],
        divisions: ["Uniform Rental"],
        state: "MO",
        zipCount: 18,
      },
    ],
    departments: [department("uniform")],
    displayName: "Avery Morgan",
    id: "rep-avery-morgan",
    locations: [
      { label: "Demo Location 101", number: "demo-101", state: "MO" },
    ],
    sourceDivisions: ["Uniform Rental"],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(
      available("(314) 555-0103"),
      available("morgan.ellis@example.com"),
      available("(314) 555-0103"),
    ),
    coverage: [
      {
        cities: ["St. Louis"],
        divisions: ["First Aid & Safety"],
        state: "MO",
        zipCount: 11,
      },
    ],
    departments: [department("first-aid-safety")],
    displayName: "Morgan Ellis",
    id: "rep-morgan-ellis",
    locations: [
      { label: "Demo Location 101", number: "demo-101", state: "MO" },
    ],
    sourceDivisions: ["First Aid & Safety"],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(
      available("(314) 555-0104"),
      available("casey.nguyen@example.com"),
      available("(314) 555-0104"),
    ),
    coverage: [
      {
        cities: ["St. Louis"],
        divisions: ["First Aid & Safety"],
        state: "MO",
        zipCount: 11,
      },
    ],
    departments: [department("first-aid-safety")],
    displayName: "Casey Nguyen",
    id: "rep-casey-nguyen",
    locations: [
      { label: "Demo Location 101", number: "demo-101", state: "MO" },
    ],
    sourceDivisions: ["First Aid & Safety"],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(
      available("(314) 555-0105"),
      available("devon.park@example.com"),
      available("(314) 555-0105"),
    ),
    coverage: [
      {
        cities: ["St. Louis", "Columbia"],
        divisions: ["Product Specialist", "Healthcare Specialist"],
        state: "MO",
        zipCount: 27,
      },
      {
        cities: ["Springfield"],
        divisions: ["Education Specialist"],
        state: "IL",
        zipCount: 8,
      },
    ],
    departments: [
      department("strategic-specialty"),
      department("facility-services"),
    ],
    displayName: "Devon Park",
    id: "rep-devon-park",
    lastVerifiedLabel: "August 22, 2026",
    locations: [
      { label: "Demo Location 101", number: "demo-101", state: "MO" },
      { label: "Demo Location 202", number: "demo-202", state: "MO" },
    ],
    sourceDivisions: [
      "Product Specialist",
      "Healthcare Specialist",
      "Education Specialist",
      "Facility Services",
    ],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(
      available("(573) 555-0201"),
      available("alex.rivera@example.com"),
      available("(573) 555-0201"),
    ),
    coverage: [
      {
        cities: ["Columbia"],
        divisions: ["Facility Services"],
        state: "MO",
        zipCount: 9,
      },
    ],
    departments: [department("facility-services")],
    displayName: "Alex Rivera",
    id: "rep-alex-rivera",
    locations: [
      { label: "Demo Location 202", number: "demo-202", state: "MO" },
    ],
    sourceDivisions: ["Facility Services"],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(
      available("(573) 555-0202"),
      available("riley.chen@example.com"),
      available("(573) 555-0202"),
    ),
    coverage: [
      {
        cities: ["Columbia"],
        divisions: ["Uniform Rental"],
        state: "MO",
        zipCount: 16,
      },
    ],
    departments: [department("uniform")],
    displayName: "Riley Chen",
    id: "rep-riley-chen",
    locations: [
      { label: "Demo Location 202", number: "demo-202", state: "MO" },
    ],
    sourceDivisions: ["Uniform Rental"],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(
      restricted(),
      available("drew.bennett@example.com"),
      unavailable(),
    ),
    coverage: [
      {
        cities: ["Atlanta"],
        divisions: ["SRIT Uniform Rental"],
        state: "GA",
        zipCount: 21,
      },
    ],
    departments: [department("uniform")],
    displayName: "Drew Bennett",
    id: "rep-drew-bennett",
    locations: [
      { label: "Demo Location 303", number: "demo-303", state: "GA" },
    ],
    sourceDivisions: ["SRIT Uniform Rental"],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(
      available("(617) 555-0404"),
      available("skyler.gray@example.com"),
      available("(617) 555-0404"),
    ),
    coverage: [
      {
        cities: ["Boston"],
        divisions: ["Sanis Ambassador"],
        state: "MA",
        zipCount: 10,
      },
    ],
    departments: [department("facility-services")],
    displayName: "Skyler Gray",
    id: "rep-skyler-gray",
    locations: [
      { label: "Demo Location 404", number: "demo-404", state: "MA" },
    ],
    sourceDivisions: ["Sanis Ambassador"],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(
      available("(314) 555-0110"),
      available("cameron.brooks.uniform@example.com"),
      available("(314) 555-0110"),
    ),
    coverage: [
      {
        cities: ["St. Louis"],
        divisions: ["Uniform Rental"],
        state: "MO",
        zipCount: 12,
      },
    ],
    departments: [department("uniform")],
    displayName: "Cameron Brooks",
    id: "rep-cameron-brooks-uniform",
    locations: [
      { label: "Demo Location 101", number: "demo-101", state: "MO" },
    ],
    sourceDivisions: ["Uniform Rental"],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(
      available("(573) 555-0210"),
      available("cameron.brooks.firstaid@example.com"),
      available("(573) 555-0210"),
    ),
    coverage: [
      {
        cities: ["Columbia"],
        divisions: ["FAS Account Executive"],
        state: "MO",
        zipCount: 8,
      },
    ],
    departments: [department("first-aid-safety")],
    displayName: "Cameron Brooks",
    id: "rep-cameron-brooks-first-aid",
    locations: [
      { label: "Demo Location 202", number: "demo-202", state: "MO" },
    ],
    sourceDivisions: ["FAS Account Executive"],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(restricted(), restricted(), restricted()),
    coverage: [
      {
        cities: ["St. Louis"],
        divisions: ["Fire Protection Specialist"],
        state: "MO",
        zipCount: 7,
      },
    ],
    departments: [department("fire-protection")],
    displayName: "Robin Hale",
    id: "rep-robin-hale-review",
    locations: [
      { label: "Demo Location 101", number: "demo-101", state: "MO" },
    ],
    sourceDivisions: ["Fire Protection Specialist"],
    sourceUpdatedLabel,
    status: "needs-review",
  },
  {
    canReceiveHandoffs: true,
    contact: contacts(unavailable(), unavailable(), unavailable()),
    coverage: [
      {
        cities: ["Springfield"],
        divisions: ["Facility Services"],
        state: "IL",
        zipCount: 6,
      },
    ],
    departments: [department("facility-services")],
    displayName: "Sage Mitchell",
    id: "rep-sage-mitchell",
    locations: [
      { label: "Demo Location 606", number: "demo-606", state: "IL" },
    ],
    sourceDivisions: ["Facility Services"],
    sourceUpdatedLabel,
    status: "active",
  },
  {
    canReceiveHandoffs: false,
    contact: contacts(unavailable(), unavailable(), unavailable()),
    coverage: [],
    departments: [department("uniform")],
    displayName: "Jamie Cole",
    id: "rep-jamie-cole-inactive",
    locations: [
      { label: "Demo Location 505", number: "demo-505", state: "NY" },
    ],
    sourceDivisions: ["Uniform Rental"],
    sourceUpdatedLabel,
    status: "inactive",
  },
];

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Directory request cancelled", "AbortError");
  }
}

export const fictionalRepresentativeDirectoryService: RepresentativeDirectoryService =
  {
    async getRepresentative(representativeId, signal) {
      throwIfAborted(signal);
      await Promise.resolve();
      throwIfAborted(signal);

      return (
        fictionalDirectoryRepresentatives.find(
          (representative) => representative.id === representativeId,
        ) ?? null
      );
    },

    async search(request, signal) {
      throwIfAborted(signal);
      await Promise.resolve();
      throwIfAborted(signal);

      const normalizedQuery = normalizeDirectoryQuery(request.query);
      const matches = searchDirectoryRepresentatives(
        fictionalDirectoryRepresentatives,
        { ...request, query: normalizedQuery },
      );

      return {
        dataState:
          request.filters.state === "MA"
            ? ("stale" as const)
            : ("current" as const),
        representatives: matches.slice(0, request.limit),
        sourceUpdatedLabel,
        suggestions: normalizedQuery.length >= 2 ? matches.slice(0, 8) : [],
        total: matches.length,
        versionsMatch: true,
      };
    },
  };
