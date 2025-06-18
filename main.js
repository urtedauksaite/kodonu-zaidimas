import { GameScene } from './GameScene.js';
import { StartScene } from './StartScene.js';

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 900,
  backgroundColor: '#fdf6f0',
  scene: [StartScene, GameScene]
};

new Phaser.Game(config);
