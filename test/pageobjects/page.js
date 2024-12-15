import { logStep } from "../helpers/logger.js";

export default class Page {
  url(path) {
      return path
      ? `${browser.options.baseUrl}/${path}`
      : browser.options.baseUrl;
  }

  open() {
    logStep(`Открытие страницы: ${this.url()}`);
    return browser.url(this.url());
  }
}
