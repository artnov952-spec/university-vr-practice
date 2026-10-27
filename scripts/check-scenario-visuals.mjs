import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { scenarioLibrary } from '../scenario-library.js';
import { VISUAL_ATLASES, VISUAL_SPRITES, VISUAL_SCRIPTS, scenarioVisualState, normalizeVisualContext, propBounds, renderScenarioVisual, visualForAttempt } from '../scenario-visuals.js';
import { createPresentationDemo, reducePresentationDemo, presentationScore } from '../presentation-demo.js';
import { readParentCommand, normalizeTheme } from '../panorama/viewer.js';

assert.deepEqual(Object.keys(VISUAL_SCRIPTS).sort(), scenarioLibrary.map(item=>item.id).sort());
let transitions=0;
for(const item of scenarioLibrary) {
  let state=reducePresentationDemo(createPresentationDemo(),{type:'case',value:item.id});
  state={...state,caseId:item.id,scenario:item.sceneId,checks:[true,true,true],phase:'ready'};
  state=reducePresentationDemo(state,{type:'start'});
  let previous=JSON.stringify(scenarioVisualState(state).props);
  for(let index=0;index<5;index++) {
    const before=state;
    state=reducePresentationDemo(state,{type:'point',index});
    const visual=scenarioVisualState(state);
    assert.equal(visual.step,index+1);
    assert.notEqual(JSON.stringify(visual.props),previous,`${item.id} action ${index+1} must visibly change objects`);
    previous=JSON.stringify(visual.props); transitions++;
    assert.equal(reducePresentationDemo(state,{type:'point',index}),state,'Duplicate cannot change state');
    assert.equal(reducePresentationDemo({...before,paused:true},{type:'point',index}).points.length,before.points.length,'Pause blocks effects');
    for(const prop of visual.props) {
      const bounds=propBounds(prop);
      assert.ok(Object.values(bounds).every(Number.isFinite));
      assert.ok(bounds.left>=0 && bounds.top>=0 && bounds.left+bounds.width<=100 && bounds.top+bounds.height<=115,`${item.id}/${index}/${prop.id} source bounds`);
      assert.ok(VISUAL_SPRITES[prop.sprite] || ['smoke','wet','rain','dusk'].includes(prop.sprite));
    }
    for(const language of ['ru','uz']) assert.ok(renderScenarioVisual(state,language).includes(`data-visual-step="${index+1}"`));
  }
  assert.equal(presentationScore(state),100,'Assessment still uses original reducer and formula');
  const missing=scenarioVisualState({caseId:item.id,points:[0,1,3,4]});
  assert.equal(missing.step,2); assert.equal(missing.pending,true);
  assert.deepEqual(missing.props,scenarioVisualState({caseId:item.id,points:[0,1]}).props);
  assert.equal(scenarioVisualState({caseId:item.id,points:[4]}).step,0,'Final action alone cannot resolve a hazard');
  const attempt={scenario:{...item,conceptId:item.id},events:item.points.map(point=>({kind:'record',pointId:point.id}))};
  assert.equal(scenarioVisualState(visualForAttempt(attempt)).step,5);
  attempt.events[2].kind='skip'; assert.equal(scenarioVisualState(visualForAttempt(attempt)).step,2);
  assert.equal(visualForAttempt({scenario:{...item,conceptId:item.id,points:[{id:'legacy'}]},events:[]}),null);
  assert.equal(visualForAttempt({scenario:{...item,conceptId:item.id,brief:'Changed local teaching contract'},events:[]}),null);
}
for(const value of [null,{},[],{caseId:'__proto__',points:[]},{caseId:'courtyard-01',points:[-1]},{caseId:'courtyard-01',points:[0,0]},{caseId:'courtyard-01',points:['0']},{caseId:'courtyard-01',points:[Infinity]}]) assert.equal(normalizeVisualContext(value),null);
const parent={}, origin='https://example.test', message={origin,source:parent,data:{type:'university-panorama:scenario',caseId:'courtyard-01',points:[0,1]}};
assert.equal(readParentCommand(message,parent,origin).context.caseId,'courtyard-01');
assert.equal(readParentCommand({...message,source:{}},parent,origin),null);
assert.equal(readParentCommand({...message,origin:'https://other.test'},parent,origin),null);
assert.equal(readParentCommand({...message,data:{...message.data,points:[100]}},parent,origin),null);
assert.equal(normalizeTheme('dark'),'light');
assert.equal(readParentCommand({...message,data:{type:'university-panorama:theme',theme:'dark'}},parent,origin).theme,'light');
const source=await readFile(new URL('../theme.js',import.meta.url),'utf8');
for(const throwStorage of [false,true]) {
  const root={dataset:{theme:'dark'},style:{}}, writes=[], events=[];
  const context={document:{documentElement:root,querySelectorAll:()=>[],querySelector:()=>null,addEventListener:(name,fn)=>events.push(fn)},localStorage:{setItem:(key,value)=>{if(throwStorage)throw new Error('Storage disabled');writes.push([key,value]);}},window:{addEventListener:(name,fn)=>events.push(fn)}};
  runInNewContext(source,context);
  for(const fn of events) fn();
  assert.equal(root.dataset.theme,'light');assert.equal(root.style.colorScheme,'light');
  assert.ok(writes.every(([key,value])=>key==='university-vr.theme'&&value==='light'),'No workspace data writes');
}
for(const sheet of Object.values(VISUAL_ATLASES)) {
  const png=await readFile(new URL('../'+sheet.src,import.meta.url));
  assert.equal(png.readUInt32BE(16),sheet.width);assert.equal(png.readUInt32BE(20),sheet.height);
  assert.equal(png[25],6,'RGBA atlas required');
}
const proposal=await readFile(new URL('../proposal-template.js',import.meta.url),'utf8');
assert.ok(!proposal.includes('data-theme-toggle'));
console.log(JSON.stringify({result:'passed',scenarios:20,visualTransitions:transitions,languages:2,alphaAtlases:4,guards:['duplicate','pause','missing prerequisite','legacy snapshot','same-origin parent','light-only storage migration']},null,2));
