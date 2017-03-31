#!/usr/bin/env node
const startTime = Date.now();

const fs = require('fs');
const cp = require('child_process');
const { createWatcher } = require('./watcher');
const createReporter = require('./reporter');
const createState = require('./state');
const colorApi = require('../util/color-api');

const { getState, createIteration } = createState();

const createOnMessage = (fileName, iterationApi, reporter) => {
  return (message) => {
    if (message.type === 'pass') {
      iterationApi.addPass(fileName, message.title);
      reporter.pass(getState(), fileName);
    } else if (message.type === 'fail') {
      iterationApi.addFail(fileName, message.title, message.error);
      reporter.fail(getState(), fileName);
    } else if (message.type === 'report') {
      iterationApi.addReport(fileName, message.payload);
      reporter.report(getState(), fileName);
    }
  };
};

// to get rid of this variable all forked processes need to be canceld
// also the getLast in the reporter might fail when an child process
// from a previous iteration will send a message
let running = false;
const createDisconnect = (reporter, childrenLength) => {
  return () => {
    running = true;
    childrenLength -= 1;
    if (childrenLength === 0) {
      running = false;
      reporter.finish(getState());
    }
  };
};

const execTests = () => {
  const reporter = createReporter(colorApi);
  const disconnect = createDisconnect(reporter, testFiles.length);
  const iterationApi = createIteration();

  testFiles.forEach(testFile => {
    //const child = cp.fork(testFile);
    const child = cp.fork('../tropic/cli/execute', [testFile, 'babel-register']);
    child.on('message', createOnMessage(testFile, iterationApi, reporter));
    child.on('disconnect', disconnect);
  });
};

process.on('exit', () => {
  console.log(`\n${Date.now() - startTime}ms execution time`);
});

const isWatch = arg => arg === '--watch';
const shouldBeWatched = process.argv.slice(2).some(arg => isWatch(arg));
const testFiles = process.argv.slice(2).filter(arg => !isWatch(arg));

if (shouldBeWatched) {
  createWatcher(fs, setInterval, (files) => {
    console.log(`changes: ${files.join(', ')}\n`);
    if (!running) {
      execTests();
    }
  });
}

// also the getLast in the reporter might fail when an child process
// from a previous iteration will send a message
execTests();
