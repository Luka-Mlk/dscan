# Depget

Depget is a command-line tool written in TypeScript that helps you track dependencies and dependants in JavaScript projects

<figure>
    <img src="depget.png" width="300px">
</figure>

## Quickstart

Depget allows you to quickly identify which files in your project are importing or being imported by specific packages. Here’s a simple example to get started.

### Example: Find files that import a given package

```bash
$ depget --json --root src graph/DependencyGraph.ts
```

#### Output

```bash
{
  "file": "/home/user/Projects/depget/src/graph/DependencyGraph.ts",
  "dependencies": [
    "/home/user/Projects/depget/src/graph/graphNode.ts"
  ],
  "dependants": [
    "/home/user/Projects/depget/src/scanner/fileScanner.ts",
    "/home/user/Projects/depget/src/formatter/outputter.ts",
    "/home/user/Projects/depget/src/cli/cli.ts",
    "/home/user/Projects/depget/src/index.ts"
  ]
}
```

This output shows the files that are imported by DependencyGraph.ts as well as the files that import it.

### Example: Find files that import `DependencyGraph.ts`

To get a list of files that import DependencyGraph.ts, use the --reverse flag:

```bash
$ depget --reverse --root src graph/DependencyGraph.ts
```

#### Output

```bash
/home/user/Projects/depget/src/scanner/fileScanner.ts
/home/user/Projects/depget/src/formatter/outputter.ts
/home/user/Projects/depget/src/cli/cli.ts
/home/user/Projects/depget/src/index.ts
```

### Example: Get files imported by `DependencyGraph.ts`

To find the files that DependencyGraph.ts imports, simply run:

```bash
npx depget --root src graph/DependencyGraph.ts
```
#### Output

```bash
/home/user/Projects/depget/src/graph/graphNode.ts
```

### Example: Using a custom `tsconfig` file

If your project uses a custom tsconfig file (e.g., tsconfig.app.json), you can specify it with the `--tsconfig` option:

```bash
$ depget --tsconfig tsconfig.app.json --reverse --root src graph/DependencyGraph.ts
```

#### Output

```bash
/home/user/Projects/depget/src/scanner/fileScanner.ts
/home/user/Projects/depget/src/formatter/outputter.ts
/home/user/Projects/depget/src/cli/cli.ts
/home/user/Projects/depget/src/index.ts
```

### Handling Missing tsconfig Files

If the tsconfig file specified does not exist or cannot be found, you will see a warning message like this:

```bash
$ depget --tsconfig tsconfig.app.json --reverse --root src graph/DependencyGraph.ts
```

#### Warning output

```bash
[FileScanner] Warning: tsconfig file tsconfig.app.json not found at or above /home/luka/Projects/depget/src. Aliases will not be resolved.
/home/user/Projects/depget/src/index.ts
```

## Limitations

- Aliased imports through package.json (Import Maps): Depget currently does not support resolving module imports that are aliased through the imports field in package.json
