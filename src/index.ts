import path from "path";
import fs from "fs";
import DependencyGraph from "./graph/dependency.js";
import Cli from "./cli/cli.js";
import { ImportResolver } from "./resolver/import.js";

const cli = new Cli();
// command validation
if (!cli.validInputs()) {
  process.exit(1);
}

const { files, verbose, depth, outputJson } = cli.parseInput();

const resolvedFiles = files.map((f) => path.resolve(process.cwd(), f));

if (verbose) {
  console.log("Changed files:");
  resolvedFiles.forEach((file) => {
    console.log(" -", file);
  });
}

const resolver = new ImportResolver();
const graph = new DependencyGraph();

for (const file of resolvedFiles) {
  graph.addFile(file);
  const deps = resolver.extract(file);
  for (const dep of deps) {
    graph.addDependency(file, dep);
  }
}

// Output dependencies
for (const file of resolvedFiles) {
  const deps = graph.getAllDependencies(file, new Set(), depth);

  if (outputJson) {
    console.log(JSON.stringify({ file, deps: Array.from(deps) }, null, 2));
  } else if (verbose) {
    console.log(`\nDependencies of ${file}:`);
    if (deps.length === 0) {
      console.log("   (no dependencies found)");
    } else {
      for (const dep of deps) {
        console.log("   ->", dep);
      }
    }
  } else {
    // Default: just print dependencies directly (one per line)
    for (const dep of deps) {
      console.log(dep);
    }
  }
}
