const { GrammyError, HttpError } = require("grammy");

class ErrorHandler {
    constructor(bot) {
        this.bot = bot;
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        this.bot.catch(this.handleError.bind(this));

        process.on("uncaughtException", this.handleUncaughtException.bind(this));
        process.on("unhandledRejection", this.handleUnhandledRejection.bind(this));
    }

    handleUncaughtException(error) {
        console.error("💥 Неперехваченные ошибки NodeJS.");
        console.error("Тип ошибки: " + error.name);
        console.error("Сообщение: " + error.message);
        console.error("⚠️ Критическая ошибка! Выключение бота..");

        this.shutdownBot(1);
    }

    handleUnhandledRejection(reason, promise) {
        console.error("🔮 Необработанные Promise");
        console.error("Причина:", reason);
        console.error("Promise:", promise);
    }

    handleError(err) {
        const error = err.error;
        const ctx = err.ctx;

        if (error.error_code) {
            console.error(`📱 Произошла ошибка TelegramAPI: ${error.error_code}, ${error.description}`);
        } else {
            console.error(`📱 Произошла ошибка: ${error.message}`);
        }    

        if (error instanceof GrammyError) {
            this.handleGrammyError(error, ctx);
        }
        else if (error instanceof HttpError) {
            this.handleHttpError(error, ctx);
        } else {
            this.handleUnknownError(error, ctx);
        }
    }

    handleGrammyError(error, ctx) {
        switch(error.error_code) {
            case 401:
                console.error("❌ Вы ввели неправильный токен, проверьте .env файл, а также корректность создания бота.");
                this.shutdownBot(1);
                break;
            case 400:
                console.error("⚠️ Вы совершили неправильный запрос к TelegramAPI");
                this.safeReply(ctx, "❌ Произошла ошибка. Попробуйте еще раз.");
                break;
            case 429: 
                console.error("🚦 Превышен лимит запросов к Telegram");
                break;
            default:
                console.error(`❓ Неизвестная ошибка Telegram: ${error.error_code}`);
                this.safeReply(ctx, "⚠️ Произошла неизвестная ошибка.");
        }
    }
    handleHttpError(error, ctx) {
        console.error("🌐 Произошла ошибка сети (HTTP) " + error);

        if (error.message.includes('ENOTFOUND')) {
            console.error("❌ Не могу найти сервер TELEGRAM, Проверьте подключение к интернету.");
            this.safeReply(ctx, "🌐 Проблемы с интернетом. Проверьте подключение.")
        } else if (error.message.includes('ECONNREFUSED')) {
            console.error("❌ Отклонено подключение к TELEGRAM.");
            this.safeReply(ctx, "🔧 Сервер Telegram временно недоступен.")
        } else if (error.message.includes('ETIMEDOUT')) {
            console.error("⏰ TIMEOUT подключение к серверу TELEGRAM.");
            this.safeReply(ctx, "⏳ Сервер перегружен. Попробуйте позже.")
        } else if (error.message.includes('ECONNRESET')) {
            console.error("🔌 Соединение сброшено с TELEGRAM сервером");
            this.safeReply(ctx, "🔌 Соединение прервано. Попробуйте снова.")
        } else if (error.message.includes('UNAVAILABLE')) {
            console.error("🚫 Сервис TELEGRAM временно недоступен");
            this.safeReply(ctx, "🚫 Сервис временно недоступен.")
        } else {
            console.error("🌐 Неизвестная сетевая ошибка");
            console.error("Тип ошибки:", error.message);
            this.safeReply(ctx, "🌐 Проблемы с соединением. Попробуйте позже.")
        }
    }
    handleUnknownError (error, ctx) {
        console.error("💥 Неизвестная ошибка");
        console.error("Тип ошибки:", error.name);
        console.error("Сообщение:", error.message);
        this.safeReply(ctx, "⚠️ Произошла непредвиденная ошибка.")
    }
    safeReply(ctx, message) {
        try {
            ctx.reply(message).catch(error => {
                console.error("Не удалось отправить сообщение об ошибке:", error); 
            })
        }
        catch (error) {
            console.error("Ошибка при попытке отправки сообщения:", error); 
        }
    }
    shutdownBot(exitCode = 0) {
        console.log("🛑 Происходит завершение бота....")
        if (this.bot && typeof this.bot.stop === "function") {
            this.bot.stop()
        }
        process.exit(exitCode);
    }
}

module.exports = { ErrorHandler };