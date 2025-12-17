// WeatherWidget.js
import { UIComponent } from './UIComponent.js';

export class WeatherWidget extends UIComponent {
  #content;   // DOM-элемент для отображения погоды
  #config;    // Объект с конфигурацией (город, единицы)

  constructor(title, id, config = {}) {
    super(title, id);
    this.#config = config; // например { city: 'Moscow', units: 'metric' }
    this.#content = null;
  }

  // Метод рендера виджета
  render() {
    this.element = document.createElement('div');
    this.element.id = this.id;
    this.element.classList.add('weather-widget-container');

    // Заголовок виджета
    const header = document.createElement('h3');
    header.textContent = this.title;

    // Контейнер для данных погоды
    this.#content = document.createElement('div');
    this.#content.classList.add('weather-widget-content');
    this.#content.textContent = 'Загрузка погоды...';

    // Добавляем в элемент
    this.element.appendChild(header);
    this.element.appendChild(this.#content);

    // Загружаем погоду
    this.loadWeather();

    return this.element;
  }

  // Метод загрузки погоды из API
  async loadWeather() {
    try {
      const apiKey = 'ebf5aec023d729a1be9744b84c8dd965';
      const city = this.#config.city || 'Moscow';
      const units = this.#config.units || 'metric';
      const unitsLabel = units === 'metric' ? 'C' : 'F';

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`City "${city}" not found or API error`);
      }

      const weatherData = await response.json();

      // Формируем HTML
      this.#content.innerHTML = `
        <div class="weather-info">
          <div class="weather-icon">
            <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" 
                 alt="${weatherData.weather[0].description}">
          </div>
          <div>
            <div class="temperature">${Math.round(weatherData.main.temp)}°${unitsLabel}</div>
            <div>${weatherData.weather[0].description}</div>
          </div>
        </div>
        <div class="weather-details">
          <div>Feels like: ${Math.round(weatherData.main.feels_like)}°</div>
          <div>Humidity: ${weatherData.main.humidity}%</div>
          <div>Wind: ${Math.round(weatherData.wind.speed)} m/s</div>
          <div>Location: ${weatherData.name}, ${weatherData.sys.country}</div>
        </div>
      `;
    } catch (error) {
      this.showWidgetError(error.message);
    }
  }

  // Метод отображения ошибки в виджете
  showWidgetError(message) {
    if (this.#content) {
      this.#content.innerHTML = `<div class="widget-error">Ошибка: ${message}</div>`;
    }
  }

  // Переопределяем destroy для очистки
  destroy() {
    super.destroy();
    this.#content = null;
    this.#config = null;
  }
}
