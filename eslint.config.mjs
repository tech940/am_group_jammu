import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Five homepage builds that were abandoned and are imported by no route
    // (the live homepage is components/homepage). They are kept as a record,
    // not maintained, so they are not linted: one of them fails a rule added
    // after it was written, and fixing code nobody runs is not worth the risk.
    "components/editorial-home/**",
    "components/story/**",
    "components/worldclass-home/**",
    "components/ferrari-home/**",
    // components/home is the fifth, EXCEPT content.ts, which live pages read
    // for the group's history. The files are ignored one level down (not the
    // directory itself) because a file inside an ignored directory cannot be
    // un-ignored.
    "components/home/**/*",
    "!components/home/content.ts",
  ]),
  // The loose .js files at the top of the repository are one-off Node scripts
  // (photo uploads, a database inspection) run by hand with `node file.js`.
  // They are CommonJS, so `require()` is how they are meant to import.
  {
    files: ["*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);

export default eslintConfig;
