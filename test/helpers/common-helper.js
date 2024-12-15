import {logStep} from './logger.js';
import { urlIs } from 'wdio-wait-for';

/**
 * Проверяет соответствие текущего URL ожидаемому.
 * @param {string} expectedUrl - Ожидаемый URL.
 */
export async function checkUrlIs(expectedUrl) {
    logStep(`Проверка, что URL равен ${expectedUrl}`);
    await browser.waitUntil(
        urlIs(expectedUrl),
        {
            timeout: 5000,
            timeoutMsg: `Текущий URL не соответствует ожидаемому: ${expectedUrl}`,
        }
    );
}


/**
 * Дожидается обновления текста элемента до ожидаемого значения.
 *
 * @param {WebdriverIO.Element} element - Элемент, текст которого нужно проверить.
 * @param {string|number} expectedText - Ожидаемое значение в тексте элемента.
 * @param {number} [timeout=5000] - Максимальное время ожидания в мс.
 */
export async function waitForTextToBeUpdated(element, expectedText, timeout = 5000) {
    await browser.waitUntil(
        async () => {
            const actualText = await element.getText();
            return actualText === String(expectedText); // Преобразуем в строку в случае чисел
        },
        {
            timeout,
            timeoutMsg: `Ожидание обновления текста элемента до "${expectedText}" превысило ${timeout} мс`
        }
    );
}