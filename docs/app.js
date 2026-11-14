import {answerKey, grade, summarize, decodeAnswers} from './study-core.js';
const $ = s => document.querySelector(s);
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORAGE='scmos.answers.v1';
let answers={}, persist=true, weeks=[], chapter='ch01', mode='framework';
const chapters=[['ch01','Ch1 導論'],['ch02','Ch2 策略'],['ch03','Ch3 產品與服務設計'],['ch05','Ch5 產能管理'],['ch09','Ch9 服務流程'],['ch07-08','Ch7–8 製造與佈置'],['ch12-13','Ch12–13 品質管理'],['ch14','Ch14 精實供應鏈'],['activities','活動與演講']];
try { answers=decodeAnswers(localStorage.getItem(STORAGE)); } catch { persist=false; }
function save(){try{if(persist)localStorage.setItem(STORAGE,JSON.stringify(answers));}catch{persist=false;}storageNote();}
function storageNote(){ $('#storage-note').textContent=persist?'作答與草稿保存在這個瀏覽器；清除網站資料會移除紀錄。尚未連接 Supabase，不跨裝置同步。':'此瀏覽器無法保存資料；作答暫存在本頁，重新整理會清除。尚未連接 Supabase。'; }
const sources=refs=>'<details class="source"><summary>來源定位</summary>'+refs.map(r=>`<div>${esc(r.source_id)} / ${esc(r.locator)}</div>`).join('')+'<p>原始逐字稿與 PDF 未公開，代碼供持有教材者對照。</p></details>';
const current=()=>weeks.filter(w=>w.chapter_ids.includes(chapter));
const currentQuestions=()=>current().flatMap(w=>w.questions);
function title(){return chapters.find(c=>c[0]===chapter)?.[1]??chapter;}
function route(){history.replaceState(null,'',`#${chapter}/${mode}`);}
function render(){
  $('#chapter-title').textContent=title();
  const selected=current();const concepts=selected.flatMap(w=>w.concepts);
  $('#chapter-meta').textContent=selected.length?`第 ${selected.map(w=>w.week).join('、')} 週 · ${concepts.length} 組框架 · ${currentQuestions().length} 題練習`:'尚未提供教材，預留後續週次。';
  document.querySelectorAll('[data-chapter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chapter===chapter)));
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  $('#concept-nav').innerHTML=concepts.map(c=>`<a href="#${esc(c.concept_id)}" data-concept="${esc(c.concept_id)}">${esc(c.title)}</a>`).join('');
  $('#concept-nav').querySelectorAll('a').forEach(a=>a.onclick=ev=>{ev.preventDefault();if(mode!=='framework'){mode='framework';render();}document.getElementById(a.dataset.concept)?.scrollIntoView({behavior:'smooth',block:'start'});});
  const area=$('#content');area.replaceChildren();
  if(!selected.length){area.innerHTML='<div class="empty">本章教材尚未提供。收到後會累積在這裡，不會影響既有作答紀錄。</div>';route();return;}
  if(mode==='framework'||mode==='rapid'){
    area.innerHTML=concepts.map(c=>`<article class="card" id="${esc(c.concept_id)}"><span class="badge">${esc(c.evidence??'課堂＋筆記對照')}</span><h3>${esc(c.title)}</h3><p class="prose">${esc(mode==='rapid'?c.rapid:c.body)}</p>${mode==='rapid'?`<button data-expand="${esc(c.concept_id)}">回到完整框架</button>`:''}${sources(c.sources)}</article>`).join('');
    area.querySelectorAll('[data-expand]').forEach(b=>b.onclick=()=>{mode='framework';render();document.getElementById(b.dataset.expand)?.scrollIntoView({behavior:'smooth',block:'start'});});
  } else if(mode==='issues'){
    for(const week of selected){area.insertAdjacentHTML('beforeend',`<p class="note">${esc(week.coverage)}</p>`);for(const x of week.issues)area.insertAdjacentHTML('beforeend',`<article class="card"><span class="badge">${esc(x.status)}</span><h3>${esc(x.kind)}</h3><p>${esc(x.evidence)}</p><p>${esc(x.resolution)}</p></article>`);area.insertAdjacentHTML('beforeend',`<article class="card"><h3>課程事項</h3><p class="prose">${esc(week.admin)}</p></article>`);}
  }else{
    area.innerHTML='<p class="note">自編練習，非指定考題。先作答，可使用提示或直接查看解答；申論題依要點自評。</p><p class="progress" id="progress" aria-live="polite"></p>';
    for(const [i,q] of currentQuestions().entries())renderQuestion(area,q,i);
    progress();
  }
  storageNote();route();
}
function progress(){const s=summarize(currentQuestions(),answers);$('#progress').textContent=`已提交 ${s.submitted} / ${currentQuestions().length} 題 · 選擇／數值題最近提交答對 ${s.correct} / ${s.graded} 題 · 申論採自評`;}
function renderQuestion(area,q,i){
 const key=answerKey(q);const previous=answers[key]??{value:'',submitted:false,revealed:false};
 const card=document.createElement('article');card.className='card';card.id=q.question_id;
 const labels={choice:'選擇題',numeric:'數值題',self:'申論自評'};
 let input;
 if(q.type==='choice')input=`<fieldset><legend>請選一個答案</legend>${q.options.map((o,k)=>`<label class="option"><input type="radio" name="${esc(key)}" value="${k}" ${String(previous.value)===String(k)?'checked':''}><span>${String.fromCharCode(65+k)}. ${esc(o)}</span></label>`).join('')}</fieldset>`;
 else if(q.type==='numeric')input=`<label for="answer-${q.question_id}">答案（${esc(q.unit)}）</label><p class="meta">${esc(q.rounding)}；容許誤差 ${q.tolerance}。</p><input id="answer-${q.question_id}" type="text" inputmode="decimal" autocomplete="off" value="${esc(previous.value)}">`;
 else input=`<label for="answer-${q.question_id}">你的答題框架</label><textarea id="answer-${q.question_id}">${esc(previous.value)}</textarea>`;
 card.innerHTML=`<span class="badge">${i+1} / ${currentQuestions().length} · ${labels[q.type]} · ${esc(q.label)}</span><h3>${esc(q.prompt)}</h3><form>${input}<div class="actions"><button class="primary" type="submit">${q.type==='self'?'完成作答，開啟自評':'核對答案'}</button><button type="button" class="reveal">直接查看解答</button></div></form><details><summary>提示</summary><p>${esc(q.hint)}</p></details><p class="feedback" role="status"></p><div class="solution" hidden></div>`;
 area.append(card);
 const getValue=()=>q.type==='choice'?(card.querySelector('input[type=radio]:checked')?.value??''):card.querySelector(q.type==='self'?'textarea':'input[type=text]').value;
 const solution=card.querySelector('.solution');const feedback=card.querySelector('.feedback');
 function reveal(){solution.hidden=false;if(solution.childElementCount)return;let result=q.type==='choice'?`參考答案：${String.fromCharCode(65+q.answer)} · ${q.options[q.answer]}`:q.type==='numeric'?`參考答案：${q.answer} ${q.unit}`:'申論採自評，請核對論述與前提。';solution.innerHTML=`<p>${esc(result)}</p>`+q.steps.map((s,k)=>`<details><summary>解題步驟 ${k+1}</summary><p>${esc(s)}</p></details>`).join('')+(q.type==='choice'?'<details><summary>各選項解析</summary>'+q.explanations.map((s,k)=>`<p>${String.fromCharCode(65+k)}. ${esc(s)}</p>`).join('')+'</details>':q.type==='self'?'<p>核對要點：</p>'+q.rubric.map(s=>`<label class="option"><input type="checkbox"><span>${esc(s)}</span></label>`).join(''):'')+sources(q.sources);}
 function showGrade(){const r=grade(q,getValue());feedback.textContent=!r.valid?r.message:r.correct===null?'已提交，請依要點自評。':r.correct?'答對了，請展開步驟確認推理。':'答案不同，請展開步驟重新檢查。';}
 card.querySelector('form').onsubmit=ev=>{ev.preventDefault();const value=getValue(),r=grade(q,value);if(!r.valid){feedback.textContent=r.message;return;}answers[key]={value,submitted:true,revealed:true};save();showGrade();reveal();progress();};
 card.querySelector('.reveal').onclick=()=>{answers[key]={...(answers[key]??previous),value:getValue(),revealed:true};save();reveal();if(!answers[key].submitted)feedback.textContent='已查看解答；尚未提交，不列入完成數。';};
 card.querySelector('form').addEventListener('input',()=>{answers[key]={value:getValue(),submitted:false,revealed:!solution.hidden};save();feedback.textContent='草稿已更新，請重新提交核對。';progress();});
 if(previous.revealed)reveal();if(previous.submitted)showGrade();
}
async function loadJSON(url){const response=await fetch(url);if(!response.ok)throw Error(`載入失敗 (${response.status})`);return response.json();}
async function init(){
 try{
  const catalog=await loadJSON('./data/catalog.json');
  weeks=await Promise.all(catalog.weeks.map(w=>loadJSON(`./data/${w.file}`)));
  const [requestedChapter,requestedMode]=location.hash.slice(1).split('/');
  if(chapters.some(c=>c[0]===requestedChapter))chapter=requestedChapter;
  if(['framework','rapid','quiz','issues'].includes(requestedMode))mode=requestedMode;
  $('#coverage').textContent=`已整理 ${weeks.length} / ${catalog.total_weeks} 週`;
  $('#week-status').innerHTML=Array.from({length:catalog.total_weeks},(_,i)=>`<li class="${weeks.some(w=>w.week===i+1)?'ready':''}">第 ${i+1} 週 · ${weeks.some(w=>w.week===i+1)?'已整理／含核對紀錄':'待提供'}</li>`).join('');
  $('#chapters').innerHTML=chapters.map(([id,name])=>`<button data-chapter="${id}" aria-pressed="${id===chapter}">${esc(name)}${weeks.some(w=>w.chapter_ids.includes(id))?'':' · 待提供'}</button>`).join('');
  document.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>{chapter=b.dataset.chapter;render();});
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;render();});
  $('#loading').hidden=true;$('#study').hidden=false;render();
 }catch(error){$('#loading').hidden=true;$('#error').hidden=false;$('#error').textContent='教材暫時無法載入。請確認透過網站網址開啟，並重新整理。'+error.message;}
}
init();
