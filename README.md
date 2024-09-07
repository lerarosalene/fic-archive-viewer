## Fiction archive viewer

### Installation and usage

1. Download `fic-archive-viewer.exe` from **releases** page.
2. Drop `fic-archive-viewer.exe` into root directory of your copy of an archive
3. Run `fic-archive-viewer.exe`, it should start server and open browser tab with interface.

You can close console window with server whenever you are finished. Notice: it won't close
browser tab automatically.

### Build it yourself

Notice: you need `node` version 20.2 or higher.

```
npm ci
npm run codegen
npm run typecheck
npm run build
```

`npm run build` script creates `.js` bundle and `.exe` application. If you are using different OS than Windows,
either adapt build script, or pass `NO_EXE=1` as an environment variable to `npm run build`. You can then drop `.js`
bundle into archive root instead of `.exe` and run it with `node fic-archive-viewer.js`.

### Environment variables

1. `ARCHIVE_PATH` - Where application looks for archive. Defaults to directory where `.exe`/`.js` is.
2. `BIND_PORT` - Which port to listen. Defaults to 0 (system assigns random available port). You can set it manually
to avoid port changing every run.
3. `NO_OPEN` - set it to prevent viewer from opening browser tab.

### TODO

1. Search by dates (publish/update), word count and chapter count
2. Sort results
