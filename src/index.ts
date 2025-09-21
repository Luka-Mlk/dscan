import path from "path";
import fs from "fs";
import DependencyGraph from "./graph/dependency.js";
import Cli from "./cli/cli.js";
import { ImportResolver } from "./resolver/import.js";

console.log(1);

const cli = new Cli();
// command validation
if (!cli.validInputs()) {
  process.exit(1);
}

console.log(2);

const { files, verbose, depth, outputJson } = cli.parseInput();

console.log(files, verbose, depth, outputJson);

console.log(3);

const resolvedFiles = files.map((f) => path.resolve(process.cwd(), f));

console.log(4);

if (verbose) {
  console.log("Changed files:");
  resolvedFiles.forEach((file) => {
    console.log(" -", file);
  });
}

console.log(5);

const resolver = new ImportResolver();
const graph = new DependencyGraph();

console.log(6);

for (const file of resolvedFiles) {
  graph.addFile(file);
  const deps = resolver.extract(file);
  for (const dep of deps) {
    graph.addDependency(file, dep);
  }
}

console.log(7);

console.log(resolvedFiles);

// Output dependencies
for (const file of resolvedFiles) {
  const deps = graph.getAllDependencies(file, new Set(), depth);

  console.log(8);

  if (outputJson) {
    console.log(JSON.stringify({ file, deps: Array.from(deps) }, null, 2));
    console.log(9);
  } else if (verbose) {
    console.log(10);
    console.log(`\nDependencies of ${file}:`);
    if (deps.length === 0) {
      console.log(11);
      console.log("   (no dependencies found)");
    } else {
      for (const dep of deps) {
        console.log(12);
        console.log("   ->", dep);
      }
    }
  } else {
    console.log(13);
    // Default: just print dependencies directly (one per line)
    for (const dep of deps) {
      console.log(dep);
    }
  }
}
