import { scenarioLibrary } from './scenario-library.js?v=sales20261027-r1';
import { SCENARIO_FRAMES } from './scenario-visuals.js?v=sales20261027-r1';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const PILOT_CASES = ['market-01', 'entrance-01', 'traffic-01'];
export function pilotPlan(caseId = PILOT_CASES[0], language = 'ru') {
  if (!PILOT_CASES.includes(caseId)) throw new RangeError('Unknown pilot case');
  const t = (ru, uz) => language === 'uz' ? uz : ru;
  const item = scenarioLibrary.find(entry => entry.id === caseId);
  const title = language === 'uz' ? item.uzTitle : item.title;
  const steps = [
    t('Согласовать цель, учебную группу и критерии с преподавателем.', 'Maqsad, o‘quv guruhi va mezonlarni o‘qituvchi bilan kelishish.'),
    t('Показать учебную сцену и пройти пять действий курсанта.', 'O‘quv sahnasini ko‘rsatish va kursantning beshta amalini bajarish.'),
    t('Открыть журнал, обсудить пропуски и повторить сложный момент.', 'Jurnalni ochish, o‘tkazilgan nuqtalarni muhokama qilish va murakkab joyni takrorlash.'),
    t('Определить состав класса, оборудование и следующий этап разработки.', 'Xona tarkibi, jihozlar va keyingi ishlab chiqish bosqichini belgilash.')
  ];
  const note = t('Дата, оборудование и условия пробного занятия согласуются отдельно. Этот план не является записью на встречу или коммерческим предложением по цене.', 'Sana, jihozlar va sinov mashg‘uloti shartlari alohida kelishiladi. Bu reja uchrashuvga yozilish yoki narx taklifi emas.');
  return { caseId, language, title, summary: language === 'uz' ? item.uzSummary : item.summary, steps, note,
    text: [t('План пробного занятия / Учебный VR-комплекс', 'Sinov mashg‘uloti rejasi / O‘quv VR-kompleksi'), title, '', ...steps.map((step, index) => `${index+1}. ${step}`), '', note].join('\n') };
}
export function renderPilotPlan(caseId, language) {
  const plan = pilotPlan(caseId, language), t = (ru, uz) => language === 'uz' ? uz : ru;
  return `<div class="pilot-options" role="group" aria-label="${t('Ситуация для пробного занятия', 'Sinov mashg‘uloti vaziyati')}">${PILOT_CASES.map(id => `<button type="button" data-pilot-case="${id}" aria-pressed="${id === caseId}">${t({ 'market-01':'Ребенок на базаре','entrance-01':'Запах гари','traffic-01':'Дорожный переход' }[id],{ 'market-01':'Bozordagi bola','entrance-01':'Kuygan hid','traffic-01':'Yo‘l o‘tish joyi' }[id])}</button>`).join('')}</div><div class="pilot-summary"><img src="${SCENARIO_FRAMES[caseId][0].src}" width="1774" height="887" alt=""><div><p class="eyebrow">${t('ОДНА ГРУППА / ОДНА СИТУАЦИЯ', 'BITTA GURUH / BITTA VAZIYAT')}</p><h3>${escape(plan.title)}</h3><p>${escape(plan.summary)}</p></div></div><ol class="pilot-plan">${plan.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol><div class="pilot-download"><button class="btn btn--primary" type="button" id="download-pilot">${t('Скачать план занятия', 'Mashg‘ulot rejasini yuklash')}</button><small id="pilot-download-status" role="status">${t('План можно обсудить с командой. Дата еще не назначена.', 'Rejani jamoa bilan muhokama qilish mumkin. Sana hali belgilanmagan.')}</small></div>`;
}
