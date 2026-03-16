const gameEngine = new GameEngine();
const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./sprites/walkingchopper.png");
ASSET_MANAGER.queueDownload("./sprites/standingchopper.png");
ASSET_MANAGER.queueDownload("./sprites/runchopper.png");
ASSET_MANAGER.queueDownload("./sprites/punch1.png");
ASSET_MANAGER.queueDownload("./sprites/punch2.png");
ASSET_MANAGER.queueDownload("./sprites/punch3.png");
ASSET_MANAGER.queueDownload("./sprites/jumpchopper.png");
ASSET_MANAGER.queueDownload("./sprites/thwomp.png");
ASSET_MANAGER.queueDownload("./sprites/spike.png");


ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");

    gameEngine.player = new chopper(gameEngine);
    gameEngine.addEntity(gameEngine.player);

    // Runner-style randomized obstacles (breakable block or spike).
    const obstacleManager = new ObstacleManager(gameEngine);
    gameEngine.obstacleManager = obstacleManager;
    gameEngine.addEntity(obstacleManager);

    gameEngine.init(ctx);
    // Static background image is already set in index.html on the canvas.
    canvas.focus();
    gameEngine.start();
});