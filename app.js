
const menus=[
 {id:'doa',ico:'🤲',title:'Doa Pembuka',sub:'Memulai perjalanan dengan doa'},
 {id:'materi',ico:'📚',title:'Materi Pembelajaran',sub:'Kenali lingkungan dan jenis sampah'},
 {id:'simulasi',ico:'🧪',title:'Simulasi Interaktif',sub:'Masukkan sampah ke rumahnya'},
 {id:'games',ico:'🎮',title:'Games Level 1–3',sub:'Kenali, pilah, dan tantang Robot Bumi'},
 {id:'evaluasi',ico:'🏆',title:'Evaluasi Akhir',sub:'Tunjukkan apa yang kamu pelajari'},
 {id:'doapenutup',ico:'🤲',title:'Doa Penutup',sub:'Menutup petualangan dengan doa'},
 {id:'sertifikat',ico:'🚩',title:'Sertifikat',sub:'Finish: Penjaga Bumi'}
];
let done=JSON.parse(localStorage.getItem('pb_done')||'{}'), score=Number(localStorage.getItem('pb_score')||0), childName=localStorage.getItem('pb_name')||'';
let simIndex=Number(localStorage.getItem('pb_simIndex')||0), simSelected=null, gameIndex=Number(localStorage.getItem('pb_gameIndex')||0), evalAnswers=JSON.parse(localStorage.getItem('pb_evalAnswers')||'{}'), gameAnswered=false;

function femaleVoice(){
 const vs=window.speechSynthesis?window.speechSynthesis.getVoices():[];
 const id=vs.filter(v=>(v.lang||'').toLowerCase().startsWith('id'));
 const femaleHints=['female','woman','perempuan','wanita','girl','google bahasa indonesia','microsoft'];
 return id.find(v=>femaleHints.some(h=>(v.name||'').toLowerCase().includes(h))) ||
        id.find(v=>/google|microsoft|natural/i.test(v.name||'')) || id[0] ||
        vs.find(v=>/indonesia/i.test(v.name||'')) || vs[0];
}
function speak(text){
 if(!window.speechSynthesis)return;
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(text); u.lang='id-ID'; u.rate=1.0; u.pitch=.48; u.volume=1;
 const v=femaleVoice(); if(v)u.voice=v; speechSynthesis.speak(u);
}
if(window.speechSynthesis) speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices();

function renderMap(){
 const map=document.getElementById('map'); map.innerHTML='';
 menus.forEach((m,i)=>{
   const n=document.createElement('button'); n.className='node '+(done[m.id]?'done ':'')+(done[menus[i-1]?.id]||i===0?'current ':'');
   n.onclick=()=>openMenu(m.id);
   n.innerHTML='<div class="dot">'+(done[m.id]?'✓':m.ico)+'</div><div class="label">'+m.title+'</div>';
   map.appendChild(n);
   if(i<menus.length-1){const line=document.createElement('div');line.className='line '+(done[m.id]?'done':'');map.appendChild(line)}
 });
}
function renderMenus(){
 const g=document.getElementById('menuGrid');g.innerHTML='';
 menus.forEach(m=>{
  const b=document.createElement('button');b.className='menu '+(done[m.id]?'done':'');b.onclick=()=>openMenu(m.id);
  b.innerHTML='<span class="ico">'+m.ico+'</span><span class="txt">'+m.title+' <span class="speak">🔊</span><span class="small">'+m.sub+'</span></span><span class="check">✓</span>';
  g.appendChild(b);
 });
}
function refresh(){document.getElementById('score').textContent=score;renderMap();renderMenus()}
// Keyboard nama virtual: kompatibel dengan sentuhan IFP dan mouse/kursor laptop.
function showTouchKeyboard(){
 const kb=document.getElementById('touchKeyboard');
 if(kb)kb.style.display='block';
 const i=document.getElementById('nameInput');
 if(i){try{i.focus({preventScroll:true})}catch(e){i.focus()}}
}
function typeKey(k){
 const i=document.getElementById('nameInput');
 if(!i)return;
 const start=typeof i.selectionStart==='number'?i.selectionStart:i.value.length;
 const end=typeof i.selectionEnd==='number'?i.selectionEnd:i.value.length;
 i.value=i.value.slice(0,start)+k+i.value.slice(end);
 const pos=start+k.length;
 try{i.setSelectionRange(pos,pos);i.focus({preventScroll:true})}catch(e){i.focus()}
 i.dispatchEvent(new Event('input',{bubbles:true}));
}
function backspaceKey(){
 const i=document.getElementById('nameInput');
 if(!i)return;
 const start=typeof i.selectionStart==='number'?i.selectionStart:i.value.length;
 const end=typeof i.selectionEnd==='number'?i.selectionEnd:i.value.length;
 if(start!==end){i.value=i.value.slice(0,start)+i.value.slice(end);try{i.setSelectionRange(start,start)}catch(e){}}
 else if(start>0){i.value=i.value.slice(0,start-1)+i.value.slice(start);try{i.setSelectionRange(start-1,start-1)}catch(e){}}
 i.focus();i.dispatchEvent(new Event('input',{bubbles:true}));
}
function clearName(){const i=document.getElementById('nameInput');if(i){i.value='';i.focus();i.dispatchEvent(new Event('input',{bubbles:true}))}}
function finishNameTyping(){const i=document.getElementById('nameInput');if(i)i.blur();speak('Nama sudah siap. Tekan Mulai Petualangan.')}
function setupNameKeyboard(){
 const kb=document.getElementById('touchKeyboard'), input=document.getElementById('nameInput');
 if(!kb||!input)return;
 kb.querySelectorAll('.touch-key').forEach(btn=>{
   btn.addEventListener('mousedown',e=>e.preventDefault());
   btn.addEventListener('pointerdown',()=>btn.classList.add('pressed'));
   ['pointerup','pointercancel','mouseleave'].forEach(ev=>btn.addEventListener(ev,()=>btn.classList.remove('pressed')));
 });
 input.addEventListener('keydown',e=>{
   if(e.key==='Enter'){e.preventDefault();finishNameTyping();}
   else if(e.key==='Escape'){e.preventDefault();clearName();}
 });
}

function saveName(){
 const n=document.getElementById('nameInput').value.trim();
 if(!n){speak('Silakan masukkan nama kamu terlebih dahulu.');return}
 // Setiap menekan Mulai Petualangan berarti sesi anak baru dimulai dari nol.
 ['pb_done','pb_score','pb_simIndex','pb_gameIndex','pb_evalAnswers','pb_childPhoto'].forEach(k=>localStorage.removeItem(k));
 done={};score=0;simIndex=0;gameIndex=0;evalAnswers={};gameAnswered=false;
 const oldPhoto=document.getElementById('childPhoto'), oldPlaceholder=document.getElementById('certPhotoPlaceholder');
 if(oldPhoto){oldPhoto.removeAttribute('src');oldPhoto.style.display='none'} if(oldPlaceholder)oldPlaceholder.style.display='block';
 childName=n;localStorage.setItem('pb_name',n);
 const w=document.getElementById('welcome');w.style.display='block';w.innerHTML='🌟 Selamat datang, '+htmlEscape(n)+'! Mari kita mulai petualangan kita! <button class="speak" onclick="speak(\'Selamat datang, '+jsEscape(n)+'! Mari kita mulai petualangan kita!\')">🔊</button>';
 speak('Selamat datang, '+n+'! Mari kita mulai petualangan kita!');
 refresh();
 const mc=document.querySelector('.map-card');
 if(mc){
   mc.classList.remove('focus');
   void mc.offsetWidth;
   mc.classList.add('focus');
   mc.scrollIntoView({behavior:'smooth',block:'center'});
   setTimeout(()=>mc.classList.remove('focus'),3200);
 }
 const first=document.querySelector('#map .node');
 if(first){
   first.setAttribute('aria-label','Misi pertama: Doa Pembuka');
   setTimeout(()=>first.focus({preventScroll:true}),700);
 }
}
function htmlEscape(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function jsEscape(s){return JSON.stringify(String(s)).slice(1,-1)}
function openMenu(id){
 if(id!=='doa'){
   const idx=menus.findIndex(x=>x.id===id);
   if(idx>0 && !done[menus[idx-1].id]){
     speak('Selesaikan misi sebelumnya terlebih dahulu.');return;
   }
 }
 document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
 const target=document.getElementById(id); if(!target)return;
 target.classList.add('active');
 document.body.classList.toggle('doa-open',id==='doa');
 if(id==='simulasi')renderSimulation();
 if(id==='games')renderGame();
 if(id==='evaluasi')renderEvaluation();
 if(id==='doapenutup'){speak('Alhamdulillah. Kita sudah sampai di doa penutup.');}
 if(id==='doa'){initDoaAudio();setTimeout(()=>startDoaAudio(),120);}
 window.scrollTo({top:0,behavior:'instant'});
}
function fmtTime(sec){sec=Number(sec)||0;const m=Math.floor(sec/60),s=Math.floor(sec%60);return m+':'+String(s).padStart(2,'0')}
function startDoaAudio(){const a=document.getElementById('doaAudio');if(!a)return;a.play().catch(()=>{});}
function toggleDoaAudio(){const a=document.getElementById('doaAudio');if(!a)return;if(a.paused){a.play().catch(()=>{});speak('Audio doa pembuka dimulai')}else{a.pause();speak('Audio doa dijeda')}}
function initDoaAudio(){const a=document.getElementById('doaAudio');const seek=document.getElementById('doaSeek');if(!a||a.dataset.ready)return;a.dataset.ready='1';a.addEventListener('loadedmetadata',()=>{document.getElementById('doaDuration').textContent=fmtTime(a.duration);});a.addEventListener('timeupdate',()=>{document.getElementById('doaTime').textContent=fmtTime(a.currentTime);if(a.duration)seek.value=(a.currentTime/a.duration)*100;});a.addEventListener('play',()=>document.querySelector('.doa-stage')?.classList.add('playing'));a.addEventListener('pause',()=>document.querySelector('.doa-stage')?.classList.remove('playing'));seek.addEventListener('input',()=>{if(a.duration)a.currentTime=(Number(seek.value)/100)*a.duration});}
function goHome(){const a=document.getElementById('doaAudio');if(a){a.pause();a.currentTime=0}document.body.classList.remove('doa-open');document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('home').classList.add('active');refresh();window.scrollTo({top:0,behavior:'smooth'})}
function goNext(id){openMenu(id)}
function addScore(n){score+=n;localStorage.setItem('pb_score',score);refresh()}
function complete(id){
 done[id]=true;localStorage.setItem('pb_done',JSON.stringify(done));refresh();speak('Misi selesai, mari lanjutkan.');
}
function resetProgress(){localStorage.removeItem('pb_done');localStorage.removeItem('pb_score');localStorage.removeItem('pb_simIndex');localStorage.removeItem('pb_gameIndex');localStorage.removeItem('pb_evalAnswers');done={};score=0;simIndex=0;gameIndex=0;evalAnswers={};refresh();speak('Semua progres sudah diatur ulang.')}
function applause(){
 const A=new (window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain();
 o.type='triangle';o.frequency.value=850;g.gain.setValueAtTime(.0001,A.currentTime);g.gain.exponentialRampToValueAtTime(.18,A.currentTime+.02);
 o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+.14);
 setTimeout(()=>{for(let i=0;i<5;i++)setTimeout(()=>{let c=new AudioContext(),n=c.createOscillator(),x=c.createGain();n.frequency.value=350+Math.random()*500;x.gain.value=.06;n.connect(x);x.connect(c.destination);n.start();n.stop(c.currentTime+.07)},i*45)},120);
}
function updateSimProgress(){const el=document.getElementById('simProgress');if(el)el.style.width=Math.min(100,Math.max(0,(simIndex/5)*100))+'%';}
function updateGameProgress(){const el=document.getElementById('gameProgress');if(el)el.style.width=Math.min(100,((gameIndex+1)/15)*100)+'%';[1,2,3].forEach(n=>document.getElementById('pill'+n)?.classList.toggle('active',Math.ceil((gameIndex+1)/5)===n));}
function updateEvalProgress(){const n=Object.keys(evalAnswers).length;const el=document.getElementById('evalProgress');if(el)el.style.width=(n/5*100)+'%';const c=document.getElementById('evalCount');if(c)c.textContent=n+' / 5 terjawab';}
function scoreBurst(points){const d=document.createElement('div');d.className='score-burst';d.textContent='+'+points+' poin! 🌟';document.body.appendChild(d);setTimeout(()=>d.remove(),800);}
function nextSimulation(){
 if(simIndex<5){simIndex++;localStorage.setItem('pb_simIndex',simIndex);renderSimulation()} else {complete('simulasi');localStorage.removeItem('pb_simIndex');simIndex=0;goNext('games')}
}
const sims=[
 ['🍌','Kulit pisang','Organik'],['🧴','Botol plastik','Anorganik'],['💊','Obat kedaluwarsa','B3'],
 ['🥫','Kaleng minuman','Anorganik'],['🧪','Cairan pembersih berbahaya','B3']
];
function renderSimulation(){
 updateSimProgress();
 if(simIndex>=5){document.getElementById('simArea').innerHTML='<div class="notice">🎉 Lima simulasi selesai! Kamu hebat! <button class="speak" onclick="speak(\'Lima simulasi selesai. Kamu hebat!\')">🔊</button></div>';document.getElementById('simNext').textContent='➡️ Lanjutkan';return}
 const [ico,name,ans]=sims[simIndex];simSelected=null;
 document.getElementById('simArea').innerHTML=
 `<h2 style="text-align:center">Simulasi ${simIndex+1} dari 5 <button class="speak" onclick="speak('Simulasi ${simIndex+1} dari lima')">🔊</button></h2>
 <div class="trash-row"><div class="trash" id="trashItem" draggable="true" onclick="selectTrash()" onkeydown="if(event.key==='Enter'||event.key===' ')selectTrash()" tabindex="0"><div style="font-size:50px">${ico}</div>${name}<button class="speak" onclick="event.stopPropagation();speak('${jsEscape(name)}')">🔊</button></div></div>
 <div class="bins">
  <button class="bin" onclick="sortTrash('Organik')" aria-label="Tempat sampah organik warna hijau"><img src="assets/bin_organik_hijau.svg" alt="Tempat sampah hijau untuk sampah organik"></button>
  <button class="bin anorg" onclick="sortTrash('Anorganik')" aria-label="Tempat sampah anorganik warna kuning"><img src="assets/bin_anorganik_kuning.svg" alt="Tempat sampah kuning untuk sampah anorganik"></button>
  <button class="bin b3" onclick="sortTrash('B3')" aria-label="Tempat sampah B3 warna merah"><img src="assets/bin_b3_merah.svg" alt="Tempat sampah merah untuk sampah B3"></button>
 </div><div id="simFeedback" class="feedback"></div>`;
 const t=document.getElementById('trashItem');t.addEventListener('dragstart',()=>{simSelected=true;t.classList.add('dragging')});t.addEventListener('dragend',()=>t.classList.remove('dragging'));
 document.querySelectorAll('.bin').forEach(b=>{b.addEventListener('dragover',e=>{e.preventDefault();b.classList.add('over')});b.addEventListener('dragleave',()=>b.classList.remove('over'));b.addEventListener('drop',()=>{b.classList.remove('over');sortTrash(b.textContent.includes('ORGANIK')&&!b.textContent.includes('ANORGANIK')?'Organik':b.textContent.includes('ANORGANIK')?'Anorganik':'B3')});});
}
function selectTrash(){simSelected=true;document.getElementById('trashItem').classList.add('selected');speak('Pilih rumah sampah yang tepat.')}
function sortTrash(ans){
 if(simSelected===null)simSelected=true;
 const correct=ans===sims[simIndex][2], f=document.getElementById('simFeedback');
 if(correct){f.className='feedback-card ok';f.innerHTML='🌟 ✓ KAMU HEBAT! <button class="speak" onclick="speak(\'Kamu hebat! Jawabanmu tepat.\')">🔊</button>';applause();speak('Kamu hebat! Jawabanmu tepat.');addScore(5);scoreBurst(5);document.querySelectorAll('.bin').forEach(b=>b.disabled=true);document.getElementById('trashItem')?.classList.remove('selected');document.getElementById('simNext').focus();}
 else{f.className='feedback-card bad';f.innerHTML='💡 ✗ KURANG TEPAT — Coba lagi! <button class="speak" onclick="speak(\'Kurang tepat. Coba lagi.\')">🔊</button>';speak('Kurang tepat. Coba lagi.');}
}

const games=[
 ['Level 1','Mana yang termasuk sampah organik?',['🍌 Kulit pisang','🧴 Botol plastik','🥫 Kaleng','🛍️ Kantong plastik'],'🍌 Kulit pisang'],
 ['Level 1','Daun kering termasuk...',['Organik','Anorganik','B3','Bukan sampah'],'Organik'],
 ['Level 1','Sisa makanan termasuk...',['Organik','Anorganik','B3','Bukan sampah'],'Organik'],
 ['Level 1','Mana yang termasuk anorganik?',['🧴 Botol plastik','🍂 Daun','🍌 Kulit pisang','🍚 Sisa nasi'],'🧴 Botol plastik'],
 ['Level 1','Kaleng minuman termasuk...',['Organik','Anorganik','B3','Bukan sampah'],'Anorganik'],
 ['Level 2','Botol plastik harus dimasukkan ke...',['Organik','Anorganik','B3','Sungai'],'Anorganik'],
 ['Level 2','Pilih pasangan yang benar.',['🍌 Kulit pisang → Organik','🍌 Kulit pisang → B3','🧴 Botol → Organik','🥫 Kaleng → Organik'],'🍌 Kulit pisang → Organik'],
 ['Level 2','Sampah yang dapat digunakan kembali jika memungkinkan adalah...',['Botol plastik','Obat kedaluwarsa','Cairan berbahaya','Sampah makanan busuk'],'Botol plastik'],
 ['Level 2','Kita memilah sampah agar...',['Lebih mudah dikelola','Sungai makin kotor','Sampah berserakan','Bumi panas'],'Lebih mudah dikelola'],
 ['Level 2','Saat teman menjawab berbeda, kita...',['Mendengarkan','Mengejek','Berteriak','Pergi'],'Mendengarkan'],
 ['Level 3','Apa yang sebaiknya dilakukan terhadap sampah plastik?',['Menggunakan kembali jika memungkinkan','Membuang ke sungai','Membuang sembarangan','Meninggalkannya di halaman'],'Menggunakan kembali jika memungkinkan'],
 ['Level 3','Mengapa kita menjaga lingkungan?',['Agar bersih dan sehat','Agar banyak sampah','Agar air kotor','Agar hewan pergi'],'Agar bersih dan sehat'],
 ['Level 3','Robot Bumi melihat sampah tercampur. Langkah pertama?',['Memilah','Membakar semuanya','Membuang ke sungai','Meninggalkan'],'Memilah'],
 ['Level 3','Temanmu salah memilih tempat sampah. Kamu sebaiknya...',['Membantu dengan ramah','Menertawakan','Marah','Meninggalkan'],'Membantu dengan ramah'],
 ['Level 3','Siapa yang dapat menjaga bumi?',['Kita semua','Robot saja','Guru saja','Orang dewasa saja'],'Kita semua']
];
let colorGame=false, paintColor='#2cae63', gameRenderedOptions=[];
function renderGame(){
 gameAnswered=false;updateGameProgress();
 const g=games[gameIndex], level=g[0],q=g[1],opts=g[2],correct=g[3];
 gameRenderedOptions=shuffle(opts.map(o=>({text:o,correct:o===correct})));
 document.getElementById('gameTitle').innerHTML=`<h2>🎮 ${level} <button class="speak" onclick="speak('${level}')">🔊</button></h2>`;
 document.getElementById('gameCounter').textContent=`Permainan ${gameIndex+1} / 15`;
 let html=`<h2>${q} <button class="speak" onclick="speak('${jsEscape(q)}')">🔊</button></h2>`;
 html+=`<div class="choices">`+gameRenderedOptions.map((o,i)=>`<button class="choice" onclick="answerGame(${i})">${o.text} <span class="speak" onclick="event.stopPropagation();speak('${jsEscape(o.text)}')">🔊</span></button>`).join('')+`</div>`;
 if(gameIndex===4||gameIndex===9){html+=`<hr><h3>🎨 Bonus Mewarnai Tempat Sampah <button class="speak" onclick="speak('Bonus mewarnai tempat sampah')">🔊</button></h3><canvas id="paint" width="560" height="320"></canvas><div class="palette">${['#2cae63','#2b9bd0','#e74c3c','#f4c542','#9b59b6','#ffffff'].map(c=>`<button class="swatch" style="background:${c}" onclick="paintColor='${c}'"></button>`).join('')}</div><p class="tiny">Sentuh dan usap gambar untuk mewarnai. <button class="speak" onclick="speak('Sentuh dan usap gambar untuk mewarnai.')">🔊</button></p>`}
 document.getElementById('gameArea').innerHTML=html;
 if(gameIndex===4||gameIndex===9)setupCanvas();
}
function answerGame(i){
 if(gameAnswered)return;
 const rendered=gameRenderedOptions[i],choice=rendered?.text,btn=document.querySelectorAll('#gameArea .choice')[i];
 if(rendered?.correct){gameAnswered=true;const pts=gameIndex<5?10:gameIndex<10?10:15;addScore(pts);scoreBurst(pts);speak('Benar. Kamu hebat!');applause();btn.classList.add('correct');document.querySelectorAll('#gameArea .choice').forEach(x=>x.disabled=true);document.getElementById('gameNext').focus();}
 else{btn.classList.add('wrong');speak('Kurang tepat. Coba lagi.');setTimeout(()=>btn.classList.remove('wrong'),650)}
}

function nextGame(){
 if(!gameAnswered){speak('Jawab pertanyaan ini terlebih dahulu.');return}
 if(gameIndex<14){gameIndex++;localStorage.setItem('pb_gameIndex',gameIndex);renderGame()}
 else{complete('games');localStorage.removeItem('pb_gameIndex');gameIndex=0;goNext('evaluasi')}
}
function setupCanvas(){
 const c=document.getElementById('paint'),ctx=c.getContext('2d');ctx.lineWidth=18;ctx.lineCap='round';
 ctx.fillStyle='#f8fffb';ctx.fillRect(0,0,c.width,c.height);
 ctx.strokeStyle='#4b7a70';ctx.lineWidth=7;
 ctx.beginPath();ctx.roundRect(190,65,180,200,25);ctx.stroke();
 ctx.beginPath();ctx.moveTo(170,65);ctx.lineTo(390,65);ctx.stroke();
 ctx.beginPath();ctx.arc(280,165,70,0,Math.PI*2);ctx.stroke();
 function draw(e){const r=c.getBoundingClientRect();const x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;ctx.strokeStyle=paintColor;ctx.lineWidth=20;ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y)}
 c.addEventListener('pointerdown',e=>{ctx.beginPath();const r=c.getBoundingClientRect();ctx.moveTo((e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height);c.setPointerCapture(e.pointerId);c.onpointermove=draw});
 c.addEventListener('pointerup',()=>{c.onpointermove=null});
}
let evalRenderedOptions=[];
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;}
const evalQs=[
 ['Mana yang termasuk sampah organik?',['🍌 Kulit pisang','🧴 Botol plastik','🥫 Kaleng','🛍️ Kantong plastik'],'🍌 Kulit pisang'],
 ['Botol plastik termasuk...',['Organik','Anorganik'],'Anorganik'],
 ['Apa yang sebaiknya kita lakukan terhadap sampah?',['Memilah','Membuang sembarangan'],'Memilah'],
 ['Mengapa kita menjaga lingkungan?',['Agar lingkungan bersih dan sehat','Agar banyak sampah'],'Agar lingkungan bersih dan sehat'],
 ['Siapa yang dapat menjaga bumi?',['Kita semua','Robot saja'],'Kita semua']
];
function renderEvaluation(){
 const a=document.getElementById('evalArea');a.innerHTML='';updateEvalProgress();
 evalRenderedOptions=[];
 evalQs.forEach((q,i)=>{
  const d=document.createElement('div');d.className='eval-q';
  evalRenderedOptions[i]=shuffle(q[1]);
  d.innerHTML=`<h3>${i+1}. ${q[0]} <button class="speak" onclick="speak('${jsEscape(q[0])}')">🔊</button></h3>`+
   evalRenderedOptions[i].map(o=>`<button class="choice" onclick="evalPick(${i},'${jsEscape(o)}',this)">${o} <span class="speak" onclick="event.stopPropagation();speak('${jsEscape(o)}')">🔊</span></button>`).join(' ');
  a.appendChild(d);
 });
}
function evalPick(i,o,el){evalAnswers[i]=o;localStorage.setItem('pb_evalAnswers',JSON.stringify(evalAnswers));document.querySelectorAll('.eval-q')[i].querySelectorAll('.choice').forEach(x=>x.classList.remove('correct','wrong'));el.classList.add(o===evalQs[i][2]?'correct':'wrong');updateEvalProgress();speak(o===evalQs[i][2]?'Benar.':'Kurang tepat. Coba lagi.')}
function finishEvaluation(){
 const ok=evalQs.every((q,i)=>evalAnswers[i]===q[2]);
 if(!ok){speak('Coba jawab semua pertanyaan dengan lebih teliti.');return}
 addScore(5);localStorage.removeItem('pb_evalAnswers');evalAnswers={};complete('evaluasi');goNext('doapenutup');
}
function takePhoto(){
 const v=document.getElementById('cam');
 if(!navigator.mediaDevices?.getUserMedia){speak('Kamera tidak tersedia di perangkat ini.');return}
 v.style.display='block';document.getElementById('snap').style.display='inline-block';
 navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}}}).then(s=>{v.srcObject=s;v.play().catch(()=>{});}).catch(()=>speak('Kamera belum tersedia atau izin kamera belum diberikan.'));
}
function snapPhoto(){
 const v=document.getElementById('cam'),c=document.getElementById('photoCanvas'),img=document.getElementById('childPhoto'),ph=document.getElementById('certPhotoPlaceholder');
 c.width=v.videoWidth||1280;c.height=v.videoHeight||720;
 c.getContext('2d').drawImage(v,0,0,c.width,c.height);
 const data=c.toDataURL('image/jpeg',0.95);
 img.src=data;img.style.display='block';ph.style.display='none';
 localStorage.setItem('pb_childPhoto',data);
 v.srcObject?.getTracks().forEach(t=>t.stop());v.srcObject=null;v.style.display='none';document.getElementById('snap').style.display='none';
 speak('Foto berhasil dimasukkan ke sertifikat.');
}
function loadChildPhoto(){
 const data=localStorage.getItem('pb_childPhoto');
 if(!data)return;
 const img=document.getElementById('childPhoto'),ph=document.getElementById('certPhotoPlaceholder');
 img.src=data;img.style.display='block';ph.style.display='none';
}
function showMissionCompleteFeedback(){
 const old=document.getElementById('missionCompleteOverlay'); if(old)old.remove();
 const overlay=document.createElement('div'); overlay.id='missionCompleteOverlay';
 overlay.innerHTML=`<div class="mission-complete-card">
   <div class="complete-medal">🏅</div>
   <h2>🎉 SELAMAT!</h2>
   <p>Misi selesai, <b>${htmlEscape(childName||'Detektif Cilik')}</b>!</p>
   <p>Kamu telah menyelesaikan seluruh petualangan <b>Penjaga Bumi</b> dan berhasil mendapatkan Piagam Penghargaan.</p>
   <div class="complete-actions"><button class="btn next" onclick="startNewChild()">🌱 Mulai untuk Anak Berikutnya</button></div>
 </div>`;
 document.body.appendChild(overlay);
 speak('Selamat! Misi selesai. Kamu telah menyelesaikan seluruh petualangan Penjaga Bumi.');
 setTimeout(()=>startNewChild(),4200);
}
function clearChildData(){
 ['pb_done','pb_score','pb_simIndex','pb_gameIndex','pb_evalAnswers','pb_name','pb_childPhoto'].forEach(k=>localStorage.removeItem(k));
 done={};score=0;simIndex=0;gameIndex=0;evalAnswers={};childName='';simSelected=null;gameAnswered=false;
 const ni=document.getElementById('nameInput'); if(ni){ni.value='';try{ni.focus({preventScroll:true})}catch(e){}}
 const w=document.getElementById('welcome'); if(w)w.innerHTML='';
 const img=document.getElementById('childPhoto'),ph=document.getElementById('certPhotoPlaceholder');
 if(img){img.removeAttribute('src');img.style.display='none'} if(ph)ph.style.display='block';
 const certName=document.getElementById('certName');if(certName)certName.textContent='Detektif Cilik';
 const certChild=document.getElementById('certChild');if(certChild)certChild.textContent='Detektif Cilik';
 const cam=document.getElementById('cam');if(cam){cam.srcObject?.getTracks().forEach(t=>t.stop());cam.srcObject=null;cam.style.display='none'}
 const snap=document.getElementById('snap');if(snap)snap.style.display='none';
 refresh();
}
function startNewChild(){
 const ov=document.getElementById('missionCompleteOverlay');if(ov)ov.remove();
 clearChildData();
 goHome();
 setTimeout(()=>{const i=document.getElementById('nameInput');if(i){try{i.focus({preventScroll:true})}catch(e){i.focus()}}},250);
}
function printCertificate(){
 if(!localStorage.getItem('pb_childPhoto')){speak('Ambil foto terlebih dahulu agar foto anak masuk ke sertifikat.');alert('Silakan tekan “Ambil Foto” dan “Gunakan Foto” terlebih dahulu. Foto anak wajib dimasukkan ke sertifikat sebelum dicetak atau disimpan sebagai PDF.');return}
 window.__certificatePrinting=true;
 window.print();
}
window.addEventListener('afterprint',()=>{
 if(window.__certificatePrinting){window.__certificatePrinting=false;showMissionCompleteFeedback();}
});
function init(){
 if(childName)document.getElementById('nameInput').value=childName;
 document.getElementById('certName').textContent=childName||'Detektif Cilik';document.getElementById('certChild').textContent=childName||'Detektif Cilik';const now=new Date();const months=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];document.getElementById('certDate').textContent=now.getDate()+' '+months[now.getMonth()]+' '+now.getFullYear();
 loadChildPhoto();
 setupNameKeyboard();
 refresh();
}
init();
