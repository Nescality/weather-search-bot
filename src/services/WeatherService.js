const axios = require('axios');
const { WeatherErrorHandler } = require('../errors');

class WeatherService {
    static async getWeather(city) {
        console.log("Начало getWeather, город:", city);
        
        const validate = WeatherErrorHandler.validateCity(city);
        if (!validate.isValid) {
            console.log("Валидация не пройдена:", validate.userMessage);
            throw new Error(validate.userMessage);
        }
    
        try {
            console.log("Делаю запрос к API...");
            
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather`,
                {
                    params: {
                        q: city,
                        appid: process.env.WEATHER_API_KEY,
                        units: "metric",
                        lang: "ru"
                    },
                    timeout: 10000
                }
            );

            console.log(" Ответ от API получен, статус:", response.status);
    
            const formattedData = this.formatWeatherData(response.data);
            console.log("Данные отформатированы:", formattedData);
            
            return formattedData;
            
        } catch (error) {
            console.log("Ошибка в getWeather:", error.message);
            
            const errorInfo = WeatherErrorHandler.handleApiError(error);
            console.log("Обработанная ошибка:", errorInfo);
            
            throw new Error(errorInfo.userMessage);
        }
    }

    static async getWeatherByCoords(latitude, longitude) {
    
        try {
            console.log("Делаю запрос к API...");
            
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather`,
                {
                    params: {
                        lat: latitude,
                        lon: longitude,
                        appid: process.env.WEATHER_API_KEY,
                        units: "metric",
                        lang: "ru"
                    },
                    timeout: 10000
                }
            );

            console.log(" Ответ от API получен, статус:", response.status);
    
            const formattedData = this.formatWeatherData(response.data);
            console.log("Данные отформатированы:", formattedData);
            
            return formattedData;
            
        } catch (error) {
            console.log("Ошибка в getWeather:", error.message);
            
            const errorInfo = WeatherErrorHandler.handleApiError(error);
            console.log("Обработанная ошибка:", errorInfo);
            
            throw new Error(errorInfo.userMessage);
        }
    }

    static formatWeatherData(data) {
        console.log("Форматирую данные:", data);
        
        if (!data || !data.main || !data.weather) {
            console.log("Данные от API неполные!");
            return {
                city: 'Неизвестно',
                country: '',
                temperature: 0,
                feelsLike: 0,
                humidity: 0,
                pressure: 0,
                windSpeed: 0,
                description: 'нет данных',
                icon: ''
            };
        }
        
        const result = {
            city: data.name || 'Неизвестно',
            country: data.sys?.country || '',
            temperature: Math.round(data.main.temp) || 0,
            feelsLike: Math.round(data.main.feels_like) || 0,
            humidity: data.main.humidity || 0,
            pressure: data.main.pressure || 0,
            windSpeed: data.wind?.speed || 0,
            description: data.weather[0]?.description || 'нет данных',
            icon: data.weather[0]?.icon || ''
        };
        
        console.log("Итоговые данные:", result);
        return result;
    }
}

module.exports = { WeatherService };