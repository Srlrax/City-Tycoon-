import { BUILDINGS } from '../city/BuildingCatalog.js';

const money = value => '$' + Math.floor(value).toLocaleString('en-US');

export class BuildMenu {
  constructor(root, onSelect) {
    this.root = root;
    this.onSelect = onSelect;
    this.selected = 'house';
  }

  render(level, selected = this.selected) {
    this.selected = selected;
    this.root.innerHTML = '';

    for (const item of BUILDINGS) {
      const locked = level < item.unlock;
      const button = document.createElement('button');
      button.className = 'build-card' + (this.selected === item.id ? ' active' : '');
      button.disabled = locked;
      button.title = locked ? 'Reach city level ' + item.unlock + ' to unlock' : item.description;
      button.innerHTML =
        '<span class="building-emoji">' + item.emoji + '</span>' +
        '<span class="building-copy"><span class="building-name">' + item.name + (locked ? ' 🔒' : '') + '</span>' +
        '<span class="building-detail">+' + money(item.income) + '/s · ' + item.population + ' residents</span></span>' +
        '<span class="building-price">' + money(item.cost) + '</span>';
      button.addEventListener('click', () => {
        this.selected = item.id;
        this.render(level, item.id);
        this.onSelect(item);
      });
      this.root.appendChild(button);
    }
  }
}
