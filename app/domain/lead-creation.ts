import type {
  TerritoryAssignment,
  TerritoryDepartmentCode,
} from "./territory-result";

export type LeadCreationStep = "route" | "customer" | "opportunity" | "review";

export type LeadEntryContext =
  | { source: "global" }
  | { representativeId: string; source: "directory" }
  | {
      routingSnapshot: {
        assignmentId: string;
        city?: string;
        department: TerritoryDepartmentCode;
        division: string;
        location: string;
        representativeId: string;
        sourceVersion: string;
        state?: string;
        zip?: string;
      };
      source: "territory";
    }
  | {
      copiedCustomer: Pick<
        LeadCustomerDraft,
        | "city"
        | "companyName"
        | "contactAvailability"
        | "contactName"
        | "email"
        | "noContactReason"
        | "phone"
        | "state"
        | "streetAddress"
        | "zip"
      >;
      excludedDepartment: TerritoryDepartmentCode;
      source: "another-department";
    };

export type LeadContactAvailability = "phone" | "email" | "both" | "none";

export type LeadCustomerDraft = {
  city: string;
  companyName: string;
  contactAvailability: LeadContactAvailability | "";
  contactName: string;
  email: string;
  noContactReason: string;
  phone: string;
  state: string;
  streetAddress: string;
  zip: string;
};

export type LeadCustomerTiming =
  "asap" | "within-7-days" | "within-30-days" | "more-than-30-days" | "unknown";

export type LeadOpportunityDraft = {
  additionalNotes: string;
  customerRequestedContactAt: string;
  customerTiming: LeadCustomerTiming | "";
  customerTimingReason: string;
  needSummary: string;
  opportunityContext: string;
};

export type LeadRoutingDraft = {
  department: TerritoryDepartmentCode | "";
  preferredRepresentativeId?: string;
  zip: string;
};

export type ConfirmedLeadRoute = {
  assignment: TerritoryAssignment;
  city: string;
  department: TerritoryDepartmentCode;
  representative: TerritoryAssignment["representatives"][number];
  sourceUpdatedLabel: string;
  sourceVersion: string;
  state: string;
  zip: string;
};

export type LeadRoutingResolution =
  | { route: ConfirmedLeadRoute; type: "confirmed" }
  | {
      currentRoute: ConfirmedLeadRoute;
      preferredRepresentativeId: string;
      type: "recipient-mismatch";
    }
  | { assignment: TerritoryAssignment; type: "needs-review" }
  | { assignment: TerritoryAssignment; type: "open" }
  | { type: "not-found" }
  | { type: "stale" };

export type LeadDraft = {
  customer: LeadCustomerDraft;
  duplicateOverrideReason: string;
  idempotencyKey: string;
  opportunity: LeadOpportunityDraft;
  routing: LeadRoutingDraft;
};

export type LeadFieldErrors = Record<string, string>;

const practicalEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneDigits = /\d/g;

function boundedRequired(
  value: string,
  minimum: number,
  maximum: number,
  label: string,
) {
  const length = value.trim().length;
  if (length < minimum)
    return `${label} must be at least ${minimum} characters.`;
  if (length > maximum)
    return `${label} must be ${maximum} characters or fewer.`;
  return undefined;
}

function boundedOptional(
  value: string,
  minimum: number,
  maximum: number,
  label: string,
) {
  if (!value.trim()) return undefined;
  return boundedRequired(value, minimum, maximum, label);
}

export function validateRouteDraft(route: LeadRoutingDraft): LeadFieldErrors {
  const errors: LeadFieldErrors = {};
  if (!route.department)
    errors.department = "Select a requested department or service.";
  if (!/^\d{5}$/.test(route.zip.trim()))
    errors.zip = "Enter an exact five-digit customer ZIP code.";
  return errors;
}

export function validateCustomerDraft(
  customer: LeadCustomerDraft,
): LeadFieldErrors {
  const errors: LeadFieldErrors = {};
  const companyError = boundedRequired(
    customer.companyName,
    2,
    120,
    "Company name",
  );
  const streetError = boundedOptional(
    customer.streetAddress,
    2,
    160,
    "Street address",
  );
  const contactNameError = boundedOptional(
    customer.contactName,
    2,
    100,
    "Contact name",
  );
  if (companyError) errors.companyName = companyError;
  if (streetError) errors.streetAddress = streetError;
  if (contactNameError) errors.contactName = contactNameError;
  if (!customer.city.trim())
    errors.city = "A routing-validated city is required.";
  if (!/^[A-Z]{2}$/.test(customer.state))
    errors.state = "A routing-validated two-letter state is required.";
  if (!/^\d{5}$/.test(customer.zip))
    errors.customerZip = "A routing-validated five-digit ZIP is required.";
  if (!customer.contactAvailability)
    errors.contactAvailability =
      "Select which customer contact information is available.";

  const requiresPhone =
    customer.contactAvailability === "phone" ||
    customer.contactAvailability === "both";
  const requiresEmail =
    customer.contactAvailability === "email" ||
    customer.contactAvailability === "both";
  if (requiresPhone && (customer.phone.match(phoneDigits)?.length ?? 0) < 7) {
    errors.phone = "Enter the available customer phone number.";
  }
  if (requiresEmail && !practicalEmail.test(customer.email.trim())) {
    errors.email = "Enter the available customer email address.";
  }
  if (customer.email.trim() && !practicalEmail.test(customer.email.trim())) {
    errors.email = "Enter a practical email address, such as name@example.com.";
  }
  if (customer.contactAvailability === "none") {
    const reasonError = boundedRequired(
      customer.noContactReason,
      5,
      240,
      "Contact explanation",
    );
    if (reasonError) errors.noContactReason = reasonError;
  }
  return errors;
}

export function validateOpportunityDraft(
  opportunity: LeadOpportunityDraft,
): LeadFieldErrors {
  const errors: LeadFieldErrors = {};
  const needError = boundedRequired(
    opportunity.needSummary,
    10,
    1000,
    "Customer need",
  );
  if (needError) errors.needSummary = needError;
  if (!opportunity.customerTiming)
    errors.customerTiming = "Select the customer's timing.";
  if (opportunity.customerTiming === "asap") {
    const reasonError = boundedRequired(
      opportunity.customerTimingReason,
      5,
      300,
      "ASAP explanation",
    );
    if (reasonError) errors.customerTimingReason = reasonError;
  }
  if (opportunity.opportunityContext.length > 1000)
    errors.opportunityContext =
      "Opportunity context must be 1,000 characters or fewer.";
  if (opportunity.additionalNotes.length > 2000)
    errors.additionalNotes =
      "Additional notes must be 2,000 characters or fewer.";
  return errors;
}

export function normalizeCompanyForDuplicateCheck(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function getNextBusinessDay(date: Date) {
  const target = new Date(date);
  do {
    target.setUTCDate(target.getUTCDate() + 1);
  } while (target.getUTCDay() === 0 || target.getUTCDay() === 6);
  return target;
}

export const leadDepartmentOptions: Array<{
  label: string;
  value: TerritoryDepartmentCode;
}> = [
  { label: "Uniform", value: "uniform" },
  { label: "Facility Services", value: "facility-services" },
  { label: "First Aid & Safety", value: "first-aid-safety" },
  { label: "Fire Protection", value: "fire-protection" },
  { label: "Strategic & Specialty", value: "strategic-specialty" },
];

export const leadTimingLabels: Record<LeadCustomerTiming, string> = {
  asap: "As soon as possible",
  "within-7-days": "Within 7 days",
  "within-30-days": "Within 30 days",
  "more-than-30-days": "More than 30 days",
  unknown: "Timing unknown",
};
