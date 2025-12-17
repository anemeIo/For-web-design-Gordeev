// UIComponent.js
export class UIComponent {
  constructor(title, id) {
    this.title = title;
    this.id = id;
    this.element = null;
  }

  render() {
    const div = document.createElement('div');
    div.id = this.id;
    div.setAttribute('title', this.title);
    this.element = div;
    return div;
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
