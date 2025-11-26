# Depget

A unlix like CLI tool written in typescript for tracking dependants and dependencies in a javascript project
<figure>
    <img src="depget.png" width="300px">
</figure>
Please note that the following is still a work in progress.

Being subject to chage many parts of this tool are not yet in a final or stable version

## Quickstart

A simple use case to find what services import a given package:

```bash
$ depget --json --root src graph/DependencyGraph.ts
```
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

You can also change up the option parameters to get different results
Below is an example on how to get what files import graph/DependencyGraph.ts

```bash
$ depget --reverse --root src graph/DependencyGraph.ts
```
```bash
/home/user/Projects/depget/src/scanner/fileScanner.ts
/home/user/Projects/depget/src/formatter/outputter.ts
/home/user/Projects/depget/src/cli/cli.ts
/home/user/Projects/depget/src/index.ts
```

Get files imported by graph/DependencyGraph.ts

```bash
npx depget --root src graph/DependencyGraph.ts
```
```bash
/home/user/Projects/depget/src/graph/graphNode.ts
```

If you are using an alternate name for your tsconfig, for example react packaged with vite produces the following tsconfig name

```bash
$ depget --tsconfig tsconfig.app.json --reverse --root src graph/DependencyGraph.ts
```
```bash
/home/user/Projects/depget/src/scanner/fileScanner.ts
/home/user/Projects/depget/src/formatter/outputter.ts
/home/user/Projects/depget/src/cli/cli.ts
/home/user/Projects/depget/src/index.ts
```

In case a tsconfig you have provided has not been found you will encounter the following error and not have correctly resolived aliases (if your project uses them)

```bash
$ depget --tsconfig tsconfig.app.json --reverse --root src graph/DependencyGraph.ts
```
```bash
[FileScanner] Warning: tsconfig file tsconfig.app.json not found at or above /home/luka/Projects/depget/src. Aliases will not be resolved.
/home/user/Projects/depget/src/index.ts
```
