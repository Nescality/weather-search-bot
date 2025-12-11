const { WeatherService } = require('../services/WeatherService');
const { Keyboard } = require("grammy");

class WeatherHandler {
    static weatherRequests = new Map();
    static locationRequests = new Map();

    static getMainKeyboard () {
        return new Keyboard()
        .text("🌤️ Узнать погоду")
        .resized();
    }

    static getWeatherMethodKeyboard() {
        return new Keyboard()
            .text("🏙️ По названию города")
            .text("📍 По геолокации")
            .row()
            .text("↩️ Назад в меню")
            .resized();
    }

    static getWeatherRequestKeyboard() {
        return new Keyboard()
            .text("❌ Отменить запрос погоды")
            .resized();
    }

    static getWeatherResultKeyboard() {
        return new Keyboard()
            .text("🔄 Новый запрос погоды")
            .text("📍 Погода по местоположению")
            .text("↩️ Вернуться в главное меню")
            .resized();
    }

    static getLocationRequestKeyboard() {
        return {
            keyboard: [[{
                text: "📍 Отправить местоположение",
                request_location: true
            }], [{
                text: "❌ Отменить"
            }]],
            resize_keyboard: true,
            one_time_keyboard: true
        };
    }

    static startWeatherRequest(ctx) {
        this.weatherRequests.set(ctx.from.id, true);
        return ctx.reply(
            "🌤️ Введите название города.",
            {
                reply_markup: this.getWeatherRequestKeyboard()
            }
        );
    }
    static startLocationRequest(ctx) {
        this.locationRequests.set(ctx.from.id, true);
        return ctx.reply(
            `📍 Для определения погоды по вашему местоположению:\n\n` +
            `1. Нажмите кнопку "📍 Отправить местоположение"\n` +
            `2. Или отправьте геолокацию вручную через 📎 (скрепка)\n` +
            `3. Выберите "Геолокация" и отправьте`,
            {
                reply_markup: this.getLocationRequestKeyboard()
            }
        );
    }

    static async handleWeatherInput(ctx) {
        try {
            const city = ctx.message.text;
            const userId = ctx.from.id; 

            if (!this.weatherRequests.has(userId)) {
                await ctx.reply("Пожалуйста, начните запрос погоды через меню");
                return;
            }

            await ctx.reply("⏳ Запрашиваю погоду...");

            const weather = await WeatherService.getWeather(city);
            const weatherMessage = this.formatWeatherMessage(weather);

            await ctx.reply(
                weatherMessage,
                { reply_markup: this.getWeatherResultKeyboard() }
            );

            this.weatherRequests.set(userId, "result");
        } catch (error) {
            await ctx.reply(
                error.message,
                { reply_markup: this.getWeatherResultKeyboard() }
            );
            this.weatherRequests.set(ctx.from.id, "result");
        }
    }

    static async handleLocationInput(ctx) {
        try {
            const location = ctx.message.location;
            const userId = ctx.from.id; 

            if (!this.locationRequests.has(userId)) {
                await ctx.reply("Пожалуйста, начните запрос местоположения через меню");
                return;
            }

            await ctx.reply("⏳ Определяю погоду по вашему местоположению...");

            const weather = await WeatherService.getWeatherByCoords(
                location.latitude,
                location.longitude
            );
            const weatherMessage = this.formatWeatherMessage(weather);

            await ctx.reply(
                weatherMessage,
                { reply_markup: this.getWeatherResultKeyboard() }
            );

            this.locationRequests.set(userId, "result");
        } catch (error) {
            await ctx.reply(
                error.message,
                { reply_markup: this.getWeatherResultKeyboard() }
            );
            this.locationRequests.set(ctx.from.id, "result");
        }
    }

    static handleNewRequest(ctx) {
        this.weatherRequests.set(ctx.from.id, true);
        return ctx.reply(
            "🌤️ Введите название города для нового запроса:",
            { reply_markup: this.getWeatherRequestKeyboard() }
        );
    }
    
    static async handleCancel(ctx) {
        this.weatherRequests.delete(ctx.from.id);
        this.locationRequests.delete(ctx.from.id);
        await ctx.reply(
            "Запрос отменен. Возвращаю в главное меню:",
            { reply_markup: this.getWeatherMethodKeyboard() }
        );
    }

    static async handleBackToMain(ctx) {
        this.weatherRequests.delete(ctx.from.id);
        this.locationRequests.delete(ctx.from.id);
        await ctx.reply(
            "Возвращаю в главное меню:",
            { reply_markup: this.getMainKeyboard() }
        );
    }

    static formatWeatherMessage(weather) {
        return `🌤️ Погода в ${weather.city}, ${weather.country}:

🌡️ Температура: ${weather.temperature}°C
💭 Ощущается как: ${weather.feelsLike}°C
💧 Влажность: ${weather.humidity}%
🌬️ Ветер: ${weather.windSpeed} м/с
📝 ${weather.description}

Что хотите сделать дальше?`;
    }

    static isUserInWeatherRequest(userId) {
        return this.weatherRequests.has(userId);
    }
    static isUserInLocationRequest(userId) {
        return this.locationRequests.has(userId);
    }
}

module.exports = { WeatherHandler };