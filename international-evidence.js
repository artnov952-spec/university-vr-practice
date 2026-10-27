const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const INTERNATIONAL_EXAMPLES = [
  { code:'UK', country:['Великобритания','Buyuk Britaniya'], organization:'Dyfed-Powys Police', status:['Практика / 2025','Amaliyot / 2025'],
    description:['VR и видео 360° применяют в начальной подготовке полицейских.','VR va 360° video politsiyachilarning boshlang‘ich tayyorgarligida ishlatiladi.'],
    benefit:['Можно показать ситуации, которые сложно воссоздать в обычном классе.','Oddiy xonada yaratish qiyin bo‘lgan vaziyatlarni ko‘rsatish mumkin.'],
    url:'https://www.dyfed-powys.police.uk/foi-ai/dyfed-powys-police/disclosure-2025/november/virtual-realitymixed-reality-10512025/' },
  { code:'US', country:['США','AQSh'], organization:'DOJ / 16.054', status:['Федеральная программа','Federal dastur'],
    description:['Программа поддерживает сценарное VR-обучение общению с людьми в кризисе.','Dastur inqirozdagi odamlar bilan muloqot bo‘yicha vaziyatli VR-ta’limni qo‘llab-quvvatlaydi.'],
    benefit:['Цель: отрабатывать спокойное разрешение конфликтов.','Maqsad: nizolarni xotirjam hal qilishni mashq qilish.'],
    url:'https://fpi.omb.gov/program/16.054.html' },
  { code:'DE', country:['Германия','Germaniya'], organization:'HöMS / Hessen', status:['Учебный тренажер / 2025','O‘quv trenajyori / 2025'],
    description:['VR-тренажер дополняет подготовку полицейских в Гессене.','VR-trenajyor Gessendagi politsiya tayyorgarligini to‘ldiradi.'],
    benefit:['Преподаватель меняет условия и разбирает выполненную попытку.','O‘qituvchi sharoitlarni o‘zgartiradi va bajarilgan urinishni tahlil qiladi.'],
    url:'https://innen.hessen.de/presse/neue-virtual-reality-trainingsanlage-fuer-polizeiliches-situationstraining-an-der-hoems-eroeffnet' },
  { code:'NL', country:['Нидерланды','Niderlandiya'], organization:'Politie / Vrije Universiteit', status:['Исследование SHOTPROS','SHOTPROS tadqiqoti'],
    description:['Полиция и университет исследовали VR как дополнение к действующей подготовке.','Politsiya va universitet VR’ni mavjud tayyorgarlikka qo‘shimcha sifatida o‘rgandi.'],
    benefit:['VR проверяют на задачах полицейской подготовки.','VR politsiya tayyorgarligi vazifalarida tekshiriladi.'],
    url:'https://aiss.nl/project/vr-politie/' },
  { code:'AT', country:['Австрия','Avstriya'], organization:'SIAK / SHOTPROS', status:['Пилотные тренировки / 2022','Sinov mashg‘ulotlari / 2022'],
    description:['Команды отрабатывали принятие решений в сложной обстановке.','Jamoalar murakkab vaziyatda qaror qabul qilishni mashq qildi.'],
    benefit:['Ситуации можно повторять с меньшим числом статистов и реквизита.','Vaziyatlarni kamroq yordamchi aktyor va jihoz bilan takrorlash mumkin.'],
    url:'https://www.bmi.gv.at/magazinfiles/2022/05_06/28_virtuelles_training.pdf' },
  { code:'SG', country:['Сингапур','Singapur'], organization:'Singapore Police Force / MobiC', status:['Мобильный класс / 2025','Mobil sinf / 2025'],
    description:['Мобильный класс доставляет VR-сценарии к месту подготовки полицейских.','Mobil sinf VR-ssenariylarni politsiyachilar tayyorlanadigan joyga olib boradi.'],
    benefit:['Учебные ситуации доступны в мобильном формате.','O‘quv vaziyatlari mobil shaklda mavjud.'],
    url:'https://www.mha.gov.sg/stories/stories-collection/reflections-from-the-home-team-part-1--the-future-firefighter-and-the-tech-amplifier/' }
];

export function renderInternationalEvidence(language='ru') {
  const index=language==='uz'?1:0, t=(ru,uz)=>index?uz:ru;
  return `<details class="international-evidence" id="international-experience"><summary><span>${t('Международный опыт VR-подготовки','VR-tayyorgarlik bo‘yicha xalqaro tajriba')}</span><small>${t('6 стран / практика и исследования','6 mamlakat / amaliyot va tadqiqotlar')}</small><svg class="i" aria-hidden="true"><use href="./assets/ui-icons/sprite.svg#i-plus"></use></svg></summary><div class="international-content"><p class="international-intro">${t('Где применяют и исследуют этот подход. В каждом примере указан источник и статус проекта.','Bu yondashuv qayerda qo‘llanadi va o‘rganiladi. Har bir misolda manba va loyiha holati ko‘rsatilgan.')}</p><div class="international-grid">${INTERNATIONAL_EXAMPLES.map(item=>`<article data-evidence-country="${item.code}"><div class="international-country"><span aria-hidden="true">${item.code}</span><div><h3>${escape(item.country[index])}</h3><small>${escape(item.status[index])}</small></div></div><p>${escape(item.description[index])}</p><p class="international-benefit">${escape(item.benefit[index])}</p><a href="${item.url}" target="_blank" rel="noopener">${escape(item.organization)} <svg class="i" aria-hidden="true"><use href="./assets/ui-icons/sprite.svg#i-arrow-up-right"></use></svg></a></article>`).join('')}</div><div class="international-outcomes"><h3>${t('Эффект проверим на пробном занятии','Natijani sinov mashg‘ulotida tekshiramiz')}</h3><p>${t('Сравним первую и повторную попытку: пропущенные действия, их порядок и итоговый результат. Так университет оценит изменения на своей учебной группе.','Birinchi va takroriy urinishni solishtiramiz: o‘tkazilgan amallar, ularning tartibi va yakuniy natija. Shu orqali universitet o‘z o‘quv guruhidagi o‘zgarishlarni baholaydi.')}</p><details><summary>${t('Что известно о процентах улучшения','Yaxshilanish foizlari haqida nima ma’lum')}</summary><p>${t('В этих источниках нет единого процента, который можно перенести на наш комплекс. В пилотном отчете RAND/NIJ результаты описательные; перенос навыков в реальную работу требует отдельной проверки.','Ushbu manbalarda bizning kompleksga ko‘chirish mumkin bo‘lgan yagona foiz yo‘q. RAND/NIJ sinov hisobotida natijalar tavsifiy; ko‘nikmalarning haqiqiy ishga o‘tishi alohida tekshiruvni talab qiladi.')} <a href="https://ojp.gov/pdffiles1/nij/grants/309395.pdf" target="_blank" rel="noopener">RAND / NIJ, 2024</a>.</p></details></div><p class="international-note">${t('Это примеры подхода, а не партнеры проекта и не гарантия результатов предлагаемого комплекса.','Bular yondashuv misollari, loyiha hamkorlari yoki taklif etilayotgan kompleks natijalarining kafolati emas.')}</p></div></details>`;
}
