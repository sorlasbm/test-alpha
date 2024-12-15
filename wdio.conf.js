import chalk from 'chalk';

export const config = {
  runner: "local",
  specs: ["./test/specs/**/*.js"],
  exclude: [
    // 'path/to/excluded/files'
  ],
  maxInstances: 10,
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        args: ["headless", "disable-gpu"]
      }
    },
    // {
    //   browserName: "firefox",
    //   browserVersion: "stable",
    //   "moz:firefoxOptions": {
    //     args: ['-headless']
    //   }
    // },
    // {
    //   browserName: "safari",
    //   'safari:options': {
    //     technologyPreview: true,
    //   },
    // },
  ],

  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: "error",
  bail: 0,
  baseUrl: 'https://enotes.pointschool.ru',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: ["intercept"],

  framework: "mocha",

  // specFileRetries: 1,
  // specFileRetriesDelay: 0,
  // specFileRetriesDeferred: false,

  reporters: ["spec",
    ["allure", {
      outputDir: "allure-results",
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
    }],
  ],

  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },

  before: async () => {
    await browser.setWindowSize(1920, 1080);
  },

  /**
   * Function to be executed before a test (in Mocha/Jasmine) starts.
   */
  beforeTest: function (test, context) {
    console.log(`${chalk.green('[TEST STARTED]')} - SUITE: ${test.parent}, TEST: ${test.title}`);
  },
  /**
   * Function to be executed after a test (in Mocha/Jasmine only)
   */
  afterTest: async function (
    test,
    context,
    { error, result, duration, passed, retries },
  ) {
    console.log(`${chalk.green('[TEST FINISHED]')} - SUITE: ${test.parent}, TEST: ${test.title}`);
    if (!passed) {
      await browser.takeScreenshot();
    }
  },
};
