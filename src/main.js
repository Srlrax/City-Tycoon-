import { Game } from './core/Game.js';

const world = document.getElementById('world');
const ui = document.getElementById('ui');

try {
  const game = new Game(world, ui);
  game.start();
  window.cityTycoon = game;
} catch (error) {
  console.error('City Tycoon failed to start:', error);
  const boot = document.getElementById('boot-screen');
  if (boot) boot.innerHTML = '<div class="boot-title">CITY TYCOON COULD NOT LOAD</div><p style="color:#b7c7d1;font-size:12px">Refresh the page and check that WebGL is enabled.</p>';
}
