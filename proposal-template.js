import { proposalContent } from './proposal-content.js?v=proposal20261027-r13cardsroom';
import { PANORAMA_MEDIA } from './panorama/media.js?v=proposal20261027-r13cardsroom';
import { renderClassroomPlan } from './classroom-plan.js?v=proposal20261027-r13cardsroom';
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const icon = name => `<svg class="i" aria-hidden="true"><use href="./assets/ui-icons/sprite.svg#i-${name}"></use></svg>`;

export function renderProposal(language) {
  const t = (ru, uz) => language === 'uz' ? uz : ru;
  const data = proposalContent(language);
  const heading = (n, label, title, text) => `<div class="section-heading"><div><p class="eyebrow">${n} / ${label}</p><h2>${title.replaceAll('E-reyting','<span class="nowrap">E-reyting</span>')}</h2></div><p>${text}</p></div>`;
  const languageButton = value => `<button type="button" data-language="${value}" aria-pressed="${language === value}" aria-label="${value === 'ru' ? t('Русский язык','Rus tili') : t('Узбекский язык',"O'zbek tili")}">${value.toUpperCase()}</button>`;
  return `
  <a class="skip-link" href="#purpose">${t('К предложению','Taklifga o‘tish')}</a>
  <header class="header wrap">
    <div class="header-top">
      <a class="identity" href="#purpose"><img src="./assets/university-logo.png" width="56" height="56" alt="${t('Эмблема с официального сайта университета','Universitet rasmiy saytidagi gerb')}"><span>${t('Университет общественной безопасности','Jamoat xavfsizligi universiteti')}<small>${t('Республика Узбекистан','O‘zbekiston Respublikasi')}</small></span></a>
      <div class="header-actions"><div class="language-switch" role="group" aria-label="${t('Язык предложения и программы','Taklif va dastur tili')}">${languageButton('ru')}${languageButton('uz')}</div><a class="btn btn--primary demo-entry" href="#demo" id="expand-workspace">${icon('monitor')}${t('Демо программы','Dastur demosi')}${icon('arrow-up-right')}</a></div>
    </div>
    <nav class="navigation" aria-label="${t('Разделы предложения','Taklif bo‘limlari')}">${data.nav.map(item => `<a href="#${item.id}">${item.title}</a>`).join('')}</nav>
  </header>
  <main>
    <section class="hero slide wrap" id="purpose">
      <div class="hero-copy"><p class="eyebrow">CLOUDPLUS / ${t('ПРЕДЛОЖЕНИЕ ПО РАЗРАБОТКЕ','ISHLAB CHIQISH TAKLIFI')}</p><h1>${t('Учебный комплекс','O‘quv kompleksi')}<span>${t('для практической подготовки','amaliy tayyorgarlik uchun')}</span></h1><p class="lead">${t('Практика в четырех средах Узбекистана. Задания, наблюдение, разбор и передача результатов в <span class="nowrap">E-reyting</span>.','O‘zbekistonning to‘rtta muhitida amaliyot. Topshiriq, kuzatish, tahlil va natijalarni <span class="nowrap">E-reyting</span>ga uzatish.')}</p><div class="hero-actions"><a class="btn btn--primary btn--lg" href="#workspace">${t('Как работает комплекс','Kompleks qanday ishlaydi')} ${icon('arrow-right')}</a><a class="text-button" href="#environment-courtyard">${t('Осмотреть учебные среды','O‘quv muhitlarini ko‘rish')} ${icon('eye')}</a></div><div class="hero-facts"><a href="#workspace"><b>14</b><span>${t('рабочих модулей','ishchi modul')}</span></a><a href="#environment-courtyard"><b>4</b><span>${t('учебные среды','o‘quv muhiti')}</span></a><a href="#roles"><b>3</b><span>${t('роли пользователей','foydalanuvchi roli')}</span></a></div></div>
      <div class="hero-mosaic" aria-label="${t('Четыре учебные среды','To‘rtta o‘quv muhiti')}">${Object.entries(data.scenes).map(([id,item],i)=>`<a href="#environment-${id}" class="mosaic-tile"><img src="${PANORAMA_MEDIA[id].src}" width="1774" height="887" alt="" ${i?'loading="lazy"':'fetchpriority="high"'}><span><small>0${i+1}</small><strong>${item.title}</strong>${icon('arrow-up-right')}</span></a>`).join('')}</div>
      <div class="hero-benefits">${[
        ['layout-grid',t('Повторяемые упражнения','Takrorlanadigan mashqlar'),t('Одинаковая версия задания для группы.','Guruh uchun bir xil topshiriq versiyasi.')],
        ['history',t('История действий','Harakatlar tarixi'),t('События и контрольные точки каждой попытки.','Har bir urinishning hodisalari va nazorat nuqtalari.')],
        ['check-check',t('Проверенный результат','Tekshirilgan natija'),t('Разбор и подтверждение преподавателем.','O‘qituvchi tahlili va tasdig‘i.')]
      ].map(item=>`<article>${icon(item[0])}<div><h3>${item[1]}</h3><p>${item[2]}</p></div></article>`).join('')}</div>
    </section>
    <section class="slide wrap" id="workspace">
      ${heading('02',t('О программе','Dastur haqida'),t('Подготовить. Провести. Разобрать.','Tayyorlash. O‘tkazish. Tahlil qilish.'),t('Преподаватель выбирает задание, наблюдает за практикой и проверяет результат. Курсант, сценарий и события занятия связаны между собой.','O‘qituvchi topshiriqni tanlaydi, amaliyotni kuzatadi va natijani tekshiradi. Kursant, ssenariy va mashg‘ulot hodisalari bir-biri bilan bog‘langan.'))}
      <div id="process" class="program-workflow">            <p class="interaction-hint">${icon('info')}${t('У каждого этапа свой интерактивный экран','Har bir bosqichning o‘z interaktiv ekrani bor')}</p>
      <div class="process-layout"><div class="process-steps" role="tablist" aria-label="${t('Этапы занятия','Mashg‘ulot bosqichlari')}" aria-orientation="vertical"></div><article id="process-content" role="tabpanel"></article></div></div>
      <details class="module-details assessment-details"><summary>${t('Как оцениваются действия','Harakatlar qanday baholanadi')}${icon('plus')}</summary><div class="program-assessment" id="assessment">            <div class="assessment-layout"><div class="assessment-principles">${[
        [t('Критерии упражнения','Mashq mezonlari'),t('Контрольные точки, последовательность и вес показателей.','Nazorat nuqtalari, ketma-ketlik va ko‘rsatkichlar ulushi.')],
        [t('События попытки','Urinish hodisalari'),t('Выполненные действия, время и пропуски доступны для разбора.','Bajarilgan harakatlar, vaqt va o‘tkazib yuborilgan nuqtalar tahlil uchun mavjud.')],
        [t('Решение преподавателя','O‘qituvchi qarori'),t('Комментарий, подтверждение или повторная подготовка.','Izoh, tasdiqlash yoki qayta tayyorgarlik.')]
      ].map(([title,text],i)=>`<article><span class="step-dot">0${i+1}</span><div><h3>${title}</h3><p>${text}</p></div></article>`).join('')}<button class="btn btn--soft" data-inline-stage="5">${t('Попробовать расчет','Hisobni sinab ko‘rish')} ${icon('arrow-right')}</button></div><div class="assessment-live"><p class="eyebrow">${t('Пример карточки / учебные данные','Karta namunasi / o‘quv ma’lumotlari')}</p><div id="assessment-summary"></div><a class="text-button" href="#integration">${t('Подготовка результата для E-reyting','Natijani E-reyting uchun tayyorlash')} ${icon('arrow-right')}</a></div></div></div></details>
      <details class="module-details"><summary>${t('Состав программы: 14 модулей','Dastur tarkibi: 14 modul')}${icon('plus')}</summary><div id="module-overview" class="module-overview"></div></details>

      <div id="workspace-slot" hidden></div>

      <div class="role-block" id="roles"><p class="eyebrow">${t('Ответственность участников','Ishtirokchilar mas’uliyati')}</p><div class="role-tabs" role="tablist" aria-label="${t('Роли пользователей','Foydalanuvchi rollari')}">${Object.entries(data.roles).map(([id,item],i)=>`<button id="role-${id}" role="tab" aria-selected="${i===0}" aria-controls="role-panel" data-role="${id}">${item[0]}</button>`).join('')}</div><article class="role-panel" id="role-panel" role="tabpanel" aria-labelledby="role-teacher"></article></div>

    </section>
    ${Object.keys(data.scenes).map((id,i)=>`<section class="slide wrap environment-slide ${i%2?'tinted':''}" id="environment-${id}" data-environment="${id}"><div class="environment-heading"><div><p class="eyebrow">0${i+3} / ${t('ПРОСТРАНСТВО ДЛЯ ПРАКТИКИ','AMALIYOT MUHITI')} / 0${i+1}</p><h2>${data.scenes[id].title}</h2><p>${data.scenes[id].description}</p></div><span class="environment-count">5 ${t('ситуаций','vaziyat')} · 5 ${t('действий','harakat')}</span></div><div id="environment-content-${id}"></div></section>`).join('')}
    <section class="slide wrap tinted" id="integration">
      ${heading('07',t('Интеграция','Integratsiya'),t('VR-практика в учебном учете E-reyting','VR-amaliyot E-reyting o‘quv hisobida'),t('Подтвержденный результат связывается с курсантом, группой, дисциплиной и версией упражнения. Преподаватель видит, что готово к передаче и какой ответ получен.','Tasdiqlangan natija kursant, guruh, fan va mashq versiyasi bilan bog‘lanadi. Tizim ma’lumotlar tarkibini tekshiradi va qayta ishlash holatini saqlaydi.'))}
      <div class="exchange-flow">${[
        ['users',t('Связать данные','Ma’lumotlarni bog‘lash'),t('Курсант, группа, дисциплина','Kursant, guruh, fan')],
        ['check-check',t('Проверка','Tekshirish'),t('Подтверждение и обязательные поля','Tasdiq va majburiy maydonlar')],
        ['arrow-up-down',t('Пакет результатов','Natijalar paketi'),t('Состав и способ передачи','Tarkib va uzatish usuli')],
        ['history',t('Получить ответ','Javob olish'),t('Ответ, ошибка, повтор','Javob, xato, qayta urinish')]
      ].map(([ico,title,text],i)=>`<article>${icon(ico)}<span class="exchange-number">0${i+1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
      <div class="exchange-panel"><div><p class="eyebrow">${t('Способ передачи','Uzatish usuli')}</p><div class="exchange-tabs" role="tablist" aria-label="${t('Способ обмена','Almashuv usuli')}"><button id="exchange-api" role="tab" aria-selected="true" aria-controls="exchange-detail" data-exchange="api">API</button><button id="exchange-file" role="tab" aria-selected="false" aria-controls="exchange-detail" data-exchange="file">Excel / CSV</button></div><article id="exchange-detail" role="tabpanel" aria-labelledby="exchange-api"></article><button class="btn btn--primary" data-open-exchange>${t('Проверить пример пакета','Paket namunasini tekshirish')} ${icon('arrow-right')}</button></div><div class="exchange-record"><h3>${t('Какие данные передаем','Qanday ma’lumot uzatiladi')}</h3><dl>${[
        [t('Участник','Ishtirokchi'),t('Код курсанта и учебная группа','Kursant kodi va o‘quv guruhi')],
        [t('Учебная связь','O‘quv bog‘lanishi'),t('Дисциплина и упражнение','Fan va mashq')],
        [t('Основание','Asos'),t('Версия сценария и номер попытки','Ssenariy versiyasi va urinish raqami')],
        [t('Результат','Natija'),t('Баллы, дата и подтверждение преподавателя','Ball, sana va o‘qituvchi tasdig‘i')],
        [t('Контроль','Nazorat'),t('Идентификатор пакета и статус обработки','Paket identifikatori va qayta ishlash holati')]
      ].map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl></div></div>
      <div class="exchange-checks"><div>${icon('shield-check')}<strong>${t('Непроверенные результаты не передаются','Tekshirilmagan natijalar uzatilmaydi')}</strong></div><div>${icon('history')}<strong>${t('Повторы и ошибки видны в журнале','Takrorlar va xatolar jurnalda ko‘rinadi')}</strong></div></div>
      <p class="note">${t('В демонстрации работают локальные сопоставления, проверка и подготовка пакета. Реальный API не подключен; формат и доступ согласуются с владельцем E-reyting.','Namoyishda mahalliy moslashtirish, tekshirish va paket tayyorlash ishlaydi. Haqiqiy API ulanmagan; format va kirish E-reyting egasi bilan kelishiladi.')}</p>
      <details class="module-details"><summary>${t('Попробовать подготовку результата для E-reyting','E-reyting uchun natija tayyorlashni sinash')}${icon('plus')}</summary><div class="program-assessment" id="integration-example"></div></details>
    </section>
    <section class="slide wrap" id="classroom">
      ${heading('08',t('Аудитория','Auditoriya'),t('VR на каждом рабочем месте','Har bir ish joyida VR'),t('Рабочие места курсантов, компьютер преподавателя и общий экран. Нажмите на элемент схемы, чтобы посмотреть его роль в занятии.','Kursantlar ish joylari, o‘qituvchi kompyuteri va umumiy ekran. Mashg‘ulotdagi vazifasini ko‘rish uchun sxema elementini bosing.'))}
      <div class="classroom-layout">${renderClassroomPlan(language)}<article class="classroom-detail" id="classroom-detail" aria-live="polite"></article></div>
      <p class="note">${t('Расстановка и число одновременно работающих комплектов уточняются после обмера аудитории и проверки оборудования.','Joylashuv va bir vaqtda ishlaydigan to‘plamlar soni xona o‘lchanib, jihozlar tekshirilgandan keyin aniqlanadi.')}</p>
    </section>
    <section class="slide wrap tinted" id="architecture">
      ${heading('09',t('Состав и внедрение','Tarkib va joriy etish'),t('Единый учебный комплекс','Yagona o‘quv kompleksi'),t('Выберите компонент: ниже откроется его экран с действиями. Примеры показывают, как связаны преподаватель, учебные данные, практика и результаты.','Komponentni tanlang: pastda uning amallar mavjud ekrani ochiladi. Namunalar o‘qituvchi, o‘quv ma’lumotlari, amaliyot va natijalar qanday bog‘langanini ko‘rsatadi.'))}
      <div class="architecture-map">${Object.entries(data.architecture).map(([id,item])=>`<button data-arch="${id}" aria-pressed="${id==='teacher'}">${icon(item[4])}<strong>${item[0]}</strong><small>${item[1]}</small></button>`).join('')}</div><article id="architecture-detail"></article>
      <div class="delivery-steps" role="group" aria-label="${t('Этапы внедрения','Joriy etish bosqichlari')}">${[
        [t('Методика','Metodika'),t('Учебные цели, сценарии, роли и критерии с ответственными от университета.','Universitet mas’ullari bilan o‘quv maqsadlari, ssenariylar, rollar va mezonlar.')],
        [t('Проверка на оборудовании','Jihozlarda tekshirish'),t('Одна сцена, оценка графики, производительности и понятности занятия.','Bitta sahna, grafika, unumdorlik va mashg‘ulot tushunarliligini baholash.')],
        [t('Разработка комплекса','Kompleksni ishlab chiqish'),t('Программа преподавателя, VR-клиент, история и согласованный обмен.','O‘qituvchi dasturi, VR-mijoz, tarix va kelishilgan almashuv.')],
        [t('Испытания и обучение','Sinov va o‘qitish'),t('Проверка сценариев, подготовка аудитории и обучение пользователей.','Ssenariylarni tekshirish, auditoriyani tayyorlash va foydalanuvchilarni o‘qitish.')]
      ].map(([title,text],i)=>`<button type="button" class="delivery-step-button" data-delivery="${i}" aria-pressed="${i===0}"><span>0${i+1}</span><h3>${title}</h3><p>${text}</p></button>`).join('')}</div><div class="delivery-output" id="delivery-output" aria-live="polite"></div>
    </section>
  </main>
  <footer class="footer wrap"><span><b>CLOUDPLUS</b> / ${t('Учебный VR-комплекс','O‘quv VR-kompleksi')}</span><button class="text-button" id="open-about">${t('О демонстрации и источниках','Namoyish va manbalar haqida')}</button></footer>`;
}
