export class Input {
  constructor(element) {
    this.element = element;
    this.keys = new Set();
    this.pressed = new Set();
    this.yaw = 0;
    this.pitch = 0.28;
    this.zoom = 12.5;
    this.zoomDelta = 0;
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;

    this.onKeyDown = event => {
      const key = event.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','shift'].includes(key)) event.preventDefault();
      if (!this.keys.has(key)) this.pressed.add(key);
      this.keys.add(key);
    };
    this.onKeyUp = event => {
      const key = event.key.toLowerCase();
      this.keys.delete(key);
      this.pressed.delete(key);
    };
    this.onBlur = () => {
      this.keys.clear();
      this.pressed.clear();
      this.dragging = false;
    };
    this.onPointerDown = event => {
      if (event.button !== 2) return;
      this.dragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.element.setPointerCapture?.(event.pointerId);
    };
    this.onPointerMove = event => {
      if (!this.dragging) return;
      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.yaw -= dx * 0.0046;
      this.pitch = Math.max(-0.08, Math.min(0.92, this.pitch + dy * 0.0032));
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    };
    this.onPointerUp = () => { this.dragging = false; };
    this.onWheel = event => {
      event.preventDefault();
      this.zoomDelta += Math.sign(event.deltaY) * 1.1;
    };
    this.onContextMenu = event => event.preventDefault();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    element.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    element.addEventListener('wheel', this.onWheel, { passive: false });
    element.addEventListener('contextmenu', this.onContextMenu);
  }

  down(...keys) { return keys.some(key => this.keys.has(key)); }
  consumePress(key) {
    const wasPressed = this.pressed.has(key);
    this.pressed.delete(key);
    return wasPressed;
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.element.removeEventListener('wheel', this.onWheel);
    this.element.removeEventListener('contextmenu', this.onContextMenu);
  }
}
