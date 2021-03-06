const { miniTest, miniTestReport, createSpy } = require('../util/mini-test')()
const assert = require('assert')
const { createRunner } = require('./runner')

const options = { timeout: 200 }

miniTest('createRunner returns function executeTestsWithState', () => {
  const noop = () => {}
  const executeTestsWithState = createRunner(noop, noop, noop, options)
  assert.strictEqual(Object.prototype.toString.call(executeTestsWithState), '[object Function]')
})

miniTest('executeTestsWithState calls the tests', () => {
  const logPass = () => {}
  const logFail = () => {}
  const logReport = () => {}
  const executeTestsWithState = createRunner(logPass, logFail, logReport, options)

  const createTestSpy = () => {
    return {
      title: 'test spy',
      callback: createSpy()
    }
  }

  const state = {
    test: [createTestSpy(), createTestSpy()],
    only: [],
    skip: []
  }

  executeTestsWithState(state)
  assert.strictEqual(state.test[0].callback.args.length, 1)
  assert.strictEqual(state.test[1].callback.args.length, 1)
})

miniTest('executeTestsWithState calls the only tests', () => {
  const logPass = () => {}
  const logFail = () => {}
  const logReport = () => {}
  const executeTestsWithState = createRunner(logPass, logFail, logReport, options)

  const createTestSpy = () => {
    return {
      title: 'test spy',
      callback: createSpy()
    }
  }

  const state = {
    test: [],
    only: [createTestSpy(), createTestSpy()],
    skip: []
  }

  executeTestsWithState(state)
  assert.strictEqual(state.only[0].callback.args.length, 1)
  assert.strictEqual(state.only[1].callback.args.length, 1)
})

miniTest('executeTestsWithState does not call the skip tests', () => {
  const logPass = () => {}
  const logFail = () => {}
  const logReport = () => {}
  const executeTestsWithState = createRunner(logPass, logFail, logReport, options)

  const createTestSpy = () => {
    return {
      title: 'test spy',
      callback: createSpy()
    }
  }

  const state = {
    test: [],
    only: [],
    skip: [createTestSpy(), createTestSpy()]
  }

  executeTestsWithState(state)
  assert.strictEqual(state.skip[0].callback.args.length, 0)
  assert.strictEqual(state.skip[1].callback.args.length, 0)
})

miniTestReport()
