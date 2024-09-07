import { SEARCH_FIELDS } from "./search";

export function generateGenericFields() {
  let result: string[] = [];
  let visited = new Set<string>();

  for (const field of SEARCH_FIELDS) {
    if (field.endsWith("Or")) {
      const fieldName = field.replace(/Or$/, "");
      if (!visited.has(fieldName)) {
        result.push(fieldName);
        visited.add(fieldName);
      }
    }
  }

  return result;
}
