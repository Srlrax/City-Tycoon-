import { CITY_CONFIG } from '../config.js';
import { BUILDINGS } from '../city/BuildingCatalog.js';

export class Economy {
  constructor() {
    this.cash = CITY_CONFIG.startingCash;
    this.income = 0;
    this.population = 0;
    this.level = 1;
    this.xp = 0;
    this.buildingCount = 0;
  }
  canAfford(amount) { return this.cash >= amount; }
  spend(amount) {
    if (!this.canAfford(amount)) return false;
    this.cash -= amount;
    return true;
  }
  registerBuilding(typeId) {
    const building = BUILDINGS.find(item => item.id === typeId);
    if (!building) return;
    this.income += building.income;
    this.population += building.population;
    this.buildingCount += 1;
    this.xp += 30;
  }
  tick() { this.cash += this.income; }
  get upgradeCost() { return this.level === 1 ? 1250 : this.level === 2 ? 3600 : this.level === 3 ? 8500 : Infinity; }
  upgrade() {
    if (this.level >= 4 || !this.spend(this.upgradeCost)) return false;
    this.level += 1;
    this.xp = 0;
    return true;
  }
  get xpPercent() { return Math.min(100, (this.xp / (this.level * 180)) * 100); }
  toJSON() {
    return { cash: this.cash, income: this.income, population: this.population, level: this.level, xp: this.xp };
  }
  load(data) {
    if (!data || typeof data !== 'object') return;
    const savedCash = Number(data.cash);
    this.cash = Number.isFinite(savedCash) && savedCash >= 0 ? savedCash : CITY_CONFIG.startingCash;
    this.level = Math.min(4, Math.max(1, Number(data.level) || 1));
    this.xp = Math.max(0, Number(data.xp) || 0);
  }
}
