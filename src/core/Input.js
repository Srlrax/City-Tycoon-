export class Input {
  constructor(element) {
    this.element = element;
    this.keys = new Set();
    this.pressed = new Set();
    this.yaw = 0;
    this.pitch = 0.18;
    this.zoom = 12.5;
    this.zoomDelta = 0;
    this.dragging = false;
    this.pointerLocked = false;
    this.firstPerson = false;
    this.buildPanelOpen = false;
    this.lastX = 0;
    this.lastY = 0;

    this.onKeyDown = event => {
      const key = event.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','shift','tab'].includes(key)) event.preventDefault();
      if (!this.keys.has(key)) this.pressed.add(key);
      this.keys.add(key);
      if (key === 'b' && !event.repeat) this.toggleBuildPanel();
      if (key === 'v' && !event.repeat) this.toggleFirstPerson();
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
      if (this.firstPerson && !this.buildPanelOpen && !this.pointerLocked && event.button === 0) {
        this.element.requestPointerLock?.();
        return;
      }
      if (event.button !== 2 || this.pointerLocked || this.buildPanelOpen) return;
      this.dragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      this.element.setPointerCapture?.(event.pointerId);
    };
    this.onPointerMove = event => {
      if (this.pointerLocked) {
        this.yaw -= event.movementX * 0.0025;
        this.pitch = Math.max(-1.15, Math.min(1.15, this.pitch - event.movementY * 0.0022));
        return;
      }
      if (!this.dragging) return;
      const dx = event.clientX - this.lastX;
      const dy = event.clientY - this.lastY;
      this.yaw -= dx * 0.0046;
      this.pitch = Math.max(-0.08, Math.min(0.92, this.pitch + dy * 0.0032));
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    };
    this.onPointerUp = () => { this.dragging = false; };
    this.onPointerLockChange = () => {
      this.pointerLocked = document.pointerLockElement === this.element;
      document.body.classList.toggle('pointer-locked', this.pointerLocked);
    };
    this.onWheel = event => {
      if (this.firstPerson) return;
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
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    element.addEventListener('wheel', this.onWheel, { passive: false });
    element.addEventListener('contextmenu', this.onContextMenu);
  }

  toggleFirstPerson() {
    this.firstPerson = !this.firstPerson;
    if (this.firstPerson && !this.buildPanelOpen) this.element.requestPointerLock?.();
    else if (document.pointerLockElement) document.exitPointerLock?.();
  }

  toggleBuildPanel() {
    this.buildPanelOpen = !this.buildPanelOpen;
    const panel = document.getElementById('build-panel');
    if (panel) panel.classList.toggle('panel-hidden', !this.buildPanelOpen);
    if (this.buildPanelOpen && document.pointerLockElement) document.exitPointerLock?.();
    if (!this.buildPanelOpen && this.firstPerson) this.element.requestPointerLock?.();
  }

  down(...keys) { return keys.some(key => this.keys.has(key)); }
  consumePress(key) {
    const wasPressed = this.pressed.has(key);
    this.pressed.delete(key);
    return wasPressed;
  }

  dispose() {
    document.body.classList.remove('pointer-locked');
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    this.element.removeEventListener('wheel', this.onWheel);
    this.element.removeEventListener('contextmenu', this.onContextMenu);
  }
}
