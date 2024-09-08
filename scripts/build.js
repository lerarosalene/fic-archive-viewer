const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const esbuild = require("esbuild");

const fsp = fs.promises;

function system(command, args, opts) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: "inherit",
      ...(opts || {}),
    });
    process.on("exit", (code) => {
      if (code === 0) {
        return void resolve();
      }

      if (code === null) {
        return void reject(new Error(`Process exited abruptly`));
      }

      reject(new Error(`Process exited with code ${code}`));
    });
  });
}

async function main() {
  await esbuild.build({
    entryPoints: [path.join("src", "index.ts")],
    outfile: path.join("dist", "fic-archive-viewer.js"),
    bundle: true,
    minify: true,
    platform: "node",
    loader: {
      ".css": "text",
      ".txt": "text",
      ".svg": "text",
    },
    define: { "import.meta.url": `_importMetaUrl` },
    banner: {
      js: "const _importMetaUrl=require('url').pathToFileURL(__filename)",
    },
  });

  if (process.env.NO_EXE) {
    return;
  }

  await system("node", ["--experimental-sea-config", "sea-config.json"]);
  await fsp.copyFile(
    process.execPath,
    path.join("dist", "fic-archive-viewer.exe")
  );

  const postjectConfig = JSON.parse(
    await fsp.readFile(require.resolve("postject/package.json"), "utf-8")
  );

  await system("node", [
    path.join(
      path.dirname(require.resolve("postject/package.json")),
      postjectConfig.bin.postject
    ),
    path.join("dist", "fic-archive-viewer.exe"),
    "NODE_SEA_BLOB",
    path.join("dist", "fic-archive-viewer.blob"),
    "--sentinel-fuse",
    "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
  ]);

  await fsp.unlink(path.join("dist", "fic-archive-viewer.blob"));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
