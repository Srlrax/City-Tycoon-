import THREE from '../vendor/three.js';
import { CITY_CONFIG } from '../config.js';
import { createLighting } from '../world/Lighting.js';
import { CityWorld } from '../world/CityWorld.js';
import { Player } from '../player/Player.js';
import { CameraRig } from '../player/CameraRig.js';
import { Input } from './Input.js';
import { PlacementSystem } from '../city/PlacementSystem.js';
import { BUILDINGS } from '../city/BuildingCatalog.js';
import { Economy } from '../systems/Economy.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { TrafficSystem } from '../systems/TrafficSystem.js';
import { PedestrianSystem } from '../systems/PedestrianSystem.js';
import { VehicleController } from '../vehicles/VehicleController.js';
import { HUD } from '../ui/HUD.js';

export class Game {
  constructor(worldElement, uiElement) {
    this.worldElement = worldElement;
    this.uiElement = uiElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 600);

    const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 4);
    this.renderer = new THREE.WebGLRenderer({ antialias: !lowPower, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    worldElement.appendChild(this.renderer.domElement);

    const lighting = createLighting(this.scene);
    if (lowPower) lighting.sun.shadow.mapSize.set(1024, 1024);

    this.city = new CityWorld(this.scene);
    const { tiles } = this.city.build();
    this.player = new Player(this.scene);
    this.input = new Input(this.renderer.domElement);
    this.cameraRig = new CameraRig(this.camera, this.input);
    this.economy = new Economy();
    this.saveSystem = new SaveSystem();
    this.traffic = new TrafficSystem(this.scene, lowPower ? 8 : 12);
    this.pedestrians = new PedestrianSystem(this.scene);
    this.placement = new PlacementSystem(
      this.scene,
      this.renderer,
      this.camera,
      tiles,
      (type, gx, gz) => this.tryPlace(type, gx, gz)
    );
    this.hud = new HUD(uiElement, {
      onSelect: id => this.placement.select(id),
      onUpgrade: () => this.upgradeCity(),
      onSave: () => this.saveGame(),
      onReset: () => this.resetEverything()
    });
    this.vehicles = new VehicleController(this.scene, this.player, message => this.hud.toast.show(message));

    this.restoreGame();
    this.hud.update(this.economy, this.placement.objects.length);
    this.clock = new THREE.Clock();
    this.incomeElapsed = 0;
    this.autosaveElapsed = 0;
    this.running = false;
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    this.animate = this.animate.bind(this);

    try {
      if (!localStorage.getItem('city-tycoon-seen-help')) {
        this.hud.openHelp();
        localStorage.setItem('city-tycoon-seen-help', '1');
      }
    } catch {}
  }

  start() {
    if (this.running) return;
    this.running = true;
    const boot = document.getElementById('boot-screen');
    if (boot) {
      boot.style.opacity = '0';
      setTimeout(() => boot.remove(), 420);
    }
    this.cameraRig.snapTo(this.player.group.position);
    this.renderer.setAnimationLoop(this.animate);
  }

  tryPlace(typeId, gx, gz) {
    const spec = BUILDINGS.find(item => item.id === typeId);
    if (!spec) return;
    if (this.placement.occupied.has(gx + ',' + gz)) return;
    if (this.economy.level < spec.unlock) {
      this.hud.toast.show('Upgrade your city to unlock this property.');
      return;
    }
    if (!this.economy.spend(spec.cost)) {
      this.hud.toast.show('Not enough cash for ' + spec.name + '.');
      return;
    }
    const placed = this.placement.place(typeId, gx, gz);
    if (!placed) {
      this.economy.cash += spec.cost;
      return;
    }
    this.economy.registerBuilding(typeId);
    this.hud.toast.show(spec.name + ' added to your city!');
    this.refreshHUD();
    this.saveGame(true);
  }

  upgradeCity() {
    if (!this.economy.upgrade()) return;
    this.hud.toast.show('City level ' + this.economy.level + ' unlocked. New developments available!');
    this.refreshHUD();
    this.saveGame(true);
  }

  resetEverything() {
    // Clear placed properties and restore all progression to a brand-new city.
    this.placement.clear();
    this.economy.reset();
    this.player.reset();
    this.vehicles.reset();

    // Restore the default third-person camera and character controls.
    this.input.keys.clear();
    this.input.pressed.clear();
    this.input.dragging = false;
    this.input.yaw = 0;
    this.input.pitch = 0.28;
    this.input.zoom = 12.5;
    this.input.zoomDelta = 0;
    this.cameraRig.distance = 12.5;
    this.cameraRig.snapTo(this.player.group.position);

    // Reset the selected building, timers, HUD, and the persistent save.
    this.placement.select('house');
    this.hud.selected = 'house';
    this.incomeElapsed = 0;
    this.autosaveElapsed = 0;
    this.refreshHUD();
    this.saveGame(true);
    this.hud.toast.show('Your city has been completely reset.');
  }

  refreshHUD() {
    this.hud.update(this.economy, this.placement.objects.length);
  }

  saveGame(silent = false) {
    const ok = this.saveSystem.save({
      economy: this.economy.toJSON(),
      buildings: this.placement.getSaveData(),
      player: { x: this.player.group.position.x, z: this.player.group.position.z },
      vehicle: this.vehicles.getSaveData()
    });
    if (!silent) this.hud.toast.show(ok ? 'City saved on this device.' : 'Save failed. Check browser storage settings.');
    return ok;
  }

  restoreGame() {
    const data = this.saveSystem.load();
    if (!data) return;
    if (data.economy) this.economy.load(data.economy);
    for (const item of (data.buildings || [])) {
      const spec = BUILDINGS.find(building => building.id === item.type);
      if (spec && this.placement.place(item.type, item.gx, item.gz)) this.economy.registerBuilding(item.type);
    }
    if (data.player) {
      this.player.group.position.x = Number(data.player.x) || 0;
      this.player.group.position.z = Number(data.player.z) || 13;
    }
    this.vehicles.load(data.vehicle);
  }

  resize() {
    const width = this.worldElement.clientWidth || innerWidth;
    const height = this.worldElement.clientHeight || innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 0.045);

    if (this.input.consumePress('e')) this.vehicles.toggleVehicle();
    if (!this.vehicles.driving) this.player.update(dt, this.input, CITY_CONFIG.playerSpeed);
    this.vehicles.update(dt, this.input);
    this.traffic.update(dt);
    this.pedestrians.update(dt);

    this.incomeElapsed += dt * 1000;
    this.autosaveElapsed += dt * 1000;
    if (this.incomeElapsed >= CITY_CONFIG.incomeTickMs) {
      const ticks = Math.floor(this.incomeElapsed / CITY_CONFIG.incomeTickMs);
      this.incomeElapsed -= ticks * CITY_CONFIG.incomeTickMs;
      for (let i = 0; i < ticks; i++) this.economy.tick();
      this.refreshHUD();
    }
    if (this.autosaveElapsed >= 30000) {
      this.autosaveElapsed = 0;
      this.saveGame(true);
    }

    this.cameraRig.update(this.vehicles.focus, dt, this.vehicles.driving);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
    this.input.dispose();
    this.placement.dispose();
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
