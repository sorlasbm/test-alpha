import axios from 'axios';
import { logStep } from './logger.js';

class ApiHelper {
    constructor() {
        this.baseURL = browser.options.baseUrl;
        this.client = axios.create({
            baseURL: this.baseURL,
            withCredentials: true,
        });
    }


    async getCookieHeader() {
        const cookies = await browser.getCookies();
        return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    }


    async getCsrfToken() {
        const csrfToken = await browser.execute(() => {
            return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        });

        if (!csrfToken) {
            throw new Error("Не удалось получить CSRF-токен");
        }

        return csrfToken;
    }


    async clearBasket() {
        logStep('Очистка корзины');
        try {
            const cookieHeader = await this.getCookieHeader();
            const csrfToken = await this.getCsrfToken();

            const response = await this.client.post(
                "/basket/clear",
                {},
                {
                    headers: {
                        "Cookie": cookieHeader,
                        "X-CSRF-Token": csrfToken,
                    },
                }
            );
            console.log(`Корзина успешно очищена: ${response.status} ${response.statusText}`);
        } catch (error) {
            console.error(`Ошибка очистки корзины: ${error.message}`);
            throw error;
        }
    }


    async logout() {
        logStep('Выход из аккаунта');
        try {
            const cookieHeader = await this.getCookieHeader();
            const csrfToken = await this.getCsrfToken();

            const response = await this.client.post(
                "/site/logout",
                {},
                {
                    headers: {
                        "Cookie": cookieHeader,
                        "X-CSRF-Token": csrfToken,
                    },
                }
            );
            console.log(`Успешный выход из аккаунта: ${response.status} ${response.statusText}`);
        } catch (error) {
            console.error(`Ошибка при попытке выйти из аккаунта: ${error.message}`);
            throw error;
        }
    }

    async getProducts() {
        logStep('Получение списка продуктов с 2-ух страниц');

        try {
            const cookieHeader = await this.getCookieHeader();
            const csrfToken = await this.getCsrfToken();
            const headers = {
                "Cookie": cookieHeader,
                "X-CSRF-Token": csrfToken,
            };

            // Для запроса продуктов с конкретной страницы
            const getProductsByPage = async (page) => {
                const response = await this.client.post(
                    "/product/get", // Эндпоинт
                    `filters=search%3D%26price-from%3D%26price-to%3D&action=&page=${page}`,
                    { headers }
                );
                return response.data.products;
            };

            const page1Products = await getProductsByPage(1);
            const page2Products = await getProductsByPage(2);

            // Объединяем продукты в 1 массив
            const allProducts = [...page1Products, ...page2Products];

            logStep(`Количество продуктов: ${allProducts.length}`);
            return allProducts;
        } catch (error) {
            console.error(`Ошибка получения продуктов: ${error.message}`);
            throw error;
        }
    }

    async addProductToBasket(productId, count = 1) {
        logStep(`Добавление товара в корзину: продукт ID=${productId}, количество=${count}`);

        try {
            const cookieHeader = await this.getCookieHeader();
            const csrfToken = await this.getCsrfToken();
            const headers = {
                "Cookie": cookieHeader,
                "X-CSRF-Token": csrfToken,
            };
            const body = `product=${productId}&count=${count}`;
            const response = await this.client.post(
                "/basket/create",
                body,
                { headers }
            );

            console.log(`Продукт успешно добавлен: ${response.status} ${response.statusText}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка добавления продукта в корзину: ${error.message}`);
            throw error;
        }
    }

    async getBasketItems() {
        logStep('Получение списка товаров в корзине');

        try {
            const cookieHeader = await this.getCookieHeader();
            const csrfToken = await this.getCsrfToken();
            const headers = {
                "Cookie": cookieHeader,
                "X-CSRF-Token": csrfToken,
            };
            const response = await this.client.post(
                "/basket/get",
                {},
                { headers }
            );

            console.log(`Список товаров в корзине успешно получен: ${response.status} ${response.statusText}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка получения списка товаров в корзине: ${error.message}`);
            throw error;
        }
    }
}

export default new ApiHelper();