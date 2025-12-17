import { ToDoWidget } from './modules/ToDoWidget.js';
import { QuoteWidget } from './modules/QuoteWidget.js';
import { TimerWidget } from './modules/TimerWidget.js';
import { WeatherWidget } from './modules/WeatherWidget.js';
// === Drag & Drop ===
function enableDragAndDrop(container) {
  let draggedItem = null;

  container.addEventListener('dragstart', (e) => {
    draggedItem = e.target.closest('.widget');
    if (draggedItem) draggedItem.classList.add('dragging');
  });

  container.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
    draggedItem = null;
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    const draggable = container.querySelector('.dragging');
    if (!draggable) return;

    if (afterElement == null) {
      container.appendChild(draggable);
    } else {
      container.insertBefore(draggable, afterElement);
    }
  });

  function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll('.widget:not(.dragging)')];
    return elements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }
}

// === Экспорт / Импорт ===
function exportDashboard(container) {
  const widgets = [...container.querySelectorAll('.widget')].map(w => ({
    type: w.dataset.type,
    title: w.querySelector('h3')?.textContent || '',
  }));

  const blob = new Blob([JSON.stringify(widgets, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dashboard-config.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importDashboard(file, container) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const widgets = JSON.parse(e.target.result);
    container.innerHTML = '';
    widgets.forEach(w => addWidget(container, w.type, w.title));
  };
  reader.readAsText(file);
}

// === Добавление виджетов ===
function addWidget(container, type, title = '') {
  let widget;

  switch (type) {
    case 'ToDoWidget':
      widget = new ToDoWidget(title || 'Мои задачи', `todo-${Date.now()}`);
      break;
    case 'QuoteWidget':
      widget = new QuoteWidget(title || 'Цитата дня', `quote-${Date.now()}`);
      break;
    case 'TimerWidget':
      widget = new TimerWidget(title || 'Таймер', `timer-${Date.now()}`);
      break;
    case 'WeatherWidget':
      widget = new WeatherWidget(title || 'Погода', `weather-${Date.now()}`);
      break;
    default:
      return;
  }

  const element = widget.render();
  element.classList.add('widget');
  element.dataset.type = type;
  element.setAttribute('draggable', true);

  // === Панель управления (⚙️ и ❌) ===
  const controlPanel = document.createElement('div');
  controlPanel.style.display = 'flex';
  controlPanel.style.justifyContent = 'space-between';
  controlPanel.style.alignItems = 'center';

  // ⚙️ Настройки
  const settingsBtn = document.createElement('button');
  settingsBtn.textContent = '⚙️';
  settingsBtn.title = 'Настройки';
  settingsBtn.addEventListener('click', () => {
    const newTitle = prompt('Введите новое название:', widget.title);
    if (newTitle) {
      widget.title = newTitle;
      element.querySelector('h3').textContent = newTitle;
    }
  });

  // ❌ Закрыть
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '❌';
  closeBtn.title = 'Удалить виджет';
  closeBtn.style.backgroundColor = '#ff4d4d';
  closeBtn.style.marginLeft = '5px';
  closeBtn.addEventListener('click', () => {
    if (confirm('Удалить этот виджет?')) {
      element.remove();
    }
  });

  controlPanel.appendChild(settingsBtn);
  controlPanel.appendChild(closeBtn);
  element.prepend(controlPanel);

  container.appendChild(element);
}

// === Основная логика ===
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = document.getElementById('dashboard');
  const addToDo = document.getElementById('add-todo-widget');
  const addQuote = document.getElementById('add-quote-widget');
  const addTimer = document.getElementById('add-timer-widget');
  const addWeather = document.getElementById('add-weather-widget');
  const exportBtn = document.getElementById('export-config');
  const importBtn = document.getElementById('import-config');
  const importFile = document.getElementById('import-file');

  enableDragAndDrop(dashboard);

  addToDo.addEventListener('click', () => addWidget(dashboard, 'ToDoWidget'));
  addQuote.addEventListener('click', () => addWidget(dashboard, 'QuoteWidget'));
  addTimer.addEventListener('click', () => addWidget(dashboard, 'TimerWidget'));
  addWeather.addEventListener('click', () => addWidget(dashboard, 'WeatherWidget'));

  exportBtn.addEventListener('click', () => exportDashboard(dashboard));

  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      importDashboard(e.target.files[0], dashboard);
    }
  });
});
