import { kodonuLentele } from './kodonu_lentele.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.visoKodonų = 40;
        this.rezultatuSuvestine = [];
    }

    preload() {
        this.load.image('arrowLeft', 'assets/left.png');
        this.load.image('arrowRight', 'assets/right.png');
        this.load.image('iconCorrect', 'assets/check.png');
        this.load.image('iconWrong', 'assets/delete.png');
        this.load.image('iconMissed', 'assets/warning.png');
    }

    create() {
        this.bazes = ['A', 'U', 'G', 'C'];
        this.kodonai = Object.keys(kodonuLentele);
        this.kodonaiEile = Phaser.Utils.Array.Shuffle(this.kodonai).slice(0, 10);
        this.dabartinisIndeksas = 0;

        this.targetKodonas = this.kodonaiEile[this.dabartinisIndeksas];
        this.targetAmino = kodonuLentele[this.targetKodonas];

        this.targetKodonas = this.kodonaiEile[this.dabartinisIndeksas];
        this.targetAmino = kodonuLentele[this.targetKodonas];
        this.generateSequence();

        this.pasirinkimai = new Set();
        this.symbols = [];

        this.showProgress();
        this.showIntro();
        this.laukiamKlausimo = false;
    }

    showProgress() {
        const centerX = this.scale.width / 2;
        const barWidth = 500;
        const procentas = Math.round(100 * (this.dabartinisIndeksas / this.kodonaiEile.length));

        const textY = 510;
        const barY = 535;

        if (this.progressBg) this.progressBg.destroy();
        if (this.progressBar) this.progressBar.destroy();
        if (this.progressText) this.progressText.destroy();

        this.progressText = this.add.text(centerX, textY, `Progresas: ${procentas}%`, {
            fontSize: '16px',
            color: '#5c4d7d'
        }).setOrigin(0.5);

        this.progressBg = this.add.rectangle(centerX, barY, barWidth, 8, 0xe0e0e0).setOrigin(0.5);

        const barLength = barWidth * procentas / 100;
        const barX = centerX - barWidth / 2 + barLength / 2;

        this.progressBar = this.add.rectangle(barX, barY, barLength, 8, 0xff9f43).setOrigin(0.5);
    }

    showIntro() {
        const centerX = this.scale.width / 2;

        this.introText = this.add.text(centerX, 60, 'Įsimink šį kodoną:', {
            fontSize: '30px',
            color: '#5c4d7d'
        }).setOrigin(0.5);

        this.targetText = this.add.text(centerX, 100, `${this.targetAmino} → ${this.targetKodonas}`, {
            fontSize: '32px', color: '#000'
        }).setOrigin(0.5);
        
        this.time.delayedCall(5000, () => {
            this.introText.setVisible(false);
            this.targetText.setVisible(false);
            this.showSequence();
        });
    }

    showSequence() {
        this.add.text(450, 80, 'Užduotis: Surask visus atitinkamus kodonus mRNR sekoje', {
            fontSize: '25px',
            color: '#5c4d7d'
        }).setOrigin(0.5);

        const spacing = 28;
        const extraGap = 6;
        const viewX = 100;
        const viewWidth = 700;
        const y = 180;

        const colorMap = {
            'A': '#27ae60',
            'U': '#2980b9',
            'G': '#f39c12',
            'C': '#8e44ad'
        };

        this.sequenceContainer = this.add.container(viewX, y);
            this.symbols = [];

        for (let i = 0; i < this.visaSeka.length; i++) {
        const char = this.visaSeka[i];
        const offset = i > 0 ? Math.floor(i / 3) * extraGap : 0;
        const x = i * spacing + offset;

        const t = this.add.text(x, 0, char, {
            fontFamily: 'monospace',
            fontSize: '28px',
            color: colorMap[char] || '#000',
            backgroundColor: '#ffffff',
            padding: { left: 8, right: 8, top: 6, bottom: 6 }
        }).setInteractive();

        t.setAlpha(0);
        t.y += 30;

        this.tweens.add({
            targets: t,
            alpha: 1,
            y: t.y - 30,
            duration: 400,
            ease: 'Back.easeOut',
            delay: i * 15
        });

        if (Math.floor(i / 3) % 2 === 1) {
            t.setBackgroundColor('#f2f2f2'); 
            }

        t.index = i;
        this.symbols.push(t);
        this.sequenceContainer.add(t);

        t.on('pointerover', () => t.setScale(1.2));
        t.on('pointerout', () => t.setScale(1));
        t.on('pointerdown', () => this.toggleMark(t));
        }

        const pirmas = this.symbols[0];
        const offsetFix = pirmas.getBounds().x;
        this.symbols.forEach(t => t.x -= offsetFix);

        const paskutinis = this.symbols[this.symbols.length - 1];
        this.sequenceContainer.width = paskutinis.x + paskutinis.width;

        const kodonoPlotis = this.symbols[3].x - this.symbols[0].x;

        const arrowY = y - 20; 

        const leftArrow = this.add.image(viewX - 80, arrowY, 'arrowLeft') 
        .setInteractive()
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setScale(0.05);

        const rightArrow = this.add.image(viewX + viewWidth + 80, arrowY, 'arrowRight') 
        .setInteractive()
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setScale(0.05);

        leftArrow.on('pointerdown', () => {
            this.sequenceContainer.x = Math.min(this.sequenceContainer.x + kodonoPlotis, viewX);
        });

        rightArrow.on('pointerdown', () => {
            const containerRightEdge = this.sequenceContainer.x + this.sequenceContainer.width;
            const viewRightEdge = viewX + viewWidth;
            if (containerRightEdge > viewRightEdge) {
            this.sequenceContainer.x -= kodonoPlotis;
            }
        });

        const centerX = this.scale.width / 2;

        this.tikrintiBtn = this.add.text(centerX, 400, 'Tikrinti', {
            fontSize: '24px',
            backgroundColor: '#ff9f43',
            color: '#fff',
            padding: 10
        }).setOrigin(0.5).setInteractive().setScrollFactor(0);


        this.tikrintiBtn.on('pointerover', () => this.tikrintiBtn.setStyle({ backgroundColor: '#e67e22' }));
        this.tikrintiBtn.on('pointerout', () => this.tikrintiBtn.setStyle({ backgroundColor: '#ff9f43' }));
        this.tikrintiBtn.on('pointerdown', () => this.evaluate());
    }

    animateBounce(target) {
        this.tweens.add({
            targets: target,
            scale: 1.2,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
    }

    toggleMark(t) {
        const i = t.index;
        if (i > this.visaSeka.length - 3 || i % 3 !== 0) return;

        if (this.pasirinkimai.has(i)) {
            this.pasirinkimai.delete(i);
            for (let j = 0; j < 3; j++) {
            this.symbols[i + j].setBackgroundColor('#ffffff');
            this.animateBounce(this.symbols[i + j]);
            }
        } else {
            this.pasirinkimai.add(i);
            for (let j = 0; j < 3; j++) {
            this.symbols[i + j].setBackgroundColor('#fff7c2');
            this.animateBounce(this.symbols[i + j]);
            }
        }
    }

    showTeisingasAts(kodonas) {
        const ats = kodonuLentele[kodonas];

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2 - 140;

        const fonas = this.add.rectangle(centerX, centerY, 400, 120, 0xffffff)
            .setStrokeStyle(2, 0xcccccc);

        const tekstas = this.add.text(centerX, centerY, `Teisingas atsakymas:\n${kodonas} → ${ats}`, {
            fontSize: '20px',
            fontFamily: 'Georgia',
            color: '#4a3f75',
            align: 'center',
            wordWrap: { width: 360 }
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            fonas.destroy();
            tekstas.destroy();
        });
    }

    generateSequence() {
        const visoKodonų = this.visoKodonų;
        const kiekTarget = Phaser.Math.Between(3, 7);
        this.kiekTarget = kiekTarget;

        const visiKodonai = Array.from({ length: visoKodonų }, () => null);

        const validIndices = Phaser.Utils.Array.Shuffle([...Array(visoKodonų).keys()]);
        const tiksliniuPozicijos = validIndices.slice(0, kiekTarget);

        tiksliniuPozicijos.forEach(i => {
            visiKodonai[i] = this.targetKodonas;
        });

        for (let i = 0; i < visoKodonų; i++) {
            if (!visiKodonai[i]) {
            let rnd;
            do {
                rnd = Phaser.Utils.Array.GetRandom(this.kodonai);
            } while (rnd === this.targetKodonas);
            visiKodonai[i] = rnd;
            }
        }

        this.visaSeka = visiKodonai.flatMap(kodonas => kodonas.split(''));
    }

    evaluate() {
        const teisingos = [];
        for (let i = 0; i < this.visaSeka.length; i += 3) {
        const k = this.visaSeka.slice(i, i + 3).join('');
        if (k.length === 3 && k === this.targetKodonas) {
            teisingos.push(i);
        }
        }

        let teisingai = 0, klaidos = 0, praleista = 0;

        this.pasirinkimai.forEach(i => {
        if (teisingos.includes(i)) {
            teisingai++;
            for (let j = 0; j < 3; j++) {
            const sym = this.symbols[i + j];
            sym.setBackgroundColor('#c8facc');
            this.animateBounce(sym);
            }
        } else {
            klaidos++;
            for (let j = 0; j < 3; j++) {
            this.symbols[i + j].setBackgroundColor('#ffc9c9');
            }
        }
        });

        teisingos.forEach(i => {
        if (!this.pasirinkimai.has(i)) {
            for (let j = 0; j < 3; j++) {
            this.symbols[i + j].setBackgroundColor('#ffeaa7');
            }
            praleista++;
        }
        });

        this.tikrintiBtn.setVisible(false);

        const resultLines = [
        { icon: 'iconCorrect', label: `Teisingi: ${teisingai}` },
        { icon: 'iconWrong', label: `Klaidos: ${klaidos}` },
        { icon: 'iconMissed', label: `Praleista: ${praleista}` }
        ];

        const centerX = this.scale.width / 2;
        const baseY = 600;
        const lineHeight = 38;

        resultLines.forEach((item, i) => {
        const y = baseY + i * lineHeight;

        const labelText = this.add.text(0, 0, item.label, {
            fontSize: '18px',
            fontFamily: 'Georgia',
            color: '#000'
        }).setOrigin(0, 0.5);

        const icon = this.add.image(0, 0, item.icon)
            .setOrigin(0, 0.5)
            .setDisplaySize(24, 24);

        labelText.x = icon.displayWidth + 10;

        const totalWidth = icon.displayWidth + 10 + labelText.width;

        const container = this.add.container(centerX - totalWidth / 2, y, [icon, labelText]);
        });

        this.testiBtn = this.add.text(centerX, baseY + 4.5 * lineHeight, 'Tęsti', {
        fontSize: '24px',
        backgroundColor: '#27ae60',
        color: '#fff',
        padding: 10
        }).setOrigin(0.5).setInteractive().setScrollFactor(0).setVisible(false);

        this.laukiamKlausimo = true;

        this.showKodonQuestion(this.targetKodonas, () => {
        this.showTeisingasAts(this.targetKodonas);
        this.laukiamKlausimo = false;
        this.testiBtn.setVisible(true);
        });


        this.testiBtn.on('pointerover', () => {
        this.testiBtn.setStyle({ backgroundColor: '#219150' });
        });

        this.testiBtn.on('pointerout', () => {
        this.testiBtn.setStyle({ backgroundColor: '#27ae60' });
        });

        this.testiBtn.on('pointerdown', () => {
        if (this.laukiamKlausimo) return;

        this.testiBtn.destroy();
        this.pasirinkimai.clear();
        this.symbols = [];

        this.dabartinisIndeksas++;
        if (this.dabartinisIndeksas < this.kodonaiEile.length) {
            this.children.removeAll();
            this.showProgress();
            this.targetKodonas = this.kodonaiEile[this.dabartinisIndeksas];
            this.targetAmino = kodonuLentele[this.targetKodonas];
            this.generateSequence(); // ✅ Svarbu!
            this.showIntro();
        } else {
            this.showEnd();
        }
        });

        this.rezultatuSuvestine.push({
            kodonas: this.targetKodonas,
            amino: this.targetAmino,
            teisingi: teisingai,
            klaidos: klaidos + praleista
        });

    }

    showKodonQuestion(kodonas, onFinish) {
        const teisingasAts = kodonuLentele[kodonas];

        const kiti = Object.values(kodonuLentele)
            .filter(x => x !== teisingasAts && x !== 'Stop');
        Phaser.Utils.Array.Shuffle(kiti);

        const pasirinkimai = Phaser.Utils.Array.Shuffle([
            teisingasAts, kiti[0], kiti[1]
        ]);

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2 - 100;

        const z = 1000;

        const fonas = this.add.rectangle(centerX, centerY, 400, 220, 0xffffff)
            .setStrokeStyle(2, 0xcccccc)
            .setDepth(z);

        const klausimas = this.add.text(centerX, centerY - 70, `Ką koduoja kodonas ${kodonas}?`, {
            fontSize: '20px',
            fontFamily: 'Georgia',
            color: '#4a3f75',
            align: 'center',
            wordWrap: { width: 360 }
        }).setOrigin(0.5).setDepth(z);

        const buttons = [];

        pasirinkimai.forEach((ats, i) => {
            const btn = this.add.text(centerX, centerY - 20 + i * 50, ats, {
            fontSize: '18px',
            backgroundColor: '#ecf0f1',
            color: '#2c3e50',
            padding: { left: 20, right: 20, top: 6, bottom: 6 },
            borderRadius: 5
            }).setOrigin(0.5).setInteractive().setDepth(z);

            btn.on('pointerdown', () => {
            if (ats === teisingasAts) {
                btn.setStyle({ backgroundColor: '#2ecc71' });
            } else {
                btn.setStyle({ backgroundColor: '#e74c3c' });
            }

            buttons.forEach(b => b.disableInteractive());

            this.time.delayedCall(1000, () => {
                fonas.destroy();
                klausimas.destroy();
                buttons.forEach(b => b.destroy());
                if (typeof onFinish === 'function') onFinish();
            });
            });

            buttons.push(btn);
        });
    }

        showEnd() {
            this.children.removeAll();

            const centerX = this.scale.width / 2;

            this.add.text(centerX, 60, 'Žaidimas baigtas!', {
                fontSize: '32px',
                color: '#5c4d7d'
            }).setOrigin(0.5);

            const rez = this.rezultatuSuvestine || [];

            const cardWidth = 550;
            const cardHeight = 40;
            const startY = 120;
            const gap = 10;

            rez.forEach((entry, i) => {
                const y = startY + i * (cardHeight + gap);
                const bgColor = i % 2 === 0 ? 0xf8f8f8 : 0xe8eaf6;
                const offsetX = centerX - cardWidth / 2 + 20;

                const spalva = entry.klaidos === 0
                    ? '#2ecc71'
                    : (entry.teisingi === 0 ? '#e74c3c' : '#f39c12');

                this.add.rectangle(centerX, y, cardWidth, cardHeight, bgColor)
                    .setStrokeStyle(1, 0xcccccc)
                    .setOrigin(0.5);

                this.add.text(offsetX, y, `${entry.kodonas} → ${entry.amino}`, {
                    fontSize: '18px',
                    color: spalva
                }).setOrigin(0, 0.5);

                this.add.image(offsetX + 180, y, 'iconCorrect').setDisplaySize(20, 20).setOrigin(0.5);
                this.add.text(offsetX + 200, y, `${entry.teisingi}`, {
                    fontSize: '18px',
                    color: '#2ecc71'
                }).setOrigin(0, 0.5);

                this.add.image(offsetX + 260, y, 'iconWrong').setDisplaySize(20, 20).setOrigin(0.5);
                this.add.text(offsetX + 280, y, `${entry.klaidos} klaidos`, {
                    fontSize: '18px',
                    color: '#e74c3c'
                }).setOrigin(0, 0.5);
            });

            
            const restartBtn = this.add.text(centerX, this.scale.height - 80, 'Žaisti dar kartą', {
                fontSize: '22px',
                backgroundColor: '#3498db',
                color: '#fff',
                padding: 10
            }).setOrigin(0.5).setInteractive();

            restartBtn.on('pointerover', () => restartBtn.setStyle({ backgroundColor: '#2980b9' }));
            restartBtn.on('pointerout', () => restartBtn.setStyle({ backgroundColor: '#3498db' }));
            restartBtn.on('pointerdown', () => location.reload());

                this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
                this.cameras.main.scrollY += deltaY * 0.3;
            });

        }

}

export { GameScene };
