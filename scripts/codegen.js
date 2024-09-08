const fs = require("node:fs");
const path = require("node:path");
const pug = require("pug");
const less = require("less");
const esbuild = require("esbuild");

const fsp = fs.promises;

const templates = ["main", "result"];

async function main() {
  const fieldsJS = await esbuild.build({
    entryPoints: [path.join("scripts", "exportSearchFields.ts")],
    outfile: path.join("scripts", "exportSearchFields.js"),
    bundle: true,
    minify: true,
    write: false,
    format: "iife",
    globalName: "fields",
  });

  const fields = new Function(`${fieldsJS.outputFiles[0].text};return fields;`)().SEARCH_FIELDS;
  await fsp.mkdir(path.join("src", "generated"), { recursive: true });
  await fsp.writeFile(path.join("src", "generated", "searchFields.ts"), `export default ${JSON.stringify(fields, null, 2)} as const;`);

  for (const template of templates) {
    const compiled = pug.compileFileClient(
      path.join("src", "templates", `${template}.pug`),
      { self: true, name: "render", debug: false, compileDebug: false }
    );

    await fsp.writeFile(
      path.join("src", "templates", `${template}.js`),
      compiled + "\n\nexport default render;\n"
    );

    await fsp.writeFile(
      path.join("src", "templates", `${template}.d.ts`),
      `declare function render(locals: any): string;\nexport default render;\n`
    );
  }

  const lessTemplate = await fsp.readFile(
    path.join("src", "client", "index.less"),
    "utf-8"
  );
  const css = await less.render(lessTemplate, { compress: true });
  await fsp.writeFile(path.join("src", "generated", "index.css"), css.css);

  const darkTemplate = await fsp.readFile(
    path.join("src", "client", "dark.less"),
    "utf-8"
  );
  const darkCss = await less.render(darkTemplate, { compress: true });
  await fsp.writeFile(path.join("src", "generated", "dark.css"), darkCss.css);

  await esbuild.build({
    entryPoints: [path.join("src", "client", "search.ts")],
    outfile: path.join("src", "generated", "search.js.txt"),
    bundle: true,
    minify: true,
  });

  await esbuild.build({
    entryPoints: [path.join("src", "client", "results.ts")],
    outfile: path.join("src", "generated", "results.js.txt"),
    bundle: true,
    minify: true,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
