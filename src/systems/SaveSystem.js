import { CITY_CONFIG } from '../config.js';
export class SaveSystem {
  load() {
    try { const raw = localStorage.getItem(CITY_CONFIG.saveKey); return raw ? JSON.parse(raw) : null; }
    catch (error) { console.warn('Could not read the local save:', error); return null; }
  }
  save(payload) {
    try { localStorage.setItem(CITY_CONFIG.saveKey, JSON.stringify({ ...payload, savedAt: Date.now() })); return true; }
    catch (error) { console.warn('Could not save the game:', error); return false; }
  }
}
