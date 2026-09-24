// Dependency-free loading theatre. Copy into each prototype; no shared runtime paths.
(() => {
 const root=document.getElementById('loading'); if(!root)return;
 const option=Math.max(0,Math.min(2,Number(root.dataset.loadingOption||1)-1));
 const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
 const status=root.querySelector('#loading-text'),note=root.querySelector('.loading-note');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let time=motion.matches?26:0,last=performance.now(),w=700,paused=motion.matches,raf=0,failed=false;
 const started=performance.now();
 const pause=root.querySelector('.loading-pause'),retry=root.querySelector('.loading-retry');
 function sync(){pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));}
 pause.onclick=()=>{paused=!paused;sync();};sync();
 motion.addEventListener('change',e=>{paused=e.matches;sync();});
 retry.onclick=()=>location.reload();
 function fail(message){if(root.hidden)return;failed=true;status.textContent=message;retry.hidden=false;}
 window.storyLoading={status(message){if(!failed)status.textContent=message;},fail,ready(){root.hidden=true;}};
 window.addEventListener('error',e=>{if(!root.hidden&&e.message)fail(window.lightBootUi?.error||status.textContent);});
 window.addEventListener('unhandledrejection',()=>fail(window.lightBootUi?.error||status.textContent));
 const statusObserver=new MutationObserver(()=>{if(/could not|unavailable|failed/i.test(status.textContent)){failed=true;retry.hidden=false;}});
 statusObserver.observe(status,{childList:true,characterData:true,subtree:true});
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function line(x,y,xx,yy,color,width=2){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke()}
function glow(x,y,r){let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fbd18377');g.addColorStop(1,'#fbd18300');ellipse(x,y,r,r,g)}
function sheep(x,y,s,angle=0){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(s,s);for(let i=0;i<4;i++)line(-15+i*10,9,-17+i*10,23+Math.sin(time*8+i)*3,'#879a9b',4);ellipse(0,0,25,16,'#e8dec8');for(let i=0;i<5;i++)ellipse(-17+i*8,-9-Math.sin(i)*4,9,9,'#fff0d7');ellipse(25,1,10,12,'#829899');ellipse(27,-11,4,7,'#829899');ellipse(29,-1,2,2,'#162b35');ctx.restore()}
function house(x,y,s,reveal){ctx.save();ctx.translate(x,y);ctx.scale(s,s);const p=Math.min(1,Math.max(0,reveal));ctx.globalAlpha=p;ctx.translate(0,(1-p)*-65);ctx.fillStyle='#aa8870';ctx.fillRect(-20,-35,40,35);ctx.fillStyle='#dfb88a';ctx.beginPath();ctx.moveTo(-27,-35);ctx.lineTo(0,-57);ctx.lineTo(27,-35);ctx.fill();ctx.fillStyle='#f5cc78';ctx.fillRect(-11,-25,8,10);ctx.fillRect(7,-25,8,10);ctx.fillStyle='#37424a';ctx.fillRect(-4,-14,9,14);ctx.restore()}
function draw(){ctx.clearRect(0,0,w,270);ctx.fillStyle='#101f2b';ctx.fillRect(0,0,w,270);for(let i=0;i<35;i++)ellipse((i*97.3)%w,18+(i*37)%132,1+(i%3)*.3,1+(i%3)*.3,`rgba(237,222,181,${.25+.3*(1+Math.sin(time*.8+i))/2})`);ellipse(w*.81,49,18,18,'#e6d6aa');ellipse(w*.81-7,44,17,17,'#101f2b');
for(let j=0;j<3;j++){ctx.fillStyle=['#1a343e','#23454a','#2b5150'][j];ctx.beginPath();ctx.moveTo(0,270);for(let x=0;x<=w+8;x+=8)ctx.lineTo(x,171+j*28+Math.sin(x/(90+j*20)+j)*18);ctx.lineTo(w,270);ctx.fill()}
if(option===0){const center=w*.52;line(center-15,190,center-15,239,'#b39473',5);line(center+15,190,center+15,239,'#b39473',5);line(center-23,203,center+23,203,'#dac298',5);line(center-23,218,center+23,218,'#dac298',5);
for(let i=0;i<3;i++){const u=((time*.16+i*.34)%1),x=-60+u*(w+120),d=(x-center)/85;const jump=Math.abs(d)<1?Math.sin((d+1)*Math.PI/2)*(i===1?89:55):0;ellipse(x,246,23*(1-jump/200),4,'#152e3677');sheep(x,220-jump,.85,i===1&&Math.abs(d)<1?Math.sin((d+1)*Math.PI)*.4:0)}
}else if(option===1){const x=w*.5+Math.sin(time*.23)*w*.26,y=193+Math.sin(time*.7)*9;for(let i=0;i<5;i++){let hx=w*(.12+i*.19);house(hx,186+Math.sin(i)*9,.55,Math.min(1,time/5-i*.6))}ctx.strokeStyle='#a6926977';ctx.lineWidth=15;ctx.beginPath();ctx.moveTo(0,256);ctx.bezierCurveTo(w*.3,197,w*.6,271,w,209);ctx.stroke();for(let i=0;i<22;i++){let fx=x+Math.sin(i*7+time*.5)*(25+i*3),fy=y-25+Math.cos(i*4+time*.7)*(15+i*2);glow(fx,fy,7);ellipse(fx,fy,1.4,1.4,'#edcd79')}glow(x,y,75);line(x,y-27,x,y-12,'#debb76',2);ctx.fillStyle='#e9bb65';ctx.fillRect(x-7,y-13,14,20);ctx.fillStyle='#ffefb9';ctx.fillRect(x-4,y-10,8,14);line(x-10,y+9,x+10,y+9,'#ba9057',3);
}else{const cycle=time%40; const savedTime=time; time=cycle; ellipse(w/2,222,Math.min(230,w*.44),29,'#937e60');for(let i=0;i<9;i++){let x=w/2+((i%3)-1)*Math.min(91,w*.25),y=160+Math.floor(i/3)*31;house(x,y,.65+Math.floor(i/3)*.15,(time-i*2)/1.2)}for(let i=0;i<6;i++){let p=Math.min(1,Math.max(0,(time-16-i)/1.2)),x=w/2+Math.cos(i*2.4)*Math.min(205,w*.42),y=200+Math.sin(i*2.4)*27;line(x,y,x,y-28*p,'#9b8060',3);ellipse(x,y-28*p,12*p,18*p,'#74977b')}if(time>24)sheep(w/2+Math.sin(time*.35)*60,231,.4);for(let i=0;i<3;i++){let x=w/2+(i-1)*80;ellipse(x+Math.sin(time+i)*5,105-((time*8+i*19)%40),5,3,'#bcc3b144')}time=savedTime;}

 }
 function resize(){w=canvas.clientWidth;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=270*d;if(ctx){ctx.setTransform(d,0,0,d,0,0);draw();}}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
 function frame(now){const dt=Math.min((now-last)/1000,.1);last=now;if(!paused&&!document.hidden&&ctx){time+=dt;draw();}if(root.hidden){cancelAnimationFrame(raf);return;}raf=requestAnimationFrame(frame);}
 const slow=setInterval(()=>{if(root.hidden)return;const seconds=Math.floor((performance.now()-started)/1000);root.querySelector('.loading-elapsed').textContent=seconds+'s';if(seconds>=60)retry.hidden=false;},1000);
 const observer=new MutationObserver(()=>{if(root.hidden){cancelAnimationFrame(raf);clearInterval(slow);}else{last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}});
 observer.observe(root,{attributes:true,attributeFilter:['hidden']});
 resize();raf=requestAnimationFrame(frame);
})();
