# City Tycoon

A 3D browser-based city-building prototype built with Three.js, HTML, CSS, and JavaScript modules.

## Play it

This is a static web app. It loads Three.js from jsDelivr and therefore needs an internet connection.

### Publish with GitHub Pages
1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the `main` branch and `/(root)` folder.
4. Save and open the Pages URL shown by GitHub after deployment.

### Test locally
Run the project with a local web server (for example, VS Code Live Server). Do not open `index.html` directly as a `file://` page; browsers can block JavaScript module imports that way.

## Controls
- **WASD / arrow keys:** move the mayor.
- **Right mouse drag:** rotate the camera.
- **Build menu:** select a property, then click an empty green lot.
- **Upgrade City:** unlocks more advanced properties.
- **Save City:** saves progress in this browser.

## Prototype features
- Procedurally generated city roads, lane markings, sidewalks, streetlights, trees, and distant buildings.
- Third-person character with a basic animated walk cycle and orbit camera.
- Procedural homes, shops, cafes, offices, parks, and a glass tower.
- Building placement, cash, passive income, population, city upgrades, and local save data.
- Simple moving road traffic and pedestrian ambience.

## Project status
This is an early playable foundation, not a finished commercial game. Production-level character and vehicle models, advanced animations, detailed interiors, audio, mobile touch controls, online accounts, and multiplayer are future development steps.
