const MISSIONS = [
  { title: 'Build your neighborhood', detail: 'Place 2 starter homes', kind: 'buildings', type: 'house', target: 2, reward: 150 },
  { title: 'Open for business', detail: 'Build your first corner store', kind: 'buildings', type: 'shop', target: 1, reward: 250 },
  { title: 'Welcome new residents', detail: 'Grow your population to 25', kind: 'population', target: 25, reward: 400 },
  { title: 'A thriving economy', detail: 'Reach $40 income per second', kind: 'income', target: 40, reward: 600 },
  { title: 'Become an established city', detail: 'Reach city level 2', kind: 'level', target: 2, reward: 1200 },
  { title: 'Give people room to breathe', detail: 'Build your first city park', kind: 'buildings', type: 'park', target: 1, reward: 850 }
];

export class MissionSystem {
  constructor() { this.completed = 0; }

  reset() { this.completed = 0; }

  load(index) {
    this.completed = Math.max(0, Math.min(MISSIONS.length, Number(index) || 0));
  }

  get current() {
    if (this.completed >= MISSIONS.length) return null;
    return { ...MISSIONS[this.completed], index: this.completed + 1, total: MISSIONS.length };
  }

  progress(economy, placement) {
    const mission = this.current;
    if (!mission) return { mission: null, value: 0, ratio: 1 };
    let value = 0;
    if (mission.kind === 'buildings') {
      value = placement.objects.filter(item => item.type === mission.type).length;
    } else if (mission.kind === 'population') value = economy.population;
    else if (mission.kind === 'income') value = economy.income;
    else if (mission.kind === 'level') value = economy.level;
    return { mission, value, ratio: Math.min(1, value / mission.target) };
  }

  update(economy, placement) {
    const state = this.progress(economy, placement);
    if (!state.mission || state.value < state.mission.target) return null;
    const finished = state.mission;
    economy.cash += finished.reward;
    economy.xp += 60;
    this.completed += 1;
    return { ...finished, completed: this.completed, cash: economy.cash };
  }

  toJSON() { return { completed: this.completed }; }
}
