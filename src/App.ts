import fs from "node:fs";
import path from "node:path";
import { exists, getLanguageName, prepareStory, read } from "./util";
import { SearchQuery, searchCacheKey, searchParamsToPredicate } from "./search";
import type { Fanfic } from "./Fanfic";

export interface Chip {
  title: string;
  content: string;
  link?: string;
}

export interface FanficView {
  Title: string;
  Summary: string;
  Chips: Chip[];
  StoryURL: string;
  fullID: string;
  Filename: string;
}

const sources = [
  { code: "ao3", name: "Archive of Our Own", file: "archiveofourown.csv" },
  { code: "wattpad", name: "Wattpad", file: "wattpad.csv" },
  { code: "fanfiction", name: "FanFiction.net", file: "fanfiction.csv" },
  { code: "fictionpress", name: "FictionPress", file: "fictionpress.csv" },
];

const MAX_CACHE_SIZE = 50;

export class App {
  private _directory: string;
  private _fanfics = new Map<string, Fanfic>();
  private _order: string[] = [];
  private _langs = new Set<string>();
  private _cache = new Map<string, string[]>();

  private _onStory = (fic: Fanfic) => {
    this._fanfics.set(fic.fullID, fic);
    this._order.push(fic.fullID);
    this._langs.add(fic.LanguageID);
  };

  public constructor(directory: string) {
    this._directory = directory;
  }

  public async initialize() {
    let promises = [];
    for (const source of sources) {
      const p = read(
        path.join(this._directory, source.file),
        source.code,
        this._onStory,
      );
      promises.push(p);
    }
    return await Promise.all(promises);
  }

  public get languages() {
    let result: [string, string][] = [];
    this._langs.forEach((l) => {
      result.push([l, getLanguageName(l)]);
    });
    return result.sort((a, b) => a[0].localeCompare(b[0]));
  }

  public get sources() {
    return sources.map((s) => [s.code, s.name]);
  }

  public search(query: SearchQuery): FanficView[] {
    const key = searchCacheKey(query);
    const cached = this._cache.get(key);
    if (cached) {
      return cached
        .map((id) => this._fanfics.get(id))
        .filter(exists)
        .map(prepareStory);
    }

    const predicate = searchParamsToPredicate(query);
    const result = this._order
      .map((id) => this._fanfics.get(id))
      .filter(exists)
      .filter(predicate)
      .map(prepareStory);

    if (this._cache.size >= MAX_CACHE_SIZE) {
      process.stdout.write(
        `Cache got too big (>= ${MAX_CACHE_SIZE} searches). Dropping.\n`,
      );
      this._cache.clear();
    }

    this._cache.set(
      key,
      result.map((fv) => fv.fullID),
    );

    return result;
  }

  public getFile(id: string) {
    const fic = this._fanfics.get(id);
    if (!fic) {
      return null;
    }

    const relPath = fic.Path.startsWith("/") ? fic.Path.substring(1) : fic.Path;
    return fs.createReadStream(path.join(this._directory, relPath));
  }
}
