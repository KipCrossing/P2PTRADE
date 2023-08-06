import { spawn } from "child_process";
import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import css from "rollup-plugin-css-only";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import * as fs from "fs";

const production = !process.env.ROLLUP_WATCH;

function bundleScriptToHTML() {
  try {
    // Read 'bundle.js' file
    const scriptData = fs.readFileSync("public/build/bundle.js", "utf-8");

    // Remove newline and tab characters
    // const cleanedScriptData = scriptData.replace(/\$\`/g, "$$`");

    // Read 'template.html' file
    const htmlData = fs.readFileSync("compiled/template.html", "utf-8");

    // Replace placeholder with bundle.js contents
    const splitHtmlData = htmlData.split("** script **");
    const newHtmlData = splitHtmlData[0] + scriptData + splitHtmlData[1];
    // Write new 'index.html' file
    fs.writeFileSync("compiled/index.html", newHtmlData, "utf-8");
    console.log("The file has been saved as index.html");
  } catch (err) {
    console.error(err);
  }
}

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = spawn("npm", ["run", "start", "--", "--dev"], {
        stdio: ["ignore", "inherit", "inherit"],
        shell: true,
      });

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

export default {
  input: "src/main.ts",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
    inlineDynamicImports: true,
  },
  context: "window", // Add this
  moduleContext: "window", // Add this
  plugins: [
    svelte({
      preprocess: sveltePreprocess({ sourceMap: !production }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
      emitCss: false,
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    // css({ output: "bundle.css" }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
      exportConditions: ["svelte"],
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),

    {
      name: "bundle-html",
      writeBundle() {
        bundleScriptToHTML();
      },
    },
  ],
  watch: {
    clearScreen: false,
  },
};
