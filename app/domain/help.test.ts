import {
  containsProhibitedHelpContent,
  searchHelpTopics,
  type HelpTopic,
} from "./help";

function topic(
  title: string,
  keywords: string[],
  recommended = false,
): HelpTopic {
  return {
    audience: "All users",
    expectedResult: "Done",
    group: "Start here",
    keywords,
    lastReviewed: "August 24, 2026",
    notDo: "Nothing changes automatically.",
    prerequisites: [],
    problems: [],
    purpose: title,
    recommended,
    relatedSlugs: [],
    slug: title.toLocaleLowerCase().replaceAll(" ", "-"),
    steps: [],
    summary: title,
    title,
    version: "demo",
  };
}

describe("help domain", () => {
  const topics = [
    topic("Send a lead", ["handoff"], true),
    topic("Understand lead ownership", ["send a lead"]),
    topic("Calendar snapshot", ["Outlook"]),
  ];

  it("returns recommended topics for short or empty search text", () => {
    expect(searchHelpTopics(topics, " ").map((item) => item.title)).toEqual([
      "Send a lead",
    ]);
    expect(searchHelpTopics(topics, "s")).toHaveLength(1);
  });

  it("ranks exact titles ahead of exact keywords and normalizes spaces", () => {
    expect(
      searchHelpTopics(topics, "  SEND   A LEAD ").map((item) => item.title),
    ).toEqual(["Send a lead", "Understand lead ownership"]);
  });

  it("rejects known sensitive-content patterns without echoing values", () => {
    expect(containsProhibitedHelpContent("My password is in the note")).toBe(
      true,
    );
    expect(
      containsProhibitedHelpContent("Customer email should be added here"),
    ).toBe(true);
    expect(
      containsProhibitedHelpContent("The Save button stays disabled"),
    ).toBe(false);
  });
});
