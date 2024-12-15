import LoginPage from '../pageobjects/login.page';
import MainPage from '../pageobjects/main.page';
import ApiHelper from '../helpers/api-helper.js';
import BasketPage from '../pageobjects/basket.page.js';
import {checkUrlIs} from '../helpers/common-helper.js';

import {users} from "../data/users.js";

// Для 2 и 3 тест-кейса
const testCases = [
    { description: '2. Переход в корзину с 1 неакционным товаром', isDiscounted: false },
    { description: '3. Переход в корзину с 1 акционным товаром', isDiscounted: true }
];

describe('Тесты корзины', () => {

    beforeEach( async () => {
        await LoginPage.login(users.testUser);
        await ApiHelper.clearBasket();
    })

    afterEach( async () => {
        await ApiHelper.clearBasket();
        await ApiHelper.logout();
    })

    it('1. Переход в пустую корзину', async () => {
        // Клик по корзине с проверкой отображения дропдауна
        await BasketPage.clickBasket();

        // Переход в корзину и проверка url
        await BasketPage.goToBasket();
        await checkUrlIs(BasketPage.url());
    })

    // 2 и 3 тест кейсы - тесты с 1 товаром в корзине (проверки через UI)
    testCases.forEach(({ description, isDiscounted }) => {
        it(description, async () => {
            // Добавляем в корзину случайный товар со скидкой/без скидки
            const productId = await MainPage.addRandomProductToBasket(isDiscounted);

            // Проверяем количество товара на иконке корзины
            await BasketPage.checkCountOnBasketIcon(1);

            // Получаем имя и цену товара из карточки на главной странице
            const productName = await MainPage.getProductNameById(productId);
            const productPrice = await MainPage.getProductPriceById(productId);

            // Проверка данных товара в дропдауне корзины
            await BasketPage.clickBasket();
            await BasketPage.verifyBasketItemById(productId, productName, productPrice);

            // Переход в корзину и проверка url
            await BasketPage.goToBasket();
            await checkUrlIs(BasketPage.url());
        });
    })

    it('4. Переход в корзину с 9 разными товарами', async () => {
         // Получаем список товаров c 2-ух страниц
        const products = await ApiHelper.getProducts();
        const addedProducts = [];

        // Добавляем 1 акционный товар
        const discountedProduct = await BasketPage.addProductToBasket({
            products,
            count: 1,
            isDiscounted: true,
        });
        addedProducts.push(...discountedProduct);

        // Делаем массив продуктов без уже добавленного акционного товара
        const filteredProducts = products.filter(product => product.id !== discountedProduct[0].id);

        // Добавляем 8 разных товаров
        const uniqueProducts = await BasketPage.addProductToBasket({
            products: filteredProducts,
            uniqueCount: 8,
        });
        addedProducts.push(...uniqueProducts);

        // Проверяем количество товара на иконке корзины (нужен рефреш страницы при добавлении через api)
        await browser.refresh();
        await BasketPage.checkCountOnBasketIcon(9);

        // Проверяем, что в корзине именно те продукты, которые мы в нее добавляли
        await BasketPage.verifyBasketProducts(addedProducts, 9);

        // !!! Проверки ниже завалят тест, т.к. дропдаун корзины не показывается, когда в ней 9 товаров
        // Клик по корзине с проверкой отображения дропдауна
        await BasketPage.clickBasket();

        // Переход в корзину и проверка url
        await BasketPage.goToBasket();
        await checkUrlIs(BasketPage.url());
    });

    it('5. Переход в корзину с 9 акционными товарами одного наименования', async () => {
        // Получаем список товаров c 2-ух страниц
        const products = await ApiHelper.getProducts();

        // Добавляем акционный товар в количестве 9шт
        const addedProducts = await BasketPage.addProductToBasket({
            products,
            count: 9,
            isDiscounted: true,
        });

        // Проверяем количество товара на иконке корзины (нужен рефреш страницы при добавлении через api)
        await browser.refresh();
        await BasketPage.checkCountOnBasketIcon(9);

        // Проверяем, что в корзине именно те продукты, которые мы в нее добавляли
        await BasketPage.verifyBasketProducts(addedProducts, 1);

        // !!! Проверки ниже завалят тест, т.к. дропдаун корзины не показывается, когда в ней 9 товаров
        // Клик по корзине с проверкой отображения дропдауна
        await BasketPage.clickBasket();

        // Переход в корзину и проверка url
        await BasketPage.goToBasket();
        await checkUrlIs(BasketPage.url());
    });
})

