import { BuildMenu } from './BuildMenu.js';
import { Notifications } from './Notifications.js';
const money = value => '$' + Math.floor(value).toLocaleString('en-US');

export class HUD {
  constructor(root, handlers) {
    this.root = root; this.handlers = handlers; this.selected = 'house';
    this.root.innerHTML = `
      <header class="topbar ui-panel">
        <div class="brand"><div class="brand-symbol">CT</div><div><div class="brand-name">CITY TYCOON</div><div class="brand-sub">BUILD YOUR OWN WORLD</div></div></div>
        <div class="stat-card"><div class="stat-label">CASH</div><div class="stat-value cash" id="hud-cash">$1,250</div></div>
        <div class="stat-card"><div class="stat-label">INCOME</div><div class="stat-value" id="hud-income">$0/s</div></div>
        <div class="stat-card"><div class="stat-label">RESIDENTS</div><div class="stat-value" id="hud-population">0</div></div>
        <button class="help-button ui-button" id="help-button" aria-label="How to play">?</button>
      </header>
      <aside class="side-panel ui-panel" id="build-panel">
        <div class="panel-head"><div class="panel-icon">🏗️</div><div><div class="panel-title">BUILD MENU</div><div class="panel-caption">Select a property, then click a green lot</div></div></div>
        <div id="building-list"></div><div class="panel-note">Properties generate income every second. Explore the city and expand your district.</div>
      </aside>
      <aside class="side-panel ui-panel" id="city-panel">
        <div class="panel-head"><div class="panel-icon">📊</div><div><div class="panel-title">CITY OVERVIEW</div><div class="panel-caption">Your mayor dashboard</div></div></div>
        <div class="level-row"><span>City level</span><b id="hud-level">1</b></div>
        <div class="progress-track"><div class="progress-fill" id="hud-xp"></div></div>
        <div class="detail-row"><span>Properties</span><b id="hud-buildings">0</b></div>
        <div class="detail-row"><span>Next unlock</span><b id="hud-unlock">Office</b></div>
        <button class="primary-button ui-button" id="upgrade-button">UPGRADE CITY · $1,250</button>
        <button class="secondary-button ui-button" id="save-button">SAVE CITY</button>
      </aside>
      <div class="controls-hint"><span class="keycap">W A S D</span> MOVE <span class="keycap">RIGHT DRAG</span> LOOK <span class="keycap">SCROLL</span> ZOOM <span class="keycap">E</span> DRIVE CAR <span class="keycap">CLICK</span> BUILD</div>
      <div id="toast" class="toast" role="status"></div>
      <div id="help-modal" class="modal hidden"><div class="modal-card">
        <button class="modal-close ui-button" id="close-help" aria-label="Close">×</button>
        <h2>Welcome, Mayor.</h2><p>Your city starts small. Build homes and businesses, collect income, and upgrade your city to unlock bigger developments.</p>
        <ul><li><b>WASD / arrow keys:</b> move your character. Hold Shift to run and press Space to jump.</li><li><b>Right mouse drag:</b> look around. Use the mouse wheel to zoom in and out.</li><li><b>E:</b> enter or exit your blue sports car when you are nearby.</li><li><b>While driving:</b> WASD steers and accelerates or reverses.</li><li><b>Build menu:</b> select a property, then click an empty green lot.</li><li><b>Upgrade city:</b> unlocks offices, parks, and the glass tower.</li><li><b>Save city:</b> stores your progress in this browser.</li></ul>
        <button class="primary-button ui-button" id="got-it">LET'S BUILD</button>
      </div></div>`;
    this.toast = new Notifications(this.root.querySelector('#toast'));
    this.list = this.root.querySelector('#building-list');
    this.buildMenu = new BuildMenu(this.list, item => {
      this.selected = item.id;
      this.handlers.onSelect(item.id);
      this.toast.show('Selected ' + item.name + '. Click an empty green lot.');
    });
    this.root.querySelector('#help-button').addEventListener('click', () => this.openHelp());
    this.root.querySelector('#close-help').addEventListener('click', () => this.closeHelp());
    this.root.querySelector('#got-it').addEventListener('click', () => this.closeHelp());
    this.root.querySelector('#upgrade-button').addEventListener('click', () => this.handlers.onUpgrade());
    this.root.querySelector('#save-button').addEventListener('click', () => this.handlers.onSave());
    this.renderBuildings(1);
  }
  renderBuildings(level) {
    this.buildMenu.render(level, this.selected);
  }

  update(economy, buildingCount) {
    this.root.querySelector('#hud-cash').textContent = money(economy.cash);
    this.root.querySelector('#hud-income').textContent = money(economy.income) + '/s';
    this.root.querySelector('#hud-population').textContent = economy.population.toLocaleString();
    this.root.querySelector('#hud-level').textContent = economy.level;
    this.root.querySelector('#hud-xp').style.width = economy.xpPercent + '%';
    this.root.querySelector('#hud-buildings').textContent = buildingCount;
    this.root.querySelector('#hud-unlock').textContent = economy.level < 2 ? 'Office' : economy.level < 3 ? 'Glass Tower' : 'City Prestige';
    const upgrade = this.root.querySelector('#upgrade-button');
    upgrade.textContent = economy.level >= 4 ? 'MAX CITY LEVEL' : 'UPGRADE CITY · ' + money(economy.upgradeCost);
    upgrade.disabled = economy.level >= 4 || !economy.canAfford(economy.upgradeCost);
    this.renderBuildings(economy.level);
  }
  openHelp() { this.root.querySelector('#help-modal').classList.remove('hidden'); }
  closeHelp() { this.root.querySelector('#help-modal').classList.add('hidden'); }
}
