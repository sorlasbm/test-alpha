import Page from "./page";
import { logStep } from "../helpers/logger.js";

class MainPage extends Page {
  productCardsSelector(hasDiscount = false) {
    return $$(
      `div.note-item${hasDiscount ? ".hasDiscount" : ":not(.hasDiscount)"}`,
    );
  }

  productItemById(productId) {
    return $(`div .note-item[data-product="${productId}"]`);
  }

  async getProductNameById(productId) {
    const product = await this.productItemById(productId);
    const name = await product.$(".product_name").getText();
    logStep(`Название товара с ID=${productId}: ${name}`);
    return name;
  }

  async getProductPriceById(productId) {
    const product = await this.productItemById(productId);
    const priceStr = await product.$(".product_price").getText();
    const [currentPrice] = priceStr.match(/\d+/) || [];
    const price = parseInt(currentPrice, 10);
    logStep(`Цена товара с ID=${productId}: ${price}`);
    return price;
  }

  async getRandomProduct(hasDiscount = false) {
    const products = await this.productCardsSelector(hasDiscount);
    if (!hasDiscount) products.pop()
    if (products.length === 0) {
      throw new Error(
        `Не найдено товаров с параметром hasDiscount=${hasDiscount}`,
      );
    }
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
  }

  // Добавление случайного товара в корзину (через UI), возвращает productId
  async addRandomProductToBasket(hasDiscount = false) {
    logStep(`Выбираем случайный товар (hasDiscount=${hasDiscount})`);
    const product = await this.getRandomProduct(hasDiscount);
    const productId = await product.getAttribute("data-product"); // Получаем уникальный ID товара
    logStep(`Выбран товар с ID=${productId}`);
    const addToBasketButton = await product.$(".actionBuyProduct"); // Кнопка добавления
    await addToBasketButton.scrollIntoView();
    await addToBasketButton.click();
    logStep(`Товар с ID=${productId} добавлен в корзину`);
    return productId;
  }
}

export default new MainPage();