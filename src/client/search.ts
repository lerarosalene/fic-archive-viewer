import SEARCH_FIELDS from "../generated/searchFields";

const elements = {
  form: document.querySelector("#query") as HTMLFormElement,
  languages: document.querySelector("#languages") as HTMLDivElement,
  sources: document.querySelector("#sources") as HTMLDivElement,
};

function isInput(element: Element | null): element is HTMLInputElement {
  return Boolean(element && element.tagName === "INPUT");
}

function getChecboxes(container: HTMLElement, dataAttr: string) {
  const checkboxes = container.querySelectorAll(`[data-${dataAttr}]`);

  let result = [];
  for (const checkbox of checkboxes) {
    if (!isInput(checkbox)) {
      continue;
    }

    if (checkbox.checked) {
      result.push(checkbox.dataset[dataAttr]);
    }
  }

  if (result.length) {
    return result.join(",");
  }

  return null;
}

elements.form.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();

  const url = new URL("/search", location.href);
  const params = new URLSearchParams();

  SEARCH_FIELDS.forEach((field) => {
    const isGenericField =
      field.endsWith("Or") ||
      field.endsWith("And") ||
      field.endsWith("Exclude");

    if (!isGenericField) {
      return;
    }

    const input = document.getElementById(field);
    if (!isInput(input)) {
      return;
    }

    if (input.value) {
      params.set(field, input.value);
    }
  });

  const languages = getChecboxes(elements.languages, "language");
  if (languages) {
    params.set("Language", languages);
  }

  const sources = getChecboxes(elements.sources, "source");
  if (sources) {
    params.set("Source", sources);
  }

  url.search = params.toString();
  location.href = url.href;
});

function fillFromSearch() {
  const params = new URLSearchParams(location.search);
  const langParam = params.get("Language");
  const sourceParam = params.get("Source");

  if (langParam) {
    const codes = langParam.split(",");
    for (const code of codes) {
      const checkbox = document.getElementById(`lang-${code}`);
      if (!isInput(checkbox)) {
        continue;
      }

      checkbox.checked = true;
    }
  }

  if (sourceParam) {
    const codes = sourceParam.split(",");
    for (const code of codes) {
      const checkbox = document.getElementById(`source-${code}`);
      if (!isInput(checkbox)) {
        continue;
      }

      checkbox.checked = true;
    }
  }
}

fillFromSearch();
