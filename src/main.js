import Phaser from 'phaser';
import '@fontsource/noto-sans/latin-400.css';
import '@fontsource/noto-sans/vietnamese-400.css';
import '@fontsource/noto-sans/latin-700.css';
import '@fontsource/noto-sans/vietnamese-700.css';
import '@fontsource/noto-sans/latin-800.css';
import '@fontsource/noto-sans/vietnamese-800.css';
import './style.css';
import nutArt from './assets/ca1png.png?url&no-inline';
import buffaloArt from './assets/ca2png.png?url&no-inline';
import cartArt from './assets/cart.svg?url&no-inline';
import wheelArt from './assets/wheel.svg?url&no-inline';

const W = 360, H = 640, DECK = 533;
const TEXT_RESOLUTION = Math.min(4, Math.max(2, window.devicePixelRatio * Math.min(window.innerWidth / W, window.innerHeight / H)));
const RENDER_SCALE = Math.ceil(TEXT_RESOLUTION);
const NUT_WIDTH = 52, NUT_HEIGHT = NUT_WIDTH * 533 / 800;
const DROP_LEFT = 36, DROP_RIGHT = W - 36, DROP_CENTER = 223;
const FALLING_NUT_DEPTH = 4, ACTIVE_NUT_DEPTH = 3;
const readBest = () => { try { return Number(localStorage.getItem('cu-au-best')) || 0; } catch { return 0; } };
class Tower extends Phaser.Scene {
  constructor() { super('Tower'); }
  preload() {
    this.load.image('nut', nutArt);
    this.load.image('buffalo', buffaloArt);
    this.load.svg('cart', cartArt, { width: 660, height: 270 });
    this.load.svg('wheel', wheelArt, { width: 144, height: 144 });
  }
  create() {
    this.cameras.main.setOrigin(0, 0).setZoom(RENDER_SCALE);
    this.best = readBest(); this.soundOn = true; this.mode = 'menu'; this.nuts = [];
    this.drawWorld(); this.makeBuffalo();
    this.matter.world.setBounds(-500, -20000, 1360, 21000, 32, false, false, false, false);
    this.matter.world.setGravity(0, 1.15);
    this.cartBody = this.matter.add.rectangle(223, DECK, 188, 18, { isStatic: true, friction: .85, label: 'cart' });
    this.hud = this.add.text(16, 19, '', {fontFamily:'Noto Sans',fontSize:'16px',color:'#263d32',fontStyle:'bold'}).setResolution(TEXT_RESOLUTION).setScrollFactor(0).setDepth(20);
    this.cartHint = this.add.text(W / 2, 86, 'Đủ 5 củ xe to ra', {fontFamily:'Noto Sans',fontSize:'16px',fontStyle:'bold',color:'#38634c'})
      .setResolution(TEXT_RESOLUTION).setOrigin(.5).setScrollFactor(0).setDepth(20).setVisible(false);
    this.drag = null;
    this.input.on('pointerdown', pointer => {
      if (this.mode !== 'play' || !this.active || this.drag || pointer.y / RENDER_SCALE <= 65) return;
      this.drag = { id: pointer.id, pointerX: pointer.x / RENDER_SCALE, nutX: this.active.x };
    });
    this.input.on('pointermove', pointer => this.moveNut(pointer));
    const release = pointer => {
      if (!this.drag || this.drag.id !== pointer.id) return;
      this.moveNut(pointer);
      this.drag = null;
      this.drop();
    };
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);
    // Losing focus cancels a gesture rather than dropping an unintended nut.
    this.cancelDrag = () => { this.drag = null; };
    this.game.events.on(Phaser.Core.Events.BLUR, this.cancelDrag);
    this.input.manager.canvas.addEventListener('pointercancel', this.cancelDrag);
    this.events.once('shutdown', () => {
      this.game.events.off(Phaser.Core.Events.BLUR, this.cancelDrag);
      this.input.manager.canvas.removeEventListener('pointercancel', this.cancelDrag);
    });
    this.events.on('shutdown', () => { if (this.audio) this.audio.close(); });
    this.showMenu();
  }
  drawWorld() {
    const g = this.add.graphics();
    g.fillStyle(0xffedba).fillRect(0, -20000, W, 20640);
    g.fillStyle(0xf8c956).fillCircle(296, 122, 32);
    g.fillStyle(0xfffae9).fillRoundedRect(23, 111, 103, 19, 10).fillRoundedRect(210, 173, 99, 15, 8);
    g.fillStyle(0xdac165).fillEllipse(40, 430, 310, 110).fillEllipse(290, 430, 320, 140);
    g.fillStyle(0xe8b83e).fillRect(0, 430, W, 210);
    for (let x=3; x<W; x+=14) { g.lineStyle(2,0xaf942d,.6); g.lineBetween(x,505,x+5,461); g.fillStyle(0xffdf6b); g.fillEllipse(x+5,461,5,15); }
    g.fillStyle(0x9d7138).fillRect(0,580,W,60);
    // Twin wooden shafts attach the cart to the buffalo's yoke.
    g.lineStyle(5, 0x57432d); g.lineBetween(70, 524, 144, 543);
    g.lineStyle(2, 0xb79a66); g.lineBetween(70, 522, 145, 541);
    g.lineStyle(4, 0x80623c); g.lineBetween(67, 531, 132, 550);
    this.cartImage = this.add.image(119, 514, 'cart').setOrigin(0).setDisplaySize(220, 90);
    this.cartWheels = [40, 180].map(x => this.add.image(119 + x, 574, 'wheel').setDisplaySize(48, 48));
  }
  makeBuffalo() {
    this.buffalo = this.add.container(63, 526);
    const body = this.add.image(-55, -30, 'buffalo').setOrigin(0).setDisplaySize(126, 126 * 533 / 800);
    this.buffalo.add(body);
    this.bubble=this.add.text(77,461,'',{fontFamily:'Noto Sans',fontSize:'13px',color:'#31473a',backgroundColor:'#fff7d8',padding:{x:8,y:6}}).setResolution(TEXT_RESOLUTION).setDepth(10).setVisible(false);
  }
  setCartExpanded(expanded) {
    const width = expanded ? 228 : 188;
    const currentWidth = this.cartBody.bounds.max.x - this.cartBody.bounds.min.x;
    Phaser.Physics.Matter.Matter.Body.scale(this.cartBody, width / currentWidth, 1);
    this.cartImage.setDisplaySize(expanded ? 260 : 220, 90).setX(expanded ? 93 : 119);
    // Move the wheels along the axle without stretching their circular textures.
    this.cartWheels.forEach((wheel, i) => wheel.setX(this.cartImage.x + [40, 180][i] * this.cartImage.displayWidth / 220));
    this.cartHint.setVisible(this.mode === 'play' && !expanded);
    this.cartExpanded = expanded;
  }
  showMenu(finished = false) {
    this.mode = 'menu';
    this.cartHint.setVisible(false);
    this.drag = null;
    const intro = document.getElementById('intro');
    const result = document.getElementById('intro-result');
    result.hidden = !finished;
    result.textContent = finished ? `Bạn xếp được ${this.score} củ ấu\nKỷ lục: ${this.best} củ` : '';
    intro.hidden = false;
    const video = intro.querySelector('iframe');
    if (!video.hasAttribute('src')) video.src = video.dataset.videoSrc;
    const button = document.getElementById('start-button');
    button.disabled = false;
    button.addEventListener('click', () => this.start(), { once: true });
  }
  start() {
    // Unloading the player stops video audio; retain the menu for the next round.
    const intro = document.getElementById('intro');
    intro.hidden = true;
    intro.querySelector('iframe').removeAttribute('src');
    if(this.active) { this.active.destroy(); this.active = null; }
    for(const n of this.nuts) n.destroy(); this.nuts=[];
    this.cameras.main.setScroll(0,0); this.score=0; this.lives=3; this.mode='play'; this.bubble.setText('').setVisible(false); this.targetScroll=0;
    this.drag = null;
    this.setCartExpanded(false);
    this.unlockAudio(); this.spawn(); this.updateHud();
  }
  unlockAudio() { if(!this.audio) { const Audio=window.AudioContext||window.webkitAudioContext; if(Audio) this.audio=new Audio(); } if(this.audio?.state==='suspended') this.audio.resume(); }
  beep(f=400,d=.08) { if(!this.soundOn||!this.audio) return; const o=this.audio.createOscillator(),g=this.audio.createGain(); o.type='triangle'; o.frequency.setValueAtTime(f,this.audio.currentTime); o.frequency.exponentialRampToValueAtTime(f/2,this.audio.currentTime+d); g.gain.setValueAtTime(.08,this.audio.currentTime); g.gain.exponentialRampToValueAtTime(.001,this.audio.currentTime+d); o.connect(g);g.connect(this.audio.destination);o.start();o.stop(this.audio.currentTime+d); }
  spawn() {
    if(this.mode!=='play') return;
    const x = DROP_CENTER;
    this.active = this.add.image(x, this.cameras.main.scrollY + 130, 'nut').setDisplaySize(NUT_WIDTH, NUT_HEIGHT)
      .setAngle(Phaser.Math.FloatBetween(-180, 180)).setDepth(ACTIVE_NUT_DEPTH);
  }
  moveNut(pointer) {
    if (this.mode !== 'play' || !this.active || !this.drag || this.drag.id !== pointer.id) return;
    this.active.x = Phaser.Math.Clamp(
      this.drag.nutX + pointer.x / RENDER_SCALE - this.drag.pointerX, DROP_LEFT, DROP_RIGHT
    );
  }
  drop() {
    if(this.mode!=='play' || !this.active) return;
    const {x,y,rotation}=this.active; this.active.destroy(); this.active=null;
    // Convex outline follows the photographed nut's sloping horns and lower point.
    const M = Phaser.Physics.Matter.Matter;
    const vertices = [{x:-25,y:-13},{x:-4,y:-8},{x:25,y:1},{x:-7,y:14},{x:-15,y:4}];
    const center = M.Vertices.centre(vertices);
    const cos = Math.cos(rotation), sin = Math.sin(rotation);
    const body = M.Bodies.fromVertices(
      x + center.x * cos - center.y * sin,
      y + center.x * sin + center.y * cos, vertices, {
      friction:.75, frictionStatic:1, restitution:.05, density:.003, frictionAir:.015
    });
    M.Body.setAngle(body, rotation);
    const n=this.matter.add.image(x,y,'nut').setDisplaySize(NUT_WIDTH, NUT_HEIGHT)
      .setExistingBody(body).setOrigin(.5 + center.x / NUT_WIDTH, .5 + center.y / NUT_HEIGHT)
      .setRotation(rotation).setDepth(FALLING_NUT_DEPTH);
    n.born=this.time.now; n.stable=0; n.counted=false; n.lost=false;
    this.nuts.push(n); this.beep(500); this.spawn();
  }
  updateHud() { this.hud.setText(`Củ: ${this.score}   Kỷ lục: ${this.best}\nMạng: ${'♥'.repeat(this.lives)}${'♡'.repeat(3-this.lives)}`); }
  lose(n) {
    n.lost=true; this.lives=Math.max(0,this.lives-1); this.beep(150,.2); this.updateHud();
    if(this.lives===0) {
      if(this.active) { this.active.destroy(); this.active=null; }
      this.showMenu(true);
    }
  }
  scoreNut(n) {
    n.counted=true; this.score++;
    if(this.score >= 5 && !this.cartExpanded) this.setCartExpanded(true); this.best=Math.max(this.best,this.score); try{localStorage.setItem('cu-au-best',String(this.best));}catch{}
    this.updateHud();this.beep(750,.12);
    const reactions={10:'Mười củ! Trâu phục bạn!',15:'Ê… xe có chịu nổi không?',20:'Trâu xin nghỉ phép! 🐃',24:'Đủ chuyến rồi, đi thôi!'};
    if(reactions[this.score]) {this.bubble.setText(reactions[this.score]).setVisible(true);this.tweens.add({targets:this.buffalo,angle:8,duration:130,yoyo:true,repeat:5});this.time.delayedCall(2400,()=>this.bubble.setText('').setVisible(false));}
  }
  update(_time,delta) {
    if(this.mode!=='play')return;
    const dt=Math.min(delta,50);
    if(this.active) {
      this.active.y = this.cameras.main.scrollY + 130;
    }
    let top=DECK;
    for(const n of this.nuts) {
      if(n.lost)continue;
      if(n.y>610 || n.x < -70 || n.x > W+70) {this.lose(n); if(this.mode!=='play')return;continue;}
      if(n.body.speed<.65 && Math.abs(n.body.angularVelocity)<.035 && this.time.now-n.born>500) n.stable+=dt; else n.stable=0;
      if(!n.counted && n.stable>650 && n.y<DECK) this.scoreNut(n);
      if(n.counted && n.y<DECK)top=Math.min(top,n.y-25);
    }
    this.targetScroll=Math.min(0,top-265);
    this.cameras.main.scrollY=Phaser.Math.Linear(this.cameras.main.scrollY,this.targetScroll,.045);
  }
}
export let game;
async function boot() {
  // Canvas text must be created after the Vietnamese glyphs are available.
  await Promise.all([400, 700, 800].map(weight =>
    document.fonts.load(`${weight} 16px "Noto Sans"`, 'THỬ THÁCH CỦ ẤU Kỷ lục Bạn xếp được')
  ));
  game = new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W * RENDER_SCALE,height:H * RENDER_SCALE,backgroundColor:'#ffedba',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.NO_CENTER},physics:{default:'matter',matter:{enableSleeping:true}},scene:Tower});
// Development-only inspection for browser smoke checks; stripped from production.
if (import.meta.env.DEV) window.__towerGame = game;

}
boot();
