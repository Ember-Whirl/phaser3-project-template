import StartGame from './game/main';
import PortalManager from './scripts/adapters/portals/portalManager';

document.addEventListener('DOMContentLoaded', async () => {

    await PortalManager.init();
    StartGame('game-container');

});