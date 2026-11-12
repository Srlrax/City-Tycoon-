import THREE from '../vendor/three.js';
import { Vehicle } from './Vehicle.js';

export class VehicleController {
  constructor(scene, player, notify = () => {}) {
    this.scene = scene;
    this.player = player;
    this.notify = notify;
    this.driving = false;
    this.speed = 0;
    this.steering = 0;
    this.vehicle = new Vehicle('sport', 0x397dba);
    this.vehicle.group.position.set(-5, 0, 20.5);
    this.vehicle.group.rotation.y = Math.PI / 2;
    scene.add(this.vehicle.group);
  }

  toggleVehicle() {
    if (this.driving) {
      this.driving = false;
      this.speed = 0;
      this.player.group.visible = true;
      const side = new THREE.Vector3(-Math.cos(this.vehicle.group.rotation.y), 0, Math.sin(this.vehicle.group.rotation.y));
      this.player.group.position.copy(this.vehicle.group.position).addScaledVector(side, 2.2);
      this.player.group.rotation.y = this.vehicle.group.rotation.y;
      this.notify('You stepped out of your car.');
      return true;
    }

    const distance = this.player.group.position.distanceTo(this.vehicle.group.position);
    if (distance > 9.5) {
      this.notify('Walk closer to your blue sports car to get in.');
      return false;
    }

    this.driving = true;
    this.speed = 0;
    this.player.group.visible = false;
    this.notify('You are driving! WASD to drive, E to get out.');
    return true;
  }

  update(dt, input) {
    if (!this.driving) {
      this.vehicle.update(dt, 0, 0);
      return;
    }

    const accelerating = input.down('w', 'arrowup');
    const reversing = input.down('s', 'arrowdown');
    const throttle = accelerating ? 1 : reversing ? -0.72 : 0;
    const maxSpeed = accelerating ? 22 : 10;
    if (throttle !== 0) {
      this.speed += throttle * 15 * dt;
    } else {
      this.speed *= Math.max(0, 1 - dt * 1.7);
    }
    this.speed = THREE.MathUtils.clamp(this.speed, -8, maxSpeed);

    const steeringInput = (input.down('a', 'arrowleft') ? 1 : 0) - (input.down('d', 'arrowright') ? 1 : 0);
    this.steering += (steeringInput - this.steering) * Math.min(1, dt * 6);
    const directionFactor = this.speed >= 0 ? 1 : -1;
    this.vehicle.group.rotation.y += this.steering * directionFactor * Math.min(Math.abs(this.speed) / 10, 1) * dt * 1.7;

    if (!input.dragging) {
      let yawDelta = (this.vehicle.group.rotation.y - input.yaw + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      input.yaw += yawDelta * Math.min(1, dt * 4.5);
    }
    const forward = new THREE.Vector3(Math.sin(this.vehicle.group.rotation.y), 0, Math.cos(this.vehicle.group.rotation.y));
    this.vehicle.group.position.addScaledVector(forward, this.speed * dt);
    this.vehicle.group.position.x = THREE.MathUtils.clamp(this.vehicle.group.position.x, -98, 98);
    this.vehicle.group.position.z = THREE.MathUtils.clamp(this.vehicle.group.position.z, -98, 98);
    this.vehicle.update(dt, this.speed, this.steering);
  }

  reset() {
    this.driving = false;
    this.speed = 0;
    this.steering = 0;
    this.player.group.visible = true;
    this.player.group.position.set(0, 0, 13);
    this.player.group.rotation.set(0, 0, 0);
    this.vehicle.group.position.set(-5, 0, 20.5);
    this.vehicle.group.rotation.set(0, Math.PI / 2, 0);
    this.vehicle.update(0, 0, 0);
  }

  get focus() {
    return this.driving ? this.vehicle.group.position : this.player.group.position;
  }

  getSaveData() {
    return { x: this.vehicle.group.position.x, z: this.vehicle.group.position.z, rotation: this.vehicle.group.rotation.y };
  }

  load(data) {
    if (!data) return;
    if (Number.isFinite(data.x)) this.vehicle.group.position.x = data.x;
    if (Number.isFinite(data.z)) this.vehicle.group.position.z = data.z;
    if (Number.isFinite(data.rotation)) this.vehicle.group.rotation.y = data.rotation;
  }
}
