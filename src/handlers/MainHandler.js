const { Keyboard } = require("grammy");

class MainHandler {
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

    static async handleStart (ctx) {
        const userName = ctx.from?.first_name || "Пользователь"
        await ctx.reply(
            `👋 Привет ${userName}, ты попал в MakarenkoBot.\n` +
            `Нажмите кнопку ниже, чтобы воспользоваться нужной услугой.`,
            {
                reply_markup: this.getMainKeyboard()
            }
        );    
    }

    static async handleWeatherButton(ctx) {
        await ctx.reply(
            "🌤️ Выберите способ получения погоды:",
            {
                reply_markup: this.getWeatherMethodKeyboard()
            }
        );
    }


    static async handleUnknownCommand (ctx) {
        await ctx.reply(
            `🤔 Пожалуйста, выберите функцию из меню:`,
            {
                reply_markup: this.getMainKeyboard()
            }
        );    
    }

}


module.exports = { MainHandler };

