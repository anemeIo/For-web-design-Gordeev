// QuoteWidget.js
import { UIComponent } from './UIComponent.js';

export class QuoteWidget extends UIComponent {
  #quotes;      // Массив сохранённых цитат
  #quoteText;   // DOM-элемент для текста цитаты
  #list;        // Список сохранённых цитат

  constructor(title, id) {
    super(title, id);
    this.#quotes = [];
  }

  // Метод для рендера виджета
  render() {
    this.element = document.createElement('div');
    this.element.id = this.id;
    this.element.classList.add('quote-widget');

        // Заголовок виджета
    const header = document.createElement('h3');
    header.textContent = this.title;

    // Элемент для отображения цитаты
    this.#quoteText = document.createElement('p');
    this.#quoteText.textContent = 'Нажмите "Новая цитата", чтобы получить цитату';

    // Кнопка получения новой цитаты из API
    const fetchButton = document.createElement('button');
    fetchButton.textContent = 'Новая цитата';
    fetchButton.addEventListener('click', () => this.fetchQuote());

    // Кнопка сохранения цитаты
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Сохранить цитату';
    saveButton.addEventListener('click', () => this.saveQuote());

    // Список сохранённых цитат
    this.#list = document.createElement('ul');

    // Добавляем элементы в контейнер
    this.element.appendChild(this.#quoteText);
    this.element.appendChild(fetchButton);
    this.element.appendChild(saveButton);
    this.element.appendChild(this.#list);

    return this.element;
  }

  // Метод для получения цитаты из API
  async fetchQuote() {
  try {
    const response = await fetch('https://quoteslate.vercel.app/api/quotes/random');
    const data = await response.json();

    // Используем правильное поле
    this.#quoteText.textContent = data.quote || 'Цитата не найдена';
  } catch (error) {
    this.#quoteText.textContent = 'Ошибка получения цитаты';
    console.error(error);
  }
}

  // Метод сохранения текущей цитаты
  saveQuote() {
    const text = this.#quoteText.textContent.trim();
    if (!text) return;

    const quote = { id: Date.now(), text };
    this.#quotes.push(quote);

    const li = document.createElement('li');
    li.textContent = quote.text;
    li.dataset.id = quote.id;

    // Кнопка удаления для каждой цитаты
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => this.removeQuote(quote.id));
    li.appendChild(deleteBtn);

    this.#list.appendChild(li);
  }

  // Метод удаления цитаты
  removeQuote(id) {
    this.#quotes = this.#quotes.filter(q => q.id !== id);
    const li = this.#list.querySelector(`li[data-id='${id}']`);
    if (li) this.#list.removeChild(li);
  }

  // Метод получения всех сохранённых цитат
  getQuotes() {
    return [...this.#quotes];
  }

  // Переопределяем destroy, чтобы очистить все данные
  destroy() {
    super.destroy();
    this.#quotes = [];
    this.#quoteText = null;
    this.#list = null;
  }
}
