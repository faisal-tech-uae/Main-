/** Renders a `{{variable}}` template against a flat variable map. Missing variables render as an empty string. */
export function renderTemplate(template: string, variables: Record<string, string | number | undefined>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = variables[key];
    return value === undefined ? "" : String(value);
  });
}
