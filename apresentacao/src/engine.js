(function(){
"use strict";
const NS='http://www.w3.org/2000/svg';
const stage=document.getElementById('stage');
function fit(){const s=Math.min(innerWidth/1920,innerHeight/1080);stage.style.transform=`translate(-50%,-50%) scale(${s})`;}
addEventListener('resize',fit);fit();
const $=(r,q)=>r.querySelector(q),$$=(r,q)=>[...r.querySelectorAll(q)];
const fmt=(v,d=1)=>v.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const svgEl=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;};

/* ---------- elementos temáticos ---------- */
function gearPath(cx,cy,R,n,h,hole){
  const st=2*Math.PI/n;let d='';
  for(let i=0;i<n;i++){const a=i*st;
    const p=[[R,a],[R+h,a+st*.15],[R+h,a+st*.45],[R,a+st*.6]];
    p.forEach(([r,t],j)=>{d+=(i===0&&j===0?'M':'L')+(cx+r*Math.cos(t)).toFixed(1)+' '+(cy+r*Math.sin(t)).toFixed(1)+' ';});}
  d+='Z ';
  d+=`M${cx+hole} ${cy} A${hole} ${hole} 0 1 0 ${cx-hole} ${cy} A${hole} ${hole} 0 1 0 ${cx+hole} ${cy} Z`;
  return d;
}
const DECO=`<svg class="deco" viewBox="0 0 1920 960" aria-hidden="true">
  <g class="g1"><g class="gin" style="transform-origin:1835px 70px"><g class="s1" style="transform-origin:1835px 70px"><path class="gear" d="${gearPath(1835,70,92,16,20,30)}"/></g></g></g>
  <g class="g2"><g class="gin" style="transform-origin:1698px 190px"><g class="s2" style="transform-origin:1698px 190px"><path class="gear" d="${gearPath(1698,190,46,9,16,14)}"/></g></g></g>
  <g class="gin" style="transform-origin:1880px 252px"><polygon class="bolt" points="1880,232 1898,242 1898,262 1880,272 1862,262 1862,242"/><circle class="bolt" cx="1880" cy="252" r="8"/></g>
  <path class="trace" d="M0 880 H150 L200 830 H330"/>
  <path class="trace" d="M0 916 H240 L272 884 H430"/>
  <path class="trace" d="M0 846 H70 L110 806 H180"/>
  <circle class="node" cx="330" cy="830" r="10"/><circle class="node" cx="430" cy="884" r="10"/><circle class="node" cx="180" cy="806" r="8"/>
  <path class="sig" d="M445 862 a26 26 0 0 1 0 44"/><path class="sig b" d="M458 848 a44 44 0 0 1 0 72"/>
  <path class="sig" d="M345 808 a26 26 0 0 1 0 44"/><path class="sig b" d="M358 794 a44 44 0 0 1 0 72"/>
</svg>`;

const slides=[...document.querySelectorAll('.slide')];
const N=slides.length;
slides.forEach(s=>{
  s.insertAdjacentHTML('afterbegin',DECO);
  s.querySelectorAll('.anim').forEach((el,i)=>el.style.setProperty('--i',Math.min(i,10)));
  s._ticks=[];s._enter=[];
});

/* ---------- navegação + menu de dias ---------- */
const prevB=document.getElementById('prev'),nextB=document.getElementById('next');
const themeLabel=document.getElementById('themeLabel'),counter=document.getElementById('counter');
const menu=document.getElementById('menu');
let cur=0,busy=false,enterT=performance.now();
function updateFooter(){
  const th=slides[cur].dataset.theme;
  if(themeLabel.textContent!==th){themeLabel.textContent=th;themeLabel.classList.remove('swap');void themeLabel.offsetWidth;themeLabel.classList.add('swap');}
  counter.textContent=(cur+1)+' / '+N;
  prevB.disabled=cur===0;nextB.disabled=cur===N-1;
}
function loadEmbeds(s){
  $$(s,'.embed[data-src],.embed[data-srcdoc]').forEach(e=>{
    if(e.querySelector('iframe'))return;
    const f=document.createElement('iframe');f.title=e.dataset.title||'Simulador';
    if(e.dataset.srcdoc)f.srcdoc=e.dataset.srcdoc;else f.src=e.dataset.src;
    f.setAttribute('allow','fullscreen; xr-spatial-tracking; gyroscope; accelerometer');f.setAttribute('allowfullscreen','');
    f.addEventListener('load',()=>{const ph=e.querySelector('.ph');if(ph)ph.remove();});
    e.appendChild(f);
  });
}
function activate(n){
  cur=n;const s=slides[n];s.classList.add('is-active');enterT=performance.now();
  updateFooter();loadEmbeds(s);s._enter.forEach(f=>f());
  history.replaceState(null,'','#'+(n+1));
}
function go(n){
  if(busy||n<0||n>=N||n===cur)return;
  busy=true;const old=slides[cur];
  old.classList.add('is-leaving');old.classList.remove('is-active');
  setTimeout(()=>{old.classList.remove('is-leaving');activate(n);busy=false;},420);
}
function jumpDay(d){const i=slides.findIndex(s=>s.dataset.day==String(d));if(i>=0){closeMenu();go(i);}}
function openMenu(){menu.classList.add('open');}
function closeMenu(){menu.classList.remove('open');}
// constrói o mapa de dias a partir das capas
const dayCards=slides.filter(s=>s.dataset.day).map(s=>{
  const d=s.dataset;const cls=d.kind==='av'?' av':d.kind==='pr'?' pr':'';
  return `<button class="daycard${cls}" data-go="${d.day}"><span class="n">Dia ${d.day}</span><span class="d">${d.date}</span><span class="t">${d.title}</span>${d.badge?`<span class="k">${d.badge}</span>`:''}</button>`;}).join('');
$$(document,'.daymap').forEach(m=>m.innerHTML=dayCards);
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)jumpDay(b.dataset.go);});
document.getElementById('menuBtn').addEventListener('click',()=>menu.classList.contains('open')?closeMenu():openMenu());
$(menu,'.close').addEventListener('click',closeMenu);
prevB.addEventListener('click',()=>go(cur-1));
nextB.addEventListener('click',()=>go(cur+1));
document.addEventListener('keydown',e=>{
  if(!e.target.matches)return;
  if(e.target.matches('input[type=range]')&&(e.key.startsWith('Arrow')))return;
  if(e.target.matches('input[type=number],input[type=text]'))return;
  if(e.key==='Escape'){closeMenu();return;}
  if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();go(cur+1);}
  else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(cur-1);}
  else if(e.key==='Home')go(0);
  else if(e.key==='End')go(N-1);
  else if(e.key==='m'||e.key==='M'){menu.classList.contains('open')?closeMenu():openMenu();}
  else if(e.key==='f'||e.key==='F'){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();}
});
document.addEventListener('pointerup',e=>{
  if(e.pointerType!=='touch')return;
  if(e.target.closest('button,input,a,label,iframe,.embed,.w'))return;
  const r=stage.getBoundingClientRect();const x=(e.clientX-r.left)/r.width;
  if(x<0.18)go(cur-1);else if(x>0.82)go(cur+1);
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-fs]');if(!b)return;
  const f=b.closest('.slide').querySelector('.embed:not([hidden]) iframe');if(f)f.requestFullscreen?.();});
// alterna entre embeds do mesmo slide (ex.: cilindro pneumático / hidráulico)
document.addEventListener('click',e=>{const b=e.target.closest('button[data-cil]');if(!b)return;
  const s=b.closest('.slide');$$(s,'button[data-cil]').forEach(x=>x.classList.toggle('on',x===b));
  $$(s,'.embed[data-cil]').forEach(x=>x.hidden=x.dataset.cil!==b.dataset.cil);});
const start=Math.min(Math.max(parseInt(location.hash.slice(1),10)||1,1),N)-1;

/* ---------- quiz genérico ---------- */
function makeQuiz(root,qs,opts){
  let i=0,score=0;
  function render(){
    if(i>=qs.length){
      root.innerHTML=`<p class="q-meta">Resultado</p><p class="q-text">${score} de ${qs.length} respostas corretas.</p>
      <div class="q-foot"><p class="q-feedback">${opts.end||''}</p><button class="btn ghost" data-r>Recomeçar</button></div>`;
      root.querySelector('[data-r]').onclick=()=>{i=0;score=0;render();};return;}
    const q=qs[i];const o=q.o||opts.options;const letters='ABCD';
    root.innerHTML=`<p class="q-meta">${opts.label||'Pergunta'} ${i+1} de ${qs.length}</p><p class="q-text">${q.q}</p>
      <div class="q-opts">${o.map((t,k)=>`<button class="q-opt" data-k="${k}">${opts.options?'':`<span class="k">${letters[k]}</span>`}<span>${t}</span></button>`).join('')}</div>
      <div class="q-foot"><p class="q-feedback" aria-live="polite"></p><button class="btn" data-n hidden>${i<qs.length-1?(opts.next||'Próxima pergunta'):'Ver resultado'}</button></div>`;
    const btns=[...root.querySelectorAll('.q-opt')],fb=root.querySelector('.q-feedback'),nx=root.querySelector('[data-n]');
    btns.forEach(b=>b.onclick=()=>{
      const k=+b.dataset.k;btns.forEach(x=>x.disabled=true);
      btns[q.a].classList.add('correct');
      if(k===q.a){score++;fb.innerHTML=`<b>Correto.</b>${q.e}`;}
      else{b.classList.add('wrong');fb.innerHTML=`<b>Incorreto.</b>${q.e}`;}
      nx.hidden=false;nx.focus({preventScroll:true});
    });
    nx.onclick=()=>{i++;render();};
    $$(root,'[data-vsym]').forEach(vsym);
  }
  render();
}

/* ===================== WIDGETS ===================== */
const W={};
const reg=(el,fn)=>el.closest('.slide')._ticks.push(fn);
const onEnter=(el,fn)=>el.closest('.slide')._enter.push(fn);
function holdBtn(b,set){
  const dn=e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);b.classList.add('down');set(true);};
  const up=()=>{b.classList.remove('down');set(false);};
  b.addEventListener('pointerdown',dn);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);
  b.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();b.classList.add('down');set(true);}});
  b.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){up();}});
}

/* ----- conversor de unidades com manômetro ----- */
W.units=el=>{
  el.innerHTML=`<div class="two mid"><div><svg viewBox="0 0 400 300" aria-label="Manômetro">
    <path d="M60 230 A150 150 0 1 1 340 230" fill="none" stroke="#D3D8E3" stroke-width="26" stroke-linecap="round"/>
    <path class="arc" d="M60 230 A150 150 0 1 1 340 230" fill="none" stroke="#E8490F" stroke-width="26" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100"/>
    <g class="ticks"></g>
    <line class="needle" x1="200" y1="190" x2="200" y2="70" stroke="#1A2366" stroke-width="8" stroke-linecap="round"/>
    <circle cx="200" cy="190" r="18" fill="#27348B"/>
    <text x="200" y="270" text-anchor="middle" font-size="34" font-weight="700" fill="#1A2366" class="rd">0,0 bar</text></svg></div>
    <div><div class="ctrl"><label>Pressão no manômetro</label><input type="range" min="0" max="10" step="0.1" value="6"></div>
    <div class="ro" style="--c:2"><div><b class="psi"></b><span>psi (lbf/pol²)</span></div><div><b class="kpa"></b><span>kPa</span></div>
    <div><b class="kgf"></b><span>kgf/cm²</span></div><div><b class="abs o"></b><span>bar absoluto (manômetro + 1,013)</span></div></div></div></div>`;
  const r=$(el,'input'),nd=$(el,'.needle'),arc=$(el,'.arc'),tk=$(el,'.ticks');
  for(let i=0;i<=10;i++){const a=(-210+24*i)*Math.PI/180;svgEl('text',{x:200+118*Math.cos(a),y:198+118*Math.sin(a),'text-anchor':'middle','font-size':20,fill:'#525B70'},tk).textContent=i;}
  const up=()=>{const p=+r.value;nd.setAttribute('transform',`rotate(${-120+24*p} 200 190)`);arc.setAttribute('stroke-dasharray',`${p*10} 100`);
    $(el,'.rd').textContent=fmt(p)+' bar';$(el,'.psi').textContent=fmt(p*14.504,0);$(el,'.kpa').textContent=fmt(p*100,0);
    $(el,'.kgf').textContent=fmt(p*1.0197,2);$(el,'.abs').textContent=fmt(p+1.013,2);};
  r.addEventListener('input',up);up();
};

/* ----- força em cilindros ----- */
W.force=el=>{
  const rod=el.dataset.rod==='1';
  const D=[[16,6],[20,8],[25,10],[32,12],[40,16],[50,20],[63,20],[80,25],[100,25]];
  el.innerHTML=`<div class="two"><div>
    <p class="small" style="margin:0 0 8px"><b>Diâmetro do êmbolo (mm)</b></p><div class="seg">${D.map((d,i)=>`<button data-i="${i}">${d[0]}</button>`).join('')}</div>
    <div class="ctrl"><label>Pressão de trabalho: <span class="pv hl"></span></label><input type="range" min="1" max="10" step="0.5" value="6"></div>
    <svg viewBox="0 0 700 170"><rect x="40" y="40" width="380" height="90" rx="10" fill="#E6E9F5" stroke="#27348B" stroke-width="5"/>
      <g class="pist"><rect x="0" y="44" width="26" height="82" fill="#27348B"/><rect x="26" y="${85-8}" width="420" height="16" fill="#8A92A6"/></g>
      <path class="air flowdash" d="M60 85 H160" stroke="#E8490F" stroke-width="10" fill="none"/>
      <text x="230" y="160" text-anchor="middle" font-size="22" fill="#525B70">F = p × A</text></svg></div>
    <div><div class="ro" style="--c:1"><div><b class="fa"></b><span>força teórica de avanço</span></div>
    ${rod?'<div><b class="fr"></b><span>força teórica de retorno (área da haste descontada)</span></div>':''}
    <div><b class="eq o"></b><span class="eqs">equivalência</span></div></div>
    <p class="note">Valores teóricos. Na prática, o atrito reduz a força em cerca de 10 % a 15 %.</p></div></div>`;
  let di=5;const r=$(el,'input[type=range]'),bs=$$(el,'.seg button');
  const up=()=>{bs.forEach((b,i)=>b.classList.toggle('on',i===di));const p=+r.value,[d,h]=D[di];
    const A=Math.PI*(d/1000)**2/4,Ar=Math.PI*((d/1000)**2-(h/1000)**2)/4;const F=p*1e5*A,Fr=p*1e5*Ar;
    $(el,'.pv').textContent=fmt(p)+' bar';$(el,'.fa').textContent=fmt(F,0)+' N  ≈ '+fmt(F/9.81,0)+' kgf';
    if(rod)$(el,'.fr').textContent=fmt(Fr,0)+' N  ≈ '+fmt(Fr/9.81,0)+' kgf  (haste '+h+' mm)';
    $(el,'.eq').textContent='≈ '+fmt(F/9.81/50,1)+' sacos de cimento de 50 kg';};
  bs.forEach((b,i)=>b.onclick=()=>{di=i;up();});r.addEventListener('input',up);up();
  const pist=$(el,'.pist');reg(el,(t,T)=>{const x=40+170+150*Math.sin(T/700);pist.setAttribute('transform',`translate(${x} 0)`);$(el,'.air').setAttribute('d',`M50 85 H${x-6}`);});
};

/* ----- custo de vazamentos (6 bar) ----- */
W.leak=el=>{
  const L=[[1,1.1,0.4],[3,9.7,3.5],[5,26.9,9.7],[10,107.8,38.8]];
  el.innerHTML=`<div class="two"><div><p class="small" style="margin:0 0 8px"><b>Diâmetro do furo</b></p>
    <div class="seg">${L.map((l,i)=>`<button data-i="${i}">${l[0]} mm</button>`).join('')}</div>
    <div class="ctrl"><label>Horas de compressor ligado por dia: <span class="hv hl"></span></label><input type="range" min="4" max="24" step="1" value="16"></div>
    <div class="ctrl"><label>Tarifa de energia (R$/kWh) &nbsp;<input type="number" min="0.1" max="3" step="0.05" value="0.85"></label></div>
    <svg viewBox="0 0 600 120"><rect x="20" y="40" width="560" height="40" rx="20" fill="#D3D8E3"/><circle class="hole" cx="300" cy="60" r="6" fill="#1A2366"/>
      <g class="jet" fill="#E8490F"></g></svg></div>
    <div><div class="ro" style="--c:1"><div><b class="q"></b><span>ar perdido (6 bar)</span></div><div><b class="kw"></b><span>potência desperdiçada no compressor</span></div>
    <div><b class="c o"></b><span>custo por ano (300 dias)</span></div></div></div></div>`;
  let li=1;const bs=$$(el,'.seg button'),r=$(el,'input[type=range]'),tar=$(el,'input[type=number]'),jet=$(el,'.jet');
  for(let i=0;i<10;i++)svgEl('circle',{r:4,cx:300,cy:60},jet);
  const up=()=>{bs.forEach((b,i)=>b.classList.toggle('on',i===li));const [d,q,kw]=L[li],h=+r.value,t=+tar.value||0;
    $(el,'.hv').textContent=h+' h';$(el,'.q').textContent=fmt(q,1)+' L/s  ≈ '+fmt(q*60,0)+' L/min';$(el,'.kw').textContent=fmt(kw,1)+' kW';
    $(el,'.c').textContent='R$ '+fmt(kw*h*300*t,0);$(el,'.hole').setAttribute('r',2+d*1.4);};
  bs.forEach((b,i)=>b.onclick=()=>{li=i;up();});r.addEventListener('input',up);tar.addEventListener('input',up);up();
  reg(el,(t,T)=>{const n=[...jet.children],k=L[li][0];n.forEach((c,i)=>{const f=((T/600)+i/10)%1;c.setAttribute('cy',60-f*55);c.setAttribute('cx',300+(i%2?1:-1)*f*k*3);c.setAttribute('opacity',1-f);c.setAttribute('r',2+k*0.5*(1-f));});});
};

/* ----- símbolos de válvulas (ISO 1219) ----- */
const VT={
  '32nf':{n:'3/2 vias NF (normal fechada)',bw:150,top:[['2',.5]],bot:[['1',.3],['3',.7]],box:[[['a','1','2'],['t','3']],[['a','2','3'],['t','1']]],rest:1,L:['botao'],R:['mola'],src:'1'},
  '32na':{n:'3/2 vias NA (normal aberta)',bw:150,top:[['2',.5]],bot:[['1',.3],['3',.7]],box:[[['a','2','3'],['t','1']],[['a','1','2'],['t','3']]],rest:1,L:['botao'],R:['mola'],src:'1'},
  '52':{n:'5/2 vias, simples solenoide, retorno por mola',bw:170,top:[['4',.3],['2',.7]],bot:[['5',.15],['1',.5],['3',.85]],box:[[['a','1','4'],['a','2','3'],['t','5']],[['a','1','2'],['a','4','5'],['t','3']]],rest:1,L:['sol'],R:['mola'],src:'1'},
  '52d':{n:'5/2 vias, duplo solenoide (memória)',bw:170,top:[['4',.3],['2',.7]],bot:[['5',.15],['1',.5],['3',.85]],box:[[['a','1','4'],['a','2','3'],['t','5']],[['a','1','2'],['a','4','5'],['t','3']]],rest:1,L:['sol'],R:['sol'],mem:1,src:'1'},
  '53cf':{n:'5/3 vias, centro fechado',bw:170,top:[['4',.3],['2',.7]],bot:[['5',.15],['1',.5],['3',.85]],box:[[['a','1','4'],['a','2','3'],['t','5']],[['t','1'],['t','2'],['t','3'],['t','4'],['t','5']],[['a','1','2'],['a','4','5'],['t','3']]],rest:1,L:['sol','mola'],R:['sol','mola'],src:'1'},
  '43cf':{n:'4/3 vias, centro fechado',bw:150,top:[['A',.3],['B',.7]],bot:[['P',.3],['T',.7]],box:[[['a','P','A'],['a','B','T']],[['t','P'],['t','T'],['t','A'],['t','B']],[['x','P','B'],['x','A','T']]],rest:1,L:['sol','mola'],R:['sol','mola'],src:'P',hyd:1},
  '43ca':{n:'4/3 vias, centro aberto',bw:150,top:[['A',.3],['B',.7]],bot:[['P',.3],['T',.7]],box:[[['a','P','A'],['a','B','T']],[['j','P','T','A','B']],[['x','P','B'],['x','A','T']]],rest:1,L:['sol','mola'],R:['sol','mola'],src:'P',hyd:1},
  '43tan':{n:'4/3 vias, centro tandem (P→T)',bw:150,top:[['A',.3],['B',.7]],bot:[['P',.3],['T',.7]],box:[[['a','P','A'],['a','B','T']],[['l','P','T'],['t','A'],['t','B']],[['x','P','B'],['x','A','T']]],rest:1,L:['sol','mola'],R:['sol','mola'],src:'P',hyd:1},
  '43flu':{n:'4/3 vias, centro flutuante (A e B→T)',bw:150,top:[['A',.3],['B',.7]],bot:[['P',.3],['T',.7]],box:[[['a','P','A'],['a','B','T']],[['j','A','B','T'],['t','P']],[['x','P','B'],['x','A','T']]],rest:1,L:['sol','mola'],R:['sol','mola'],src:'P',hyd:1},
};
function drawActuator(g,kind,x,y,dir){ // dir: -1 = lado esquerdo, +1 = direito
  const c='#1A2366',w=4;const X=v=>x+dir*v;
  if(kind==='mola'){let d=`M${X(0)} ${y}`;for(let i=0;i<6;i++)d+=` L${X(6+i*7)} ${y+(i%2?14:-14)}`;d+=` L${X(48)} ${y}`;svgEl('path',{d,fill:'none',stroke:c,'stroke-width':w},g);return 50;}
  if(kind==='sol'){svgEl('rect',{x:Math.min(X(0),X(26)),y:y-22,width:26,height:44,fill:'#fff',stroke:c,'stroke-width':w},g);svgEl('line',{x1:X(0),y1:y+22,x2:X(26),y2:y-22,stroke:c,'stroke-width':w},g);return 28;}
  if(kind==='botao'){svgEl('line',{x1:X(0),y1:y,x2:X(22),y2:y,stroke:c,'stroke-width':w},g);svgEl('path',{d:`M${X(22)} ${y-18} A18 18 0 0 ${dir<0?0:1} ${X(22)} ${y+18} Z`,fill:'#fff',stroke:c,'stroke-width':w},g);return 44;}
  if(kind==='piloto'){svgEl('line',{x1:X(0),y1:y,x2:X(40),y2:y,stroke:c,'stroke-width':w,'stroke-dasharray':'8 6'},g);svgEl('path',{d:`M${X(0)} ${y} L${X(16)} ${y-10} L${X(16)} ${y+10}Z`,fill:c},g);return 42;}
  if(kind==='alavanca'){svgEl('line',{x1:X(0),y1:y,x2:X(30),y2:y-26,stroke:c,'stroke-width':w},g);svgEl('circle',{cx:X(32),cy:y-28,r:6,fill:c},g);return 36;}
  if(kind==='rolete'){svgEl('line',{x1:X(0),y1:y,x2:X(22),y2:y,stroke:c,'stroke-width':w},g);svgEl('circle',{cx:X(34),cy:y,r:12,fill:'#fff',stroke:c,'stroke-width':w},g);return 48;}
  return 0;
}
function drawValve(svg,key,pos,opts={}){
  const v=VT[key];svg.innerHTML='';const n=v.box.length,bw=v.bw,bh=120;
  const totalW=n*bw;const cx=opts.cx||400,top=opts.top||70;
  const alignX=cx-bw/2; // caixa ativa alinhada aqui
  const gx=alignX-pos*bw;
  const portX=(p)=>{const t=v.top.find(q=>q[0]===p),b=v.bot.find(q=>q[0]===p);return t?{x:t[1]*bw,y:0,top:1}:{x:b[1]*bw,y:bh,top:0};};
  const act=v.box[pos];
  // caminhos ativos (pressão / retorno)
  const hot=new Set(),ret=new Set();
  act.forEach(it=>{if(it[0]==='a'||it[0]==='x'||it[0]==='l'){if(it[1]===v.src)hot.add(it[2]);else if(it[2]===v.src)hot.add(it[1]);else ret.add(it[1]),ret.add(it[2]);}
    if(it[0]==='j'&&it.includes(v.src))it.slice(1).forEach(p=>p!==v.src&&hot.add(p));});
  // linhas externas (portas)
  const ext=svgEl('g',{},svg);
  [...v.top,...v.bot].forEach(([p,f])=>{const isTop=v.top.some(q=>q[0]===p);const x=alignX+f*bw;const y1=isTop?top:top+bh,y2=isTop?top-40:top+bh+40;
    const col=(p===v.src||hot.has(p))?'#E8490F':'#8A92A6';
    svgEl('line',{x1:x,y1,x2:x,y2,stroke:col,'stroke-width':p===v.src||hot.has(p)?8:5},ext);
    svgEl('text',{x:x+(isTop?0:0),y:isTop?y2-10:y2+30,'text-anchor':'middle','font-size':26,'font-weight':700,fill:'#1A2366'},ext).textContent=p;
    if(!isTop&&(p==='3'||p==='5')&&!v.hyd){svgEl('path',{d:`M${x-12} ${y2} L${x+12} ${y2} L${x} ${y2+14}Z`,fill:'none',stroke:'#8A92A6','stroke-width':3},ext);}
  });
  const g=svgEl('g',{transform:`translate(${gx} ${top})`,class:'vbody'},svg);
  v.box.forEach((items,i)=>{const ox=i*bw;const isA=i===pos;
    svgEl('rect',{x:ox,y:0,width:bw,height:bh,fill:isA?'#FDE7DD':'#fff',stroke:'#1A2366','stroke-width':5},g);
    items.forEach(it=>{const col=isA?(it.slice(1).includes(v.src)?'#E8490F':'#27348B'):'#525B70';
      if(it[0]==='t'){const p=portX(it[1]);const y=p.top?18:bh-18,x=ox+p.x;svgEl('line',{x1:x,y1:p.top?0:bh,x2:x,y2:y,stroke:col,'stroke-width':4},g);svgEl('line',{x1:x-14,y1:y,x2:x+14,y2:y,stroke:col,'stroke-width':4},g);}
      else if(it[0]==='j'){const cxp=ox+bw/2,cyp=bh/2;it.slice(1).forEach(q=>{const p=portX(q);svgEl('line',{x1:ox+p.x,y1:p.y,x2:cxp,y2:cyp,stroke:col,'stroke-width':4},g);});svgEl('circle',{cx:cxp,cy:cyp,r:7,fill:col},g);}
      else{const a=portX(it[1]),b=portX(it[2]);const x1=ox+a.x,y1=a.top?8:bh-8,x2=ox+b.x,y2=b.top?8:bh-8;
        svgEl('line',{x1,y1,x2,y2,stroke:col,'stroke-width':4},g);
        if(it[0]!=='l'){const ang=Math.atan2(y2-y1,x2-x1),L=18;svgEl('path',{d:`M${x2} ${y2} L${x2-L*Math.cos(ang-0.4)} ${y2-L*Math.sin(ang-0.4)} L${x2-L*Math.cos(ang+0.4)} ${y2-L*Math.sin(ang+0.4)}Z`,fill:col},g);}}
    });
  });
  let lx=0;v.L.forEach(k=>{lx+=drawActuator(g,k,-lx,bh/2,-1)+2;});
  let rx=totalW;v.R.forEach(k=>{rx+=drawActuator(g,k,rx,bh/2,1)+2;});
  return {hot:[...hot],ret:[...ret]};
}
W.valve=el=>{
  const keys=(el.dataset.types||'32nf,52').split(',');
  el.innerHTML=`<div class="seg">${keys.map(k=>`<button data-k="${k}">${VT[k].n}</button>`).join('')}</div>
    <svg class="vsv" viewBox="0 0 900 290"></svg><div class="wrow vb"></div><p class="wtext"></p>`;
  let key=keys[0],pos=VT[key].rest;const svg=$(el,'.vsv'),vb=$(el,'.vb'),tx=$(el,'.wtext');
  const draw=()=>{const v=VT[key];const r=drawValve(svg,key,pos,{cx:450,top:70});
    const nm=v.box.length===3?['esquerda (1Y1)','central (repouso)','direita (1Y2)'][pos]:(pos===v.rest?'repouso':'acionada');
    tx.innerHTML=`<b>Posição ${nm}.</b> `+(r.hot.length?`A pressão de <b>${v.src}</b> segue para <span class="hl">${r.hot.join(' e ')}</span>.`:`A entrada <b>${v.src}</b> está bloqueada.`)+(r.ret.length?` Retorno/escape: ${r.ret.join(' → ')}.`:'');};
  const build=()=>{const v=VT[key];pos=v.rest;vb.innerHTML='';
    if(v.box.length===3){[['1Y1',0],['1Y2',2]].forEach(([l,p])=>{const b=document.createElement('button');b.className='btn sm push';b.textContent='Manter '+l+' energizado';holdBtn(b,on=>{pos=on?p:1;draw();});vb.appendChild(b);});}
    else if(v.mem){[['Sinal 14 (1Y1)',0],['Sinal 12 (1Y2)',1]].forEach(([l,p])=>{const b=document.createElement('button');b.className='btn sm';b.textContent='Pulso '+l;b.onclick=()=>{pos=p;draw();};vb.appendChild(b);});
      const s=document.createElement('span');s.className='note';s.style.margin='0';s.textContent='Sem sinal, a válvula mantém a última posição.';vb.appendChild(s);}
    else{const b=document.createElement('button');b.className='btn sm push';b.textContent='Manter acionada';holdBtn(b,on=>{pos=on?0:1;draw();});vb.appendChild(b);}
    $$(el,'.seg button').forEach(b=>b.classList.toggle('on',b.dataset.k===key));draw();};
  $$(el,'.seg button').forEach(b=>b.onclick=()=>{key=b.dataset.k;build();});build();
};
window.VALVE_SVG=(key,pos)=>{const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','0 0 900 290');drawValve(s,key,pos??VT[key].rest,{cx:450,top:70});return s.outerHTML;};
function vsym(e){const [k,p]=e.dataset.vsym.split(':');e.innerHTML=window.VALVE_SVG(k,p!==undefined?+p:undefined);}
$$(document,'[data-vsym]').forEach(vsym);

/* ----- bancada de comando elétrico (ladder) ----- */
const LAD=window.LADDER_MODES||{};
W.ladder=el=>{
  const keys=el.dataset.modes.split(',');
  el.innerHTML=`${keys.length>1?`<div class="seg">${keys.map(k=>`<button data-k="${k}">${LAD[k].t}</button>`).join('')}</div>`:''}
  <div class="lad"><div><svg class="ladsvg" viewBox="0 0 930 520"></svg><p class="wtext"></p></div>
  <div><svg class="cylsvg" viewBox="0 0 560 300"></svg><div class="inputs"></div><div class="chips"></div></div></div>`;
  const ls=$(el,'.ladsvg'),cs=$(el,'.cylsvg'),inp=$(el,'.inputs'),chips=$(el,'.chips'),tx=$(el,'.wtext');
  let M,st,parts;
  function cylDraw(){
    cs.innerHTML=`<rect x="40" y="70" width="300" height="80" rx="8" fill="#E6E9F5" stroke="#27348B" stroke-width="5"/>
    <g class="pis"><rect x="0" y="74" width="22" height="72" fill="#27348B"/><rect x="22" y="102" width="290" height="16" fill="#8A92A6"/><rect x="306" y="94" width="18" height="32" rx="4" fill="#525B70"/></g>
    <g class="s1g"><rect x="44" y="40" width="44" height="22" rx="4" fill="#fff" stroke="#525B70" stroke-width="3"/><text x="66" y="30" text-anchor="middle" font-size="20" font-weight="700" fill="#1A2366">${M.sl?M.sl[0]:''}</text></g>
    <g class="s2g"><rect x="292" y="40" width="44" height="22" rx="4" fill="#fff" stroke="#525B70" stroke-width="3"/><text x="314" y="30" text-anchor="middle" font-size="20" font-weight="700" fill="#1A2366">${M.sl?M.sl[1]:''}</text></g>
    <g transform="translate(70 200)"><rect x="0" y="0" width="200" height="70" fill="#fff" stroke="#1A2366" stroke-width="4"/><line x1="100" y1="0" x2="100" y2="70" stroke="#1A2366" stroke-width="4"/>
      <g class="ysol"><rect x="-30" y="15" width="28" height="40" fill="#fff" stroke="#1A2366" stroke-width="4"/><line x1="-30" y1="55" x2="-2" y2="15" stroke="#1A2366" stroke-width="4"/>
      <text x="-16" y="90" text-anchor="middle" font-size="22" font-weight="700" fill="#1A2366">${M.yl[0]}</text></g>
      ${M.yl[1]?`<g class="ysol2"><rect x="202" y="15" width="28" height="40" fill="#fff" stroke="#1A2366" stroke-width="4"/><line x1="202" y1="55" x2="230" y2="15" stroke="#1A2366" stroke-width="4"/><text x="216" y="90" text-anchor="middle" font-size="22" font-weight="700" fill="#1A2366">${M.yl[1]}</text></g>`
      :`<path d="M202 35 l6 -12 l7 24 l7 -24 l7 24 l6 -12" fill="none" stroke="#1A2366" stroke-width="4"/>`}
      <text class="vtx" x="100" y="-12" text-anchor="middle" font-size="20" fill="#525B70">válvula 5/2</text></g>
    <text x="440" y="120" text-anchor="middle" font-size="22" fill="#525B70" class="posx"></text>`;
  }
  function build(k){
    M=LAD[k];st={pos:0,valve:0,acc:{},v:{}};
    $$(el,'.seg button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
    // ladder
    ls.innerHTML='';parts=[];let y=60;const RX=880,LX=50,step=128;
    const rails=svgEl('g',{},ls);
    M.r.forEach((r,ri)=>{
      const pre=r.pre||[],br=r.b||[[]],post=r.s||[];const nb=br.length;
      svgEl('text',{x:24,y:y+8,class:'rn'},ls).textContent=ri+1;
      let x=LX;const rung={r,wires:[],cts:[],brw:[]};
      const addCt=(e,x,yy,list)=>{const nc=e[0]==='!',nm=nc?e.slice(1):e;const g=svgEl('g',{class:'ct'},ls);
        svgEl('rect',{x:x+30,y:yy-26,width:40,height:52},g);
        svgEl('line',{x1:x,y1:yy,x2:x+38,y2:yy},g);svgEl('line',{x1:x+38,y1:yy-24,x2:x+38,y2:yy+24},g);
        svgEl('line',{x1:x+62,y1:yy-24,x2:x+62,y2:yy+24},g);svgEl('line',{x1:x+62,y1:yy,x2:x+step,y2:yy},g);
        if(nc)svgEl('line',{x1:x+30,y1:yy+24,x2:x+70,y2:yy-24},g);
        svgEl('text',{x:x+50,y:yy-34,class:'lbl'},g).textContent=(M.clic&&nc)?nm.toLowerCase():nm;
        list.push({g,e});};
      pre.forEach(e=>{addCt(e,x,y,rung.cts);x+=step;});
      const bx0=x,maxL=Math.max(...br.map(b=>b.length),1),bx1=bx0+maxL*step;
      br.forEach((b,bi)=>{const yy=y+bi*84;let xx=bx0;const bc=[];b.forEach(e=>{addCt(e,xx,yy,bc);xx+=step;});
        const wl=svgEl('line',{x1:xx,y1:yy,x2:bx1,y2:yy,class:'wire'},ls);rung.brw.push({bc,wl,v:bi?svgEl('path',{d:`M${bx0} ${y} V${yy} M${bx1} ${y} V${yy}`,class:'wire'},ls):null});rung.cts.push(...bc);});
      x=bx1;post.forEach(e=>{addCt(e,x,y,rung.cts);x+=step;});
      const cx=RX-90;rung.w=svgEl('line',{x1:x,y1:y,x2:cx-28,y2:y,class:'wire'},ls);
      const cg=svgEl('g',{class:'coil'},ls);
      if(r.t==='ton'){svgEl('rect',{x:cx-28,y:y-28,width:56,height:56,rx:6},cg);}else svgEl('circle',{cx,cy:y,r:28},cg);
      svgEl('text',{x:cx,y:y+8,class:'in'},cg).textContent=r.t==='set'?'S':r.t==='reset'?'R':r.t==='ton'?'T':'';
      svgEl('text',{x:cx,y:y-40,class:'lbl'},cg).textContent=r.c;
      svgEl('line',{x1:cx+28,y1:y,x2:RX,y2:y,class:'wire'},ls);
      if(r.t==='ton'){rung.tm=svgEl('text',{x:cx+38,y:y+46,class:'tm','text-anchor':'middle'},ls);}
      rung.cg=cg;parts.push(rung);
      y+=Math.max(110,nb*84+30);
    });
    const H=Math.max(y-20,300);ls.setAttribute('viewBox',`0 0 930 ${H}`);
    svgEl('line',{x1:LX,y1:20,x2:LX,y2:H-20,class:'rail'},rails);svgEl('line',{x1:RX,y1:20,x2:RX,y2:H-20,class:'rail'},rails);
    svgEl('text',{x:LX,y:16,'text-anchor':'middle','font-size':18,fill:'#525B70'},rails).textContent=M.clic?'':'+24 V';
    svgEl('text',{x:RX,y:16,'text-anchor':'middle','font-size':18,fill:'#525B70'},rails).textContent=M.clic?'':'0 V';
    // entradas
    inp.innerHTML='';M.in.forEach(([v,kind,label])=>{const b=document.createElement('button');b.className='btn sm '+(kind==='sw'?'ghost':'push');b.textContent=label;
      if(kind==='sw'){b.onclick=()=>{st.v[v]=!st.v[v];b.classList.toggle('on',st.v[v]);};}else holdBtn(b,on=>{st.v[v]=on;});inp.appendChild(b);});
    cylDraw();tx.innerHTML=M.d||'';
    chips.innerHTML=(M.show||[]).map(v=>`<span data-v="${v}">${v}</span>`).join('');
  }
  const val=(e)=>{const nc=e[0]==='!',n=nc?e.slice(1):e;const s=!!st.v[n];return nc?!s:s;};
  function scan(dt){
    // sensores do cilindro
    if(M.sens){st.v[M.sens[0]]=st.pos<0.02;st.v[M.sens[1]]=st.pos>0.98;}
    M.r.forEach((r,ri)=>{
      const pre=(r.pre||[]).every(val),bo=(r.b||[[]]).map(b=>b.every(val)),any=bo.some(x=>x),post=(r.s||[]).every(val);
      const p=pre&&any&&post;const part=parts[ri];
      // pintura
      part.cts.forEach(c=>c.g.classList.toggle('on',val(c.e)));
      part.brw.forEach((b,bi)=>{const on=pre&&bo[bi];b.wl.classList.toggle('on',on&&post);if(b.v)b.v.classList.toggle('on',on&&post);});
      part.w.classList.toggle('on',p);
      if(r.t==='set'){if(p)st.v[r.c]=true;}
      else if(r.t==='reset'){if(p)st.v[r.c]=false;}
      else if(r.t==='ton'){st.acc[r.c]=p?(st.acc[r.c]||0)+dt:0;st.v[r.c]=st.acc[r.c]>=r.p;
        part.tm.textContent=p?fmt(Math.min(st.acc[r.c],r.p),1)+' / '+fmt(r.p,0)+' s':'';}
      else st.v[r.c]=p;
      part.cg.classList.toggle('on',r.t==='ton'?!!st.v[r.c]||p:!!st.v[r.c]);
    });
    // válvula e cilindro
    const y1=!!st.v[M.adv],y2=M.ret?!!st.v[M.ret]:false;
    if(M.ret){if(y1&&!y2)st.valve=1;else if(y2&&!y1)st.valve=0;}else st.valve=y1?1:0;
    st.pos=Math.max(0,Math.min(1,st.pos+(st.valve?1:-1)*dt*0.55));
    $(cs,'.pis').setAttribute('transform',`translate(${44+st.pos*270} 0)`);
    $(cs,'.ysol rect').setAttribute('fill',y1?'#E8490F':'#fff');
    if(M.ret)$(cs,'.ysol2 rect').setAttribute('fill',y2?'#E8490F':'#fff');
    if(M.sens){$(cs,'.s1g rect').setAttribute('fill',st.v[M.sens[0]]?'#E8490F':'#fff');$(cs,'.s2g rect').setAttribute('fill',st.v[M.sens[1]]?'#E8490F':'#fff');}
    $(cs,'.posx').textContent=st.pos<0.02?'recuado':st.pos>0.98?'avançado':(st.valve?'avançando…':'recuando…');
    $$(chips,'span').forEach(s=>s.classList.toggle('on',!!st.v[s.dataset.v]));
  }
  $$(el,'.seg button').forEach(b=>b.onclick=()=>build(b.dataset.k));
  build(keys[0]);
  reg(el,(t,T,dt)=>scan(Math.min(dt,0.05)));
  onEnter(el,()=>{for(const k in st.v)if(!M.in.some(i=>i[0]===k&&i[1]==='sw'))st.v[k]=false;});
};

/* ----- relé: bobina e contatos ----- */
W.relay=el=>{
  el.innerHTML=`<div class="two mid"><svg viewBox="0 0 520 330">
    <rect x="20" y="20" width="480" height="290" rx="18" fill="#F5F6F9" stroke="#8A92A6" stroke-width="4"/>
    <g class="coil"><rect x="50" y="110" width="110" height="130" rx="10" fill="#fff" stroke="#27348B" stroke-width="5"/>
      <path d="M66 130 h78 M66 150 h78 M66 170 h78 M66 190 h78 M66 210 h78" stroke="#525B70" stroke-width="5" class="wind"/>
      <text x="105" y="270" text-anchor="middle" font-size="22" font-weight="700" fill="#1A2366">A1 – A2</text></g>
    <path d="M160 175 H190 M190 125 V225" fill="none" stroke="#525B70" stroke-width="3" stroke-dasharray="8 6"/>
    <g class="arm1"><line x1="220" y1="135" x2="425" y2="135" stroke="#525B70" stroke-width="8" stroke-linecap="round"/></g>
    <g class="arm2"><line x1="220" y1="215" x2="425" y2="215" stroke="#525B70" stroke-width="8" stroke-linecap="round"/></g>
    <g font-size="22" font-weight="700" fill="#1A2366">
      <circle cx="220" cy="135" r="10" fill="#525B70"/><text x="220" y="116" text-anchor="middle">13</text>
      <circle cx="220" cy="215" r="10" fill="#525B70"/><text x="220" y="251" text-anchor="middle">21</text>
      <circle cx="430" cy="110" r="10" fill="#525B70"/><text x="455" y="100">14</text><text x="455" y="126" font-size="18" font-weight="400">NA</text>
      <circle cx="430" cy="240" r="10" fill="#525B70"/><text x="455" y="240">22</text><text x="455" y="264" font-size="18" font-weight="400">NF</text></g>
    <g class="h1"><circle cx="300" cy="62" r="24" fill="#fff" stroke="#525B70" stroke-width="4"/><text x="300" y="70" text-anchor="middle" font-size="20" font-weight="700" fill="#1A2366">H1</text></g>
    <g class="h2"><circle cx="300" cy="280" r="24" fill="#fff" stroke="#525B70" stroke-width="4"/><text x="300" y="288" text-anchor="middle" font-size="20" font-weight="700" fill="#1A2366">H2</text></g>
  </svg><div><button class="btn hot push">Manter bobina energizada</button>
  <p class="wtext"></p></div></div>`;
  const arm1=$(el,'.arm1'),arm2=$(el,'.arm2'),tx=$(el,'.wtext');
  const set=on=>{arm1.setAttribute('transform',on?'rotate(-6.8 220 135)':'rotate(6 220 135)');arm2.setAttribute('transform',on?'rotate(-6 220 215)':'rotate(6.8 220 215)');
    $(el,'.coil rect').setAttribute('fill',on?'#FDE7DD':'#fff');$(el,'.wind').setAttribute('stroke',on?'#E8490F':'#525B70');
    $(el,'.h1 circle').setAttribute('fill',on?'#E8490F':'#fff');$(el,'.h2 circle').setAttribute('fill',on?'#fff':'#E8490F');
    tx.innerHTML=on?'<b>Bobina energizada:</b> o eletroímã puxa os contatos móveis. O contato NA (13‑14) <span class="hl">fecha</span> e acende H1; o NF (21‑22) <span class="hl">abre</span> e apaga H2.':'<b>Bobina desligada:</b> a mola mantém o contato NF (21‑22) fechado, então H2 fica acesa. O contato NA (13‑14) fica aberto.';};
  holdBtn($(el,'.btn'),set);set(false);
};

/* ----- solenoide abrindo a passagem de ar ----- */
W.solenoid=el=>{
  el.innerHTML=`<div class="two mid"><svg viewBox="0 0 520 360">
    <rect x="40" y="230" width="440" height="90" rx="10" fill="#ECEEF3" stroke="#8A92A6" stroke-width="4"/>
    <path d="M40 290 H230 V250 M290 250 V290 H480" fill="none" stroke="#8A92A6" stroke-width="4"/>
    <text x="70" y="345" font-size="22" font-weight="700" fill="#1A2366">1 (entrada)</text><text x="370" y="345" font-size="22" font-weight="700" fill="#1A2366">2 (saída)</text>
    <rect x="200" y="40" width="120" height="170" rx="10" fill="#fff" stroke="#27348B" stroke-width="5"/>
    <g class="wind">${[0,1,2,3,4,5,6].map(i=>`<line x1="206" y1="${60+i*20}" x2="314" y2="${60+i*20}" stroke="#525B70" stroke-width="5"/>`).join('')}</g>
    <g class="plg"><rect x="245" y="70" width="30" height="170" rx="6" fill="#8A92A6"/><rect x="236" y="234" width="48" height="16" rx="4" fill="#1A2366"/></g>
    <g class="air" fill="#E8490F"></g>
    <circle class="led" cx="350" cy="56" r="12" fill="#D3D8E3" stroke="#525B70" stroke-width="3"/><text x="370" y="64" font-size="20" fill="#525B70">LED</text>
    <text x="100" y="60" font-size="22" font-weight="700" fill="#1A2366">bobina</text><text x="186" y="177" text-anchor="end" font-size="22" font-weight="700" fill="#1A2366">núcleo móvel</text><line x1="192" y1="170" x2="243" y2="170" stroke="#1A2366" stroke-width="2"/>
  </svg><div><button class="btn hot">Energizar 24 V</button><p class="wtext"></p></div></div>`;
  let on=false;const b=$(el,'.btn'),air=$(el,'.air'),tx=$(el,'.wtext');
  for(let i=0;i<8;i++)svgEl('circle',{r:7},air);
  const up=()=>{b.textContent=on?'Desligar':'Energizar 24 V';b.classList.toggle('ghost',on);
    $(el,'.wind').querySelectorAll('line').forEach(l=>l.setAttribute('stroke',on?'#E8490F':'#525B70'));
    $(el,'.led').setAttribute('fill',on?'#E8490F':'#D3D8E3');
    tx.innerHTML=on?'A corrente na bobina cria um <b>campo magnético</b> que puxa o núcleo para cima. A passagem abre e o ar segue de <b>1</b> para <b>2</b>.':'Sem corrente, a mola empurra o núcleo contra a sede e a passagem fica <b>fechada</b>.';};
  b.onclick=()=>{on=!on;up();};up();let lift=0;
  reg(el,(t,T,dt)=>{lift+=((on?1:0)-lift)*Math.min(1,dt*10);$(el,'.plg').setAttribute('transform',`translate(0 ${-lift*34})`);
    [...air.children].forEach((c,i)=>{const f=((T/1400)+i/8)%1;let x,y;if(f<.4){x=60+f/.4*170;y=290;}else if(f<.6){x=230+(f-.4)/.2*60;y=290-((f-.4)/.2)*30;}else{x=290+(f-.6)/.4*180;y=290;}
      c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('opacity',on||f<.38?1:0);});});
};

/* ----- diagrama de tempos: temporizadores ----- */
W.timer=el=>{
  const P=+(el.dataset.p||3);
  el.innerHTML=`<svg viewBox="0 0 1100 360" class="tsvg"></svg><div class="wrow" style="margin-top:12px"><button class="btn hot push">Manter S1 pressionado</button><span class="note" style="margin:0">Tempo programado: ${P} s. O gráfico mostra os últimos 12 s.</span></div>`;
  const s=$(el,'.tsvg');const rows=[['S1 (comando)','#27348B'],['Retardo na energização','#E8490F'],['Retardo na desenergização','#B8380A']];
  rows.forEach(([n],i)=>{svgEl('text',{x:10,y:70+i*110,'font-size':24,'font-weight':700,fill:'#1A2366'},s).textContent=n;svgEl('line',{x1:330,y1:90+i*110,x2:1090,y2:90+i*110,stroke:'#D3D8E3','stroke-width':3},s);});
  const pl=rows.map(([,c],i)=>svgEl('polyline',{fill:'none',stroke:c,'stroke-width':6,points:''},s));
  let on=false,ta=0,tb=0;const H=[];holdBtn($(el,'.btn'),v=>on=v);
  reg(el,(t,T,dt)=>{ta=on?ta+dt:0;tb=on?P:Math.max(0,tb-dt);const a=on&&ta>=P,b=on||tb>0;
    H.push([on,a,b]);if(H.length>240)H.shift();
    pl.forEach((p,k)=>{let pts='';H.forEach((h,i)=>{const x=1090-(H.length-1-i)*(760/239);const y=90+k*110-(h[k]?55:0);pts+=`${x.toFixed(1)},${y} `;});p.setAttribute('points',pts);});});
};

/* ----- trajeto-passo ----- */
W.steps=el=>{
  const seq=el.dataset.seq.split(' ');const cyls=[...new Set(seq.map(s=>s[0]))];
  const nS=seq.length;el.innerHTML=`<div class="tp"><div><svg class="cs" viewBox="0 0 520 ${cyls.length*150+20}"></svg><p class="stepinfo"></p>
    <div class="wrow"><button class="btn sm hot nx">Próximo passo</button><button class="btn sm ghost rs">Reiniciar</button></div></div>
    <div><svg class="ds" viewBox="0 0 1000 ${cyls.length*150+90}"></svg></div></div>`;
  const cs=$(el,'.cs'),ds=$(el,'.ds');const state=[];
  cyls.forEach((c,i)=>{const y=20+i*150;cs.insertAdjacentHTML('beforeend',`<g><text x="10" y="${y+60}" font-size="44" font-weight="700" fill="#27348B">${c}</text>
    <rect x="70" y="${y+20}" width="260" height="70" rx="8" fill="#E6E9F5" stroke="#27348B" stroke-width="5"/>
    <g class="p${i}" style="transition:transform .8s cubic-bezier(.4,.1,.2,1)"><rect x="76" y="${y+24}" width="20" height="62" fill="#27348B"/><rect x="96" y="${y+48}" width="250" height="14" fill="#8A92A6"/></g></g>`);});
  // grade do diagrama
  const X0=110,dx=(1000-X0-30)/nS;
  for(let k=0;k<=nS;k++){svgEl('line',{x1:X0+k*dx,y1:20,x2:X0+k*dx,y2:cyls.length*150+10,stroke:'#D3D8E3','stroke-width':3},ds);
    svgEl('text',{x:X0+k*dx,y:cyls.length*150+50,'text-anchor':'middle','font-size':26,'font-weight':700,fill:'#525B70'},ds).textContent=k+1;}
  svgEl('text',{x:X0+nS*dx/2,y:cyls.length*150+84,'text-anchor':'middle','font-size':22,fill:'#525B70'},ds).textContent='passos';
  const lines=cyls.map((c,i)=>{const y=40+i*150;svgEl('text',{x:20,y:y+70,'font-size':40,'font-weight':700,fill:'#27348B'},ds).textContent=c;
    svgEl('text',{x:66,y:y+16,'font-size':22,fill:'#525B70'},ds).textContent='1';svgEl('text',{x:66,y:y+110,'font-size':22,fill:'#525B70'},ds).textContent='0';
    svgEl('line',{x1:X0,y1:y+8,x2:1000-30,y2:y+8,stroke:'#ECEEF3','stroke-width':2},ds);svgEl('line',{x1:X0,y1:y+102,x2:1000-30,y2:y+102,stroke:'#ECEEF3','stroke-width':2},ds);
    return svgEl('polyline',{fill:'none',stroke:'#E8490F','stroke-width':8,'stroke-linejoin':'round',points:''},ds);});
  let k=0;
  const render=()=>{const pos=cyls.map(()=>0);const pts=cyls.map((c,i)=>[[X0,142+i*150-40]]);
    for(let j=0;j<k;j++){const [c,s]=[seq[j][0],seq[j][1]];const ci=cyls.indexOf(c);
      cyls.forEach((cc,i)=>{const y0=40+i*150;const yv=v=>v?y0+8:y0+102;
        if(i===ci){pos[i]=s==='+'?1:0;pts[i].push([X0+(j+1)*dx,yv(pos[i])]);}else pts[i].push([X0+(j+1)*dx,yv(pos[i])]);});}
    cyls.forEach((c,i)=>{const y0=40+i*150;pts[i][0]=[X0,y0+102];lines[i].setAttribute('points',pts[i].map(p=>p.join(',')).join(' '));
      $(cs,'.p'+i).style.transform=`translateX(${pos[i]*180}px)`;});
    $(el,'.stepinfo').innerHTML=k===0?'Posição inicial: todos recuados.':`Passo ${k}: <span class="hl">${seq[k-1]}</span> ${seq[k-1][1]==='+'?'(avança)':'(recua)'}`;
    $(el,'.nx').disabled=k>=nS;};
  $(el,'.nx').onclick=()=>{if(k<nS){k++;render();}};$(el,'.rs').onclick=()=>{k=0;render();};render();
};

/* ----- prensa hidráulica (Pascal) ----- */
W.pascal=el=>{
  el.innerHTML=`<div class="two mid"><svg viewBox="0 0 640 380" class="ps"></svg><div>
    <div class="ctrl"><label>Força aplicada F₁: <span class="hl f1v"></span></label><input class="f1" type="range" min="50" max="500" step="10" value="200"></div>
    <div class="ctrl"><label>Diâmetro do êmbolo menor d₁: <span class="hl d1v"></span></label><input class="d1" type="range" min="1" max="6" step="0.5" value="2"></div>
    <div class="ctrl"><label>Diâmetro do êmbolo maior d₂: <span class="hl d2v"></span></label><input class="d2" type="range" min="6" max="30" step="1" value="20"></div>
    <div class="ro" style="--c:2"><div><b class="f2 o"></b><span>força no êmbolo maior F₂</span></div><div><b class="mul"></b><span>multiplicação de força</span></div>
    <div><b class="p"></b><span>pressão no óleo (igual em todo o fluido)</span></div><div><b class="s2"></b><span>o êmbolo maior sobe, se o menor descer 10 cm</span></div></div></div></div>`;
  const ps=$(el,'.ps');
  const up=()=>{const F1=+$(el,'.f1').value,d1=+$(el,'.d1').value,d2=+$(el,'.d2').value;const r=(d2/d1)**2;const F2=F1*r,A1=Math.PI*(d1/100)**2/4,p=F1/A1/1e5;
    $(el,'.f1v').textContent=F1+' N';$(el,'.d1v').textContent=fmt(d1)+' cm';$(el,'.d2v').textContent=d2+' cm';
    $(el,'.f2').textContent=fmt(F2,0)+' N';$(el,'.mul').textContent=fmt(r,0)+' ×';$(el,'.p').textContent=fmt(p,1)+' bar';$(el,'.s2').textContent=fmt(10/r*10,1)+' mm';
    const w1=14+d1*10,w2=40+d2*9;
    ps.innerHTML=`<path d="M${120-w1/2} 120 V300 H${440-w2/2} V170 H${440+w2/2} V330 H${120-w1/2-0}" fill="none"/>
      <path d="M${120-w1/2} 150 V330 H${440+w2/2} V170 H${440-w2/2} V300 H${120+w1/2} V150 Z" fill="#E8C35A" opacity=".85"/>
      <path d="M${120-w1/2} 110 V330 H${440+w2/2} V150 M${440-w2/2} 150 V300 H${120+w1/2} V110" fill="none" stroke="#27348B" stroke-width="6"/>
      <rect x="${120-w1/2}" y="138" width="${w1}" height="14" fill="#525B70"/><rect x="${440-w2/2}" y="158" width="${w2}" height="14" fill="#525B70"/>
      <path d="M120 40 V128" stroke="#E8490F" stroke-width="10" marker-end="url(#ar)"/><path d="M440 150 V${150-Math.min(140,30+Math.log(r)*25)}" stroke="#E8490F" stroke-width="${Math.min(30,8+r/12)}"/>
      <defs><marker id="ar" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto"><path d="M0 0 L4 2 L0 4Z" fill="#E8490F"/></marker></defs>
      <text x="150" y="70" font-size="26" font-weight="700" fill="#1A2366">F₁</text><text x="${440+w2/2+12}" y="110" font-size="26" font-weight="700" fill="#1A2366">F₂</text>`;};
  $$(el,'input').forEach(i=>i.addEventListener('input',up));up();
};

/* ----- vazão x velocidade ----- */
W.flow=el=>{
  el.innerHTML=`<div class="two"><div>
    <div class="ctrl"><label>Vazão da bomba Q: <span class="hl qv"></span></label><input class="q" type="range" min="2" max="60" step="1" value="12"></div>
    <div class="ctrl"><label>Diâmetro do cilindro D: <span class="hl dv"></span></label><input class="d" type="range" min="25" max="125" step="5" value="50"></div>
    <svg viewBox="0 0 640 150"><rect x="20" y="30" width="460" height="90" rx="8" fill="#E6E9F5" stroke="#27348B" stroke-width="5"/>
    <rect class="oil" x="24" y="34" width="10" height="82" fill="#E8C35A"/><g class="pis"><rect x="0" y="34" width="20" height="82" fill="#27348B"/><rect x="20" y="66" width="420" height="18" fill="#8A92A6"/></g></svg></div>
    <div><div class="ro" style="--c:1"><div><b class="v o"></b><span>velocidade de avanço</span></div><div><b class="t"></b><span>tempo para um curso de 400 mm</span></div></div>
    <p class="formula">v = Q ÷ A<small>Mais vazão, mais velocidade. Mais área, menos velocidade.</small></p></div></div>`;
  let v=0,x=0;
  const up=()=>{const Q=+$(el,'.q').value,D=+$(el,'.d').value;const A=Math.PI*(D/1000)**2/4;v=Q/60000/A;
    $(el,'.qv').textContent=Q+' L/min';$(el,'.dv').textContent=D+' mm';$(el,'.v').textContent=fmt(v*100,1)+' cm/s';$(el,'.t').textContent=fmt(0.4/v,1)+' s';};
  $$(el,'input').forEach(i=>i.addEventListener('input',up));up();
  reg(el,(t,T,dt)=>{x+=v*dt/0.4;if(x>1.3)x=0;const p=Math.min(x,1);$(el,'.pis').setAttribute('transform',`translate(${24+p*430} 0)`);$(el,'.oil').setAttribute('width',4+p*430);});
};

/* ----- válvula proporcional ----- */
W.prop=el=>{
  el.innerHTML=`<div class="two"><div>
    <div class="ctrl"><label>Sinal de comando (CLP → amplificador): <span class="hl sv"></span></label><input class="s" type="range" min="0" max="10" step="0.1" value="5"></div>
    <svg viewBox="0 0 640 300">
      <rect x="10" y="40" width="160" height="80" rx="10" fill="#27348B"/><text x="90" y="87" text-anchor="middle" font-size="19" font-weight="700" fill="#fff">Amplificador</text>
      <path d="M170 80 H250" stroke="#E8490F" stroke-width="6" class="flowdash"/><text x="210" y="66" text-anchor="middle" font-size="20" fill="#525B70" class="ma"></text>
      <rect x="250" y="40" width="70" height="80" fill="#fff" stroke="#1A2366" stroke-width="5"/><line x1="250" y1="120" x2="320" y2="40" stroke="#1A2366" stroke-width="5"/>
      <rect x="320" y="30" width="290" height="100" rx="8" fill="#ECEEF3" stroke="#8A92A6" stroke-width="4"/>
      <rect class="spool" x="330" y="62" width="150" height="36" rx="6" fill="#525B70"/>
      <rect x="330" y="140" width="270" height="26" rx="13" fill="#D3D8E3"/><rect class="open" x="330" y="140" width="0" height="26" rx="13" fill="#E8490F"/>
      <text x="330" y="196" font-size="22" fill="#525B70">abertura da válvula</text>
      <rect x="20" y="220" width="440" height="60" rx="8" fill="#E6E9F5" stroke="#27348B" stroke-width="4"/><g class="pis"><rect x="0" y="224" width="16" height="52" fill="#27348B"/><rect x="16" y="244" width="400" height="12" fill="#8A92A6"/></g>
    </svg></div>
    <div><div class="ro" style="--c:1"><div><b class="pc o"></b><span>abertura do carretel</span></div><div><b class="vv"></b><span>velocidade relativa do cilindro</span></div></div>
    <p class="wtext">Uma válvula comum só tem <b>aberta</b> ou <b>fechada</b>. Na proporcional, a abertura acompanha o sinal: dá para acelerar e frear suavemente.</p></div></div>`;
  let x=0,f=0.5;const up=()=>{const s=+$(el,'.s').value;f=s/10;$(el,'.sv').textContent=fmt(s)+' V';$(el,'.ma').textContent=fmt(f*800,0)+' mA';
    $(el,'.pc').textContent=fmt(f*100,0)+' %';$(el,'.vv').textContent=fmt(f*100,0)+' %';$(el,'.open').setAttribute('width',f*270);$(el,'.spool').setAttribute('x',330+f*110);};
  $(el,'.s').addEventListener('input',up);up();
  reg(el,(t,T,dt)=>{x+=f*dt*0.5;if(x>1.2)x=0;$(el,'.pis').setAttribute('transform',`translate(${24+Math.min(x,1)*400} 0)`);});
};

/* ---------- inicialização dos widgets e ciclo de animação ---------- */
$$(document,'.quiz[data-q]').forEach(el=>{const d=window.QZ[el.dataset.q];if(d)makeQuiz(el,d.qs,d.opts||{});});

$$(document,'[data-w]').forEach(el=>{try{W[el.dataset.w]?.(el);}catch(err){console.error('widget',el.dataset.w,err);}});
let last=performance.now();
function loop(t){
  const dt=Math.min(0.1,(t-last)/1000);last=t;
  const s=slides[cur];const T=Math.max(0,t-enterT);
  s._ticks.forEach(f=>f(t,T,dt));
  requestAnimationFrame(loop);
}
activate(start);
requestAnimationFrame(loop);
})();
