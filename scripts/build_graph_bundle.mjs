import { build } from "esbuild";

await build({
  entryPoints: ["_javascript/knowledge-graph.js"],
  outfile: "assets/js/knowledge-graph.min.js",
  bundle: true,
  format: "iife",
  minify: true,
  sourcemap: false,
  legalComments: "external",
  banner: {
    js: "/*! NeoXMind knowledge graph bundle; rendered with PixiJS and laid out with d3-force */",
  },
});
