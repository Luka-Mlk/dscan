import path from "path";
import fs from "fs";
import DependencyGraph from "./graph/dependency.js";
import { ImportResolver } from "./resolver/import.js";

const args = process.argv.slice(2);

// CLI options
let depth = Infinity;
let outputJson = false;
let verbose = false;

const files: string[] = [];

// Parse args
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--depth" && args[i + 1]) {
    depth = Number(args[i + 1]);
    i++;
  } else if (args[i] === "--json") {
    outputJson = true;
  } else if (args[i] === "--verbose") {
    verbose = true;
  } else {
    files.push(args[i] as string);
  }
}

if (files.length === 0) {
  console.error("Usage: my-cli [--depth N] [--json] [--verbose] <files...>");
  process.exit(1);
}

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
