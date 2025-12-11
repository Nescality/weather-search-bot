require("dotenv").config();
const { Bot } = require("grammy");
const { MainHandler, WeatherHandler } = require('./src/handlers');

const bot = new Bot(process.env.BOT_API_KEY);

bot.command("start", async (ctx) => {
    await MainHandler.handleStart(ctx);
});

bot.hears("🌤️ Узнать погоду", async (ctx) => {
    await MainHandler.handleWeatherButton(ctx);
});

bot.hears("🏙️ По названию города", async (ctx) => {
    await WeatherHandler.startWeatherRequest(ctx);
});

bot.hears("📍 По геолокации", async (ctx) => {
    await WeatherHandler.startLocationRequest(ctx);
});

bot.hears("↩️ Назад в меню", async (ctx) => {
    await MainHandler.handleStart(ctx);
});

bot.hears("🔄 Новый запрос погоды", async (ctx) => {
    await WeatherHandler.handleNewRequest(ctx);
});

bot.hears("↩️ Вернуться в главное меню", async (ctx) => {
    await WeatherHandler.handleBackToMain(ctx);
});

bot.hears("❌ Отменить запрос погоды", async (ctx) => {
    WeatherHandler.handleCancel(ctx);
});
bot.hears("❌ Отменить", async (ctx) => {
    WeatherHandler.handleCancel(ctx);
});

bot.on("message", async (ctx) => {
    const userId = ctx.from.id;
    if (ctx.message.location) {
        await WeatherHandler.handleLocationInput(ctx);
        return;
    }
    if (WeatherHandler.isUserInWeatherRequest(userId)) {
        await WeatherHandler.handleWeatherInput(ctx);
        return;
    }
    await MainHandler.handleUnknownCommand(ctx);
});

bot.start();
