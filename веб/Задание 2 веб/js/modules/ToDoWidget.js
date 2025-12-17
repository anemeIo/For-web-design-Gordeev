// ToDoWidget.js
import { UIComponent } from './UIComponent.js';

export class ToDoWidget extends UIComponent {
  #tasks;
  #input;
  #list;

  constructor(title, id) {
    super(title, id);
    this.#tasks = [];
  }

  render() {
    this.element = document.createElement('div');
    this.element.id = this.id;
    this.element.classList.add('todo-widget');

        // Заголовок виджета
    const header = document.createElement('h3');
    header.textContent = this.title;

    // Поле ввода
    this.#input = document.createElement('input');
    this.#input.type = 'text';
    this.#input.placeholder = 'Новая задача';

    // Кнопка "Добавить"
    const addButton = document.createElement('button');
    addButton.textContent = 'Добавить';
    addButton.addEventListener('click', () => this.addTask(this.#input.value));

    // Список задач
    this.#list = document.createElement('ul');

    this.element.appendChild(this.#input);
    this.element.appendChild(addButton);
    this.element.appendChild(this.#list);

    return this.element;
  }

  addTask(text) {
    if (!text.trim()) return;
    const task = { id: Date.now(), text };
    this.#tasks.push(task);

    const li = document.createElement('li');
    li.textContent = task.text;
    li.dataset.id = task.id;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => this.removeTask(task.id));
    li.appendChild(deleteBtn);

    this.#list.appendChild(li);
    this.#input.value = '';
  }

  removeTask(id) {
    this.#tasks = this.#tasks.filter(task => task.id !== id);
    const li = this.#list.querySelector(`li[data-id='${id}']`);
    if (li) this.#list.removeChild(li);
  }

  getTasks() {
    return [...this.#tasks];
  }

  destroy() {
    super.destroy();
    this.#tasks = [];
    this.#input = null;
    this.#list = null;
  }
}
