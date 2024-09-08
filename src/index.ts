import express from "express";
import open from "open";
import type qs from "qs";
import type net from "node:net";

import { App } from "./App";
import result from "./templates/result";
import main from "./templates/main";
import css from "./generated/index.css";
import searchJS from "./generated/search.js.txt";
import resultsJS from "./generated/results.js.txt";
import helpIcon from "../assets/help.svg";
import darkCss from "./generated/dark.css";
import { createBackURL } from "./search";
import { generateGenericFields } from "./generateGenericFields";
import { getPages } from "./getPages";
import { getPaginationView } from "./getPaginationView";

const ARCHIVE_PATH = process.env.ARCHIVE_PATH ?? __dirname;

const server = express();
const app = new App(ARCHIVE_PATH);

const genericFields = generateGenericFields();

function flatQuery(query: qs.ParsedQs): Record<string, string> {
  return Object.fromEntries(
    Object.entries(query).map(([k, v]) => [k, String(v)] as const),
  );
}

server.get("/", (req, res) => {
  res.header("Content-Type", "text/html");
  res.status(200);

  const html = main({
    query: flatQuery(req.query),
    languages: app.languages,
    sources: app.sources,
    genericFields,
    darkMode: Boolean(process.env.DARK_MODE),
  });
  res.send(html);
});

const DEFAULT_COUNT = 25;

server.get("/search", (req, res) => {
  const query = flatQuery(req.query);

  const fanfics = app.search(query);
  const offset = req.query.offset ? Number(req.query.offset) : 0;
  const count = req.query.count ? Number(req.query.count) : DEFAULT_COUNT;

  const window = fanfics.slice(offset, offset + count);

  const pages = getPages({
    length: fanfics.length,
    offset,
    count,
    query,
  });

  const pagination = getPaginationView(pages);

  const html = result({
    stories: window,
    from: offset + 1,
    to: Math.min(offset + count, fanfics.length),
    length: fanfics.length,
    backURL: createBackURL(query),
    pagination,
    darkMode: Boolean(process.env.DARK_MODE),
  });

  res.header("Content-Type", "text/html");
  res.status(200);
  res.send(html);
});

server.get("/index.css", (_, res) => {
  res.header("Content-Type", "text/css");
  res.send(css);
});

server.get("/search.js", (_, res) => {
  res.header("Content-Type", "text/javascript");
  res.send(searchJS);
});

server.get("/results.js", (_, res) => {
  res.header("Content-Type", "text/javascript");
  res.send(resultsJS);
});

server.get("/help.svg", (_, res) => {
  res.header("Content-Type", "image/svg+xml");
  res.send(helpIcon);
});

server.get("/dark.css", (_, res) => {
  res.header("Content-Type", "text/css");
  res.send(darkCss);
});

server.get("/download/:id/:filename", (req, res) => {
  const stream = app.getFile(req.params.id);
  if (!stream) {
    res.header("Content-Type", "text/plain");
    res.send(`404 Fanfic #${req.params.id} not found`);
    return;
  }

  res.header("Content-Type", "application/epub+zip");
  res.header(
    "Content-Disposition",
    `attachment; filename=${JSON.stringify(encodeURIComponent(req.params.filename))}`,
  );

  stream.pipe(res);
});

async function start() {
  process.stdout.write("Loading fanfics... ");
  await app.initialize();
  process.stdout.write("Done!\n");
  const address = await new Promise<net.AddressInfo>((resolve, reject) => {
    let httpServer = server.listen(
      process.env.BIND_PORT ? Number(process.env.BIND_PORT) : 0,
      process.env.BIND_ADDRESS || "127.0.0.1",
      () => {
        const address = httpServer.address();
        if (address === null || typeof address === "string") {
          return void reject(new Error("Can't start server"));
        }
        resolve(address);
      },
    );
  });
  process.stdout.write(
    `Server listening on http://127.0.0.1:${address.port} (bind ${address.family} ${address.address})\n`,
  );
  if (!process.env.NO_OPEN) {
    process.stdout.write("Opening browser... ");
    await open(`http://127.0.0.1:${address.port}/`);
    process.stdout.write("Done!\n");
  }
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
