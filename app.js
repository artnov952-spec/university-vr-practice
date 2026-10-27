import { mountWorkspace, calculateResult } from './workspace.js?v=proposal20261027-r8scenes';
import { modules, scenarios } from './content.js?v=proposal20261027-r8scenes';
import { getLanguage, setLanguage, subscribeLanguage } from './locale.js?v=proposal20261027-r8scenes';
import { proposalContent } from './proposal-content.js?v=proposal20261027-r8scenes';
import { renderProposal, escapeHtml as escape, icon } from './proposal-template.js?v=proposal20261027-r8scenes';
import { createPresentationDemo, reducePresentationDemo, renderPresentationDemo } from './presentation-demo.js?v=proposal20261027-r8scenes';
import { scenarioLibrary } from './scenario-library.js?v=proposal20261027-r8scenes';

const $ = id => document.getElementById(id);
const t = (ru, uz) => getLanguage() === 'uz' ? uz : ru;
const content = () => proposalContent(getLanguage());
const view = {scene:'courtyard',stage:0,role:'teacher',zone:'intro',seat:null,architecture:'teacher',preview:'prepare',exchange:'api'};
let presentationDemo = createPresentationDemo();
const systemRoot = document.createElement('div');
systemRoot.id = 'workspace-root';
const returnFocus = new WeakMap();
let workspace, navigationObserver, headerObserver, previewObserver;
let previousModule;
let lockedScroll = null;
let previewVisible = false;

function syncPreviewMotion() {
  $('scene-preview')?.contentWindow?.postMessage({type:document.querySelector('dialog[open]') || !previewVisible ? 'university-panorama:suspend' : 'university-panorama:resume'},location.origin);
}

function syncDialogLock() {
  const open = Boolean(document.querySelector('dialog[open]'));
  if (open && lockedScroll === null) {
    lockedScroll = window.scrollY;
    document.documentElement.classList.add('modal-open');
    document.body.style.top = `-${lockedScroll}px`;
  } else if (!open && lockedScroll !== null) {
    const y = lockedScroll; lockedScroll = null;
    const behavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    document.documentElement.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo({top:y,behavior:'instant'});
    document.documentElement.style.scrollBehavior = behavior;
  }
  syncPreviewMotion();
}

function showDialog(id) {
  const dialog = $(id);
  if (!dialog.open) { returnFocus.set(dialog, document.activeElement); dialog.showModal(); }
  syncDialogLock();
}
function openModule(id) {
  const requested = Number(id);
  if (!workspace || !modules.some(item => item.id === requested)) return;
  $('system-fullscreen-slot').append(systemRoot);
  workspace.openModule(requested);
  showDialog('system-dialog');
  $('system-dialog').scrollTop = 0;
}
function panoramaURL(id, embed = false, context = presentationDemo) {
  const visual = context?.caseId?.startsWith(id+'-') ? '&case='+encodeURIComponent(context.caseId)+'&points='+encodeURIComponent(context.points.join(',')) : '';
  return './panorama/viewer.html?v=proposal20261027-r8scenes&scene='+encodeURIComponent(id)+'&theme=light&lang='+getLanguage()+(embed?'&embed=1':'')+visual;
}
function sceneTitle(id) { return id === 'classroom' ? t('Учебная аудитория','O‘quv auditoriyasi') : content().scenes[id]?.title; }
function openScene(id, context = presentationDemo) {
  const valid = id === 'classroom' || Object.hasOwn(content().scenes, id) ? id : 'courtyard';
  $('scene-dialog-title').textContent = sceneTitle(valid);
  const frame = document.createElement('iframe');
  frame.src = panoramaURL(valid, false, context);
  frame.title = sceneTitle(valid) + ' / ' + t('панорамный осмотр','panoramali ko‘rinish');
  frame.allow = 'fullscreen';
  $('scene-frame-slot').replaceChildren(frame);
  showDialog('scene-dialog');
}
function knownText(value) {
  if (getLanguage() !== 'uz') return value;
  const known = {'Демо 101':'Namoyish 101','Демо 202':'Namoyish 202','Участник 01':'Ishtirokchi 01','Участник 02':'Ishtirokchi 02','Участник 03':'Ishtirokchi 03'};
  return known[value] || value;
}
function scenarioTitle(scenario) {
  if (getLanguage()==='uz' && scenario.i18nSource?.title===scenario.title && scenario.uzTitle) return scenario.uzTitle;
  const source = scenarios.find(item => item.id === (scenario.familyId || scenario.sceneId));
  return getLanguage() === 'uz' && source && scenario.title === source.title ? source.uzTitle : scenario.title;
}
function updateSummary(state) {
  if (!$('assessment-summary')) return;
  if (previousModule !== state.view.moduleId) {
    previousModule = state.view.moduleId;
    queueMicrotask(() => { if ($('system-dialog').open) $('system-dialog').scrollTop = 0; });
  }
  const completed = state.attempts.filter(a => a.endedAt !== null);
  const attempt = completed.filter(item => item.status === 'confirmed').at(-1) || completed.at(-1);
  if (!attempt) {
    $('assessment-summary').innerHTML = `<h3>${t('Пока нет завершенных попыток','Yakunlangan urinishlar hali yo‘q')}</h3><p>${t('Пройдите учебную попытку в демонстрации программы.','Dastur namoyishida o‘quv urinishini bajaring.')}</p>`;
    return;
  }
  const result = calculateResult(attempt, state.criteria);
  const cadet = state.cadets.find(item => item.id === attempt.cadetId);
  const group = state.groups.find(item => item.id === attempt.groupId);
  const confirmed = attempt.status === 'confirmed';
  $('assessment-summary').innerHTML = `<h3 class="result-heading">${escape(scenarioTitle(attempt.scenario))}</h3><p class="result-meta">${escape(knownText(cadet?.name || t('Участник','Ishtirokchi')))} / ${escape(knownText(group?.name || t('Учебная группа','O‘quv guruhi')))} / ${t('версия','versiya')} ${attempt.scenario.version}</p><span class="badge ${confirmed?'badge--ok':'badge--warn'}">${confirmed?t('Подтверждено в демо','Namoyishda tasdiqlangan'):t('Ожидает разбора','Tahlil kutilmoqda')}</span><div class="summary-stats"><div><b>${result.completed} / ${attempt.scenario.points.length}</b><span>${t('точек выполнено','nuqta bajarilgan')}</span></div><div><b>${result.missing.length}</b><span>${t('пропущено','o‘tkazib yuborilgan')}</span></div><div><b>${result.score ?? '—'}</b><span>${t('демо-балл','namoyish bali')}</span></div></div><p class="summary-caption">${t('Карточка обновляется после работы в программе. Расчет иллюстративный, не академическая оценка.','Dasturda ishlagandan keyin karta yangilanadi. Hisob namunaviy, akademik baho emas.')}</p>`;
}
function markTabs(selector, attr, selected) {
  document.querySelectorAll(selector).forEach(button => {
    const active = button.dataset[attr] === String(selected);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
}
function selectScene(id, load = true) {
  const data = content().scenes[id];
  if (!data) return;
  view.scene = id;
  if (presentationDemo.scenario !== id) presentationDemo=reducePresentationDemo(presentationDemo,{type:'scenario',value:id});
  markTabs('[data-scene-tab]', 'sceneTab', id);
  $('scene-panel').setAttribute('aria-labelledby','scene-tab-'+id);
  if (load) $('scene-preview').src = panoramaURL(id, true);
  $('scene-preview').title = data.title + ' / ' + t('панорамный осмотр','panoramali ko‘rinish');
  $('scene-description').innerHTML = `<p class="eyebrow">${data.label}</p><h3>${data.title}</h3><p>${data.description}</p><ul>${data.points.map(point=>`<li>${point}</li>`).join('')}</ul><button class="btn btn--primary" data-open-scene="${id}">${t('Развернуть панораму','Panoramani kengaytirish')} ${icon('arrow-up-right')}</button>`;
  renderSceneCases();
  if (workspace) {selectStage(view.stage);selectArchitecture(view.architecture);selectPreview(view.preview);}
}
function renderSceneCases() {
  const cases=scenarioLibrary.filter(item=>item.sceneId===view.scene);
  const selected=cases.find(item=>item.id===presentationDemo.caseId) || cases[0];
  const local=(item,key='title')=>escape(getLanguage()==='uz'?item['uz'+key[0].toUpperCase()+key.slice(1)]:item[key]);
  $('scenario-case-browser').innerHTML=`<div class="case-browser-heading"><h3>${t('Пять сценариев в этой среде','Ushbu muhitdagi beshta ssenariy')}</h3><span>20 ${t('сценариев всего','ssenariy jami')}</span></div><div class="case-browser-grid"><div class="case-list" role="group" aria-label="${t('Учебные сценарии','O‘quv ssenariylari')}">${cases.map((item,i)=>`<button type="button" data-case-id="${item.id}" aria-pressed="${selected.id===item.id}"><span>0${i+1}</span><strong>${local(item)}</strong>${icon('chevron-right')}</button>`).join('')}</div><article class="case-detail"><p class="eyebrow">${t('Учебный сценарий / проект','O‘quv ssenariysi / loyiha')}</p><h4>${local(selected)}</h4><p>${local(selected,'summary')}</p><details><summary>${t('Условия и оцениваемые действия','Shartlar va baholanadigan harakatlar')} ${icon('plus')}</summary><p>${local(selected,'brief')}</p><ol>${selected.points.map(point=>`<li><strong>${local(point)}</strong><p>${local(point,'description')}</p></li>`).join('')}</ol><p class="case-debrief">${local(selected,'debrief')}</p></details><button type="button" class="btn btn--soft" data-inline-stage="0">${t('Попробовать этот сценарий в примере','Ushbu ssenariyni namunada sinash')} ${icon('arrow-right')}</button></article></div>`;
}
function selectStage(index) {
  const stages = content().stages;
  if (!Number.isInteger(index) || !stages[index]) return;
  view.stage = index;
  markTabs('[role="tab"][data-process-stage]', 'processStage', index);
  const stage = stages[index];
  $('process-content').setAttribute('aria-labelledby','stage-'+index);
  $('process-content').innerHTML = `<div class="stage-heading"><span class="stage-number">${t('Этап','Bosqich')} ${index+1} / ${stages.length}</span><span class="badge badge--soft">${t('Экран и действия','Ekran va amallar')}</span></div><h3>${stage[0]}</h3><p>${stage[1]}</p>${renderPresentationDemo({stage:index,state:presentationDemo,language:getLanguage()})}<div class="stage-outcome"><b>${t('Результат этапа','Bosqich natijasi')}</b>${stage[2]}</div><div class="stage-navigation"><button class="btn btn--soft" data-process-stage="${index-1}" ${index===0?'disabled':''}>${icon('chevrons-left')}${t('Назад','Orqaga')}</button><button class="btn btn--soft" data-process-stage="${index===stages.length-1?0:index+1}">${index===stages.length-1?t('К первому этапу','Birinchi bosqichga'):t('Следующий этап','Keyingi bosqich')}${icon('arrow-right')}</button></div>`;
}
function selectRole(id) {
  const role = content().roles[id];
  if (!role) return;
  view.role = id;
  markTabs('[data-role]', 'role', id);
  $('role-panel').setAttribute('aria-labelledby','role-'+id);
  $('role-panel').innerHTML = `<div><h3>${role[1]}</h3><p>${role[2]}</p></div><ul>${role[3].map(item=>`<li>${item}</li>`).join('')}</ul>`;
}
function selectZone(id, seat, interactive = false) {
  const zone = content().zones[id];
  if (!zone) return;
  view.zone = id; view.seat = seat || null;
  document.querySelectorAll('[data-zone]').forEach(element => {
    const selected = element.dataset.zone === id && (!seat || element.dataset.seat === String(seat));
    element.classList.toggle('active', selected); element.setAttribute('aria-pressed',String(selected));
  });
  $('classroom-detail').innerHTML = `<p class="eyebrow">${t('Назначение зоны','Hudud vazifasi')}${seat?' / '+t('место','joy')+' '+escape(seat):''}</p><h3>${zone[0]}</h3><p>${zone[1]}</p><ul>${zone[2].map(item=>`<li>${item}</li>`).join('')}</ul><div class="action-row">${id==='screen'?`<button class="btn btn--primary" data-inline-component="teacher">${t('Показать пульт преподавателя','O‘qituvchi panelini ko‘rsatish')} ${icon('arrow-right')}</button>`:''}<button class="btn btn--soft" data-open-scene="classroom">${t('Панорама аудитории','Auditoriya panoramasi')} ${icon('eye')}</button></div>`;
  if (interactive && matchMedia('(max-width:760px)').matches) $('classroom-detail').scrollIntoView({block:'nearest',behavior:'auto'});
}
function selectArchitecture(id) {
  const item = content().architecture[id];
  if (!item) return;
  view.architecture = id;
  document.querySelectorAll('[data-arch]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.arch===id)));
  const routes = {
    teacher:[t('Назначить готовое упражнение группе.','Tayyor mashqni guruhga tayinlash.'),t('Проверить три условия готовности.','Uchta tayyorlik shartini tekshirish.'),t('Перейти к практике и разбору.','Amaliyot va tahlilga o‘tish.')],
    platform:[t('Откройте группы, версии сценариев или попытки.','Guruhlar, ssenariy versiyalari yoki urinishlarni oching.'),t('Сопоставьте связанную учебную запись.','Bog‘langan o‘quv yozuvini solishtiring.'),t('Результат остается связан с версией упражнения.','Natija mashq versiyasiga bog‘langan holda qoladi.')],
    vr:[t('Отметьте оцениваемое действие под сценой.','Sahna ostida baholanadigan amalni belgilang.'),t('Выполненное действие появится в списке.','Bajarilgan amal ro‘yxatda paydo bo‘ladi.'),t('Проверьте паузу: новые действия блокируются.','Tanaffusni tekshiring: yangi amallar bloklanadi.')],
    display:[t('Покажите или скройте учебное имя.','O‘quv ismini ko‘rsating yoki yashiring.'),t('Переключите паузу наблюдения.','Kuzatish tanaffusini almashtiring.'),t('Разверните панораму для обсуждения среды.','Muhitni muhokama qilish uchun panoramani kengaytiring.')],
    exchange:[t('Выберите учебную запись для пакета.','Paket uchun o‘quv yozuvini tanlang.'),t('Проверка не пропустит неподтвержденный результат.','Tekshiruv tasdiqlanmagan natijani o‘tkazmaydi.'),t('После разбора подготовьте локальный пакет.','Tahlildan keyin mahalliy paket tayyorlang.')]
  };
  $('architecture-detail').innerHTML = `<div class="architecture-detail-heading"><div><p class="eyebrow">${t('Выбранный компонент','Tanlangan komponent')}</p><h3>${item[0]}</h3><p>${item[2]}</p></div></div><div class="architecture-demo">${renderPresentationDemo({component:id,state:presentationDemo,language:getLanguage(),scope:'architecture'})}<aside class="architecture-context"><h4>${t('Попробуйте в этом экране','Shu ekranda sinab ko‘ring')}</h4><ol>${routes[id].map(text=>`<li>${text}</li>`).join('')}</ol></aside></div>`;
}

function handlePresentationAction(target, value) {
  const type = target.dataset.demoAction;
  const scope = target.dataset.demoScope;
  const destinations = {'goto-prepare':1,'goto-practice':2,'goto-review':6};
  if (Object.hasOwn(destinations,type)) {
    if(type==='goto-practice') {
      presentationDemo=reducePresentationDemo(presentationDemo,{type:'start'});
      syncScenarioPreview();
      if(presentationDemo.phase!=='running') {selectStage(1);return;}
      selectArchitecture(view.architecture); selectPreview(view.preview);
    }
    if (scope==='architecture' && type==='goto-practice') selectArchitecture('vr');
    else { selectStage(destinations[type]); $('process-content').scrollIntoView({block:'start',behavior:'auto'}); }
    return;
  }
  const action = {type,value:value ?? target.dataset.demoValue,index:Number(target.dataset.demoIndex)};
  presentationDemo = reducePresentationDemo(presentationDemo,action);
  syncScenarioPreview();
  if (type==='case' || type==='scenario') selectScene(presentationDemo.scenario);
  const focusSelector = `[data-demo-action="${CSS.escape(type)}"][data-demo-scope="${CSS.escape(scope)}"]${target.dataset.demoIndex!==undefined?`[data-demo-index="${CSS.escape(target.dataset.demoIndex)}"]`:''}${target.dataset.demoValue!==undefined?`[data-demo-value="${CSS.escape(target.dataset.demoValue)}"]`:''}`;
  // Both inline illustrations share their example, not the persisted workspace.
  selectStage(view.stage); selectArchitecture(view.architecture); selectPreview(view.preview);
  const nextFocus = document.querySelector(focusSelector);
  if (nextFocus && !nextFocus.disabled) nextFocus.focus({preventScroll:true});
  else document.querySelector(`.demo-screen[data-demo-scope="${CSS.escape(scope)}"] button:not(:disabled)`)?.focus({preventScroll:true});
}
function syncScenarioPreview() {
  if (presentationDemo.scenario !== view.scene) return;
  $('scene-preview')?.contentWindow?.postMessage({type:'university-panorama:scenario',caseId:presentationDemo.caseId,points:presentationDemo.points},location.origin);
}
function selectPreview(id) {
  if (!['prepare','practice','result'].includes(id)) return;
  view.preview = id;
  const state = workspace?.getState();
  const scenario = state?.scenarios.find(item=>item.id===state.assignment.scenarioId);
  const group = state?.groups.find(item=>item.id===state.assignment.groupId);
  const variants = {
    prepare:{title:t('Назначение учебного задания','O‘quv topshirig‘ini tayinlash'),text:t('Готовый сценарий, группа и участник. Перед запуском преподаватель проверяет инструктаж, оборудование и учебную зону.','Tayyor ssenariy, guruh va ishtirokchi. Boshlashdan oldin o‘qituvchi yo‘riqnoma, jihozlar va o‘quv hududini tekshiradi.'),module:6,button:t('Открыть подготовку занятия','Mashg‘ulot tayyorgarligini ochish'),sample:t('Пример назначенного занятия','Tayinlangan mashg‘ulot namunasi'),ico:'calendar-days',rows:[[t('Группа','Guruh'),knownText(group?.name || 'Демо 101')],[t('Сценарий','Ssenariy'),scenario?scenarioTitle(scenario):t('Обход махалли','Mahallani kuzatish')],[t('Контрольные точки','Nazorat nuqtalari'),String(scenario?.points.length || 3)],[t('До запуска','Boshlashdan oldin'),t('Три проверки готовности','Uchta tayyorlik tekshiruvi')]]},
    practice:{title:t('Наблюдение за текущей попыткой','Joriy urinishni kuzatish'),text:t('Задание и события доступны на одном экране. Преподаватель может поставить занятие на паузу, добавить комментарий и открыть экран аудитории.','Topshiriq va hodisalar bitta ekranda mavjud. O‘qituvchi tanaffus qilishi, izoh qo‘shishi va auditoriya ekranini ochishi mumkin.'),module:8,button:t('Открыть проведение занятия','Mashg‘ulotni o‘tkazish ekranini ochish'),sample:t('Работа во время практики','Amaliyot davomidagi ish'),ico:'eye',rows:[[t('Участник','Ishtirokchi'),t('Назначенный курсант','Tayinlangan kursant')],[t('Наблюдение','Kuzatish'),t('Действия и время событий','Harakatlar va hodisalar vaqti')],[t('Управление','Boshqaruv'),t('Пауза и продолжение','Tanaffus va davom etish')],[t('Обратная связь','Qayta aloqa'),t('Комментарий к событию','Hodisaga izoh')]]},
    result:{title:t('Разбор и подтверждение результата','Natijani tahlil qilish va tasdiqlash'),text:t('События сопоставляются с критериями. После комментария преподавателя результат подтверждается и становится доступным для подготовки обмена.','Hodisalar mezonlar bilan solishtiriladi. O‘qituvchi izohidan keyin natija tasdiqlanadi va almashuvga tayyorlash uchun mavjud bo‘ladi.'),module:10,button:t('Открыть результат и события','Natija va hodisalarni ochish'),sample:t('Карточка разбора','Tahlil kartasi'),ico:'check-check',rows:[[t('Основание','Asos'),t('Журнал и контрольные точки','Jurnal va nazorat nuqtalari')],[t('Расчет','Hisob'),t('Полнота, порядок, время','To‘liqlik, tartib, vaqt')],[t('Решение','Qaror'),t('Подтверждение преподавателя','O‘qituvchi tasdig‘i')],[t('Следующий шаг','Keyingi bosqich'),t('Пакет для E-reyting','E-reyting uchun paket')]]}
  };
  markTabs('[data-preview]', 'preview', id);
  const data = variants[id];
  $('program-panel').setAttribute('aria-labelledby','preview-'+id);
  $('program-panel').innerHTML = `<div class="preview-body"><div class="preview-copy"><span class="badge badge--soft">${t('Пример работы','Ishlash namunasi')}</span><h3>${data.title}</h3><p>${data.text}</p></div>${renderPresentationDemo({stage:{prepare:1,practice:4,result:6}[id],state:presentationDemo,language:getLanguage(),scope:'preview'})}</div>`;
}
function selectExchange(id) {
  if (!['api','file'].includes(id)) return;
  view.exchange = id;
  markTabs('[data-exchange]', 'exchange', id);
  $('exchange-detail').setAttribute('aria-labelledby','exchange-'+id);
  const steps = id === 'api'
    ? [t('Проверка идентификаторов и подтверждения.','Identifikatorlar va tasdiqni tekshirish.'),t('Формирование согласованного пакета.','Kelishilgan paketni shakllantirish.'),t('Регистрация ответа и ошибок без повторной оценки.','Javob va xatolarni qayta baholamasdan qayd etish.')]
    : [t('Выбор подтвержденных попыток.','Tasdiqlangan urinishlarni tanlash.'),t('Проверка полей и состава файла.','Maydonlar va fayl tarkibini tekshirish.'),t('Подготовка файла и отдельный контроль импорта.','Faylni tayyorlash va importni alohida nazorat qilish.')];
  $('exchange-detail').innerHTML = `<h3>${id==='api'?t('Автоматический обмен','Avtomatik almashuv'):t('Обмен по утвержденному файлу','Tasdiqlangan fayl orqali almashuv')}</h3><ol>${steps.map(item=>`<li>${item}</li>`).join('')}</ol><p>${id==='api'?t('Проектируемый маршрут после подключения согласованного API.','Kelishilgan API ulangandan keyingi loyihaviy yo‘l.'):t('Резервный вариант при отсутствии прямого API. Скачивание файла не равно успешному импорту.','To‘g‘ridan-to‘g‘ri API bo‘lmagandagi zaxira yo‘l. Faylni yuklab olish muvaffaqiyatli import degani emas.')}</p>`;
}
function renderDialogCopy() {
  $('system-label').textContent = t('Демонстрация / локальные учебные данные','Namoyish / mahalliy o‘quv ma’lumotlari');
  $('system-dialog-title').textContent = t('Учебная платформа','O‘quv platformasi');
  $('scene-label').textContent = t('Панорамный осмотр / CG-концепция','Panoramali ko‘rinish / CG-konsepsiya');
  $('about-title').textContent = t('О демонстрации','Namoyish haqida');
  for (const [id, text] of [['system-close',t('К предложению','Taklifga')],['scene-close',t('Закрыть панораму','Panoramani yopish')],['about-close',t('Закрыть','Yopish')]]) {
    $(id).innerHTML = escape(text) + icon('x'); $(id).setAttribute('aria-label',text);
  }
  $('about-content').innerHTML = `<p>${t('Сайт описывает предлагаемый учебный комплекс, а не готовую систему университета. Состав основан на предоставленных материалах и уточнениях заказчика. Коммерческих условий нет.','Sayt universitetning tayyor tizimini emas, taklif etilayotgan o‘quv kompleksini tasvirlaydi. Tarkib taqdim etilgan materiallar va buyurtmachi aniqliklariga asoslangan. Tijorat shartlari yo‘q.')}</p><p>${t('Панорамы являются CG-иллюстрациями. Реальный шлем и API E-reyting не подключены. Программа работает на вымышленных данных только в вашем браузере; роли не являются настоящей авторизацией.','Panoramalar CG-illyustratsiyalardir. Haqiqiy shlem va E-reyting API ulanmagan. Dastur faqat brauzeringizda xayoliy ma’lumotlar bilan ishlaydi; rollar haqiqiy avtorizatsiya emas.')}</p><p>${t('Сценарии добавляет разработчик, не преподаватель или администратор университета.','Ssenariylarni universitet o‘qituvchisi yoki administratori emas, ishlab chiquvchi qo‘shadi.')}</p><p><a href="https://mgjxu.uz/ru" target="_blank" rel="noopener">${t('Название и эмблема: официальный сайт клиента','Nomi va gerbi: mijozning rasmiy sayti')}</a></p><p>${t('Кнопки, состояния и SVG: предоставленный Cloudplus UI Pack.','Tugmalar, holatlar va SVG: taqdim etilgan Cloudplus UI Pack.')} <a href="./assets/UI-CREDITS.txt" target="_blank" rel="noopener">${t('UI-ресурсы','UI-manbalari')}</a>. <a href="./panorama/CREDITS.txt" target="_blank" rel="noopener">${t('Источники панорам','Panorama manbalari')}</a>.</p>`;
}
function render() {
  navigationObserver?.disconnect(); headerObserver?.disconnect(); previewObserver?.disconnect();
  const isSystemOpen = $('system-dialog').open;
  if (!isSystemOpen) systemRoot.remove();
  document.documentElement.lang = getLanguage();
  document.title = t('Учебный VR-комплекс · Предложение для университета','O‘quv VR-kompleksi · Universitet uchun taklif');
  $('proposal').innerHTML = renderProposal(getLanguage());
  $('scene-preview').addEventListener('load',syncPreviewMotion);
  previewObserver = new IntersectionObserver(entries=>{previewVisible=entries[0].isIntersecting;syncPreviewMotion();},{threshold:0.05});
  previewObserver.observe($('scene-preview'));
  if (!isSystemOpen) $('workspace-slot').append(systemRoot);
  const data = content();
  document.querySelector('.process-steps').innerHTML = data.stages.map((stage,i)=>`<button id="stage-${i}" role="tab" aria-controls="process-content" aria-selected="false" data-process-stage="${i}"><span class="stage-index">${String(i+1).padStart(2,'0')}</span><span>${stage[0]}</span>${icon('arrow-right')}</button>`).join('');
  $('module-overview').innerHTML = modules.map(item=>`<article><strong>${escape(getLanguage()==='uz'?item.uzTitle:item.title)}</strong><small>${escape(getLanguage()==='uz'?item.uzDescription:item.description)}</small></article>`).join('');
  selectScene(view.scene); selectStage(view.stage); selectRole(view.role); selectZone(view.zone,view.seat); selectArchitecture(view.architecture); selectPreview(view.preview); selectExchange(view.exchange);
  renderDialogCopy();
  if (workspace) updateSummary(workspace.getState());
  navigationObserver = new IntersectionObserver(() => {
    const line = document.querySelector('.header').getBoundingClientRect().bottom + 60;
    const section = [...document.querySelectorAll('main section[id]')].find(item=>{
      const rect = item.getBoundingClientRect(); return rect.top <= line && rect.bottom > line;
    });
    if (section) document.querySelectorAll('.navigation a').forEach(a=>a.classList.toggle('active',a.hash==='#'+section.id));
  },{rootMargin:'-140px 0px -55% 0px'});
  document.querySelectorAll('main section[id]').forEach(section=>navigationObserver.observe(section));
  headerObserver = new ResizeObserver(entries=>{ document.documentElement.style.setProperty('--header-offset',Math.ceil(entries[0].target.getBoundingClientRect().height+30)+'px'); });
  headerObserver.observe(document.querySelector('.header'));
  window.dispatchEvent(new Event('university-ui-ready'));
  document.querySelectorAll('iframe').forEach(frame=>frame.contentWindow?.postMessage({type:'university-panorama:language',language:getLanguage()},location.origin));
}
render();
workspace = mountWorkspace(systemRoot,{onOpenScene:openScene,onStateChange:updateSummary});
updateSummary(workspace.getState()); selectPreview(view.preview);
const dialogHeaderObserver = new ResizeObserver(entries=>{
  const height = entries[0].target.getBoundingClientRect().height;
  if (height > 0) $('system-dialog').style.setProperty('--system-toolbar-offset',Math.ceil(height)+'px');
});
dialogHeaderObserver.observe($('system-dialog').querySelector('.dialog-bar'));
subscribeLanguage(()=>{render(); document.querySelector('[data-language="'+getLanguage()+'"]').focus({preventScroll:true});});

document.addEventListener('click', event=>{
  if (event.composedPath().some(node=>node.hasAttribute?.('data-vr-workspace'))) return;
  const target = event.target.closest('button,[data-zone]');
  if (!target || target.disabled) return;
  if (target.dataset.language) setLanguage(target.dataset.language);
  else if (target.dataset.caseId) {presentationDemo=reducePresentationDemo(presentationDemo,{type:'case',value:target.dataset.caseId});renderSceneCases();selectStage(view.stage);selectArchitecture(view.architecture);selectPreview(view.preview);}
  else if (target.dataset.demoAction) handlePresentationAction(target);
  else if (target.dataset.inlineStage !== undefined) {selectStage(Number(target.dataset.inlineStage));$('process-content').scrollIntoView({block:'start',behavior:'auto'});}
  else if (target.dataset.inlineComponent) {selectArchitecture(target.dataset.inlineComponent);$('architecture-detail').scrollIntoView({block:'start',behavior:'auto'});}
  else if (target.dataset.openScene) openScene(target.dataset.openScene);
  else if (target.dataset.closeDialog) $(target.dataset.closeDialog).close();
  else if (target.dataset.sceneTab) selectScene(target.dataset.sceneTab);
  else if (target.dataset.processStage !== undefined) selectStage(Number(target.dataset.processStage));
  else if (target.dataset.role) selectRole(target.dataset.role);
  else if (target.dataset.zone) selectZone(target.dataset.zone,target.dataset.seat,true);
  else if (target.dataset.arch) selectArchitecture(target.dataset.arch);
  else if (target.dataset.preview) selectPreview(target.dataset.preview);
  else if (target.dataset.exchange) selectExchange(target.dataset.exchange);
  else if (target.id === 'expand-workspace') openModule(1);
  else if (target.id === 'open-about') showDialog('about-dialog');
});
document.addEventListener('input',event=>{
  if (!event.target.matches('[data-demo-note]')) return;
  presentationDemo = reducePresentationDemo(presentationDemo,{type:'note',value:event.target.value});
  const scope=event.target.dataset.demoScope;
  if(scope!=='process')selectStage(view.stage);
  if(scope!=='architecture')selectArchitecture(view.architecture);
  if(scope!=='preview')selectPreview(view.preview);
  const screen=event.target.closest('.demo-screen');
  const button=screen.querySelector('[data-demo-action="confirm"]');
  button.disabled=presentationDemo.phase!=='ended';button.innerHTML=icon('check-check')+t('Подтвердить пример','Namunani tasdiqlash');
  const status=screen.querySelector('.demo-bottom-line .demo-status');
  status.classList.remove('is-ok');status.innerHTML=icon('clock')+t('Ожидает проверки','Tekshiruv kutilmoqda');
  screen.querySelector('.demo-error')?.remove();
});
document.addEventListener('change',event=>{
  if(event.target.matches('[data-demo-case]'))handlePresentationAction(event.target,event.target.value);
});
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.addEventListener('close',()=>{
    if (dialog.id==='system-dialog') { $('workspace-slot').append(systemRoot); selectPreview(view.preview); }
    if (dialog.id==='scene-dialog') $('scene-frame-slot').replaceChildren();
    syncDialogLock();
    const previous = returnFocus.get(dialog); if (previous?.isConnected) previous.focus({preventScroll:true});
  });
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
});
document.addEventListener('keydown',event=>{
  if (event.composedPath().some(node=>node.hasAttribute?.('data-vr-workspace'))) return;
  const zone=event.target.closest('[data-zone]');
  if (zone && ['Enter',' '].includes(event.key)) {event.preventDefault();selectZone(zone.dataset.zone,zone.dataset.seat,true);return;}
  const tab=event.target.closest('[role=tab]');
  if (!tab || !['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
  const list=Array.from(tab.closest('[role=tablist]').querySelectorAll('[role=tab]')); let index=list.indexOf(tab);
  index=event.key==='Home'?0:event.key==='End'?list.length-1:(index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+list.length)%list.length;
  event.preventDefault(); list[index].click(); list[index].focus();
});
window.addEventListener('message',event=>{
  if (event.origin !== location.origin) return;
  const fullFrame=$('scene-frame-slot').querySelector('iframe');
  if (event.source !== $('scene-preview').contentWindow && (!fullFrame || event.source !== fullFrame.contentWindow)) return;
  if (event.data?.type==='university-panorama:module' && event.data.moduleId===8) { $('scene-dialog').close(); selectArchitecture('teacher'); requestAnimationFrame(()=>$('architecture-detail').scrollIntoView({block:'start',behavior:'auto'})); return; }
  if (event.data?.type!=='university-panorama:scene') return;
  const id=event.data.sceneId;
  if (!Object.hasOwn(content().scenes,id) && id!=='classroom') return;
  if (event.source === $('scene-preview').contentWindow && content().scenes[id]) selectScene(id,false);
  if (fullFrame && event.source === fullFrame.contentWindow) { $('scene-dialog-title').textContent=sceneTitle(id); fullFrame.title=sceneTitle(id); }
});
const initialAnchor = document.getElementById(location.hash.slice(1));
if (initialAnchor) requestAnimationFrame(()=>initialAnchor.scrollIntoView({block:'start',behavior:'auto'}));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target);}
}),{threshold:.1});
document.querySelectorAll('.slide').forEach(section=>revealObserver.observe(section));
window.addEventListener('pagehide',()=>revealObserver.disconnect(),{once:true});
