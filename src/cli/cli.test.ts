import { test } from "node:test";
import assert from "node:assert";
import { CLI } from "./cli.js";

const root = process.cwd();

test("should return correct json output", () => {
  const cli = new CLI(["--json", "--root", "src", "graph/DependencyGraph.ts"]);
  const result = cli.runScanner();

  const expected = `[
  {
    "file": "${root}/src/graph/DependencyGraph.ts",
    "dependencies": [
      "${root}/src/graph/graphNode.ts"
    ],
    "dependants": [
      "${root}/src/scanner/fileScanner.ts",
      "${root}/src/formatter/outputter.ts",
      "${root}/src/cli/cli.ts",
      "${root}/src/cli/cli.test.ts",
      "${root}/src/index.ts"
    ]
  }
]`;

  assert.strictEqual(result.trim(), expected.trim());
});

test("should return correct json output", () => {
  const cli = new CLI(["-j", "--root", "src", "graph/DependencyGraph.ts"]);
  const result = cli.runScanner();

  const expected = `[
  {
    "file": "${root}/src/graph/DependencyGraph.ts",
    "dependencies": [
      "${root}/src/graph/graphNode.ts"
    ],
    "dependants": [
      "${root}/src/scanner/fileScanner.ts",
      "${root}/src/formatter/outputter.ts",
      "${root}/src/cli/cli.ts",
      "${root}/src/cli/cli.test.ts",
      "${root}/src/index.ts"
    ]
  }
]`;

  assert.strictEqual(result.trim(), expected.trim());
});

test("should return correct reverse default output", () => {
  const cli = new CLI([
    "--reverse",
    "--root",
    "src",
    "graph/DependencyGraph.ts",
  ]);
  const result = cli.runScanner();
  const expected = `${root}/src/scanner/fileScanner.ts
${root}/src/formatter/outputter.ts
${root}/src/cli/cli.ts
${root}/src/cli/cli.test.ts
${root}/src/index.ts`;

  assert.strictEqual(result.trim(), expected.trim());
});

test("should return correct default output", () => {
  const cli = new CLI(["--root", "src", "graph/DependencyGraph.ts"]);
  const result = cli.runScanner();
  const expected = `${root}/src/graph/graphNode.ts`;

  assert.strictEqual(result.trim(), expected.trim());
});

test("should return correct reverse for custom typescript aliases output", () => {
  const cli = new CLI([
    "--tsconfig",
    "tsconfig.app.json",
    "--reverse",
    "--root",
    "src",
    "graph/DependencyGraph.ts",
  ]);
  const result = cli.runScanner();
  const expected = `${root}/src/scanner/fileScanner.ts
${root}/src/formatter/outputter.ts
${root}/src/cli/cli.ts
${root}/src/cli/cli.test.ts
${root}/src/index.ts`;

  assert.strictEqual(result.trim(), expected.trim());
});

test("should ignore non-typescript/javascript files", () => {
  const cli = new CLI(["--root", "src", "../package.json"]);
  const result = cli.runScanner();
  assert.strictEqual(result.trim(), "");
});
