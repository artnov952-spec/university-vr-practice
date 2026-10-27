import { scenarioLibrary } from './scenario-library.js?v=proposal20261027-r12panorama';
import { renderScenarioVisual, prefetchScenarioFrame } from './scenario-visuals.js?v=proposal20261027-r12panorama';

const icon=name=>`<svg class="i" aria-hidden="true"><use href="./assets/ui-icons/sprite.svg#i-${name}"></use></svg>`;
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const environmentIds = ['courtyard','entrance','traffic','market'];
export const createEnvironmentExamples = () => Object.fromEntries(environmentIds.map(id => [id,{caseId:id+'-01',points:[],review:false}]));

export function reduceEnvironmentExample(state,action) {
  const item=scenarioLibrary.find(x=>x.id===state.caseId);
  if(action.type==='case' && scenarioLibrary.some(x=>x.id===action.value&&x.sceneId===item.sceneId)) return {caseId:action.value,points:[],review:false};
  if(action.type==='point' && Number.isInteger(action.index) && action.index===state.points.length && action.index<5) return {...state,points:[...state.points,action.index]};
  if(action.type==='reset') return {...state,points:[],review:false};
  if(action.type==='review') return {...state,review:!state.review};
  return state;
}

export function renderEnvironmentExample(id,state,language='ru') {
  const t=(ru,uz)=>language==='uz'?uz:ru;
  const local=(item,key='title')=>escape(item[language==='uz'?'uz'+key[0].toUpperCase()+key.slice(1):key]);
  const cases=scenarioLibrary.filter(x=>x.sceneId===id), selected=cases.find(x=>x.id===state.caseId)||cases[0];
  const count=state.points.length;
  prefetchScenarioFrame(state);
  return `<div class="environment-cases" role="group" aria-label="${t('Выберите ситуацию','Vaziyatni tanlang')}">${cases.map((item,i)=>`<button type="button" data-env="${id}" data-env-action="case" data-env-value="${item.id}" aria-pressed="${selected.id===item.id}"><small>0${i+1}</small><span>${local(item)}</span></button>`).join('')}</div>
  <div class="environment-story"><div><h3>${local(selected)}</h3><p>${local(selected,'summary')}</p></div><button class="text-button" type="button" data-open-scene="${id}" data-env="${id}">${t('Осмотреть среду','Muhitni ko‘rish')} ${icon('arrow-up-right')}</button></div>
  <div class="environment-example"><div class="environment-picture">${renderScenarioVisual(state,language)}<p class="note">${t('Нажимайте действия по порядку. Сцена покажет, что меняется.','Amallarni tartib bilan bosing. Sahnada o‘zgarishlar ko‘rinadi.')}</p></div><div class="environment-actions"><div class="environment-action-heading"><strong>${t('Что делает сотрудник','Xodim nima qiladi')}</strong><span>${count}/5</span></div>${selected.points.map((point,index)=>`<button type="button" data-env="${id}" data-env-action="point" data-env-index="${index}" class="environment-action ${index<count?'is-done':''}" ${index!==count?'disabled':''}><b>${index<count?icon('check'):String(index+1).padStart(2,'0')}</b><span><strong>${local(point)}</strong>${index===count?`<small>${local(point,'description')}</small>`:''}</span></button>`).join('')}<div class="environment-controls"><button class="btn btn--soft" type="button" data-env="${id}" data-env-action="reset" ${count?'':'disabled'}>${t('Сначала','Qaytadan')}</button><button class="btn btn--primary" type="button" data-env="${id}" data-env-action="review" aria-expanded="${state.review}">${state.review?t('Скрыть разбор','Tahlilni yopish'):t('Что оцениваем','Nimani baholaymiz')}</button></div></div></div>
  ${state.review?`<div class="environment-review"><div><p class="eyebrow">${t('РАЗБОР ПРИМЕРА','NAMUNA TAHLILI')}</p><h3>${count===5?t('Все пять действий отмечены','Besh harakat ham belgilandi'):t('Отмечено','Belgilandi')+' '+count+' '+t('из 5 действий','/ 5 harakat')}</h3><p>${t('Преподаватель проверяет не только итог, но и то, как сотрудник к нему пришел.','O‘qituvchi faqat yakunni emas, xodim unga qanday kelganini ham tekshiradi.')}</p></div><ul>${selected.points.map((point,index)=>`<li><span class="review-mark ${index<count?'is-done':''}">${index<count?icon('check'):icon('minus')}</span><span><strong>${local(point)}</strong><small>${local(point,'description')}</small></span></li>`).join('')}</ul><button class="btn btn--soft" type="button" data-env="${id}" data-env-action="assessment">${t('Показать расчет в программе','Dasturda hisobni ko‘rsatish')} ${icon('arrow-right')}</button></div>`:''}<p class="note">${t('Интерактивная CG-иллюстрация. Нажатия показывают пример, но не заменяют оценку преподавателя и практику в VR-шлеме.','Interaktiv CG-illyustratsiya. Tugmalar namunani ko‘rsatadi, lekin o‘qituvchi bahosi va VR-shlem amaliyotini almashtirmaydi.')}</p>`;
}
