import { Fanfic, isFanficField } from "./Fanfic";

export const SEARCH_FIELDS = [
  "TitleOr",
  "TitleAnd",
  "SummaryOr",
  "SummaryAnd",
  "Language",
  "PublishedFrom",
  "PublishedTo",
  "UpdatedFrom",
  "UpdatedTo",
  "WordsFrom",
  "WordsTo",
  "ChaptersFrom",
  "ChaptersTo",
  "AuthorOr",
  "AuthorAnd",
  "GenreOr",
  "GenreAnd",
  "SeriesOr",
  "SeriesAnd",
  "CategoryOr",
  "CategoryAnd",
  "CharactersOr",
  "CharactersAnd",
  "RelationshipsOr",
  "RelationshipsAnd",
  "StatusOr",
  "StatusAnd",
  "Rating",
  "WarningsOr",
  "WarningsAnd",
  "WarningsExclude",
  "Source",
] as const;

export type SearchQuery = Partial<
  Record<(typeof SEARCH_FIELDS)[number], string>
>;

export function searchCacheKey(params: SearchQuery) {
  return JSON.stringify(SEARCH_FIELDS.map((f) => params[f] ?? ""));
}

function parseTokens(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length)
    .map((t) => t.toLowerCase());
}

function createOrPredicate<T extends keyof Fanfic>(
  value: string,
  field: T,
): (fic: Fanfic) => boolean {
  const tokens = parseTokens(value);
  return (fic) => tokens.some((t) => fic[field].toLowerCase().includes(t));
}

function createAndPredicate<T extends keyof Fanfic>(
  value: string,
  field: T,
): (fic: Fanfic) => boolean {
  const tokens = parseTokens(value);
  return (fic) => tokens.every((t) => fic[field].toLowerCase().includes(t));
}

export function searchParamsToPredicate(
  params: SearchQuery,
): (fic: Fanfic) => boolean {
  let predicates: Array<(fic: Fanfic) => boolean> = [];

  SEARCH_FIELDS.forEach((field) => {
    const value = params[field];

    if (field.endsWith("Or")) {
      const fanficField = field.replace(/Or$/, "");
      if (!isFanficField(fanficField)) {
        console.error(
          `Panic: type error: ${fanficField} isn't found on type Fanfic`,
        );
        process.exit(1);
      }

      if (value) {
        predicates.push(createOrPredicate(value, fanficField));
      }
    }

    if (field.endsWith("And")) {
      const fanficField = field.replace(/And$/, "");
      if (!isFanficField(fanficField)) {
        console.error(
          `Panic: type error: ${fanficField} isn't found on type Fanfic`,
        );
        process.exit(1);
      }

      if (value) {
        predicates.push(createAndPredicate(value, fanficField));
      }
    }
  });

  if (params.Language) {
    const codes = params.Language.split(",");
    predicates.push((fic) => codes.includes(fic.LanguageID));
  }

  if (params.Source) {
    const codes = params.Source.split(",");
    predicates.push((fic) => codes.includes(fic.Source));
  }

  if (params.WarningsExclude) {
    const tokens = parseTokens(params.WarningsExclude);
    predicates.push((fic) =>
      tokens.every((t) => !fic.Warnings.toLowerCase().includes(t)),
    );
  }

  return (fic) => predicates.every((p) => p(fic));
}

export function createBackURL(query: SearchQuery) {
  const params = new URLSearchParams();
  SEARCH_FIELDS.forEach((field) => {
    const value = query[field];
    if (value) {
      params.set(field, value);
    }
  });

  return `/?${params.toString()}`;
}
