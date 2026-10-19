import { build } from "esbuild";
import { copyFile, mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outdir = "assets/js/mermaid";
const result = await build({
  entryPoints: ["_javascript/mermaid.js"],
  outdir,
  bundle: true,
  format: "esm",
  splitting: true,
  minify: true,
  sourcemap: false,
  legalComments: "external",
  chunkNames: "[name]-[hash]",
  write: false,
});

// Only replace this generated directory after a successful build. Remove old
// hashed chunks so upgrades do not leave unused renderer versions in the site.
await mkdir(outdir, { recursive: true });
for (const name of await readdir(outdir)) {
  if (/\.(?:js|css|LEGAL\.txt)$/.test(name)) await unlink(join(outdir, name));
}
for (const file of result.outputFiles) await writeFile(file.path, file.contents);
await copyFile("node_modules/mermaid/LICENSE", join(outdir, "LICENSE.txt"));
console.log(`Built Mermaid: ${result.outputFiles.length} files, ${Math.round(result.outputFiles.reduce((size, file) => size + file.contents.length, 0) / 1024)} KiB total (loaded on demand).`);
