import THREE from '../vendor/three.js';
import { Vehicle } from '../vehicles/Vehicle.js';

const CAR_COLORS = [0xd9dedc, 0x283945, 0xb8b2a4, 0x8c3c36, 0x416b83, 0x1f2830, 0xc6a36a, 0x5b7568];

export class TrafficSystem {
  constructor(scene, count = 12) {
    this.scene = scene;
    this.cars = [];
    const roads = [-66, -22, 22, 66];
    for (let i = 0; i < count; i++) this.addCar(i, roads, CAR_COLORS[i % CAR_COLORS.length]);
  }

  addCar(index, roads, color) {
    const vehicleType = index % 5 === 0 ? 'suv' : index % 4 === 0 ? 'sport' : 'sedan';
    const vehicle = new Vehicle(vehicleType, color);
    const car = vehicle.group;
    const lane = index % 4;
    const axis = lane < 2 ? 'z' : 'x';
    const roadIndex = Math.floor(index / 4) % roads.length;
    const fixed = roads[roadIndex];
    const direction = index % 2 === 0 ? 1 : -1;
    const offset = direction > 0 ? 2.55 : -2.55;
    const distance = -90 + ((index * 31) % 180);

    if (axis === 'z') {
      car.position.set(fixed + offset, 0, distance);
      car.rotation.y = direction > 0 ? 0 : Math.PI;
    } else {
      car.position.set(distance, 0, fixed - offset);
      car.rotation.y = direction > 0 ? Math.PI / 2 : -Math.PI / 2;
    }

    this.scene.add(car);
    this.cars.push({ vehicle, car, axis, direction, speed: 6 + (index % 4) * 1.4, offset: index * 1.7 });
  }

  update(dt) {
    for (const item of this.cars) {
      item.car.position[item.axis] += item.direction * item.speed * dt;
      if (item.car.position[item.axis] > 108) item.car.position[item.axis] = -108;
      if (item.car.position[item.axis] < -108) item.car.position[item.axis] = 108;
      item.vehicle.update(dt, item.speed, 0);
    }
  }
}
