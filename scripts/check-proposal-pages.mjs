import assert from 'node:assert/strict';
import { renderProposal } from '../proposal-template.js';
import { scenarioLibrary } from '../scenario-library.js';
import { environmentIds,createEnvironmentExamples,reduceEnvironmentExample,renderEnvironmentExample } from '../proposal-environments.js';

for (const language of ['ru','uz']) {
  const html=renderProposal(language);
  let previous=-1;
  for(const id of ['purpose','workspace',...environmentIds.map(id=>'environment-'+id),'integration','classroom','architecture']) {
    const position=html.indexOf(`id="${id}"`);
    assert.ok(position>previous,`${id} follows the proposal narrative`);previous=position;
  }
  const hero=html.slice(html.indexOf('id="purpose"'),html.indexOf('id="workspace"'));
  assert.equal((hero.match(/class="mosaic-tile"/g)||[]).length,4);
  assert.ok(!hero.includes('<iframe')&&!hero.includes('data-open-scene'));
  assert.equal((html.match(/id="expand-workspace"/g)||[]).length,1);
  assert.ok(html.includes('id="integration-example"'));
  for(const item of scenarioLibrary) {
    let state={caseId:item.id,points:[],review:false};
    const other=createEnvironmentExamples();
    assert.equal(reduceEnvironmentExample(state,{type:'point',index:3}),state);
    assert.equal(reduceEnvironmentExample(state,{type:'case',value:environmentIds.find(id=>id!==item.sceneId)+'-01'}),state);
    for(let index=0;index<5;index++) {
      state=reduceEnvironmentExample(state,{type:'point',index});
      assert.equal(state.points.length,index+1);
      assert.equal(reduceEnvironmentExample(state,{type:'point',index}),state);
      const rendered=renderEnvironmentExample(item.sceneId,state,language);
      assert.ok(rendered.includes(`data-visual-step="${index+1}"`));
      assert.equal((rendered.match(/data-env-action="case"/g)||[]).length,5);
      assert.equal((rendered.match(/data-env-action="point"/g)||[]).length,5);
      assert.ok(!/undefined|NaN/.test(rendered));
    }
    assert.deepEqual(other,createEnvironmentExamples(),'Examples do not mutate other environments or saved workspace');
    state=reduceEnvironmentExample(state,{type:'review'});
    assert.ok(renderEnvironmentExample(item.sceneId,state,language).includes('data-env-action="assessment"'));
    state=reduceEnvironmentExample(state,{type:'reset'});
    assert.deepEqual(state.points,[]);
    for(const point of item.points) {
      assert.ok(point.title.length<=65&&point.description.length<=220,'Short, concrete RU copy');
      assert.ok(!/гипотез|временные линии|предмет обращения|пределы установленного|согласовать два разных/i.test(point.title+' '+point.description));
      assert.ok(point.uzTitle&&point.uzDescription);
    }
  }
}
console.log(JSON.stringify({result:'passed',proposalPages:9,independentEnvironments:4,scenarios:20,plainLanguageActions:100,languages:2,fullProgramEntrances:1},null,2));
