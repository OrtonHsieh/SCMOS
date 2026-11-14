import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {answerKey,grade,summarize,decodeAnswers} from '../docs/study-core.js';
const data=[1,2].map(n=>JSON.parse(readFileSync(new URL(`../docs/data/week0${n}.json`,import.meta.url))));
test('numeric grading rejects blank, units and nonfinite values',()=>{
 const q=data[1].questions.find(q=>q.type==='numeric');
 for(const value of ['', ' ', '27種','NaN','Infinity','0x1b'])assert.equal(grade(q,value).valid,false);
 assert.deepEqual(grade(q,'27'),{valid:true,correct:true});
 assert.deepEqual(grade(q,'9'),{valid:true,correct:false});
 assert.equal(grade({...q,answer:2.5,tolerance:.01},'2.505').correct,true);
});
test('all numeric answers independently match the stated combination assumptions',()=>{
 const q=data[1].questions;
 assert.equal(q.find(q=>q.question_id==='w02-q-09').answer,3*3*3);
 assert.equal(q.find(q=>q.question_id==='w02-q-10').answer,3+3+3);
 assert.equal(q.find(q=>q.question_id==='w02-q-11').answer,2*4*3);
});
test('choice zero is valid; missing and out-of-range selections are not',()=>{
 const q={type:'choice',options:['a','b'],answer:0};
 assert.equal(grade(q,'0').correct,true);
 for(const value of ['',null,'-1','2','0.5'])assert.equal(grade(q,value).valid,false);
});
test('revealing answers does not score; drafts and versions do not overwrite submissions',()=>{
 const choice=data[0].questions[0],self=data[0].questions.find(q=>q.type==='self');
 const states={[answerKey(choice)]:{value:choice.answer,submitted:false,revealed:true},[answerKey(self)]:{value:'理由',submitted:true}};
 assert.deepEqual(summarize([choice,self],states),{submitted:1,graded:0,correct:0});
 states[answerKey(choice)].submitted=true;
 assert.deepEqual(summarize([choice,self],states),{submitted:2,graded:1,correct:1});
 assert.equal(summarize([{...choice,version:2}],states).submitted,0);
});
test('corrupt storage cannot break startup; both weeks survive serialization',()=>{
 for(const raw of ['broken','null','[]','1'])assert.deepEqual(decodeAnswers(raw),{});
 const a=data[0].questions[0],b=data[1].questions[0];
 const states={[answerKey(a)]:{value:a.answer,submitted:true},[answerKey(b)]:{value:'draft',submitted:false}};
 const restored=decodeAnswers(JSON.stringify(states));
 assert.equal(restored[answerKey(a)].submitted,true);assert.equal(restored[answerKey(b)].value,'draft');
 assert.deepEqual(decodeAnswers('{"__proto__":{"value":"x"}}'),{});
});
test('first week content and all stable question IDs are retained without duplicates',()=>{
 assert.equal(data[0].questions.length,12);assert.equal(data[1].questions.length,15);
 const ids=data.flatMap(d=>d.questions.map(q=>q.question_id));assert.equal(new Set(ids).size,27);
 for(const d of data)for(const q of d.questions){assert.ok(q.sources.length);assert.ok(q.concept_ids.every(id=>d.concepts.some(c=>c.concept_id===id)));}
});
