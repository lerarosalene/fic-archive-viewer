function fixPaginatedHeight() {
  const results = document.querySelector("#results") as HTMLDivElement;
  const paginator = document.querySelector(
    "#pagination",
  ) as HTMLDivElement | null;
  if (!paginator) {
    return;
  }
  results.style.minHeight = `calc(100vh - ${Math.ceil(paginator.getBoundingClientRect().height)}px)`;
}

fixPaginatedHeight();
