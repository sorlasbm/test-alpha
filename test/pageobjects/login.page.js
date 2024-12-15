import Page from './page';
import {logStep} from '../helpers/logger.js';
import BasketPage from './basket.page.js';

class LoginPage extends Page {

  get inputUsername() {
    return $('//input[@id = "loginform-username"]');
  }

  get inputPassword() {
    return $('//input[@id = "loginform-password"]');
  }

  get btnSubmit() {
    return $('//button[@name = "login-button"]');
  }

  async login({ username, password }) {
    if (!username || !password) {
      throw new Error('Не переданы username и password');
    }

    await this.open();

    if (!await this.btnSubmit.isDisplayed()) {
      console.log('Пользователь уже залогинен');
      return;
    }

    logStep(`Логин пользователем: ${username}`);
    await this.inputUsername.setValue(username);
    await this.inputPassword.setValue(password);
    await this.btnSubmit.click();
    await BasketPage.btnBasket.waitForDisplayed();
  }

  url() {
    return super.url('login');
  }
}

export default new LoginPage();
