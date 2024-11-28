import Phaser from 'phaser';
import { STAGES, PANEL_SIZE } from '../config';

export default class GameScene extends Phaser.Scene {
  panels: Phaser.GameObjects.Rectangle[];
  timer: Phaser.Time.TimerEvent | null;
  startTime: number;
  stageConfig: { rows: number; cols: number; bgColor: number; panelColor: number; panelBgColor: number };
  timerText!: Phaser.GameObjects.Text; // timerTextをプロパティとして追加

  constructor() {
    super({ key: 'GameScene' });
    this.panels = [];
    this.timer = null;
    this.startTime = 0;
    this.stageConfig = { rows: 1, cols: 3, bgColor: 0, panelColor: 0, panelBgColor: 0 };
    console.log(this.stageConfig);
  }

  init(data: { rows: number; cols: number; bgColor: number; panelColor: number; panelBgColor: number }): void {
    this.stageConfig = data;
  }

  create() {
    // 背景色設定
    this.cameras.main.setBackgroundColor(this.stageConfig.bgColor);

    // タイマー開始
    this.startTime = Date.now();

    // 事前に計算された方向データを作成
    const precomputedDirections = this.calculateInitialDirections();

    // パネル生成
    this.createPanels(precomputedDirections);

    // タイマー表示
    this.timerText = this.add.text(10, 10, 'Time: 0s', { fontSize: '16px', color: `#${this.stageConfig.panelColor.toString(16).padStart(6, '0')}` });

    this.timer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.timerText.setText(`Time: ${elapsed}s`);
      },
    });

    // ランダムエフェクト
    this.time.addEvent({
      delay: 3000,
      callback: this.createRandomEffect,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.timerText.setText(`Time: ${elapsed}s`);
  }

  createPanels(precomputedDirections: number[][]) {
    const { rows, cols } = this.stageConfig;
    const startX = (this.scale.width - cols * PANEL_SIZE) / 2;
    const startY = (this.scale.height - rows * PANEL_SIZE) / 2 + (cols * PANEL_SIZE / 2);
    console.log(rows, cols);
    this.add.polygon(startX - PANEL_SIZE/2, startY - PANEL_SIZE*(cols-1) - PANEL_SIZE/2, [0, 0, 20, 0, 20, 20, 15, 20, 15, 5, 0, 5], this.stageConfig.panelColor).setAngle(270);
    this.add.polygon(startX + PANEL_SIZE*(cols-1) + PANEL_SIZE/2, startY + PANEL_SIZE*(rows-1) + PANEL_SIZE/2, [0, 0, 20, 0, 20, 20, 15, 20, 15, 5, 0, 5], this.stageConfig.panelColor).setAngle(90);

    this.add.rectangle(startX - PANEL_SIZE*0.75 + 5 , startY + PANEL_SIZE*0.75 + 5 + PANEL_SIZE*(rows-1), PANEL_SIZE/2, PANEL_SIZE/2, this.stageConfig.panelBgColor);
    this.add.rectangle(startX - PANEL_SIZE*1.25 + 5 , startY + PANEL_SIZE*1.25 + 5 + PANEL_SIZE*(rows-1), PANEL_SIZE/4, PANEL_SIZE/4, this.stageConfig.panelBgColor);
    this.add.rectangle(startX - PANEL_SIZE*1.55 + 5 , startY + PANEL_SIZE*1.55 + 5 + PANEL_SIZE*(rows-1), PANEL_SIZE/8, PANEL_SIZE/8, this.stageConfig.panelBgColor);

    this.add.rectangle(startX + cols * PANEL_SIZE - PANEL_SIZE*0.25 + 5, startY - cols * PANEL_SIZE + PANEL_SIZE*0.25 + 5, PANEL_SIZE/2, PANEL_SIZE/2, this.stageConfig.panelBgColor);
    this.add.rectangle(startX + cols * PANEL_SIZE + PANEL_SIZE*0.25 + 5, startY - cols * PANEL_SIZE - PANEL_SIZE*0.25 + 5, PANEL_SIZE/4, PANEL_SIZE/4, this.stageConfig.panelBgColor);
    this.add.rectangle(startX + cols * PANEL_SIZE + PANEL_SIZE*0.55 + 5, startY - cols * PANEL_SIZE - PANEL_SIZE*0.55 + 5, PANEL_SIZE/8, PANEL_SIZE/8, this.stageConfig.panelBgColor);


    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = startX + j * PANEL_SIZE;
        const y = startY + i * PANEL_SIZE - j * PANEL_SIZE;
        const panel_bg = this.add.rectangle(x+5, y+5, PANEL_SIZE - 5, PANEL_SIZE - 5, this.stageConfig.panelBgColor);

        const panel = this.add.rectangle(x, y, PANEL_SIZE - 5, PANEL_SIZE - 5, this.stageConfig.panelColor)
          .setInteractive();

        // 事前計算された方向を使用
        const initialDirection = precomputedDirections[i][j];
        panel.setData('direction', initialDirection);

        // L字の黒い6角形を追加
        const arrow = this.add.polygon(x - PANEL_SIZE / 2, y - PANEL_SIZE / 2, [0, 0, 20, 0, 20, 20, 15, 20, 15, 5, 0, 5], this.stageConfig.bgColor);
        arrow.setOrigin(0.5);
        panel.setData('arrow', arrow);
        this.updateArrowPosition(arrow, panel, initialDirection);

        panel.on('pointerdown', () => {
          console.log('pointerdown');
          this.rotatePanel(panel, arrow);
          this.rotateAdjacentPanels(i, j);
          this.checkClear();
        });

        this.panels.push(panel);
      }
    }
  }

  calculateInitialDirections(): number[][] {
    const { rows, cols } = this.stageConfig;
    const directions = Array.from({ length: rows }, () => Array(cols).fill(0));

    // ランダムにいくつかのパネルを押したと仮定して方向を設定
    const numberOfPresses = rows * cols; // ランダムに押す回数を決定

    for (let n = 0; n < numberOfPresses; n++) {
      const randomRow = Phaser.Math.Between(0, rows - 1);
      const randomCol = Phaser.Math.Between(0, cols - 1);

      // 中心のパネルを回転
      directions[randomRow][randomCol] = (directions[randomRow][randomCol] + 1) % 4;

      // 隣接するパネルも回転
      const adjacentOffsets = [
        { row: -1, col: 0 }, // 上
        { row: 1, col: 0 },  // 下
        { row: 0, col: -1 }, // 左
        { row: 0, col: 1 }   // 右
      ];

      adjacentOffsets.forEach(offset => {
        const adjRow = randomRow + offset.row;
        const adjCol = randomCol + offset.col;
        if (adjRow >= 0 && adjRow < rows && adjCol >= 0 && adjCol < cols) {
          directions[adjRow][adjCol] = (directions[adjRow][adjCol] + 1) % 4;
        }
      });
    }

    return directions;
  }

  rotatePanel(panel: Phaser.GameObjects.Rectangle, arrow: Phaser.GameObjects.Polygon) {
    const currentDirection = panel.getData('direction');
    const newDirection = (currentDirection + 1) % 4;
    panel.setData('direction', newDirection);
    this.tweens.add({
      targets: arrow,
      duration: 300,
      onComplete: () => {
        this.checkClear();
        this.updateArrowPosition(arrow, panel, newDirection);
      },
    });
  }
  rotateAdjacentPanels(row: number, col: number) {
    const directions = [
      { row: -1, col: 0 }, // 上
      { row: 1, col: 0 },  // 下
      { row: 0, col: -1 }, // 左
      { row: 0, col: 1 }   // 右
    ];

    directions.forEach(dir => {
      const adjRow = row + dir.row;
      const adjCol = col + dir.col;
      if (adjRow >= 0 && adjRow < this.stageConfig.rows && adjCol >= 0 && adjCol < this.stageConfig.cols) {
        const index = adjRow * this.stageConfig.cols + adjCol;
        const adjacentPanel = this.panels[index];
        const currentDirection = adjacentPanel.getData('direction');
        const newDirection = (currentDirection + 1) % 4;
        adjacentPanel.setData('direction', newDirection);
        const arrow = adjacentPanel.getData('arrow');

        // Update the arrow position for the adjacent panel
        this.updateArrowPosition(arrow, adjacentPanel, newDirection);
      }
    });
  }

  updateArrowPosition(arrow: Phaser.GameObjects.Polygon, panel: Phaser.GameObjects.Rectangle, direction: number) {
    const offset = PANEL_SIZE / 2 - 20;
    let targetX = panel.x;
    let targetY = panel.y;
    let angle = 0;

    switch (direction) {
      case 0: // 上
        targetX -= offset;
        targetY -= offset;
        angle = 270;
        break;
      case 1: // 右
        targetX += offset;
        targetY -= offset;
        angle = 0;
        break;
      case 2: // 下
        targetX += offset;
        targetY += offset;
        angle = 90;
        break;
      case 3: // 左
        targetX -= offset;
        targetY += offset;
        angle = 180;
        break;
    }
    const angleDifference = Phaser.Math.Angle.WrapDegrees(angle - arrow.angle);

    this.tweens.add({
      targets: arrow,
      x: targetX,
      y: targetY,
      angle: arrow.angle + angleDifference,
      duration: 300,
      ease: 'Power2',
    });
  }

  checkClear() {
    const firstDirection = this.panels[0].getData('direction');
    const isCleared = this.panels.every(panel => panel.getData('direction') === firstDirection);
    if (isCleared) {
      if (this.timer) {
        this.timer.remove(); // タイマーを停止
        this.timer = null;
      }

      this.panels.forEach(panel => {
        panel.disableInteractive(); // パネルの操作を無効化
      });
      
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.add.text(200, 300, `Time: ${elapsed}`, {
        fontSize: '32px',
        color: '#999',
        align: 'center',
        fontFamily: 'Turret Road',
      });

      this.time.delayedCall(5000, () => {
        this.panels.forEach(panel => {
          const arrow = panel.getData('arrow');
          if (arrow) {
            arrow.destroy(); // 古い矢印を破棄
          }
        });
        this.panels = []; // パネルリストをクリア
        this.scene.start('StageSelect');
      });
    }
  }

  createRandomEffect() {
    const x = Phaser.Math.Between(0, this.scale.width);
    const y = Phaser.Math.Between(0, this.scale.height);
    const size = Phaser.Math.Between(10, 30);

    const effect = this.add.rectangle(x, y, size, size, this.stageConfig.panelBgColor).setAngle(45);
    const effect_2 = this.add.rectangle(x, y + size*1.2, size/2, size/2, this.stageConfig.panelBgColor).setAngle(45);
    const effect_3 = this.add.rectangle(x, y + size*2, size/2, size/2, this.stageConfig.panelBgColor).setAngle(45);

    this.tweens.add({
      targets: [effect, effect_2, effect_3],
      alpha: 0,
      duration: 5000,
      onComplete: () => {
        effect.destroy();
        effect_2.destroy();
        effect_3.destroy();
      },
    });
  }
}
