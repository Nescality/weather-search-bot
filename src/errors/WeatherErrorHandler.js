class WeatherErrorHandler {
    static handleApiError (error) {
        if (error.response) {
           return this.handleHttpError(error)
        }
        if (error.code) {
            return this.handleNetworkError(error)
        }
        return {
            userMessage: "❌ Неизвестная ошибка. Попробуйте еще раз.",
            logMessage: "Неизвестная ошибка.",
        }
    }

    static handleHttpError (error) {
        switch(error.response.status) {
            case 401:
                return {
                    userMessage: "❌ Проблема с API ключом",
                    logMessage: "Неправильный API ключ.",
                }
            case 404:
                return {
                    userMessage: "❌ Город не найден. Проверьте написание.",
                    logMessage: "Пользователь неправильно ввел город.",
                }
            case 404:
                return {
                    userMessage: "⏳ Превышен лимит запросов. Попробуйте через несколько минут.",
                    logMessage: "Превышен лимит запросов к OpenWeatherMap API",
                }
            case 500:
            case 502:
            case 503:
                return {
                    userMessage: "🔧 Сервис погоды временно недоступен. ",
                    logMessage: "Ошибка сервера OpenWeatherMap",
                }
            default:
                return {
                    userMessage: "❌ Ошибка при получении погоды.",
                    logMessage: `Ошибка API: ${error.response.data?.message || 'Неизвестно'}`,
                }
        }
    }

    static handleNetworkError (error) {
        switch(error.code) {
            case "ENOTFOUND":
                return {
                    userMessage: "🌐 Проблемы с интернет-соединением.",
                    logMessage: "DNS ошибка: Не найден сервер OpenWeatherMap",
                }
            case "ECONNREFUSED":
                return {
                    userMessage: "🔧 Сервер погоды временно недоступен.",
                    logMessage: "Соединение отклонено: Сервер OpenWeatherMap недоступен",
                }
            case "ETIMEDOUT":
                return {
                    userMessage: "⏰ Сервер погоды не отвечает.",
                    logMessage: "Таймаут подключения к OpenWeatherMap",
                }
            case "ECONNRESET":
                return {
                    userMessage: "🔌 Соединение прервано. Попробуйте снова.",
                    logMessage: "Соединение сброшено сервером OpenWeatherMap",
                }
            default:
                return {
                    userMessage: "🌐 Проблемы с соединением. Попробуйте позже.",
                    logMessage: `Сетевая ошибка: ${error.code} - ${error.message}`,
                }
        }
    }

    static validateCity (city) {
        if (!city && city.trim().length === 0) {
            return {
                isValid: false,
                userMessage: "❌ Введите название города.",
                logMessage: "Пользователь не ввел город.",
            }
        }
        if (city.length > 50) {
            return {
                isValid: false,
                userMessage: "❌ Слишком длинное название города.",
                logMessage: "Пользователь ввел слишком длинное название города.",
            }
        }
        if (!/^[a-zA-Zа-яА-ЯёЁ\s\-',.]+$/i.test(city)) {  
            return {
                isValid: false,
                userMessage: "❌ Недопустимые символы в названии города.",
                logMessage: "Пользователь ввел недопустимые символы в названии города.",
            }
        }
        if (/^\d+$/i.test(city)) {
            return {
                isValid: false,
                userMessage: "❌ Название города не может состоять только из цифр.",
                logMessage: "Пользователь ввел цифры в названии города.",
            }
        }
        return { isValid: true };
    }
}

module.exports = { WeatherErrorHandler };