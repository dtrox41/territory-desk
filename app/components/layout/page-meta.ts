export function pageMeta(title: string, description: string) {
  return [
    { title: `${title} — Territory Desk` },
    { content: description, name: "description" },
  ];
}
