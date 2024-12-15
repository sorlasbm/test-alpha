import Page from './page';
import {logStep} from '../helpers/logger.js';
import {waitForTextToBeUpdated} from '../helpers/common-helper.js';
import ApiHelper from "../helpers/api-helper.js";

class BasketPage extends Page {
  url() {
    return super.url("basket");
  }

  get btnBasket() {
    return $("#dropdownBasket");
  }

  get btnGoToBasket() {
    return $('[role="button"][href="/basket"]');
  }

  get dropdownBasket() {
    return $('[aria-labelledby="dropdownBasket"]');
  }

  get basketCountItemsIcon() {
    return $(".basket-count-items");
  }

  basketItemById(productId) {
    return $(`.basket-item[data-product="${productId}"]`);
  }

  async getBasketItemNameById(productId) {
    const basketItem = await this.basketItemById(productId);
    const name = await basketItem.$(".basket-item-title").getText();
    logStep(`Название товара в корзине с ID=${productId}: ${name}`);
    return name;
  }

  async getBasketItemPriceById(productId) {
    const basketItem = await this.basketItemById(productId);
    const priceStr = await basketItem.$(".basket-item-price").getText();
    const price = parseInt(priceStr.replace(/[^\d]/g, ""), 10);
    logStep(`Цена товара в корзине с ID=${productId}: ${price}`);
    return price;
  }

  async checkCountOnBasketIcon(expectedCount) {
    await waitForTextToBeUpdated(this.basketCountItemsIcon, expectedCount, {
      timeout: 5000,
    });
    const actualCount = await this.basketCountItemsIcon.getText();
    logStep(
      `Проверка количества товара на иконке корзины: Ожидаем - ${expectedCount}, Фактически - ${actualCount}`,
    );
    expect(Number(actualCount)).toEqual(expectedCount);
  }

  async clickBasket() {
    logStep('Клик на кнопку "Корзина"');
    await this.btnBasket.scrollIntoView();
    await this.btnBasket.waitForClickable();
    await this.btnBasket.click();
    await this.checkDropdownBasketDisplayed();
  }

  async checkDropdownBasketDisplayed() {
    logStep("Проверка отображения выпадающего списка корзины");
    await this.dropdownBasket.waitForDisplayed({ timeout: 2000 });
  }

  async goToBasket() {
    logStep("Клик на кнопку перехода в корзину");
    await this.btnGoToBasket.click();
  }

  // Проверка имени, цены товара и общей суммы в корзине (через UI)
  async verifyBasketItemById(productId, expectedName, expectedPrice) {
    const actualName = await this.getBasketItemNameById(productId);
    expect(actualName).toEqual(expectedName);

    const actualPrice = await this.getBasketItemPriceById(productId);
    expect(actualPrice).toEqual(expectedPrice);

    const totalBasketPrice = await this.getTotalBasketPrice();
    expect(totalBasketPrice).toEqual(expectedPrice);

    logStep(
      `Успешная проверка товара с ID=${productId}. Название: "${expectedName}", Цена: ${expectedPrice}`,
    );
  }

  async getTotalBasketPrice() {
    const totalPrice = await $('[class="basket_price"]').getText();
    logStep(`Итоговая стоимость корзины: ${totalPrice}`);
    return parseInt(totalPrice, 10);
  }


  /**
   * Добавление продуктов в корзину (через api)
   *
   * @param {Object[]} products - Массив продуктов (получаем через ApiHelper.getProducts()).
   * @param {number} [count=1] - Количество каждого товара.
   * @param {boolean} [isDiscounted=false] - Указывает добавлять товары со скидкой или без нее.
   * @param {number} [uniqueCount=0] - Количество уникальных товаров (если нужно добавлять разные товары).
   */
  async addProductToBasket({
    products,
    count = 1,
    isDiscounted = false,
    uniqueCount = 0,
  }) {

 const addedProducts = [];

    // Фильтруем товары по наличию скидки или без нее
    const filteredProducts = products.filter((product) =>
      isDiscounted ? product.discount > 0 : product.discount === 0,
    );

    if (uniqueCount === 0) {
      // Добавляем только один товар (первый из отфильтрованных)
      const productToAdd = filteredProducts[0];
      await ApiHelper.addProductToBasket(productToAdd.id, count);
      addedProducts.push({
        ...productToAdd,
        price:
          (productToAdd.price - (isDiscounted ? productToAdd.discount : 0)) *
          count,
        count,
      });
    } else {
      // Добавляем несколько разных товаров
      const uniqueProducts = filteredProducts.slice(0, uniqueCount);
      for (const product of uniqueProducts) {
        await ApiHelper.addProductToBasket(product.id, count);
        addedProducts.push({
          ...product,
          price:
            (product.price - (isDiscounted ? product.discount : 0)) * count,
          count,
        });
      }
    }

    return addedProducts;
  }

  // Получает товары в корзине через api и сравнивает их с ожидаемым списком товаров
  async verifyBasketProducts(expectedProducts, expectedLength) {
    // Получаем содержимое корзины
    const basketProducts = (await ApiHelper.getBasketItems()).basket;

    // Удаляем свойство type из массива добавленных продуктов для последующего сравнения с массивом продуктов из корзины
    const productsWithoutTypeField = expectedProducts.map(
      ({ type, ...rest }) => rest,
    );

    // Проверяем количество продуктов в корзине
    logStep(
      `Проверка количества продуктов в корзине. Ожидаем: ${expectedLength}, Фактически: ${basketProducts.length}`,
    );
    expect(basketProducts).toHaveLength(expectedLength);

    // Проверяем, список товаров в корзине соответствует ожидаемому списку товаров
    logStep("Проверяем, что в корзине содержатся ожидаемые продукты");
    expect(basketProducts).toEqual(
      expect.arrayContaining(productsWithoutTypeField),
    );
  }
}

export default new BasketPage();