#!/usr/bin/env node
import { GoodCli } from '../dist/cli/index.js';

const cli = new GoodCli();
cli.run(process.argv.slice(2)).then((res) => {
  if (res.stdout.length > 0) {
    console.log(res.stdout.join('\n'));
  }
  if (res.stderr.length > 0) {
    console.error(res.stderr.join('\n'));
  }
  process.exit(res.code);
});
