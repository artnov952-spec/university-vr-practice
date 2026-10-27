import assert from 'node:assert/strict';
import { heroFrameAt, heroCanRun, HERO_DURATION } from '../sales-hero.js';
import { PILOT_CASES, pilotPlan, renderPilotPlan } from '../pilot-plan.js';
import { renderProposal, SALES_SECTIONS } from '../proposal-template.js';
import { renderClassroomPlan } from '../classroom-plan.js';
import { renderEnvironmentExample } from '../proposal-environments.js';
import { scenarioLibrary } from '../scenario-library.js';
import { INTERNATIONAL_EXAMPLES, renderInternationalEvidence } from '../international-evidence.js';

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
assert.deepEqual(PILOT_CASES,scenarioLibrary.map(item=>item.id),'Every library scenario is available for a pilot');
assert.equal(PILOT_CASES.length,20);
assert.equal(pilotPlan().caseId,'market-01','The existing default is preserved');
assert.equal(INTERNATIONAL_EXAMPLES.length,6);
assert.equal(new Set(INTERNATIONAL_EXAMPLES.map(item=>item.code)).size,6);
assert.ok(INTERNATIONAL_EXAMPLES.every(item=>item.url.startsWith('https://')));
for(const language of ['ru','uz']) {
  const html=renderProposal(language);
  assert.ok(!html.includes('Взгляд курсанта')&&!html.includes('Kursant nigohi'));
  assert.ok(html.indexOf('id="international-experience"')>html.indexOf('<footer'),'International evidence is compact and at the end');
  assert.equal((renderInternationalEvidence(language).match(/data-evidence-country=/g)||[]).length,6);
  assert.ok(!html.slice(html.indexOf('id="benefits"'),html.indexOf('id="workflow"')).includes('dyfed-powys'),'Evidence does not interrupt the benefits');
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
    assert.equal((rendered.match(/data-pilot-case=/g)||[]).length,20);
    assert.equal((rendered.match(/data-pilot-group=/g)||[]).length,4);
    for(const group of ['courtyard','entrance','traffic','market'])assert.equal((rendered.match(new RegExp(`data-pilot-case="${group}-`,'g'))||[]).length,5);
    assert.equal((rendered.match(/aria-pressed="true"/g)||[]).length,1);
    assert.ok(rendered.includes(`data-pilot-case="${id}" aria-pressed="true"`));
    assert.equal(plan.actions.length,5);
    for(const action of plan.actions)assert.ok(plan.text.includes(action.title)&&plan.text.includes(action.description));
    assert.ok(rendered.includes('id="download-pilot"'));
    assert.ok(!/undefined|NaN|https?:\/\/.*(?:booking|calendar)|<form/.test(rendered));
  }
}
console.log(JSON.stringify({result:'passed',salesSections:7,heroFrames:5,heroSeconds:10,motionGuards:6,pilotPlans:40,pilotScenarios:20,pilotGroups:4,readonlyCompactPlan:true}));
