import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { createHash } from 'node:crypto';
import { scenarioLibrary } from '../scenario-library.js';
import { SCENARIO_FRAMES, scenarioVisualState, normalizeVisualContext, renderScenarioVisual, visualForAttempt, loadScenarioFrame } from '../scenario-visuals.js';
import { createPresentationDemo, reducePresentationDemo, presentationScore } from '../presentation-demo.js';
import { readParentCommand, normalizeTheme } from '../panorama/viewer.js';

assert.deepEqual(Object.keys(SCENARIO_FRAMES).sort(), scenarioLibrary.map(item=>item.id).sort());
let transitions=0;
for(const item of scenarioLibrary) {
  let state=reducePresentationDemo(createPresentationDemo(),{type:'case',value:item.id});
  state={...state,caseId:item.id,scenario:item.sceneId,checks:[true,true,true],phase:'ready'};
  state=reducePresentationDemo(state,{type:'start'});
  let previous=scenarioVisualState(state).frame.src;
  for(let index=0;index<5;index++) {
    const before=state;
    state=reducePresentationDemo(state,{type:'point',index});
    const visual=scenarioVisualState(state);
    assert.equal(visual.step,index+1);
    assert.notEqual(visual.frame.src,previous,`${item.id} action ${index+1} must select its own whole-frame render`);
    previous=visual.frame.src; transitions++;
    assert.equal(reducePresentationDemo(state,{type:'point',index}),state,'Duplicate cannot change state');
    assert.equal(reducePresentationDemo({...before,paused:true},{type:'point',index}).points.length,before.points.length,'Pause blocks effects');
    assert.equal(visual.frame.width/visual.frame.height,2);
    for(const language of ['ru','uz']) {
      const html=renderScenarioVisual(state,language);
      assert.ok(html.includes(`data-visual-step="${index+1}"`));
      assert.ok(html.includes(visual.frame.src));
      assert.ok(!/scenario-prop|scenario-layers|background-image/.test(html));
    }
  }
  assert.equal(presentationScore(state),100,'Assessment still uses original reducer and formula');
  const missing=scenarioVisualState({caseId:item.id,points:[0,1,3,4]});
  assert.equal(missing.step,2); assert.equal(missing.pending,true);
  assert.deepEqual(missing.frame,scenarioVisualState({caseId:item.id,points:[0,1]}).frame);
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
function jpegSize(bytes) {
  assert.equal(bytes.readUInt16BE(0),0xffd8);
  for(let offset=2;offset+8<bytes.length;) {
    assert.equal(bytes[offset++],0xff);
    while(bytes[offset]===0xff)offset++;
    const marker=bytes[offset++],length=bytes.readUInt16BE(offset);
    if([0xc0,0xc1,0xc2].includes(marker))return {width:bytes.readUInt16BE(offset+5),height:bytes.readUInt16BE(offset+3)};
    if(marker===0xda || length<2)break;
    offset+=length;
  }
  throw new Error('JPEG dimensions unavailable');
}
const hashes=new Set();let frameBytes=0;
for(const frame of Object.values(SCENARIO_FRAMES).flat()) {
  const image=await readFile(new URL('../'+frame.src,import.meta.url));
  assert.deepEqual(jpegSize(image),{width:frame.width,height:frame.height},frame.src);
  assert.ok(image.length<2_500_000,'Web frame byte budget');frameBytes+=image.length;
  const hash=createHash('sha256').update(image).digest('hex');assert.ok(!hashes.has(hash),'Every checkpoint has its own render, not repeated placeholders');hashes.add(hash);
}
const nativeImage=globalThis.Image;
try {
  globalThis.Image=class{set src(value){this.value=value;queueMicrotask(()=>this.onload?.());}get src(){return this.value;}};
  const base={src:'base'};
  assert.equal(await loadScenarioFrame(base,{caseId:'courtyard-01',points:[]}),base);
  const selected=await loadScenarioFrame(base,{caseId:'courtyard-01',points:[0,1]});
  assert.ok(new URL(selected.src).pathname.endsWith('/assets/scenario-frames/courtyard-01/step-2.jpg'));
  assert.equal(await loadScenarioFrame(base,{caseId:'courtyard-01',points:[0,1]}),selected);
} finally {if(nativeImage===undefined)delete globalThis.Image;else globalThis.Image=nativeImage;}
const rendererSource=await readFile(new URL('../scenario-visuals.js',import.meta.url),'utf8');
assert.ok(!/drawImage|createElement\('canvas'\)|VISUAL_SPRITES|renderVisualLayers/.test(rendererSource),'No sprite compositing path remains');
const proposal=await readFile(new URL('../proposal-template.js',import.meta.url),'utf8');
assert.ok(!proposal.includes('data-theme-toggle'));
console.log(JSON.stringify({result:'passed',scenarios:20,wholeFrameRenders:hashes.size,frameBytes,visualTransitions:transitions,languages:2,spriteLayers:0,guards:['duplicate','pause','missing prerequisite','legacy snapshot','same-origin parent','light-only storage migration']},null,2));
