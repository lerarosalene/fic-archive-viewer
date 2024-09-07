import fs from "node:fs";
import csv from "csv-parser";
import ISO6391 from "iso-639-1";
import isNil from "lodash/isNil";
import sanitize from "sanitize-filename";
import { id } from "./id";
import { Fanfic } from "./Fanfic";
import type { Chip, FanficView } from "./App";

export function getLanguageName(code: string) {
  if (code.toLowerCase() === "pt-br") {
    return "Português brasileiro";
  }
  const main = code.split("-")[0];
  return ISO6391.getNativeName(main);
}

export async function read(
  source: string,
  name: string,
  cb: (fic: Fanfic) => void,
) {
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(source)
      .pipe(csv())
      .on("data", (row) => cb({ ...row, Source: name, fullID: id() }))
      .on("end", () => resolve())
      .on("error", (error) => reject(error));
  });
}

export function exists<T>(item: T | undefined | null): item is T {
  return !isNil(item);
}

const STORY_PARAMS = [
  "Author",
  "Genre",
  "Series",
  "Category",
  "Characters",
  "Relationships",
  "Language",
  "Status",
  "Published",
  "Updated",
  "Rating",
  "Warnings",
  "Chapters",
  "Words",
  "Publisher",
] as const;

export function prepareStory(story: Fanfic): FanficView {
  let chips: Chip[] = [];
  STORY_PARAMS.forEach((param) => {
    if (!story[param]) {
      return;
    }

    const chip: Chip = { title: param, content: story[param] };
    if (param === "Author" && story.AuthorURL) {
      chip.link = story.AuthorURL;
    }

    if (param === "Series" && story.SeriesURL) {
      chip.link = story.SeriesURL;
    }

    if (param === "Language" && story.LanguageID) {
      chip.content = `${chip.content} (${story.LanguageID})`;
    }

    chips.push(chip);
  });

  return {
    Title: story.Title,
    Filename: `${sanitize(story.Title)}.epub`,
    Summary: story.Summary,
    Chips: chips,
    StoryURL: story.StoryURL,
    fullID: story.fullID,
  };
}
