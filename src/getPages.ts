interface GetPagesParams {
  length: number;
  offset: number;
  count: number;
  query: Partial<Record<string, string>>;
}

function createLink(...paramsLists: [string, string | undefined][][]) {
  const params = new URLSearchParams();
  for (const list of paramsLists) {
    for (const [key, value] of list) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
  }

  return `/search?${params.toString()}`;
}

export interface Pages {
  first: string;
  last: string;
  pages: Page[];
  total: number;
  current: number;
}

interface Page {
  number: number;
  link: string;
}

export function getPages(params: GetPagesParams): Pages {
  const commonParams = Object.entries(params.query);

  const maxPage = Math.max(1, Math.ceil(params.length / params.count));
  const lastPageOffset =
    Math.floor(Math.max(0, params.length - 1) / params.count) * params.count;
  const currentPage = Math.floor(params.offset / params.count) + 1;

  let pages: Page[] = [];
  for (
    let i = Math.max(2, currentPage - 2);
    i <= Math.min(maxPage - 1, currentPage + 2);
    ++i
  ) {
    pages.push({
      number: i,
      link: createLink(commonParams, [
        ["offset", String((i - 1) * params.count)],
      ]),
    });
  }

  return {
    first: createLink(commonParams, [["offset", undefined]]),
    last: createLink(commonParams, [["offset", String(lastPageOffset)]]),
    pages,
    total: maxPage,
    current: currentPage,
  };
}
