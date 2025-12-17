// TimerWidget.js
import { UIComponent } from './UIComponent.js';

export class TimerWidget extends UIComponent {
  #timers;
  #container;
  #inputHours;
  #inputMinutes;
  #inputSeconds;

  constructor(title, id) {
    super(title, id);
    this.#timers = [];
    this.#container = null;
    this.#inputHours = null;
    this.#inputMinutes = null;
    this.#inputSeconds = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.id = this.id;
    this.element.classList.add('timer-widget');

    const header = document.createElement('h3');
    header.textContent = this.title;

    const controls = document.createElement('div');
    controls.classList.add('timer-controls');

    // Поля ввода времени
    this.#inputHours = document.createElement('input');
    this.#inputHours.type = 'number';
    this.#inputHours.min = '0';
    this.#inputHours.placeholder = 'Ч';
    this.#inputHours.style.width = '50px';

    this.#inputMinutes = document.createElement('input');
    this.#inputMinutes.type = 'number';
    this.#inputMinutes.min = '0';
    this.#inputMinutes.placeholder = 'М';
    this.#inputMinutes.style.width = '50px';

    this.#inputSeconds = document.createElement('input');
    this.#inputSeconds.type = 'number';
    this.#inputSeconds.min = '0';
    this.#inputSeconds.placeholder = 'С';
    this.#inputSeconds.style.width = '50px';

    const addButton = document.createElement('button');
    addButton.textContent = 'Добавить таймер';
    addButton.addEventListener('click', () => {
      const hours = parseInt(this.#inputHours.value, 10) || 0;
      const minutes = parseInt(this.#inputMinutes.value, 10) || 0;
      const seconds = parseInt(this.#inputSeconds.value, 10) || 0;
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      if (totalSeconds > 0) {
        this.addTimer(totalSeconds);
        this.#inputHours.value = '';
        this.#inputMinutes.value = '';
        this.#inputSeconds.value = '';
      }
    });

    controls.appendChild(this.#inputHours);
    controls.appendChild(this.#inputMinutes);
    controls.appendChild(this.#inputSeconds);
    controls.appendChild(addButton);

    this.#container = document.createElement('div');
    this.#container.classList.add('timers-container');

    this.element.appendChild(header);
    this.element.appendChild(controls);
    this.element.appendChild(this.#container);

    return this.element;
  }

  addTimer(totalSeconds) {
    const timer = {
      id: Date.now(),
      remaining: totalSeconds,
      interval: null,
      paused: false,
      element: null,
      pauseBtn: null
    };

    const timerDiv = document.createElement('div');
    timerDiv.classList.add('timer-item');
    timerDiv.dataset.id = timer.id;

    const timeDisplay = document.createElement('span');
    timeDisplay.textContent = this.formatTime(timer.remaining);

    // Кнопка паузы/продолжить
    const pauseBtn = document.createElement('button');
    pauseBtn.textContent = 'Приостановить';
    pauseBtn.addEventListener('click', () => this.togglePause(timer.id));

    // Поля для добавления времени
    const addHoursInput = document.createElement('input');
    addHoursInput.type = 'number';
    addHoursInput.min = '0';
    addHoursInput.placeholder = 'ч';
    addHoursInput.style.width = '40px';

    const addMinutesInput = document.createElement('input');
    addMinutesInput.type = 'number';
    addMinutesInput.min = '0';
    addMinutesInput.placeholder = 'м';
    addMinutesInput.style.width = '40px';

    const addSecondsInput = document.createElement('input');
    addSecondsInput.type = 'number';
    addSecondsInput.min = '0';
    addSecondsInput.placeholder = 'с';
    addSecondsInput.style.width = '40px';

    const addTimeBtn = document.createElement('button');
    addTimeBtn.textContent = '+Время';
    addTimeBtn.addEventListener('click', () => {
      const h = parseInt(addHoursInput.value, 10) || 0;
      const m = parseInt(addMinutesInput.value, 10) || 0;
      const s = parseInt(addSecondsInput.value, 10) || 0;
      const addTotal = h * 3600 + m * 60 + s;
      if (addTotal > 0) {
        this.addTime(timer.id, addTotal);
        addHoursInput.value = '';
        addMinutesInput.value = '';
        addSecondsInput.value = '';
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => this.removeTimer(timer.id));

    timerDiv.appendChild(timeDisplay);
    timerDiv.appendChild(pauseBtn);
    timerDiv.appendChild(addHoursInput);
    timerDiv.appendChild(addMinutesInput);
    timerDiv.appendChild(addSecondsInput);
    timerDiv.appendChild(addTimeBtn);
    timerDiv.appendChild(deleteBtn);

    this.#container.appendChild(timerDiv);

    timer.element = timerDiv;
    timer.timeDisplay = timeDisplay;
    timer.pauseBtn = pauseBtn;

    this.#timers.push(timer);
    this.startTimer(timer);
  }

  startTimer(timer) {
    timer.interval = setInterval(() => {
      if (!timer.paused) {
        timer.remaining--;
        timer.timeDisplay.textContent = this.formatTime(timer.remaining);
        if (timer.remaining <= 0) {
          clearInterval(timer.interval);
          timer.timeDisplay.textContent = 'Время вышло!';
          timer.pauseBtn.disabled = true;
        }
      }
    }, 1000);
  }

  togglePause(id) {
    const timer = this.#timers.find(t => t.id === id);
    if (!timer) return;

    timer.paused = !timer.paused;
    timer.pauseBtn.textContent = timer.paused ? 'Продолжить' : 'Приостановить';
  }

  addTime(id, seconds) {
    const timer = this.#timers.find(t => t.id === id);
    if (!timer) return;
    timer.remaining += seconds;
    timer.timeDisplay.textContent = this.formatTime(timer.remaining);
  }

  removeTimer(id) {
    const index = this.#timers.findIndex(t => t.id === id);
    if (index === -1) return;

    const timer = this.#timers[index];
    clearInterval(timer.interval);
    if (timer.element && this.#container.contains(timer.element)) {
      this.#container.removeChild(timer.element);
    }

    this.#timers.splice(index, 1);
  }

  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  destroy() {
    this.#timers.forEach(timer => clearInterval(timer.interval));
    super.destroy();
    this.#timers = [];
    this.#container = null;
    this.#inputHours = null;
    this.#inputMinutes = null;
    this.#inputSeconds = null;
  }
}
