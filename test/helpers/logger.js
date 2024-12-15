import AllureReporter from '@wdio/allure-reporter';

export function logStep (message, prefix = '[STEP]') {
    console.log(`${prefix}: ${message}`); // Лог в консоль
    AllureReporter.addStep(message);  // Лог в Allure
}