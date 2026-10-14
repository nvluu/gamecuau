import Phaser from 'phaser';
import './style.css';

const W = 360, H = 640, DECK = 533;
const readBest = () => { try { return Number(localStorage.getItem('cu-au-best')) || 0; } catch { return 0; } };
class Tower extends Phaser.Scene {
  constructor() { super('Tower'); }
  create() {
    this.best = readBest(); this.soundOn = true; this.mode = 'menu'; this.nuts = [];
    this.drawWorld(); this.makeTextures(); this.makeBuffalo();
    this.matter.world.setBounds(-500, -20000, 1360, 21000, 32, false, false, false, false);
    this.matter.world.setGravity(0, 1.15);
    this.matter.add.rectangle(223, DECK, 188, 18, { isStatic: true, friction: .85, label: 'cart' });
    this.hud = this.add.text(16, 19, '', {fontFamily:'Arial',fontSize:'16px',color:'#263d32',fontStyle:'bold'}).setScrollFactor(0).setDepth(20);
    this.mute = this.button(316, 33, '♪', () => { this.soundOn = !this.soundOn; this.mute.setText(this.soundOn ? '♪' : '×♪'); }, 44, 34).setScrollFactor(0).setDepth(30);
    this.input.on('pointerdown', pointer => { if (this.mode === 'play' && pointer.y > 65 && !this.waiting) this.drop(); });
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
    g.fillStyle(0x75512d).fillRoundedRect(124,527,198,20,5);
    g.fillStyle(0xb88243).fillRect(130,529,187,7);
    g.lineStyle(4,0x66442c); g.lineBetween(125,551,75,546);
    for(const x of [153,287]) { g.fillStyle(0x513e2e).fillCircle(x,566,17); g.fillStyle(0xdab578).fillCircle(x,566,10); g.lineStyle(2,0x684b31); g.strokeCircle(x,566,10); }
  }
  makeTextures() {
    if(this.textures.exists('nut')) return;
    const g=this.make.graphics({x:0,y:0,add:false});
    g.fillStyle(0x54312b); g.beginPath(); g.moveTo(5,7); g.lineTo(14,28); g.lineTo(26,34); g.lineTo(38,28); g.lineTo(47,7); g.lineTo(44,34); g.lineTo(35,43); g.lineTo(18,43); g.lineTo(8,34); g.closePath(); g.fillPath();
    g.fillStyle(0x794738); g.fillEllipse(26,32,27,24); g.lineStyle(2,0xb1724c); g.lineBetween(17,29,24,25); g.lineBetween(28,25,35,29);
    g.generateTexture('nut',52,48); g.destroy();
  }
  makeBuffalo() {
    this.buffalo=this.add.container(63,526);
    const g=this.add.graphics(); g.fillStyle(0x62716e); g.fillEllipse(0,0,68,43); g.fillRoundedRect(-25,10,10,36,4); g.fillRoundedRect(15,10,10,36,4); g.fillEllipse(-23,-14,38,42);
    g.lineStyle(6,0xe8e0be); g.beginPath(); g.moveTo(-36,-25); g.lineTo(-46,-35); g.lineTo(-45,-45); g.strokePath(); g.beginPath(); g.moveTo(-11,-25); g.lineTo(-3,-37); g.lineTo(-5,-46); g.strokePath();
    g.fillStyle(0x89968b); g.fillEllipse(-27,-3,31,18); g.fillStyle(0x384b43); g.fillCircle(-34,-3,2); g.fillCircle(-23,-3,2);
    this.eye=this.add.ellipse(-29,-20,5,6,0x1e302b);
    this.tail=this.add.graphics(); this.tail.lineStyle(3,0x4e625b); this.tail.lineBetween(29,-5,40,14); this.tail.fillStyle(0x354a42); this.tail.fillEllipse(40,16,7,12);
    this.buffalo.add([g,this.eye,this.tail]);
    this.tweens.add({targets:this.tail,angle:18,duration:650,yoyo:true,repeat:-1});
    this.time.addEvent({delay:2900,loop:true,callback:()=>this.tweens.add({targets:this.eye,scaleY:.1,duration:100,yoyo:true})});
    this.bubble=this.add.text(77,461,'',{fontSize:'13px',color:'#31473a',backgroundColor:'#fff7d8',padding:{x:8,y:6}}).setDepth(10).setVisible(false);
  }
  button(x,y,label,action,width=220,height=45) {
    const t=this.add.text(x,y,label,{fontFamily:'Arial',fontSize:'20px',fontStyle:'bold',color:'#fff9df',backgroundColor:'#38634c',fixedWidth:width,fixedHeight:height,align:'center',padding:{top:10}}).setOrigin(.5).setInteractive({useHandCursor:true});
    t.on('pointerdown',(_p,_x,_y,event)=>{event.stopPropagation(); action();}); return t;
  }
  showMenu() { this.overlay('THÁP CỦ ẤU','Trâu chở được 24 củ ấu.\nBạn xếp được bao nhiêu?','Bắt đầu',()=>this.start()); }
  overlay(title,description,label,action) {
    this.panel=this.add.container(0,0).setScrollFactor(0).setDepth(40);
    const bg=this.add.rectangle(W/2,H/2,W,H,0xffedba,.94);
    const heading=this.add.text(W/2,186,title,{fontFamily:'Arial',fontSize:'31px',fontStyle:'bold',color:'#38634c'}).setOrigin(.5);
    const text=this.add.text(W/2,266,description,{fontFamily:'Arial',fontSize:'18px',color:'#55462e',align:'center',lineSpacing:9}).setOrigin(.5);
    const b=this.button(W/2,365,label,action);
    const help=this.add.text(W/2,445,'Chạm để thả • Xếp thật khéo!\nRơi 3 củ là hết lượt',{fontSize:'15px',color:'#6a623f',align:'center',lineSpacing:9}).setOrigin(.5);
    this.panel.add([bg,heading,text,b,help]);
  }
  start() {
    if(this.panel) this.panel.destroy();
    for(const n of this.nuts) n.destroy(); this.nuts=[];
    this.cameras.main.setScroll(0,0); this.score=0; this.lives=3; this.waiting=false; this.mode='play'; this.bubble.setText('').setVisible(false); this.targetScroll=0;
    this.unlockAudio(); this.spawn(); this.updateHud();
  }
  unlockAudio() { if(!this.audio) { const Audio=window.AudioContext||window.webkitAudioContext; if(Audio) this.audio=new Audio(); } if(this.audio?.state==='suspended') this.audio.resume(); }
  beep(f=400,d=.08) { if(!this.soundOn||!this.audio) return; const o=this.audio.createOscillator(),g=this.audio.createGain(); o.type='triangle'; o.frequency.setValueAtTime(f,this.audio.currentTime); o.frequency.exponentialRampToValueAtTime(f/2,this.audio.currentTime+d); g.gain.setValueAtTime(.08,this.audio.currentTime); g.gain.exponentialRampToValueAtTime(.001,this.audio.currentTime+d); o.connect(g);g.connect(this.audio.destination);o.start();o.stop(this.audio.currentTime+d); }
  spawn() { if(this.mode!=='play')return; this.waiting=false; this.phase=0; this.active=this.add.image(223,this.cameras.main.scrollY+130,'nut').setDepth(5); }
  drop() {
    const {x,y}=this.active; this.active.destroy(); this.active=null; this.waiting=true;
    const B=Phaser.Physics.Matter.Matter.Bodies;
    const parts=[B.rectangle(x,y+8,30,20,{chamfer:{radius:7}}),B.rectangle(x-17,y-3,9,27,{angle:-.38,chamfer:{radius:3}}),B.rectangle(x+17,y-3,9,27,{angle:.38,chamfer:{radius:3}})];
    const body=Phaser.Physics.Matter.Matter.Body.create({parts,friction:.75,frictionStatic:1,restitution:.05,density:.003,frictionAir:.015});
    const n=this.matter.add.image(x,y,'nut').setExistingBody(body).setOrigin(.5, .56).setDepth(4); n.born=this.time.now; n.stable=0;n.counted=false;n.lost=false;n.turnDone=false;
    this.nuts.push(n); this.current=n; this.beep(500);
  }
  updateHud() { this.hud.setText(`Củ: ${this.score}   Kỷ lục: ${this.best}\nMạng: ${'♥'.repeat(this.lives)}${'♡'.repeat(3-this.lives)}`); }
  lose(n) {
    n.lost=true; this.lives=Math.max(0,this.lives-1); this.beep(150,.2); this.updateHud();
    if(this.lives===0) {this.mode='over'; if(this.active){this.active.destroy();this.active=null;} this.time.delayedCall(450,()=>this.overlay('THÁP ĐỔ RỒI!',`Bạn xếp được ${this.score} củ ấu\nKỷ lục: ${this.best} củ`,'Chơi lại',()=>this.start()));}
  }
  scoreNut(n) {
    n.counted=true; this.score++; this.best=Math.max(this.best,this.score); try{localStorage.setItem('cu-au-best',String(this.best));}catch{}
    this.updateHud();this.beep(750,.12);
    const reactions={10:'Mười củ! Trâu phục bạn!',15:'Ê… xe có chịu nổi không?',20:'Trâu xin nghỉ phép! 🐃',24:'Đủ chuyến rồi, đi thôi!'};
    if(reactions[this.score]) {this.bubble.setText(reactions[this.score]).setVisible(true);this.tweens.add({targets:this.buffalo,angle:8,duration:130,yoyo:true,repeat:5});this.time.delayedCall(2400,()=>this.bubble.setText('').setVisible(false));}
  }
  update(_time,delta) {
    if(this.mode!=='play')return;
    const dt=Math.min(delta,50);
    if(this.active) {this.phase+=dt*(.0015+Math.min(this.score,40)*.000045);this.active.x=223+Math.sin(this.phase)*104;this.active.y=this.cameras.main.scrollY+130;}
    let top=DECK;
    for(const n of this.nuts) {
      if(n.lost)continue;
      if(n.y>610 || n.x < -70 || n.x > W+70) {this.lose(n); if(this.mode!=='play')return;continue;}
      if(n.body.speed<.65 && Math.abs(n.body.angularVelocity)<.035 && this.time.now-n.born>500) n.stable+=dt; else n.stable=0;
      if(!n.counted && n.stable>650 && n.y<DECK) this.scoreNut(n);
      if(n.counted && n.y<DECK)top=Math.min(top,n.y-25);
    }
    const n=this.current;
    if(this.waiting && n && !n.turnDone && (n.counted||n.lost||this.time.now-n.born>6000)) {n.turnDone=true;this.spawn();}
    this.targetScroll=Math.min(0,top-265);
    this.cameras.main.scrollY=Phaser.Math.Linear(this.cameras.main.scrollY,this.targetScroll,.045);
  }
}
export const game = new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#ffedba',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'matter',matter:{enableSleeping:true}},scene:Tower});
// Development-only inspection for browser smoke checks; stripped from production.
if (import.meta.env.DEV) window.__towerGame = game;
