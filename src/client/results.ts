const results = document.querySelector("#results") as HTMLDivElement;
const paginator = document.querySelector("#pagination") as HTMLDivElement;

results.style.minHeight = `calc(100vh - ${Math.ceil(paginator.getBoundingClientRect().height)}px)`;
