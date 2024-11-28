import Phaser from 'phaser';
import { STAGES } from '../config';

export default class StageSelect extends Phaser.Scene {
  constructor() {
    super('StageSelect');
  }

  create() {
    this.cameras.main.setBackgroundColor("#eee");


    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.add.text(centerX - 20, centerY - 100, 'Cyclic', {
      fontSize: '24px',
      fontFamily: 'Turret Road',
      color: '#444',
    }).setOrigin(0.5);

    STAGES.forEach((stage, index) => {
      const button = this.add.text(centerX - 20, centerY + index * 50, `「 ${stage.name} 」`, {
        fontSize: '24px',
        fontFamily: 'Turret Road',
        color: `#${stage.panelColor.toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5);

      button.setInteractive();
      button.on('pointerdown', () => {
        this.scene.start('GameScene', STAGES[index]);
      });
    });
  }
}
