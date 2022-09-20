#!/usr/bin/env node
// Copyright 2017-2020 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const path = require('path');
const [type] = require('yargs').demandCommand(1).argv._;

const execSync = require('child_process').execSync;

const TYPES = ['major', 'minor', 'patch', 'prerelease'];

if (!TYPES.includes(type)) {
  throw new Error(`Invalid version bump "${type}", expected one of ${TYPES.join(', ')}`);
}

function updateDependencies(dependencies, others, version) {
  return Object.entries(dependencies)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce((result, [key, value]) => {
      result[key] = others.includes(key) && value !== '*' ? (value.startsWith('^') ? `^${version}` : version) : value;

      return result;
    }, {});
}

console.log('$ update versions', process.argv.slice(2).join(' '));
console.log(`yarn version --${type}`);
execSync(`yarn version --${type}`);

// yarn workspaces does an OOM, manual looping takes ages
const { version } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
console.log(`Updating types version ${version}`);

const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath));
const others = [packageJson.name];
const updated = Object.keys(packageJson).reduce((result, key) => {
  if (key === 'version') {
    result[key] = version;
  } else if (
    ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies', 'resolutions'].includes(key)
  ) {
    result[key] = updateDependencies(packageJson[key], others, version);
  } else {
    result[key] = json[key];
  }

  return result;
});

fs.writeFileSync(packagePath, `${JSON.stringify(updated, null, 2)}\n`);

try {
  execSync('yarn');
} catch (e) {
  console.log('! $YARN failed');
  console.log(e);
}
