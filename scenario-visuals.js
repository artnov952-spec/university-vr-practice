import { scenarioLibrary } from './scenario-library.js?v=proposal20261027-r8final';
import { PANORAMA_MEDIA } from './panorama/media.js?v=proposal20261027-r8final';

// Coordinates are in the original 2:1 image, shared by the inline and spherical views.
const atlas = (name) => ({ src: `./assets/scenario/${name}-r8.png`, width: 1774, height: 887 });
export const VISUAL_ATLASES = Object.freeze(Object.fromEntries(['people', 'outdoor', 'interior', 'traffic'].map(name => [name, atlas(name)])));
const definitions = {
  people: ['organizer', 'wheelchair', 'stroller', 'elder', 'worker', 'woman', 'child', 'administrator'],
  outdoor: ['table', 'hose', 'barrier', 'planks', 'fan', 'notice', 'water', 'cleaner'],
  interior: ['cabinet', 'lift', 'wardrobe', 'intercom', 'threshold', 'glass', 'trolley', 'seated'],
  traffic: ['van', 'advert', 'signal', 'bus', 'parent', 'car', 'collision', 'queue']
};
const feet = { table:.81, hose:.65, barrier:.75, planks:.86, cabinet:.89, intercom:.9, glass:.88, van:.94, advert:.93, car:.84, collision:.83, queue:.89 };
const verticalScale = {table:.6,hose:.65,barrier:.75,planks:.65,van:.8,car:.8,collision:.8};
export const VISUAL_SPRITES = Object.freeze(Object.fromEntries(Object.entries(definitions).flatMap(([sheet, names]) => names.map((name, i) => [name, {
  sheet, rect: [(i % 4) * 443.5, Math.floor(i / 4) * 443.5, 443.5, 443.5], foot: feet[name] || .97, verticalScale:verticalScale[name] || 1
}]))));
// Vehicle silhouettes use slightly wider source rectangles; they remain separate in the atlas.
VISUAL_SPRITES.van.rect = [0, 0, 475, 443.5];
VISUAL_SPRITES.bus.rect = [1215, 0, 559, 443.5];
VISUAL_SPRITES.car.rect = [443.5, 443.5, 452, 443.5];
VISUAL_SPRITES.collision.rect = [880, 443.5, 496, 443.5];
VISUAL_SPRITES.queue.rect = [1376, 443.5, 398, 443.5];
const p = (sprite, x, y, width, id = sprite) => ({ id, sprite, x, y, width });
const remove = (...ids) => ids.map(id => ({ id, remove: true }));

// A step describes the visible teaching consequence, not recognition of a real-world action.
// Later consequences require a continuous prefix of recorded checkpoints. A skipped checkpoint
// therefore cannot make a hazard disappear merely because the final button was pressed.
export const VISUAL_SCRIPTS = Object.freeze({
  'courtyard-01': [
    [p('table',53,85,35),p('wheelchair',40,85,13),p('stroller',73,84,15)],
    [p('organizer',63,82,13),p('woman',81,84,12),p('hose',56,92,25)],
    [p('hose',22,89,15),p('worker',31,82,12)],
    [p('table',20,83,25),p('wheelchair',51,82,12),p('stroller',64,82,13)],
    [p('wheelchair',57,70,7),p('stroller',66,71,8),p('organizer',31,80,12),...remove('worker','woman')]
  ],
  'courtyard-02': [
    [p('elder',49,84,14)],
    [p('woman',62,85,13)],
    [p('organizer',72,83,13),p('woman',61,85,13)],
    [p('administrator',35,84,13),p('organizer',77,77,11)],
    [p('elder',54,73,9),p('woman',62,74,9),p('administrator',39,80,11)]
  ],
  'courtyard-03': [
    [p('woman',48,84,13)],
    [p('organizer',63,83,13),p('cleaner',77,85,16)],
    [p('fan',70,76,14),p('organizer',35,78,11)],
    [p('worker',77,83,12),p('cleaner',29,83,14)],
    [p('woman',52,81,12),p('administrator',63,81,12),...remove('organizer')]
  ],
  'courtyard-04': [
    [p('planks',55,90,29),p('parent',71,83,13)],
    [p('barrier',48,86,23),p('parent',76,84,13)],
    [p('worker',36,83,13),p('planks',57,91,29)],
    [p('barrier',53,85,28),p('parent',78,78,11)],
    [p('worker',65,83,13),p('administrator',35,82,12)]
  ],
  'courtyard-05': [
    [p('water',54,83,20),p('queue',72,85,22)],
    [p('administrator',38,83,13)],
    [p('woman',63,83,13),p('queue',80,80,17)],
    [p('notice',45,83,14),p('administrator',55,83,13)],
    [p('worker',66,82,12),p('queue',78,73,11),p('woman',36,80,12)]
  ],
  'entrance-01': [
    [p('cabinet',70,60,13),p('woman',47,88,16)],
    [p('administrator',31,88,16)],
    [p('barrier',61,91,30),p('woman',31,86,14)],
    [p('smoke',71,55,20),p('woman',23,89,15)],
    [p('worker',48,87,16),p('administrator',35,88,15)]
  ],
  'entrance-02': [
    [p('lift',66,80,26),p('organizer',42,88,16)],
    [p('administrator',27,88,15)],
    [p('organizer',36,89,16),p('barrier',58,91,24)],
    [p('woman',23,90,15),p('administrator',39,88,15)],
    [p('worker',51,90,16),p('organizer',25,86,14)]
  ],
  'entrance-03': [
    [p('wardrobe',56,90,29),p('elder',34,89,16)],
    [p('trolley',76,88,21),p('organizer',68,88,16)],
    [p('barrier',47,93,22),p('trolley',79,85,18)],
    [p('worker',40,89,15),p('wardrobe',76,87,22),...remove('barrier')],
    [p('wardrobe',84,82,18),p('elder',51,80,12),p('worker',65,86,14)]
  ],
  'entrance-04': [
    [p('intercom',73,52,9),p('worker',51,89,16)],
    [p('administrator',32,88,15)],
    [p('worker',68,88,15),p('woman',44,88,15)],
    [p('organizer',29,88,15),p('woman',47,86,14)],
    [p('administrator',54,87,15),p('worker',68,84,14)]
  ],
  'entrance-05': [
    [p('threshold',57,91,22),p('elder',37,89,16)],
    [p('notice',45,83,14),p('woman',69,88,15)],
    [p('threshold',62,91,26),p('barrier',50,93,25)],
    [p('worker',74,88,15),p('elder',32,90,16)],
    [p('notice',52,83,14),p('administrator',46,89,15),p('woman',24,88,15)]
  ],
  'traffic-01': [
    [p('van',56,79,34),p('parent',29,88,15)],
    [p('organizer',85,86,14)],
    [...remove('van'),p('advert',57,80,15)],
    [p('worker',87,85,14),p('advert',79,79,12)],
    [p('parent',31,84,13),p('organizer',84,77,11),...remove('worker')]
  ],
  'traffic-02': [
    [p('signal',61,74,25),p('parent',32,87,15)],
    [p('administrator',25,87,14),p('van',76,72,22)],
    [p('bus',65,79,31),p('van',84,76,24)],
    [p('worker',32,86,14),p('parent',26,85,14)],
    [p('administrator',29,85,14),p('worker',35,83,13)]
  ],
  'traffic-03': [
    [p('bus',62,76,35),p('queue',29,88,25)],
    [p('organizer',85,87,14),p('elder',29,87,14)],
    [p('bus',81,73,23,'bus-2'),p('wet',52,91,26)],
    [p('queue',28,85,22),p('elder',35,84,13)],
    [p('queue',33,78,17),p('elder',36,79,11),p('organizer',84,84,13)]
  ],
  'traffic-04': [
    [p('car',58,79,34),p('queue',86,88,20)],
    [p('organizer',31,87,14),p('queue',85,84,17)],
    [p('administrator',26,87,14)],
    [p('dusk',50,100,100),p('queue',28,84,16)],
    [p('worker',34,86,14),p('administrator',26,85,14)]
  ],
  'traffic-05': [
    [p('collision',59,79,41),p('organizer',31,88,14)],
    [p('administrator',29,87,14)],
    [p('woman',87,87,14),p('organizer',25,85,13)],
    [p('administrator',33,86,14),p('woman',85,85,13)],
    [p('worker',34,87,14),p('organizer',27,80,11),p('woman',84,81,11)]
  ],
  'market-01': [
    [p('child',51,85,19)],
    [p('administrator',33,86,14)],
    [p('organizer',72,84,14)],
    [p('worker',65,85,14),p('organizer',80,79,12)],
    [p('woman',42,84,14),p('child',53,82,17),p('administrator',32,81,12)]
  ],
  'market-02': [
    [p('queue',46,85,25),p('trolley',64,86,19),p('rain',50,100,100)],
    [p('worker',28,85,14),p('administrator',78,85,14)],
    [p('wet',62,92,31),p('threshold',74,90,18)],
    [p('queue',39,83,21),p('trolley',78,84,17)],
    [p('queue',54,74,13),p('trolley',75,75,12),p('worker',35,82,12)]
  ],
  'market-03': [
    [p('cleaner',44,85,16),p('administrator',58,86,14)],
    [p('woman',28,86,14),p('organizer',77,86,14)],
    [p('administrator',46,86,14),p('organizer',72,83,13)],
    [p('woman',32,84,13),p('organizer',66,84,13)],
    [p('worker',57,85,14),p('cleaner',82,79,12)]
  ],
  'market-04': [
    [p('seated',53,85,24)],
    [p('administrator',31,86,14)],
    [p('barrier',70,89,23),p('queue',80,80,17)],
    [p('administrator',39,86,14),p('woman',67,85,14)],
    [p('worker',44,86,14),p('administrator',33,83,13)]
  ],
  'market-05': [
    [p('glass',51,91,25),p('barrier',63,87,24)],
    [p('worker',32,85,14),p('queue',76,80,18)],
    [p('trolley',40,88,20)],
    [p('glass',57,91,9),p('cleaner',66,86,16),p('trolley',29,80,15)],
    [p('administrator',43,85,14),p('worker',52,85,14)]
  ]
});

export function normalizeVisualContext(value) {
  if (!value || typeof value !== 'object' || !Object.hasOwn(value, 'caseId') || typeof value.caseId !== 'string' || !Object.hasOwn(VISUAL_SCRIPTS, value.caseId) || !Object.hasOwn(value,'points') || !Array.isArray(value.points) || value.points.length > 5 || value.points.some(n => !Number.isInteger(n) || n < 0 || n > 4) || new Set(value.points).size !== value.points.length) return null;
  return { caseId:value.caseId, points:[...value.points] };
}

export function visualForAttempt(attempt) {
  if (!attempt?.scenario?.conceptId || !Object.hasOwn(VISUAL_SCRIPTS, attempt.scenario.conceptId)) return null;
  const concept = scenarioLibrary.find(item => item.id === attempt.scenario.conceptId);
  // Historical snapshots or locally changed checkpoint contracts must not acquire invented effects.
  if (attempt.scenario.sceneId !== concept.sceneId || attempt.scenario.title !== concept.title || attempt.scenario.brief !== concept.brief || attempt.scenario.points.length !== concept.points.length || attempt.scenario.points.some((point,i) => ['id','title','description'].some(key=>point[key]!==concept.points[i][key]))) return null;
  return { caseId:concept.id, points:attempt.events.filter(event => event.kind === 'record').map(event => concept.points.findIndex(point => point.id === event.pointId)).filter(index => index >= 0) };
}

export function scenarioVisualState(value) {
  const context = normalizeVisualContext(value);
  if (!context) return null;
  const item = scenarioLibrary.find(item => item.id === context.caseId), props = new Map();
  let step = 0;
  while (context.points.includes(step) && step < 5) step++;
  for (const changes of VISUAL_SCRIPTS[context.caseId].slice(0, step)) for (const prop of changes) {
    if (prop.remove) props.delete(prop.id); else props.set(prop.id, prop);
  }
  return { caseId:context.caseId, sceneId:item.sceneId, step, pending:context.points.length > step, props:[...props.values()], item };
}

const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function propBounds(prop) {
  const sprite = VISUAL_SPRITES[prop.sprite];
  const height = prop.width * 2 * (sprite ? sprite.rect[3] / sprite.rect[2] * sprite.verticalScale : prop.sprite === 'wet' ? .15 : .5);
  return { left:prop.x-prop.width/2, top:prop.y-height*(sprite?.foot || 1), width:prop.width, height };
}
export function renderVisualLayers(value) {
  const visual = scenarioVisualState(value);
  return visual ? `<div class="scenario-layers" aria-hidden="true" data-visual-case="${visual.caseId}" data-visual-step="${visual.step}">${visual.props.map(prop => {
    const bounds = propBounds(prop), sprite = VISUAL_SPRITES[prop.sprite];
    const position = `left:${bounds.left}%;top:${bounds.top}%;width:${bounds.width}%;height:${bounds.height}%;`;
    if (!sprite) return `<span class="scenario-effect scenario-effect--${prop.sprite}" style="${position}"></span>`;
    const sheet = VISUAL_ATLASES[sprite.sheet], [x,y,w,h] = sprite.rect;
    return `<span class="scenario-prop" data-prop="${prop.id}" style="${position}background-image:url('${sheet.src}');background-size:${sheet.width/w*100}% ${sheet.height/h*100}%;background-position:${x/(sheet.width-w)*100}% ${y/(sheet.height-h)*100}%"></span>`;
  }).join('')}</div>` : '';
}
export function renderVisualStatus(value, language='ru') {
  const visual = scenarioVisualState(value);
  if (!visual) return '';
  const uz = language === 'uz', text = visual.step ? visual.item.points[visual.step-1][uz?'uzTitle':'title'] : uz?'Harakatni tanlang: sahnada qatnashchilar va obyektlar paydo bo‘ladi.':'Выберите действие: в сцене появятся участники и объекты.';
  return `<div class="scenario-visual-status" role="status"><b>${uz?'Sahna':'Сцена'} ${visual.step}/5</b><span>${escape(text)}${visual.pending ? `<small>${uz?'Oldingi nazorat nuqtasi qayd etilmaguncha oqibat ko‘rsatilmaydi.':'Последствие ожидает предыдущую контрольную точку.'}</small>` : ''}</span></div>`;
}
export function renderScenarioVisual(value, language='ru') {
  const visual = scenarioVisualState(value);
  if (!visual) return '';
  const media = PANORAMA_MEDIA[visual.sceneId], title = visual.item[language==='uz'?'uzTitle':'title'];
  return `<div class="scenario-visual"><div class="scenario-image"><img src="${media.src}" width="1774" height="887" alt="${escape(title)}" loading="lazy">${renderVisualLayers(value)}<span class="scenario-cg-label">CG / ${language==='uz'?'O‘quv namuna':'Учебный пример'}</span></div>${renderVisualStatus(value,language)}</div>`;
}

const imageCache = new Map();
function atlasImage(sheet) {
  if (!imageCache.has(sheet.src)) imageCache.set(sheet.src, new Promise((resolve,reject) => {
    const image = new Image(); image.onload=()=>resolve(image); image.onerror=()=>{imageCache.delete(sheet.src);reject(new Error('Scenario asset unavailable'));}; image.src=new URL(sheet.src,import.meta.url).href;
  }));
  return imageCache.get(sheet.src);
}
export async function compositeScenario(base, value) {
  const visual = scenarioVisualState(value);
  if (!visual?.props.length) return base;
  const canvas=document.createElement('canvas'); canvas.width=base.naturalWidth; canvas.height=base.naturalHeight;
  const ctx=canvas.getContext('2d');
  if (!ctx) throw new Error('Scenario canvas unavailable');
  const sheets=await Promise.all([...new Set(visual.props.map(prop=>VISUAL_SPRITES[prop.sprite]?.sheet).filter(Boolean))].map(async key=>[key,await atlasImage(VISUAL_ATLASES[key])]));
  const loaded=Object.fromEntries(sheets); ctx.drawImage(base,0,0);
  for (const prop of visual.props) {
    const sprite=VISUAL_SPRITES[prop.sprite], b=propBounds(prop), x=b.left/100*canvas.width, y=b.top/100*canvas.height, w=b.width/100*canvas.width, h=b.height/100*canvas.height;
    ctx.save();
    if (sprite) { ctx.filter='drop-shadow(0px 3px 2px rgba(22,20,16,.22))';ctx.drawImage(loaded[sprite.sheet],...sprite.rect,x,y,w,h); }
    else if (['dusk','rain'].includes(prop.sprite)) {ctx.fillStyle=prop.sprite==='dusk'?'rgba(20,34,65,.34)':'rgba(53,75,93,.18)';ctx.fillRect(0,0,canvas.width,canvas.height);}
    else { const gradient=ctx.createRadialGradient(x+w/2,y+h/2,0,x+w/2,y+h/2,w/2);gradient.addColorStop(0,prop.sprite==='smoke'?'rgba(101,108,112,.6)':'rgba(120,157,171,.6)');gradient.addColorStop(1,'transparent');ctx.fillStyle=gradient;ctx.fillRect(x,y,w,h); }
    ctx.restore();
  }
  return canvas;
}
