#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0
const [type] = require('yargs').demandCommand(1).argv._;

const execSync = require('child_process').execSync;

const TYPES = ['major', 'minor', 'patch', 'prerelease'];

if (!TYPES.includes(type)) {
  throw new Error(`Invalid version bump "${type}", expected one of ${TYPES.join(', ')}`);
}

console.log('$ update versions', process.argv.slice(2).join(' '));
console.log(`yarn version --${type}`);
execSync(`yarn version --${type}`);

try {
  execSync('yarn');
} catch (e) {
  console.log('! $YARN failed');
  console.log(e);
}
