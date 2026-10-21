const $=s=>document.querySelector(s);
const cv=$('#cv'),ctx=cv.getContext('2d'),stage=$('#stage'),ov=$('#overlay');
const N=1,E=2,S=4,W=8;
const DIRS={up:[0,-1,N,S],right:[1,0,E,W],down:[0,1,S,N],left:[-1,0,W,E]};
let level=1,best=1;
try{best=+localStorage.getItem('fuga_best')||1}catch(e){}
let M,seen,lit,px,py,vx,vy,steps,t0,elapsed=0,state='menu',cell=20,dpr=1,fog=false,radius=99,held=[],last=0;

// Gera um labirinto perfeito (DFS com backtracking). Cada célula guarda suas paredes em bits.
function gen(n){
  const w=new Uint8Array(n*n).fill(15),vis=new Uint8Array(n*n),st=[0];vis[0]=1;
  while(st.length){
    const c=st[st.length-1],x=c%n,y=c/n|0,opts=[];
    for(const k in DIRS){const[dx,dy]=DIRS[k],nx=x+dx,ny=y+dy;
      if(nx>=0&&ny>=0&&nx<n&&ny<n&&!vis[ny*n+nx])opts.push([k,ny*n+nx]);}
    if(!opts.length){st.pop();continue}
    const[k,nc]=opts[Math.random()*opts.length|0];
    w[c]&=~DIRS[k][2];w[nc]&=~DIRS[k][3];vis[nc]=1;st.push(nc);
  }
  return w;
}
// Distâncias por corredores a partir de uma célula (limitadas por maxd).
function bfs(s,maxd=1e9){
  const n=M.n,d=new Int16Array(n*n).fill(-1);d[s]=0;const q=[s];
  for(let i=0;i<q.length;i++){
    const c=q[i];if(d[c]>=maxd)continue;const x=c%n,y=c/n|0;
    for(const k in DIRS){const[dx,dy,b]=DIRS[k];if(M.w[c]&b)continue;
      const nc=(y+dy)*n+x+dx;if(d[nc]<0){d[nc]=d[c]+1;q.push(nc)}}
  }
  return d;
}
function newLevel(){
  const n=Math.min(5+2*level,45);          // fase 1 = 7×7, +2 por fase
  M={n,w:gen(n)};
  const d=bfs(0);M.ex=d.indexOf(Math.max(...d)); // saída = ponto mais distante
  px=py=vx=vy=0;steps=0;t0=null;elapsed=0;
  fog=level>=4;radius=Math.max(3,6-((level-4)/3|0));
  seen=new Uint8Array(n*n);lit=new Uint8Array(n*n);
  reveal();layout();
}
function reveal(){
  if(!fog){seen.fill(1);lit.fill(1);return}
  lit.fill(0);const d=bfs(py*M.n+px,radius);
  for(let i=0;i<d.length;i++)if(d[i]>=0){lit[i]=1;seen[i]=1}
}
function layout(){
  if(!M)return;
  const r=stage.getBoundingClientRect(),aw=r.width-24,ah=r.height-24;
  cell=Math.max(6,Math.floor(Math.min(aw,ah)/M.n));dpr=window.devicePixelRatio||1;
  const s=cell*M.n;cv.style.width=s+'px';cv.style.height=s+'px';cv.width=s*dpr;cv.height=s*dpr;
}
function move(k){
  const[dx,dy,b]=DIRS[k];
  if(M.w[py*M.n+px]&b)return false;
  if(t0===null)t0=performance.now();
  px+=dx;py+=dy;steps++;reveal();
  if(py*M.n+px===M.ex)win();
  return true;
}
const fmt=ms=>{const s=ms/1000|0;return(s/60|0)+':'+String(s%60).padStart(2,'0')};
function show(t,p,b){$('#ot').textContent=t;$('#op').textContent=p;$('#go').textContent=b;ov.hidden=false;$('#go').focus()}
function win(){
  state='won';held=[];elapsed=performance.now()-t0;
  if(level>best){best=level;try{localStorage.setItem('fuga_best',best)}catch(e){}}
  const next=Math.min(5+2*(level+1),45);
  let msg='Você escapou da cela em '+steps+' passos e '+fmt(elapsed)+'. O próximo labirinto é maior: '+next+'×'+next+'.';
  if(level+1===4)msg+=' Cuidado: daqui em diante só a luz da sua tocha mostra o caminho.';
  setTimeout(()=>show('Fase '+level+' concluída!',msg,'Próxima fase'),280);
}
$('#go').onclick=()=>{
  if(ov.hidden)return;ov.hidden=true;$('#go').blur();
  if(state==='won'){level++;newLevel()}
  state='play';
};
$('#rs').onclick=()=>{level=1;newLevel();state='play';ov.hidden=true;held=[];$('#rs').blur()};

const KEY={ArrowUp:'up',w:'up',W:'up',ArrowRight:'right',d:'right',D:'right',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left'};
addEventListener('keydown',e=>{
  if(!ov.hidden&&(e.key==='Enter'||e.key===' ')){e.preventDefault();$('#go').click();return}
  const k=KEY[e.key];if(k){e.preventDefault();if(!held.includes(k))held.push(k)}
});
addEventListener('keyup',e=>{const k=KEY[e.key];if(k)held=held.filter(x=>x!==k)});
addEventListener('blur',()=>{held=[]});
document.querySelectorAll('#pad button').forEach(b=>{
  const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{e.preventDefault();if(!held.includes(k))held.push(k)});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>{held=held.filter(x=>x!==k)}));
});
new ResizeObserver(layout).observe(stage);

function draw(now){
  const n=M.n,s=cell*n,lw=Math.max(2,cell*.12);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle='#0d0c10';ctx.fillRect(0,0,s,s);
  for(let i=0;i<n*n;i++){
    if(!seen[i])continue;
    ctx.fillStyle=lit[i]?'#37333d':'#24222a';
    ctx.fillRect((i%n)*cell,(i/n|0)*cell,cell,cell);
  }
  if(seen[M.ex]){ // porta de saída
    const ex=(M.ex%n)*cell,ey=(M.ex/n|0)*cell;
    ctx.save();ctx.shadowColor='#3ddc84';ctx.shadowBlur=cell*(.4+.25*Math.sin(now/280));
    ctx.fillStyle='#3ddc84';ctx.fillRect(ex+cell*.22,ey+cell*.1,cell*.56,cell*.8);ctx.restore();
    ctx.fillStyle='#0f3b22';ctx.fillRect(ex+cell*.62,ey+cell*.48,cell*.08,cell*.08);
  }
  ctx.lineWidth=lw;ctx.lineCap='round';
  for(let pass=0;pass<2;pass++){
    ctx.strokeStyle=pass?'#c9c1ae':'#6a645a';ctx.beginPath();
    for(let i=0;i<n*n;i++){
      if(!seen[i]||lit[i]!==pass)continue;
      const w=M.w[i],x0=(i%n)*cell,y0=(i/n|0)*cell,x1=x0+cell,y1=y0+cell;
      if(w&N){ctx.moveTo(x0,y0);ctx.lineTo(x1,y0)}
      if(w&E){ctx.moveTo(x1,y0);ctx.lineTo(x1,y1)}
      if(w&S){ctx.moveTo(x0,y1);ctx.lineTo(x1,y1)}
      if(w&W){ctx.moveTo(x0,y0);ctx.lineTo(x0,y1)}
    }
    ctx.stroke();
  }
  // prisioneiro: uniforme laranja listrado
  const cx=(vx+.5)*cell,cy=(vy+.5)*cell,r=cell*.3;
  ctx.fillStyle='#ff8a1f';ctx.fillRect(cx-r*.8,cy-r*.1,r*1.6,r*1.3);
  ctx.fillStyle='#1a1208';ctx.fillRect(cx-r*.8,cy+r*.2,r*1.6,r*.2);ctx.fillRect(cx-r*.8,cy+r*.7,r*1.6,r*.2);
  ctx.fillStyle='#f1c9a0';ctx.beginPath();ctx.arc(cx,cy-r*.45,r*.58,0,7);ctx.fill();
}
function frame(now){
  if(state==='play'&&held.length&&now-last>105){move(held[held.length-1]);last=now}
  vx+=(px-vx)*.35;vy+=(py-vy)*.35;
  $('#lv').textContent=level;$('#st').textContent=steps;$('#bs').textContent=best;
  $('#tm').textContent=t0===null?'0:00':fmt(state==='won'?elapsed:performance.now()-t0);
  draw(now);requestAnimationFrame(frame);
}
newLevel();requestAnimationFrame(frame);