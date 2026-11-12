import THREE from '../vendor/three.js';

export class CameraRig {
  constructor(camera, input) {
    this.camera = camera;
    this.input = input;
    this.distance = 12.5;
    this.target = new THREE.Vector3();
    this.desiredPosition = new THREE.Vector3();
    this.lookTarget = new THREE.Vector3();
    this.initialized = false;
  }

  update(focus, dt, vehicleMode = false) {
    this.distance = THREE.MathUtils.clamp(this.distance + this.input.zoomDelta, vehicleMode ? 8 : 5.5, vehicleMode ? 25 : 21);
    this.input.zoomDelta = 0;

    const pitch = this.input.pitch;
    const horizontal = Math.cos(pitch) * this.distance;
    const height = Math.sin(pitch) * this.distance + (vehicleMode ? 2.7 : 2.15);
    const yaw = this.input.yaw;

    this.desiredPosition.set(
      focus.x + Math.sin(yaw) * horizontal,
      focus.y + height,
      focus.z + Math.cos(yaw) * horizontal
    );
    this.lookTarget.set(focus.x, focus.y + (vehicleMode ? 1.15 : 1.35), focus.z);

    if (!this.initialized) {
      this.camera.position.copy(this.desiredPosition);
      this.initialized = true;
    } else {
      const blend = 1 - Math.exp(-7.5 * Math.max(dt, 0));
      this.camera.position.lerp(this.desiredPosition, blend);
    }

    this.camera.lookAt(this.lookTarget);
  }

  snapTo(focus) {
    const horizontal = Math.cos(this.input.pitch) * this.distance;
    this.camera.position.set(
      focus.x + Math.sin(this.input.yaw) * horizontal,
      focus.y + Math.sin(this.input.pitch) * this.distance + 2.15,
      focus.z + Math.cos(this.input.yaw) * horizontal
    );
    this.camera.lookAt(focus.x, focus.y + 1.3, focus.z);
    this.initialized = true;
  }
}
