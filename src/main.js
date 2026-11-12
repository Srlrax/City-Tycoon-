const world = document.getElementById('world');
const ui = document.getElementById('ui');
const boot = document.getElementById('boot-screen');

let started = false;
const slowLoadTimer = window.setTimeout(() => {
  if (started || !boot) return;
  boot.innerHTML = `
    <div class="boot-mark">CT</div>
    <div class="boot-title">STILL LOADING THE 3D ENGINE</div>
    <div class="boot-subtitle">CHECK YOUR CONNECTION, THEN REFRESH</div>
    <button id="retry-game" style="margin-top:22px;padding:11px 18px;border:0;border-radius:9px;background:#79dfae;color:#12352c;font-weight:800;cursor:pointer">RETRY</button>`;
  boot.querySelector('#retry-game')?.addEventListener('click', () => location.reload());
}, 12000);

async function startGame() {
  try {
    const { Game } = await import('./core/Game.js');
    const game = new Game(world, ui);
    game.start();
    window.cityTycoon = game;
    started = true;
    clearTimeout(slowLoadTimer);
  } catch (error) {
    console.error('City Tycoon failed to start:', error);
    clearTimeout(slowLoadTimer);
    if (boot) {
      boot.innerHTML = `
        <div class="boot-mark">CT</div>
        <div class="boot-title">CITY TYCOON COULD NOT LOAD</div>
        <div class="boot-subtitle">THE 3D ENGINE OR WEBGL FAILED TO START</div>
        <button id="retry-game" style="margin-top:22px;padding:11px 18px;border:0;border-radius:9px;background:#79dfae;color:#12352c;font-weight:800;cursor:pointer">RETRY</button>`;
      boot.querySelector('#retry-game')?.addEventListener('click', () => location.reload());
    }
  }
}

startGame();
