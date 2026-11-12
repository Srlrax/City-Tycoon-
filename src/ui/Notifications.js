export class Notifications {
  constructor(element) { this.element = element; this.timer = null; }
  show(message) {
    this.element.textContent = message;
    this.element.classList.add('visible');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.element.classList.remove('visible'), 2300);
  }
}
