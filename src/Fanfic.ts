export const FANFIC_FIELDS = [
  "ID",
  "Path",
  "Title",
  "StoryURL",
  "Author",
  "AuthorURL",
  "Series",
  "SeriesURL",
  "Category",
  "Genre",
  "Characters",
  "Relationships",
  "Language",
  "LanguageID",
  "Status",
  "Published",
  "Updated",
  "Rating",
  "Warnings",
  "Chapters",
  "Words",
  "Publisher",
  "Summary",
  "Source",
  "fullID",
] as const;

export type Fanfic = Record<(typeof FANFIC_FIELDS)[number], string>;

export function isFanficField(field: string): field is keyof Fanfic {
  return (FANFIC_FIELDS as readonly string[]).includes(field);
}
