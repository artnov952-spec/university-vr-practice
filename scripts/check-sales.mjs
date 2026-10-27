import assert from 'node:assert/strict';
import { heroFrameAt, heroCanRun, HERO_DURATION } from '../sales-hero.js';
import { PILOT_CASES, pilotPlan, renderPilotPlan } from '../pilot-plan.js';
import { renderProposal, SALES_SECTIONS } from '../proposal-template.js';
import { renderClassroomPlan } from '../classroom-plan.js';
import { renderEnvironmentExample } from '../proposal-environments.js';

assert.equal(HERO_DURATION,10000);
assert.deepEqual(heroFrameAt(-1),{index:0,progress:0,complete:false});
assert.deepEqual(heroFrameAt(NaN),heroFrameAt(0));
assert.equal(heroFrameAt(1999).index,0);
for(let index=0;index<5;index++)assert.equal(heroFrameAt(index*2000).index,index);
assert.deepEqual(heroFrameAt(12000),{index:4,progress:1,complete:true});
const running={playing:true,ready:true,hidden:false,onscreen:true,suspended:false,reduced:false};
assert.equal(heroCanRun(running),true);
for(const [key,value] of [['playing',false],['ready',false],['hidden',true],['onscreen',false],['suspended',true],['reduced',true]])assert.equal(heroCanRun({...running,[key]:value}),false);
assert.throws(()=>pilotPlan('unknown'),RangeError);
for(const language of ['ru','uz']) {
  const html=renderProposal(language);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,'No duplicate proposal IDs');
  assert.deepEqual([...html.matchAll(/<section[^>]*\bid="([^"]+)"/g)].map(match=>match[1]),SALES_SECTIONS);
  assert.equal((renderClassroomPlan(language,{interactive:false}).match(/data-zone=|tabindex=|role="button"/g)||[]).length,0,'Compact plan is an honest image, not inert controls');
  assert.equal((renderClassroomPlan(language).match(/role="button"/g)||[]).length,12);
  const example=renderEnvironmentExample('market',{caseId:'market-01',points:[],review:false},language,{showNotes:false});
  assert.ok(!example.includes('Интерактивная CG-иллюстрация')&&!example.includes('Interaktiv CG-illyustratsiya'));
  for(const id of PILOT_CASES) {
    const plan=pilotPlan(id,language), rendered=renderPilotPlan(id,language);
    assert.equal(plan.steps.length,4);
    assert.ok(plan.text.includes(plan.title)&&plan.text.includes(plan.note));
    assert.equal((rendered.match(/data-pilot-case=/g)||[]).length,3);
    assert.ok(rendered.includes('id="download-pilot"'));
    assert.ok(!/undefined|NaN|https?:\/\/.*(?:booking|calendar)|<form/.test(rendered));
  }
}
console.log(JSON.stringify({result:'passed',salesSections:7,heroFrames:5,heroSeconds:10,motionGuards:6,pilotPlans:6,readonlyCompactPlan:true}));
