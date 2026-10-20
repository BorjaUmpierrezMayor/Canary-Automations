import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  target: "es2022",
  outfile: "dist/canary-automations.mjs",
  sourcemap: true,
  platform: "browser",
  logLevel: "info"
});

if (watch) {
  await ctx.watch();
  console.log("[canary-automations] watching for changes...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
