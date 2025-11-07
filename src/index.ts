import { CLI } from "./cli/cli.js";

// Done as so not to parse the first 2 arguments from node cli apps
const cli = new CLI(process.argv.slice(2));
cli.runScanner();
