export class Input {
  constructor(element) {
    this.keys = new Set();
    this.yaw = 0;
    this.pitch = 0.34;
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.element = element;
    this.onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)) event.preventDefault();
      this.keys.add(key);
    };
    this.onKeyUp = (event) => this.keys.delete(event.key.toLowerCase());
    this.onBlur = () => { this.keys.clear(); this.dragging = false; };
    this.onPointerDown = (event) => {
      if (event.button !== 2) return;
      this.dragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.element.setPointerCapture?.(event.pointerId);
    };
    this.onPointerMove = (event) => {
      if (!this.dragging) return;
      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.yaw -= dx * 0.005;
      this.pitch = Math.max(0.12, Math.min(0.82, this.pitch + dy * 0.0025));
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    };
    this.onPointerUp = () => { this.dragging = false; };
    this.onContextMenu = (event) => event.preventDefault();
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    element.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    element.addEventListener('contextmenu', this.onContextMenu);
  }
  down(...keys) { return keys.some(key => this.keys.has(key)); }
  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.element.removeEventListener('contextmenu', this.onContextMenu);
  }
}
