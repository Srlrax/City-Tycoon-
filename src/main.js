const world = document.getElementById('world');
const ui = document.getElementById('ui');
const boot = document.getElementById('boot-screen');

let started = false;
let stage = 'Loading game modules';
const slowLoadTimer = window.setTimeout(() => {
  if (started || !boot) return;
  showFailure(
    'The game is still waiting for the 3D engine.',
    'The network may be blocking all available 3D library hosts.'
  );
}, 18000);

function showFailure(title, detail) {
  if (!boot) return;
  boot.dataset.gameStarted = 'true';
  boot.style.opacity = '1';
  boot.innerHTML = '';
  const mark = document.createElement('div');
  mark.className = 'boot-mark';
  mark.textContent = 'CT';
  const heading = document.createElement('div');
  heading.className = 'boot-title';
  heading.textContent = title;
  const subtitle = document.createElement('div');
  subtitle.className = 'boot-subtitle';
  subtitle.textContent = 'STARTUP STAGE: ' + stage;
  const errorBox = document.createElement('pre');
  errorBox.style.cssText = 'max-width:min(760px,90vw);max-height:30vh;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;text-align:left;padding:14px 16px;margin:18px 0 0;background:#07131b;border:1px solid #ffffff28;border-radius:10px;color:#c3d4de;font:12px/1.5 monospace';
  errorBox.textContent = String(detail || 'No additional error information was provided.');
  const retry = document.createElement('button');
  retry.textContent = 'RETRY';
  retry.style.cssText = 'margin-top:18px;padding:11px 22px;border:0;border-radius:9px;background:#79dfae;color:#12352c;font-weight:800;cursor:pointer';
  retry.addEventListener('click', () => location.reload());
  boot.append(mark, heading, subtitle, errorBox, retry);
}

async function startGame() {
  try {
    // Load modules one at a time so a syntax/import failure identifies its real file.
    const moduleChecks = [
      '../vendor/three.js', '../config.js', '../core/AssetLoader.js', '../world/Lighting.js',
      '../world/Roads.js', '../world/CityBlock.js', '../world/StreetProps.js', '../world/CityWorld.js',
      '../player/CharacterAnimator.js', '../player/Player.js', '../player/CameraRig.js', './Input.js',
      '../city/BuildingCatalog.js', '../city/PlacementSystem.js', '../systems/Economy.js',
      '../systems/MissionSystem.js', '../systems/SaveSystem.js', '../vehicles/Vehicle.js',
      '../systems/TrafficSystem.js', '../systems/PedestrianSystem.js', '../vehicles/VehicleController.js',
      '../ui/BuildMenu.js', '../ui/Notifications.js', '../ui/HUD.js'
    ];
    for (const path of moduleChecks) {
      stage = 'Checking module ' + path;
      await import(path);
    }
    stage = 'Loading game controller';
    const { Game } = await import('./core/Game.js');
    stage = 'Creating the renderer and city';
    const game = new Game(world, ui);
    stage = 'Starting the game loop';
    game.start();
    window.cityTycoon = game;
    started = true;
    clearTimeout(slowLoadTimer);
  } catch (error) {
    console.error('City Tycoon startup error:', error);
    clearTimeout(slowLoadTimer);
    const message = [
      error?.name || 'Error',
      error?.message || String(error),
      error?.stack ? '\\n\\n' + error.stack : ''
    ].join('');
    showFailure('CITY TYCOON COULD NOT LOAD', message);
  }
}

startGame();
