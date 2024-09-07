import { Pages } from "./getPages";

interface PaginationItemDelimeter {
  __type: "delimiter";
}

interface PaginationItemPage {
  __type: "page";
  number: number;
  link: string;
  active: boolean;
}

type PaginationItem = PaginationItemDelimeter | PaginationItemPage;

export function getPaginationView(pages: Pages): PaginationItem[] {
  if (pages.total === 1) {
    return [];
  }

  let result: PaginationItem[] = [];

  result.push({
    __type: "page",
    number: 1,
    link: pages.first,
    active: pages.current !== 1,
  });
  for (const page of pages.pages) {
    result.push({
      __type: "page",
      number: page.number,
      link: page.link,
      active: page.number !== pages.current,
    });
  }
  result.push({
    __type: "page",
    number: pages.total,
    link: pages.last,
    active: pages.total !== pages.current,
  });

  const second = result[1];

  if (second.__type === "page" && second.number !== 2) {
    result.splice(1, 0, { __type: "delimiter" });
  }

  const beforeLast = result[result.length - 2];
  if (beforeLast.__type === "page" && beforeLast.number !== pages.total - 1) {
    result.splice(result.length - 1, 0, { __type: "delimiter" });
  }

  return result;
}
