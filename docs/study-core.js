export function answerKey(q) { return `${q.question_id}@${q.version}`; }
export function grade(q, value) {
  if (q.type === 'choice') {
    if (value === '' || value == null) return {valid:false, message:'請先選一個答案。'};
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n >= q.options.length) return {valid:false, message:'請選有效的選項。'};
    return {valid:true, correct:n === q.answer};
  }
  if (q.type === 'numeric') {
    const s = String(value ?? '').trim();
    if (!s || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s) || !Number.isFinite(Number(s))) return {valid:false, message:'請輸入有限數字，不用輸入單位。'};
    return {valid:true, correct:Math.abs(Number(s)-q.answer) <= q.tolerance};
  }
  if (q.type === 'self') return String(value ?? '').trim() ? {valid:true, correct:null} : {valid:false, message:'請先寫下答題框架，或直接查看解答。'};
  return {valid:false, message:'題型尚不支援。'};
}
export function summarize(questions, answers) {
  let submitted=0, graded=0, correct=0;
  for (const q of questions) {
    const state=answers[answerKey(q)]; if (!state?.submitted) continue;
    const r=grade(q,state.value); if (!r.valid) continue;
    submitted++; if(r.correct !== null){graded++; if(r.correct)correct++;}
  }
  return {submitted,graded,correct};
}
export function decodeAnswers(raw) {
  try {
    const parsed=JSON.parse(raw); if(!parsed || typeof parsed!=='object' || Array.isArray(parsed))return {};
    const clean={};
    for(const [key,state] of Object.entries(parsed)) {
      if(!/^w\d+-q-\d+@\d+$/.test(key) || !state || typeof state!=='object' || !['string','number'].includes(typeof state.value))continue;
      clean[key]={value:state.value,submitted:state.submitted===true,revealed:state.revealed===true};
    }
    return clean;
  } catch{return {};}
}
