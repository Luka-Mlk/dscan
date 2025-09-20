import path from "path";

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("Usage: my-cli <files...>");
  process.exit(1);
}

const resolvedFiles = files.map((f) => path.resolve(process.cwd(), f));

console.log("Changed files:");
resolvedFiles.forEach((file) => {
  console.log(" -", file);
});

// TODO: Here you will run LSP or dependency graph lookups
