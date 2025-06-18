class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    preload() {
        this.load.image('iconDNA', 'assets/dna.png');
        this.load.image('iconInfo', 'assets/information-button.png');
        this.load.image('iconGamepad', 'assets/gamepad.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#fdf6f0');
        const centerX = this.scale.width / 2;

        this.add.image(centerX, 90, 'iconDNA').setScale(0.2).setOrigin(0.5);

        this.add.text(centerX, 160, 'Kodonų paieška', {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#4a3f75',
            align: 'center',
            wordWrap: { width: 800 }
        }).setOrigin(0.5);

        this.add.text(centerX, 220, 
            'Šiame žaidime lavinsite gebėjimą atpažinti kodonus mRNR sekoje.',
            {
            fontSize: '20px',
            color: '#333',
            align: 'center',
            fontFamily: 'Georgia',
            wordWrap: { width: 700 }
            }).setOrigin(0.5);

        const infoIcon = this.add.image(0, 0, 'iconInfo').setScale(0.06).setOrigin(0, 0.5);
        const infoText = this.add.text(infoIcon.displayWidth + 10, 0, 'Kaip žaisti?', {
            fontSize: '20px',
            backgroundColor: '#f39c12',
            color: '#fff',
            padding: { left: 20, right: 20, top: 10, bottom: 10 },
            borderRadius: 10
        }).setOrigin(0, 0.5).setInteractive();

        const infoContainer = this.add.container(0, 310, [infoIcon, infoText]);
        const infoWidth = infoContainer.getBounds().width;
        infoContainer.setX(centerX - infoWidth / 2);

        infoText.on('pointerover', () => infoText.setStyle({ backgroundColor: '#d68910' }));
        infoText.on('pointerout', () => infoText.setStyle({ backgroundColor: '#f39c12' }));
        infoText.on('pointerdown', () => this.showInstructions());

        const gamepadIcon = this.add.image(0, 0, 'iconGamepad').setScale(0.06).setOrigin(0, 0.5);
        const startText = this.add.text(gamepadIcon.displayWidth + 10, 0, 'Pradėti žaidimą', {
            fontSize: '24px',
            backgroundColor: '#27ae60',
            color: '#fff',
            padding: { left: 24, right: 24, top: 12, bottom: 12 },
            borderRadius: 12
        }).setOrigin(0, 0.5).setInteractive();

        const startContainer = this.add.container(0, 380, [gamepadIcon, startText]);
        const startWidth = startContainer.getBounds().width;
        startContainer.setX(centerX - startWidth / 2);

        startText.on('pointerover', () => startText.setStyle({ backgroundColor: '#219150' }));
        startText.on('pointerout', () => startText.setStyle({ backgroundColor: '#27ae60' }));
        startText.on('pointerdown', () => this.scene.start('GameScene'));
    }

    showInstructions() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const background = this.add.rectangle(centerX, centerY, 760, 400, 0xffffff)
            .setStrokeStyle(2, 0xcccccc)
            .setDepth(100);

        this.add.text(centerX, centerY - 150, 'Taisyklės:', {
            fontSize: '26px',
            fontStyle: 'bold',
            fontFamily: 'Georgia',
            color: '#333'
        }).setOrigin(0.5).setDepth(101);

        const taisykles = [
            'Parodomas kodonas, kurį turi rasti (pvz. Met → AUG).',
            'Ekrane rodoma ilga mRNR seka.',
            'Spausk pirmą raidę, kur prasideda kodonas (kas 3 raidės).',
            'Po tikrinimo reikės atsakyti, ką koduoja tas kodonas (pasirinkti iš 3 galimų atsakymų).'
        ];

        const startY = centerY - 100;
        const numberX = centerX - 300;
        const textX = centerX - 260;

        taisykles.forEach((line, i) => {
            this.add.text(numberX, startY + i * 40, `${i + 1}.`, {
            fontSize: '20px',
            fontFamily: 'Georgia',
            color: '#333'
            }).setOrigin(0, 0).setDepth(101);

            this.add.text(textX, startY + i * 40, line, {
            fontSize: '20px',
            fontFamily: 'Georgia',
            color: '#333',
            wordWrap: { width: 600 }
            }).setOrigin(0, 0).setDepth(101);
        });

        const closeBtn = this.add.text(centerX + 360, centerY - 170, '✖️', {
            fontSize: '22px',
            color: '#c0392b',
            backgroundColor: '#fff',
            padding: { left: 6, right: 6, top: 2, bottom: 2 },
            borderRadius: 5
        }).setOrigin(0.5).setInteractive().setDepth(102);

        closeBtn.on('pointerdown', () => {
            background.destroy();
            closeBtn.destroy();
            this.children.list
            .filter(child => child.depth === 101)
            .forEach(child => child.destroy());
        });
    }
}

export { StartScene };
