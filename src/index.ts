#!/usr/bin/env node
import { CLI } from "./cli/cli.js";

const cli = new CLI(process.argv.slice(2));
cli.run();
