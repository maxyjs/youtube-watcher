#!/usr/bin/env node
const generalProcessController = require('./process/generalProcessController');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

async function App() {
  let testMode = false;

  const argv = yargs(hideBin(process.argv)).argv;
  const { user: userName, test, listQueriesPath } = argv;
  testMode = !!test;

  if (!userName) {
    console.error("Require argument --user='username'");
    process.exit(1);
  }

  await generalProcessController(userName, {
    testMode,
    listQueriesPath,
  });

  process.exit(0);
}

App().catch((error) => {
  console.error(error);
  process.exit(1);
});
