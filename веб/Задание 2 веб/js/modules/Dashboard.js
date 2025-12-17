class Dashboard {
  constructor(container) {
    this.container = container;
    this.widgets = [];
  }

  addWidget(type, id = null, title = null, config = {}, state = {}) {
    let widget;
    const widgetId = id || `${type}-${Date.now()}`;

    switch(type) {
      case 'ToDoWidget':
        widget = new ToDoWidget(title || 'Мои задачи', widgetId);
        break;
      case 'QuoteWidget':
        widget = new QuoteWidget(title || 'Цитаты', widgetId);
        break;
      case 'WeatherWidget':
        widget = new WeatherWidget(title || 'Погода', widgetId, config);
        break;
      case 'TimerWidget':
        widget = new TimerWidget(title || 'Таймер', widgetId);
        break;
      default: return;
    }

    // восстановление состояния
    if (state && widget.restoreState) widget.restoreState(state);

    this.widgets.push(widget);
    const el = widget.render();
    el.classList.add('widget');
    el.setAttribute('draggable', true);
    this.container.appendChild(el);
  }

  clearAllWidgets() {
    this.widgets.forEach(w => w.destroy());
    this.widgets = [];
    this.container.innerHTML = '';
  }
}
