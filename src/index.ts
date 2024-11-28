import Phaser from 'phaser';
import StageSelect from './scenes/StageSelect';
import GameScene from './scenes/GameScene';
import './styles.css';

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#2d2d2d',
  render: {
    pixelArt: true,
    antialias: true,
    antialiasGL: true,
  },
  scene: [StageSelect, GameScene],
};

const game = new Phaser.Game(config);
