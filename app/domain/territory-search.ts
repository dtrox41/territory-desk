export type NormalizedTerritorySearch =
  | {
      city: string;
      displayValue: string;
      kind: "city";
      state?: string;
    }
  | {
      displayValue: string;
      kind: "zip";
      normalizationMessage?: string;
      zip: string;
    };

export type TerritorySearchValidation =
  { error: string; ok: false } | { ok: true; value: NormalizedTerritorySearch };

const supportedStates: Record<string, string> = {
  alabama: "AL",
  georgia: "GA",
  illinois: "IL",
  massachusetts: "MA",
  missouri: "MO",
  "new york": "NY",
};

function normalizeCityName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b[a-z]/g, (character) => character.toUpperCase());
}

function normalizeState(value: string) {
  const trimmedValue = value.trim();

  if (/^[a-z]{2}$/i.test(trimmedValue)) {
    return trimmedValue.toUpperCase();
  }

  return supportedStates[trimmedValue.toLowerCase()];
}

export function normalizeTerritorySearch(
  rawValue: string,
): TerritorySearchValidation {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue) {
    return { error: "Enter a five-digit ZIP code or city.", ok: false };
  }

  if (/^\d{5}$/.test(trimmedValue)) {
    return {
      ok: true,
      value: {
        displayValue: trimmedValue,
        kind: "zip",
        zip: trimmedValue,
      },
    };
  }

  if (/^\d{5}-\d{4}$/.test(trimmedValue)) {
    const zip = trimmedValue.slice(0, 5);

    return {
      ok: true,
      value: {
        displayValue: zip,
        kind: "zip",
        normalizationMessage: `Using five-digit ZIP ${zip} from ZIP+4 ${trimmedValue}.`,
        zip,
      },
    };
  }

  if (/\d/.test(trimmedValue)) {
    if (/^\d{1,4}$/.test(trimmedValue)) {
      return {
        error: "Enter all five ZIP-code digits before searching.",
        ok: false,
      };
    }

    return {
      error: "Enter a five-digit ZIP or ZIP+4 in the format 12345-6789.",
      ok: false,
    };
  }

  const [rawCity, rawState, ...extraParts] = trimmedValue.split(",");
  const city = normalizeCityName(rawCity ?? "");

  if (city.length < 2) {
    return { error: "Enter at least two city letters.", ok: false };
  }

  if (extraParts.length > 0) {
    return {
      error: "Enter a city and optional state, such as Columbia, MO.",
      ok: false,
    };
  }

  if (rawState !== undefined) {
    const state = normalizeState(rawState);

    if (!state) {
      return {
        error: "Use a supported two-letter or full state name.",
        ok: false,
      };
    }

    return {
      ok: true,
      value: {
        city,
        displayValue: `${city}, ${state}`,
        kind: "city",
        state,
      },
    };
  }

  return {
    ok: true,
    value: { city, displayValue: city, kind: "city" },
  };
}
