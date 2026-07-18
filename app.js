const APP_META = {
  version: '1.5.0',
  status: 'Stable',
  updated: '18.07.2026',
};

const CLIENT_STATUSES = ['Новый', 'Связаться', 'Выезд назначен', 'В работе', 'Завершён', 'Отказ'];
const WORK_STATUSES = ['Планируется', 'В работе', 'Завершено', 'Отменено'];
const CHECKLIST_GROUPS = [
  { key: 'take', label: 'Что взять с собой' },
  { key: 'tools', label: 'Инструменты' },
  { key: 'materials', label: 'Материалы' },
];
const ESTIMATE_GROUPS = [
  { key: 'labor', label: 'Работы' },
  { key: 'materials', label: 'Материалы' },
];
const BUSINESS_PROFILE_STORAGE_KEY = 'gornBusinessProfile';
const DEFAULT_BUSINESS_PROFILE = {
  companyName: 'ГОРН',
  masterName: 'Кирилл',
  phone: '',
  email: '',
  website: 'ingorn.ru',
  region: 'Москва и Московская область',
  slogan: 'Там, где рождается тепло дома.',
};

const ESTIMATE_CATALOGS = {
  labor: [
    {
      category: 'Диагностика и выезд',
      items: [
        { name: 'Выезд и осмотр объекта', unit: 'выезд' },
        { name: 'Диагностика печи или камина', unit: 'усл.' },
        { name: 'Проверка тяги и дымовых каналов', unit: 'усл.' },
        { name: 'Подготовка сметы и технического решения', unit: 'усл.' },
      ],
    },
    {
      category: 'Ремонт',
      items: [
        { name: 'Частичная перекладка печи', unit: 'усл.' },
        { name: 'Ремонт топки', unit: 'усл.' },
        { name: 'Замена варочной плиты', unit: 'шт.' },
        { name: 'Замена топочной дверцы', unit: 'шт.' },
        { name: 'Замена поддувальной дверцы', unit: 'шт.' },
        { name: 'Замена прочистной дверцы', unit: 'шт.' },
        { name: 'Замена колосниковой решётки', unit: 'шт.' },
        { name: 'Ремонт дымохода', unit: 'усл.' },
        { name: 'Восстановление кладочных швов', unit: 'м²' },
        { name: 'Устранение трещин', unit: 'усл.' },
        { name: 'Штукатурка печи', unit: 'м²' },
        { name: 'Окраска печи', unit: 'м²' },
        { name: 'Облицовка печи или камина', unit: 'м²' },
      ],
    },
    {
      category: 'Чистка',
      items: [
        { name: 'Чистка дымохода', unit: 'усл.' },
        { name: 'Чистка печи', unit: 'усл.' },
        { name: 'Чистка дымовых каналов', unit: 'усл.' },
        { name: 'Удаление сажи и золы', unit: 'усл.' },
      ],
    },
    {
      category: 'Строительство',
      items: [
        { name: 'Кладка отопительной печи', unit: 'усл.' },
        { name: 'Кладка отопительно-варочной печи', unit: 'усл.' },
        { name: 'Кладка камина', unit: 'усл.' },
        { name: 'Кладка банной печи', unit: 'усл.' },
        { name: 'Кладка барбекю-комплекса', unit: 'усл.' },
        { name: 'Монтаж дымохода', unit: 'м' },
        { name: 'Устройство фундамента', unit: 'усл.' },
        { name: 'Противопожарная разделка', unit: 'усл.' },
      ],
    },
    {
      category: 'Демонтаж и подготовка',
      items: [
        { name: 'Демонтаж старой печи', unit: 'усл.' },
        { name: 'Разборка повреждённого участка', unit: 'усл.' },
        { name: 'Подготовка и защита помещения', unit: 'усл.' },
        { name: 'Уборка после работ', unit: 'усл.' },
      ],
    },
  ],
  materials: [
    {
      category: 'Кирпич и кладка',
      items: [
        { name: 'Кирпич печной полнотелый', unit: 'шт.' },
        { name: 'Кирпич шамотный ША-8', unit: 'шт.' },
        { name: 'Кирпич шамотный ША-5', unit: 'шт.' },
        { name: 'Кирпич облицовочный', unit: 'шт.' },
        { name: 'Кирпич клинкерный', unit: 'шт.' },
        { name: 'Смесь кладочная глино-песчаная', unit: 'меш.' },
        { name: 'Смесь шамотная огнеупорная', unit: 'меш.' },
        { name: 'Раствор кладочный готовый', unit: 'меш.' },
        { name: 'Глина печная', unit: 'меш.' },
        { name: 'Песок просеянный', unit: 'меш.' },
      ],
    },
    {
      category: 'Печная фурнитура',
      items: [
        { name: 'Плита варочная чугунная', unit: 'шт.' },
        { name: 'Дверца топочная', unit: 'шт.' },
        { name: 'Дверца поддувальная', unit: 'шт.' },
        { name: 'Дверца прочистная', unit: 'шт.' },
        { name: 'Колосниковая решётка', unit: 'шт.' },
        { name: 'Задвижка дымоходная', unit: 'шт.' },
        { name: 'Вьюшка печная', unit: 'шт.' },
        { name: 'Духовой шкаф печной', unit: 'шт.' },
        { name: 'Проволока вязальная', unit: 'м' },
        { name: 'Уголок металлический', unit: 'м' },
        { name: 'Полоса металлическая', unit: 'м' },
      ],
    },
    {
      category: 'Дымоход',
      items: [
        { name: 'Труба нержавеющая одноконтурная', unit: 'м' },
        { name: 'Труба сэндвич', unit: 'м' },
        { name: 'Переход дымохода', unit: 'шт.' },
        { name: 'Тройник дымохода', unit: 'шт.' },
        { name: 'Ревизия дымохода', unit: 'шт.' },
        { name: 'Конденсатосборник', unit: 'шт.' },
        { name: 'Хомут соединительный', unit: 'шт.' },
        { name: 'Хомут стеновой', unit: 'шт.' },
        { name: 'Кровельная проходка', unit: 'шт.' },
        { name: 'Оголовок дымохода', unit: 'шт.' },
        { name: 'Герметик высокотемпературный', unit: 'шт.' },
      ],
    },
    {
      category: 'Изоляция и безопасность',
      items: [
        { name: 'Базальтовый картон', unit: 'лист' },
        { name: 'Плита минерит', unit: 'лист' },
        { name: 'Кальций-силикатная плита', unit: 'лист' },
        { name: 'Базальтовая вата', unit: 'упак.' },
        { name: 'Лист нержавеющей стали', unit: 'лист' },
        { name: 'Лист оцинкованной стали', unit: 'лист' },
        { name: 'Огнестойкий герметик', unit: 'шт.' },
      ],
    },
    {
      category: 'Отделка',
      items: [
        { name: 'Штукатурная смесь жаростойкая', unit: 'меш.' },
        { name: 'Сетка армирующая', unit: 'м²' },
        { name: 'Грунтовка', unit: 'л' },
        { name: 'Краска термостойкая', unit: 'л' },
        { name: 'Клей жаростойкий', unit: 'меш.' },
        { name: 'Затирка жаростойкая', unit: 'кг' },
        { name: 'Плитка облицовочная', unit: 'м²' },
        { name: 'Изразцы', unit: 'шт.' },
      ],
    },
    {
      category: 'Расходные материалы',
      items: [
        { name: 'Крепёж', unit: 'компл.' },
        { name: 'Диск отрезной', unit: 'шт.' },
        { name: 'Малярная плёнка', unit: 'рул.' },
        { name: 'Мешки для строительного мусора', unit: 'шт.' },
        { name: 'Скотч малярный', unit: 'рул.' },
        { name: 'Перчатки защитные', unit: 'пар.' },
      ],
    },
  ],
};

let estimateLogoPromise = null;

const MAX_WORK_PHOTOS = 6;
const MAX_WORK_PHOTO_CHARS = 550000;
const MAX_WORK_PHOTOS_TOTAL_CHARS = 2800000;

const BACKUP_FORMAT = 'GORN_MASTER_SYSTEM_BACKUP';
const BACKUP_SCHEMA_VERSION = 1;
const PRE_IMPORT_BACKUP_KEY = 'gornBeforeLastImport';

const CLOUD_SYNC_FORMAT = 'GORN_CLOUD_SYNC';
const CLOUD_SYNC_SCHEMA_VERSION = 1;
const CLOUD_SYNC_ENDPOINT = '/.netlify/functions/gorn-sync';
const CLOUD_SYNC_CODE_KEY = 'gornCloudSyncCode';
const CLOUD_SYNC_UPDATED_KEY = 'gornDataUpdatedAt';
const CLOUD_SYNC_LAST_SYNC_KEY = 'gornCloudLastSyncedAt';
const CLOUD_SYNC_LAST_FINGERPRINT_KEY = 'gornCloudLastFingerprint';
const CLOUD_SYNC_DEVICE_KEY = 'gornCloudDeviceId';
const CLOUD_SYNC_MIN_CODE_LENGTH = 16;
const CLOUD_SYNC_PBKDF2_ITERATIONS = 120000;
const CLOUD_SYNC_CHUNK_CHARS = 700000;

const stateDefaults = {
  clientStatusFilter: 'Все',
  clientSort: 'updated',
  workStatusFilter: 'Все',
  workSort: 'dateDesc',
};

const ARRAY_FIELDS = [
  'keywords',
  'reply',
  'price',
  'phone',
  'photos',
  'check',
  'materials',
  'flags',
];

const state = {
  cards: [],
  category: 'Все',
  current: null,
  mode: 'home',
  cardSearch: '',
  clientSearch: '',
  planSearch: '',
  clientStatusFilter: stateDefaults.clientStatusFilter,
  clientSort: stateDefaults.clientSort,
  workStatusFilter: stateDefaults.workStatusFilter,
  workSort: stateDefaults.workSort,
  editingClientId: null,
  editingWorkId: null,
  workChecklistDraft: null,
  workEstimateDraft: null,
  favorites: readStoredArray('gornFavorites'),
  recent: readStoredArray('gornRecent'),
  clients: readStoredClients(),
  businessProfile: readStoredBusinessProfile(),
};

let pendingServiceWorker = null;
let systemBannerMode = '';
let cloudSyncTimer = null;
let cloudSyncInProgress = false;
let cloudSyncStatusOverride = '';

const $ = (selector) => document.querySelector(selector);

function readStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.map(String) : [];
  } catch (error) {
    console.warn(`GORN: хранилище ${key} было сброшено`, error);
    localStorage.removeItem(key);
    return [];
  }
}

function readStoredClients() {
  try {
    const value = JSON.parse(localStorage.getItem('gornClients') || '[]');
    if (!Array.isArray(value)) return [];
    return value.map((client, index) => normalizeClient(client, index));
  } catch (error) {
    console.warn('GORN: база клиентов была сброшена', error);
    localStorage.removeItem('gornClients');
    return [];
  }
}

function normalizeBusinessProfile(rawProfile) {
  const source = rawProfile && typeof rawProfile === 'object' ? rawProfile : {};
  return {
    companyName: toText(source.companyName, DEFAULT_BUSINESS_PROFILE.companyName),
    masterName: toText(source.masterName, DEFAULT_BUSINESS_PROFILE.masterName),
    phone: toText(source.phone),
    email: toText(source.email),
    website: toText(source.website, DEFAULT_BUSINESS_PROFILE.website),
    region: toText(source.region, DEFAULT_BUSINESS_PROFILE.region),
    slogan: toText(source.slogan, DEFAULT_BUSINESS_PROFILE.slogan),
  };
}

function readStoredBusinessProfile() {
  try {
    const value = JSON.parse(localStorage.getItem(BUSINESS_PROFILE_STORAGE_KEY) || '{}');
    return normalizeBusinessProfile(value);
  } catch (error) {
    console.warn('GORN: данные мастера были восстановлены по умолчанию', error);
    localStorage.removeItem(BUSINESS_PROFILE_STORAGE_KEY);
    return normalizeBusinessProfile({});
  }
}

function addDaysISO(value, days = 14) {
  const date = new Date(`${toText(value, localDateISO())}T12:00:00`);
  if (Number.isNaN(date.getTime())) return localDateISO();
  date.setDate(date.getDate() + Number(days || 0));
  return localDateISO(date);
}

function normalizeWorkDaysCount(value) {
  const count = Math.round(Number(value));
  if (!Number.isFinite(count) || count < 1) return 1;
  return Math.min(count, 365);
}

function isWeekendISO(value) {
  const date = new Date(`${toText(value, localDateISO())}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  return date.getDay() === 0 || date.getDay() === 6;
}

function workScheduleDates(work = {}) {
  const startDate = toText(work.date, localDateISO());
  const daysCount = normalizeWorkDaysCount(work.daysCount);
  const skipWeekends = work.skipWeekends !== false;
  const dates = [];
  let cursor = startDate;
  let guard = 0;

  while (dates.length < daysCount && guard < 730) {
    if (!skipWeekends || !isWeekendISO(cursor)) dates.push(cursor);
    cursor = addDaysISO(cursor, 1);
    guard += 1;
  }

  return dates.length ? dates : [startDate];
}

function workEndDate(work = {}) {
  const dates = workScheduleDates(work);
  return dates[dates.length - 1] || toText(work.date, localDateISO());
}

function isWorkScheduledOnDate(work, date) {
  return workScheduleDates(work).includes(date);
}

function nextScheduledWorkDate(work, fromDate = localDateISO()) {
  return workScheduleDates(work).find((date) => date >= fromDate) || workEndDate(work);
}

function workDayNumber(work, date = localDateISO()) {
  const dates = workScheduleDates(work);
  const index = dates.indexOf(date);
  return index >= 0 ? index + 1 : 0;
}

function workPeriodText(work, includeDays = true) {
  const dates = workScheduleDates(work);
  const start = dates[0];
  const end = dates[dates.length - 1];
  const period = start === end
    ? formatClientDate(start)
    : `${formatClientDate(start)} — ${formatClientDate(end)}`;
  if (!includeDays || dates.length === 1) return period;
  return `${period} · ${dates.length} раб. дн.`;
}

function currentWorkDayText(work, date = localDateISO()) {
  const total = normalizeWorkDaysCount(work.daysCount);
  if (total <= 1) return '';
  const current = workDayNumber(work, date);
  return current ? `день ${current} из ${total}` : `${total} рабочих дней`;
}

function createEstimateDocumentNumber() {
  const date = localDateISO().replaceAll('-', '');
  const suffix = String(Date.now()).slice(-5);
  return `GORN-${date}-${suffix}`;
}

function localDateISO(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}


function createChecklistItemId(group = 'item') {
  return `${group}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeChecklistItem(rawItem, index = 0, group = 'item') {
  const source = rawItem && typeof rawItem === 'object' ? rawItem : { text: rawItem };
  return {
    id: toText(source.id, `${group}-${index + 1}`),
    text: toText(source.text),
    done: Boolean(source.done),
  };
}

function normalizeWorkPhoto(rawPhoto, index = 0) {
  const source = rawPhoto && typeof rawPhoto === 'object' ? rawPhoto : {};
  const dataUrl = toText(source.dataUrl);
  return {
    id: toText(source.id, `photo-${index + 1}`),
    name: toText(source.name, `Фото ${index + 1}`),
    dataUrl: dataUrl.startsWith('data:image/') ? dataUrl : '',
    createdAt: toText(source.createdAt, new Date().toISOString()),
  };
}

function createDefaultWorkChecklist() {
  const makeItems = (group, values) =>
    values.map((text) => ({
      id: createChecklistItemId(group),
      text,
      done: false,
    }));

  return {
    take: makeItems('take', ['Телефон и зарядка', 'Перчатки и защита']),
    tools: makeItems('tools', ['Рулетка', 'Фонарь', 'Уровень']),
    materials: [],
    measurements: '',
    photos: [],
  };
}

function normalizeWorkChecklist(rawChecklist, useDefaults = false) {
  const source = rawChecklist && typeof rawChecklist === 'object' ? rawChecklist : {};
  const defaults = useDefaults
    ? createDefaultWorkChecklist()
    : {
        take: [],
        tools: [],
        materials: [],
        measurements: '',
        photos: [],
      };

  const result = {
    take: [],
    tools: [],
    materials: [],
    measurements: toText(source.measurements, defaults.measurements),
    photos: [],
  };

  CHECKLIST_GROUPS.forEach(({ key }) => {
    const rawItems = Array.isArray(source[key]) ? source[key] : defaults[key];
    result[key] = rawItems
      .map((item, index) => normalizeChecklistItem(item, index, key))
      .filter((item) => item.text);
  });

  const rawPhotos = Array.isArray(source.photos) ? source.photos : defaults.photos;
  result.photos = rawPhotos
    .map((photo, index) => normalizeWorkPhoto(photo, index))
    .filter((photo) => photo.dataUrl)
    .slice(0, MAX_WORK_PHOTOS);

  return result;
}

function cloneWorkChecklist(checklist) {
  return normalizeWorkChecklist(JSON.parse(JSON.stringify(checklist || {})));
}

function workChecklistProgress(checklist) {
  const normalized = normalizeWorkChecklist(checklist);
  const items = CHECKLIST_GROUPS.flatMap(({ key }) => normalized[key]);
  return {
    done: items.filter((item) => item.done).length,
    total: items.length,
    photos: normalized.photos.length,
  };
}


function createEstimateItemId(group = 'estimate') {
  return `${group}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeEstimateItem(rawItem, index = 0, group = 'estimate') {
  const source = rawItem && typeof rawItem === 'object' ? rawItem : {};
  return {
    id: toText(source.id, `${group}-${index + 1}`),
    name: toText(source.name || source.title),
    quantity: toText(source.quantity ?? source.qty, '1'),
    unit: toText(source.unit, group === 'labor' ? 'усл.' : 'шт.'),
    price: toText(source.price),
  };
}

function createDefaultWorkEstimate() {
  const documentDate = localDateISO();
  return {
    labor: [],
    materials: [],
    delivery: '',
    wasteRemoval: '',
    prepayment: '',
    documentNumber: createEstimateDocumentNumber(),
    documentDate,
    validUntil: addDaysISO(documentDate, 14),
    paymentTerms: 'Предоплата на материалы. Остаток — после завершения и приёмки работ.',
    clientNote: 'Дополнительные работы выполняются только после согласования с клиентом.',
  };
}

function normalizeWorkEstimate(rawEstimate) {
  const source = rawEstimate && typeof rawEstimate === 'object' ? rawEstimate : {};
  const documentDate = toText(source.documentDate, localDateISO());
  const result = {
    labor: [],
    materials: [],
    delivery: toText(source.delivery),
    wasteRemoval: toText(source.wasteRemoval),
    prepayment: toText(source.prepayment),
    documentNumber: toText(source.documentNumber, createEstimateDocumentNumber()),
    documentDate,
    validUntil: toText(source.validUntil, addDaysISO(documentDate, 14)),
    paymentTerms: toText(
      source.paymentTerms,
      'Предоплата на материалы. Остаток — после завершения и приёмки работ.',
    ),
    clientNote: toText(
      source.clientNote,
      'Дополнительные работы выполняются только после согласования с клиентом.',
    ),
  };

  ESTIMATE_GROUPS.forEach(({ key }) => {
    const rawItems = Array.isArray(source[key]) ? source[key] : [];
    result[key] = rawItems
      .map((item, index) => normalizeEstimateItem(item, index, key))
      .filter((item) => item.name);
  });

  return result;
}

function cloneWorkEstimate(estimate) {
  return normalizeWorkEstimate(JSON.parse(JSON.stringify(estimate || {})));
}

function parseEstimateQuantity(value) {
  const normalized = toText(value, '1')
    .replace(/\s+/g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');
  const quantity = Number.parseFloat(normalized);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function calculateWorkEstimate(estimate = {}) {
  const normalized = normalizeWorkEstimate(estimate);
  const subtotal = (key) =>
    normalized[key].reduce(
      (sum, item) => sum + parseEstimateQuantity(item.quantity) * parseAmountNumber(item.price),
      0,
    );

  const laborTotal = subtotal('labor');
  const materialsTotal = subtotal('materials');
  const deliveryTotal = parseAmountNumber(normalized.delivery);
  const wasteRemovalTotal = parseAmountNumber(normalized.wasteRemoval);
  const total = laborTotal + materialsTotal + deliveryTotal + wasteRemovalTotal;
  const prepayment = parseAmountNumber(normalized.prepayment);
  const extraLineCount = [normalized.delivery, normalized.wasteRemoval].filter((value) =>
    toText(value),
  ).length;

  return {
    laborTotal,
    materialsTotal,
    deliveryTotal,
    wasteRemovalTotal,
    total,
    prepayment,
    balance: total - prepayment,
    lineCount: normalized.labor.length + normalized.materials.length + extraLineCount,
  };
}

function normalizeWork(rawWork, index = 0) {
  const source = rawWork && typeof rawWork === 'object' ? rawWork : {};
  const createdAt = toText(source.createdAt, new Date().toISOString());
  const rawStatus = toText(source.status, 'Планируется');
  const startTime = /^\d{2}:\d{2}$/.test(toText(source.startTime))
    ? toText(source.startTime)
    : '';
  const durationMinutes = Number(source.durationMinutes);
  const reminderMinutes = Number(source.reminderMinutes);
  const daysCount = normalizeWorkDaysCount(source.daysCount);
  const skipWeekends = source.skipWeekends !== false;

  return {
    id: toText(source.id, `WORK-${index + 1}-${Date.now()}`),
    title: toText(source.title, 'Работа без названия'),
    date: toText(source.date, localDateISO()),
    startTime,
    durationMinutes: Number.isFinite(durationMinutes) && durationMinutes > 0
      ? Math.round(durationMinutes)
      : 180,
    reminderMinutes: Number.isFinite(reminderMinutes) && reminderMinutes >= 0
      ? Math.round(reminderMinutes)
      : 0,
    daysCount,
    skipWeekends,
    address: toText(source.address),
    status: WORK_STATUSES.includes(rawStatus) ? rawStatus : 'Планируется',
    amount: toText(source.amount),
    notes: toText(source.notes),
    checklist: normalizeWorkChecklist(source.checklist),
    estimate: normalizeWorkEstimate(source.estimate),
    createdAt,
    updatedAt: toText(source.updatedAt, createdAt),
  };
}

function normalizeClient(rawClient, index = 0) {
  const source = rawClient && typeof rawClient === 'object' ? rawClient : {};
  const createdAt = toText(source.createdAt, new Date().toISOString());
  const rawWorks = Array.isArray(source.works) ? source.works : [];
  return {
    id: toText(source.id, `CLIENT-${index + 1}-${Date.now()}`),
    name: toText(source.name, 'Без имени'),
    phone: toText(source.phone),
    address: toText(source.address),
    notes: toText(source.notes),
    date: toText(source.date, localDateISO()),
    status: CLIENT_STATUSES.includes(toText(source.status)) ? toText(source.status) : 'Новый',
    works: rawWorks.map((work, workIndex) => normalizeWork(work, workIndex)),
    createdAt,
    updatedAt: toText(source.updatedAt, createdAt),
  };
}

function toText(value, fallback = '') {
  if (value === null || value === undefined || typeof value === 'boolean') {
    return fallback;
  }
  const text = String(value).trim();
  return text || fallback;
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean);
  }
  if (value === null || value === undefined || typeof value === 'boolean') {
    return [];
  }
  const text = toText(value);
  return text ? [text] : [];
}


function normalizeResponseVariant(rawVariant, index = 0, prefix = 'variant') {
  const source =
    rawVariant && typeof rawVariant === 'object'
      ? rawVariant
      : { text: rawVariant };

  return {
    id: toText(source.id, `${prefix}-${index + 1}`),
    label: toText(source.label, `Вариант ${index + 1}`),
    text: toText(source.text || source.value),
  };
}

function normalizeResponseVariants(rawVariants, fallbackItems = [], prefix = 'variant') {
  const variants = Array.isArray(rawVariants)
    ? rawVariants
        .map((item, index) => normalizeResponseVariant(item, index, prefix))
        .filter((item) => item.text)
    : [];

  if (variants.length) return variants;

  return toArray(fallbackItems).map((text, index) => ({
    id: `${prefix}-${index + 1}`,
    label: index === 0 ? 'Основной вариант' : `Вариант ${index + 1}`,
    text,
  }));
}

function normalizeRisk(value) {
  const aliases = {
    low: 'green',
    medium: 'yellow',
    high: 'red',
  };

  if (typeof value === 'string') {
    const level = aliases[value] || value;
    return {
      level: ['green', 'yellow', 'red'].includes(level) ? level : 'yellow',
      text: 'Нужна оценка специалиста',
    };
  }

  if (!value || typeof value !== 'object') {
    return { level: 'yellow', text: 'Нужна оценка специалиста' };
  }

  const rawLevel = toText(value.level, 'yellow');
  const level = aliases[rawLevel] || rawLevel;
  return {
    level: ['green', 'yellow', 'red'].includes(level) ? level : 'yellow',
    text: toText(value.text, 'Нужна оценка специалиста'),
  };
}

function normalizeCard(rawCard, index) {
  const source = rawCard && typeof rawCard === 'object' ? rawCard : {};
  const card = {
    ...source,
    id: toText(source.id, `CARD-${index + 1}`),
    category: toText(source.category, 'Универсальные'),
    title: toText(source.title, `Карточка ${index + 1}`),
    icon: toText(source.icon, '🔥'),
    time: toText(source.time, 'Нужно уточнить'),
    repairability: toText(source.repairability, 'Нужно смотреть'),
    risk: normalizeRisk(source.risk),
    sourceIndex: index,
  };

  ARRAY_FIELDS.forEach((field) => {
    card[field] = toArray(source[field]);
  });

  card.replyVariants = normalizeResponseVariants(
    source.replyVariants,
    card.reply,
    'reply',
  );
  card.priceVariants = normalizeResponseVariants(
    source.priceVariants,
    card.price,
    'price',
  );

  return card;
}

function prepareCards(rawCards) {
  if (!Array.isArray(rawCards)) {
    throw new Error('Поле cards отсутствует или имеет неверный формат');
  }

  const usedIds = new Set();
  const cards = [];

  rawCards.forEach((rawCard, index) => {
    const card = normalizeCard(rawCard, index);
    if (usedIds.has(card.id)) {
      console.warn(`GORN: пропущена карточка с повторным ID ${card.id}`);
      return;
    }
    usedIds.add(card.id);
    cards.push(card);
  });

  if (!cards.length) {
    throw new Error('База карточек пуста');
  }

  return cards;
}

async function init() {
  renderVersion();
  bindEvents();
  renderEstimateCatalogs();
  preloadEstimateAssets();
  registerServiceWorker();

  try {
    const response = await fetch(`data/cards.json?v=${APP_META.version}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Ошибка загрузки базы: HTTP ${response.status}`);
    }

    const data = await response.json();
    state.cards = prepareCards(data.cards);

    if (data.version && String(data.version) !== APP_META.version) {
      console.warn(
        `GORN: версия базы ${data.version} не совпадает с версией приложения ${APP_META.version}`,
      );
    }

    state.favorites = state.favorites.filter((id) => state.cards.some((card) => card.id === id));
    state.recent = state.recent.filter((id) => state.cards.some((card) => card.id === id));
    save({ markChanged: false, sync: false });

    renderCategories();
    showListView('home', false);
    history.replaceState({ view: 'home' }, '', window.location.href);
    initializeCloudSync();
  } catch (error) {
    showLoadError(error);
  }
}

function renderVersion() {
  const line = `v${APP_META.version} • ${APP_META.status} • ${APP_META.updated}`;
  const versionLine = $('#versionLine');
  const aboutVersion = $('#aboutVersion');
  const aboutUpdated = $('#aboutUpdated');

  if (versionLine) versionLine.textContent = line;
  if (aboutVersion) aboutVersion.textContent = `Версия ${APP_META.version} ${APP_META.status}`;
  if (aboutUpdated) aboutUpdated.textContent = `Обновлено: ${APP_META.updated}`;
}

function bindEvents() {
  const search = $('#search');
  const handleSearch = () => {
    if (state.mode === 'clients') {
      state.clientSearch = search?.value || '';
      renderClients();
      return;
    }

    if (state.mode === 'plan') {
      state.planSearch = search?.value || '';
      renderPlan();
      return;
    }

    if (state.mode === 'home' || state.mode === 'favorites') {
      state.cardSearch = search?.value || '';
      renderHome();
    }
  };

  search?.addEventListener('input', handleSearch);
  search?.addEventListener('search', handleSearch);
  search?.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !search.value) return;
    search.value = '';
    handleSearch();
  });

  $('#backBtn')?.addEventListener('click', goBack);
  $('#aboutBackBtn')?.addEventListener('click', goBack);
  $('#favoriteBtn')?.addEventListener('click', () => {
    if (!state.current) return;
    toggleFavorite(state.current.id);
    updateFavoriteButton();
  });

  $('#clientsShortcutBtn')?.addEventListener('click', () => navigate('clients'));

  $('#dashboardNewClientBtn')?.addEventListener('click', () => {
    showClientsView(true);
    openClientForm();
  });
  $('#dashboardPlanBtn')?.addEventListener('click', () => navigate('plan'));
  $('#dashboardClientsBtn')?.addEventListener('click', () => navigate('clients'));
  $('#exportPlanCalendarBtn')?.addEventListener('click', exportPlanCalendar);
  $('#dashboardBackupBtn')?.addEventListener('click', exportBackup);
  $('#dashboardAttentionPlanBtn')?.addEventListener('click', () => navigate('plan'));
  $('#dashboardRefreshBtn')?.addEventListener('click', () => {
    renderDashboard();
    showToast('Обзор обновлён');
  });

  $('#newClientBtn')?.addEventListener('click', () => openClientForm());


  $('#exportBackupBtn')?.addEventListener('click', exportBackup);
  $('#importBackupBtn')?.addEventListener('click', () => $('#importBackupInput')?.click());
  $('#importBackupInput')?.addEventListener('change', importBackupFile);
  $('#undoImportBtn')?.addEventListener('click', undoLastImport);

  document.querySelectorAll('[data-client-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.clientStatusFilter = button.dataset.clientFilter || 'Все';
      renderClients();
    });
  });
  $('#clientSort')?.addEventListener('change', (event) => {
    state.clientSort = event.target.value || stateDefaults.clientSort;
    renderClients();
  });

  document.querySelectorAll('[data-work-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.workStatusFilter = button.dataset.workFilter || 'Все';
      renderWorkHistory();
    });
  });
  $('#workSort')?.addEventListener('change', (event) => {
    state.workSort = event.target.value || stateDefaults.workSort;
    renderWorkHistory();
  });

  $('#closeClientFormBtn')?.addEventListener('click', closeClientForm);
  $('#clientForm')?.addEventListener('submit', saveClientFromForm);
  $('#deleteClientBtn')?.addEventListener('click', deleteEditingClient);
  $('#addWorkBtn')?.addEventListener('click', () => openWorkForm());
  $('#closeWorkFormBtn')?.addEventListener('click', closeWorkForm);
  $('#workForm')?.addEventListener('submit', saveWorkFromForm);
  $('#deleteWorkBtn')?.addEventListener('click', deleteEditingWork);
  $('#exportWorkCalendarBtn')?.addEventListener('click', exportWorkCalendarFromForm);
  ['workDate', 'workDaysCount', 'workSkipWeekends'].forEach((id) => {
    $(`#${id}`)?.addEventListener(id === 'workDaysCount' ? 'input' : 'change', updateWorkSchedulePreview);
  });
  document.querySelectorAll('[data-work-days]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = $('#workDaysCount');
      if (!input) return;
      input.value = String(normalizeWorkDaysCount(button.dataset.workDays));
      updateWorkSchedulePreview();
    });
  });

  document.querySelectorAll('[data-checklist-add]').forEach((button) => {
    button.addEventListener('click', () => addWorkChecklistItem(button.dataset.checklistAdd));
  });
  document.querySelectorAll('[data-checklist-input]').forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      addWorkChecklistItem(input.dataset.checklistInput);
    });
  });
  $('#workChecklistSection')?.addEventListener('change', handleWorkChecklistChange);
  $('#workChecklistSection')?.addEventListener('click', handleWorkChecklistClick);
  $('#workMeasurements')?.addEventListener('input', (event) => {
    if (!state.workChecklistDraft) return;
    state.workChecklistDraft.measurements = event.target.value;
  });
  $('#workPhotoInput')?.addEventListener('change', handleWorkPhotoFiles);

  document.querySelectorAll('[data-estimate-add]').forEach((button) => {
    button.addEventListener('click', () => addWorkEstimateItem(button.dataset.estimateAdd));
  });
  document.querySelectorAll('[data-estimate-preset-add]').forEach((button) => {
    button.addEventListener('click', () => addEstimatePresetItem(button.dataset.estimatePresetAdd));
  });
  document.querySelectorAll('[data-estimate-preset-select]').forEach((select) => {
    select.addEventListener('change', () => updateEstimatePresetUnit(select.dataset.estimatePresetSelect));
  });
  document.querySelectorAll('[data-estimate-new-name]').forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      addWorkEstimateItem(input.dataset.estimateNewName);
    });
  });
  $('#workEstimateSection')?.addEventListener('input', handleWorkEstimateInput);
  $('#workEstimateSection')?.addEventListener('click', handleWorkEstimateClick);
  $('#copyEstimateBtn')?.addEventListener('click', (event) => {
    copyText('estimateClientText', event.currentTarget);
  });
  $('#applyEstimateTotalBtn')?.addEventListener('click', applyEstimateTotalToWork);
  $('#downloadEstimatePdfBtn')?.addEventListener('click', downloadEstimatePdf);
  $('#shareEstimatePdfBtn')?.addEventListener('click', shareEstimatePdf);
  $('#estimateBusinessProfile')?.addEventListener('input', handleBusinessProfileInput);
  $('#workTitle')?.addEventListener('input', renderWorkEstimateSummary);
  $('#workAddress')?.addEventListener('input', renderWorkEstimateSummary);

  $('#generateCloudSyncCodeBtn')?.addEventListener('click', () => {
    const input = $('#cloudSyncCodeInput');
    if (input) {
      input.value = formatCloudSyncCode(generateCloudSyncCode());
      input.type = 'text';
      $('#toggleCloudSyncCodeBtn').textContent = 'Скрыть';
    }
  });
  $('#saveCloudSyncCodeBtn')?.addEventListener('click', saveCloudSyncCode);
  $('#copyCloudSyncCodeBtn')?.addEventListener('click', copyCloudSyncCode);
  $('#disconnectCloudSyncBtn')?.addEventListener('click', disconnectCloudSync);
  $('#cloudUploadBtn')?.addEventListener('click', async () => {
    if (cloudSyncInProgress) return;
    setCloudSyncBusy(true);
    setCloudSyncStatus('Отправка базы в облако…');
    try {
      await uploadCloudDatabase({ manual: true });
    } catch (error) {
      console.error('GORN: ошибка отправки базы', error);
      setCloudSyncStatus(error.message || 'Не удалось отправить базу', 'error');
      window.alert(error.message || 'Не удалось отправить базу.');
    } finally {
      setCloudSyncBusy(false);
      renderCloudSyncInfo();
    }
  });
  $('#cloudDownloadBtn')?.addEventListener('click', async () => {
    if (cloudSyncInProgress) return;
    setCloudSyncBusy(true);
    setCloudSyncStatus('Загрузка базы из облака…');
    try {
      await downloadCloudDatabase({ manual: true });
    } catch (error) {
      console.error('GORN: ошибка загрузки базы', error);
      setCloudSyncStatus(error.message || 'Не удалось загрузить базу', 'error');
      window.alert(error.message || 'Не удалось загрузить базу.');
    } finally {
      setCloudSyncBusy(false);
      renderCloudSyncInfo();
    }
  });
  $('#cloudRestorePreviousBtn')?.addEventListener('click', async () => {
    if (cloudSyncInProgress) return;
    setCloudSyncBusy(true);
    setCloudSyncStatus('Проверка предыдущей облачной копии…');
    try {
      await downloadCloudDatabase({ manual: true, previous: true });
    } catch (error) {
      console.error('ГОРН: ошибка восстановления облачной копии', error);
      setCloudSyncStatus(error.message || 'Не удалось восстановить облачную копию', 'error');
      window.alert(error.message || 'Не удалось восстановить облачную копию.');
    } finally {
      setCloudSyncBusy(false);
      renderCloudSyncInfo();
    }
  });
  $('#toggleCloudSyncCodeBtn')?.addEventListener('click', () => {
    const input = $('#cloudSyncCodeInput');
    const button = $('#toggleCloudSyncCodeBtn');
    if (!input || !button) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.textContent = show ? 'Скрыть' : 'Показать';
  });

  document.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.nav));
  });

  $('#runSystemCheckBtn')?.addEventListener('click', runSystemDiagnostics);
  $('#reloadAppBtn')?.addEventListener('click', () => window.location.reload());
  $('#systemBannerAction')?.addEventListener('click', () => {
    if (systemBannerMode === 'update' && pendingServiceWorker) {
      pendingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      showSystemBanner('Устанавливается обновление…', '', 'update');
    }
  });

  window.addEventListener('online', () => {
    updateConnectionBanner();
    scheduleCloudSync(400);
  });
  window.addEventListener('offline', () => {
    updateConnectionBanner();
    renderCloudSyncInfo();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') scheduleCloudSync(500);
  });
  window.addEventListener('popstate', (event) => restoreHistoryView(event.state));
  updateConnectionBanner();
}

function showSystemBanner(message, actionLabel = '', mode = 'notice') {
  const banner = $('#systemBanner');
  const text = $('#systemBannerText');
  const action = $('#systemBannerAction');
  if (!banner || !text || !action) return;

  systemBannerMode = mode;
  text.textContent = message;
  action.textContent = actionLabel || 'Обновить';
  action.classList.toggle('hidden', !actionLabel);
  banner.className = `system-banner ${mode}`;
}

function hideSystemBanner(mode = '') {
  if (mode && systemBannerMode !== mode) return;
  const banner = $('#systemBanner');
  if (banner) banner.className = 'system-banner hidden';
  systemBannerMode = '';
}

function updateConnectionBanner() {
  if (!navigator.onLine) {
    showSystemBanner('Нет интернета — GORN продолжает работать с сохранёнными данными', '', 'offline');
    return;
  }
  if (systemBannerMode === 'offline') {
    hideSystemBanner('offline');
    if (pendingServiceWorker) {
      offerServiceWorkerUpdate(pendingServiceWorker);
    } else {
      showToast('Соединение восстановлено');
    }
  }
}

function offerServiceWorkerUpdate(worker) {
  if (!worker) return;
  pendingServiceWorker = worker;
  showSystemBanner('Доступно обновление GORN', 'Обновить сейчас', 'update');
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    updateConnectionBanner();
    return;
  }

  let refreshing = false;

  navigator.serviceWorker
    .register('service-worker.js', { updateViaCache: 'none' })
    .then((registration) => {
      if (registration.waiting) offerServiceWorkerUpdate(registration.waiting);

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            offerServiceWorkerUpdate(worker);
          }
        });
      });

      registration.update().catch(() => {});
    })
    .catch((error) => console.warn('GORN: Service Worker не зарегистрирован', error));

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

function showLoadError(error) {
  console.error('GORN: не удалось загрузить базу карточек', error);
  $('#categories').innerHTML = '<button class="category-chip active">Все</button>';
  $('#quick').innerHTML = '';
  $('#countBadge').textContent = '(0)';
  $('#empty').classList.add('hidden');
  $('#list').innerHTML = `
    <div class="empty">
      Не удалось загрузить базу карточек.<br>
      <button id="retryBtn" class="secondary-btn" type="button">Обновить страницу</button>
    </div>`;
  $('#retryBtn')?.addEventListener('click', () => window.location.reload());
}

function navigate(where, pushHistory = true) {
  if (where === 'about') {
    state.mode = 'about';
    setActiveNav('about');
    showOnly('aboutView');
    renderBackupInfo();
    runSystemDiagnostics();
    if (pushHistory) history.pushState({ view: 'about' }, '', window.location.href);
    return;
  }

  if (where === 'clients') {
    showClientsView(pushHistory);
    return;
  }

  if (where === 'plan') {
    showPlanView(pushHistory);
    return;
  }

  const mode = where === 'favorites' ? 'favorites' : 'home';
  showListView(mode, pushHistory);
}

function showListView(mode = state.mode, pushHistory = false) {
  state.mode = mode === 'favorites' ? 'favorites' : 'home';
  state.current = null;
  state.editingClientId = null;
  state.editingWorkId = null;
  state.workEstimateDraft = null;
  setActiveNav(state.mode);
  setSearchContext('cards');
  showOnly('homeView');
  renderCategories();
  renderHome();

  if (pushHistory) {
    history.pushState({ view: state.mode }, '', window.location.href);
  }
}

function showClientsView(pushHistory = false) {
  state.mode = 'clients';
  state.current = null;
  state.editingClientId = null;
  state.editingWorkId = null;
  state.workEstimateDraft = null;
  setActiveNav('clients');
  setSearchContext('clients');
  showOnly('clientsView');
  closeClientForm();
  renderClients();

  if (pushHistory) {
    history.pushState({ view: 'clients' }, '', window.location.href);
  }
}

function showPlanView(pushHistory = false) {
  state.mode = 'plan';
  state.current = null;
  state.editingClientId = null;
  state.editingWorkId = null;
  state.workEstimateDraft = null;
  setActiveNav('plan');
  setSearchContext('plan');
  showOnly('planView');
  renderPlan();

  if (pushHistory) {
    history.pushState({ view: 'plan' }, '', window.location.href);
  }
}

function setSearchContext(context) {
  const search = $('#search');
  if (!search) return;

  if (context === 'clients') {
    search.value = state.clientSearch;
    search.placeholder = 'Поиск клиентов: имя, телефон, адрес...';
    return;
  }

  if (context === 'plan') {
    search.value = state.planSearch;
    search.placeholder = 'Поиск в плане: клиент, адрес, работа...';
    return;
  }

  search.value = state.cardSearch;
  search.placeholder = 'Поиск: дымит, кирпич, чистка...';
}

function setActiveNav(where) {
  document.querySelectorAll('.bottom-nav button').forEach((button) => {
    button.classList.toggle('active', button.dataset.nav === where);
  });
}

function restoreHistoryView(historyState) {
  const view = historyState?.view || 'home';

  if (view === 'card' && historyState.cardId) {
    openCard(historyState.cardId, false);
    return;
  }

  if (view === 'about') {
    navigate('about', false);
    return;
  }

  if (view === 'clients') {
    showClientsView(false);
    return;
  }

  if (view === 'plan') {
    showPlanView(false);
    return;
  }

  showListView(view === 'favorites' ? 'favorites' : 'home', false);
}

function showOnly(id) {
  ['homeView', 'cardView', 'planView', 'clientsView', 'aboutView'].forEach((viewId) => {
    $(`#${viewId}`).classList.toggle('hidden', viewId !== id);
  });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function save(options = {}) {
  const { markChanged = true, sync = true } = options;

  try {
    localStorage.setItem('gornFavorites', JSON.stringify(state.favorites));
    localStorage.setItem('gornRecent', JSON.stringify(state.recent));
    localStorage.setItem('gornClients', JSON.stringify(state.clients));
    localStorage.setItem(BUSINESS_PROFILE_STORAGE_KEY, JSON.stringify(state.businessProfile));

    if (markChanged) {
      localStorage.setItem(CLOUD_SYNC_UPDATED_KEY, new Date().toISOString());
    } else {
      ensureDataUpdatedAt();
    }

    if (sync) scheduleCloudSync();
    return true;
  } catch (error) {
    console.warn('GORN: не удалось сохранить локальные данные', error);
    showToast('Не удалось сохранить: память устройства заполнена');
    return false;
  }
}

function readStoredText(key) {
  try {
    return toText(localStorage.getItem(key));
  } catch (error) {
    return '';
  }
}

function ensureDataUpdatedAt() {
  let value = readStoredText(CLOUD_SYNC_UPDATED_KEY);
  if (!value) {
    value = new Date().toISOString();
    try {
      localStorage.setItem(CLOUD_SYNC_UPDATED_KEY, value);
    } catch (error) {}
  }
  return value;
}

function getCloudSyncCode() {
  return normalizeCloudSyncCode(readStoredText(CLOUD_SYNC_CODE_KEY));
}

function normalizeCloudSyncCode(value) {
  return toText(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function formatCloudSyncCode(value) {
  const normalized = normalizeCloudSyncCode(value);
  return normalized.match(/.{1,4}/g)?.join('-') || '';
}

function getCloudDeviceId() {
  let id = readStoredText(CLOUD_SYNC_DEVICE_KEY);
  if (!id) {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    id = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    try {
      localStorage.setItem(CLOUD_SYNC_DEVICE_KEY, id);
    } catch (error) {}
  }
  return id;
}

function getCloudLastSyncedAt() {
  return readStoredText(CLOUD_SYNC_LAST_SYNC_KEY);
}

function getCloudLastFingerprint() {
  return readStoredText(CLOUD_SYNC_LAST_FINGERPRINT_KEY);
}

function setCloudSyncPoint(updatedAt, fingerprint) {
  try {
    localStorage.setItem(CLOUD_SYNC_LAST_SYNC_KEY, toText(updatedAt, new Date().toISOString()));
    if (fingerprint) localStorage.setItem(CLOUD_SYNC_LAST_FINGERPRINT_KEY, fingerprint);
  } catch (error) {}
}

function clearCloudSyncPoint() {
  try {
    localStorage.removeItem(CLOUD_SYNC_LAST_SYNC_KEY);
    localStorage.removeItem(CLOUD_SYNC_LAST_FINGERPRINT_KEY);
  } catch (error) {}
}

function parseTimestamp(value) {
  const timestamp = Date.parse(toText(value));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function generateCloudSyncCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(String(value));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function deriveCloudEncryptionKey(code, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(normalizeCloudSyncCode(code)),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: CLOUD_SYNC_PBKDF2_ITERATIONS,
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptCloudPayload(payload, code) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveCloudEncryptionKey(code, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

  return {
    format: CLOUD_SYNC_FORMAT,
    schemaVersion: CLOUD_SYNC_SCHEMA_VERSION,
    appVersion: APP_META.version,
    updatedAt: toText(payload.dataUpdatedAt, new Date().toISOString()),
    deviceId: getCloudDeviceId(),
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

async function decryptCloudPayload(envelope, code) {
  if (!envelope || typeof envelope !== 'object' || envelope.format !== CLOUD_SYNC_FORMAT) {
    throw new Error('Облачная копия имеет неизвестный формат');
  }
  if (Number(envelope.schemaVersion) !== CLOUD_SYNC_SCHEMA_VERSION) {
    throw new Error('Версия облачной копии не поддерживается');
  }

  try {
    const salt = base64ToBytes(envelope.salt);
    const iv = base64ToBytes(envelope.iv);
    const ciphertext = base64ToBytes(envelope.ciphertext);
    const key = await deriveCloudEncryptionKey(code, salt);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch (error) {
    throw new Error('Не удалось расшифровать облачную базу. Проверьте код синхронизации.');
  }
}

async function cloudSyncKey(code) {
  return sha256Hex(`GORN:${normalizeCloudSyncCode(code)}`);
}

async function requestCloudSync(method, code, body = null, params = {}) {
  const key = await cloudSyncKey(code);
  const query = new URLSearchParams({ key, ...params });
  const response = await fetch(`${CLOUD_SYNC_ENDPOINT}?${query.toString()}`, {
    method,
    cache: 'no-store',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 404 && method === 'GET') return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {}

  if (!response.ok) {
    throw new Error(payload?.error || `Ошибка облака: HTTP ${response.status}`);
  }

  return payload;
}

async function uploadCloudEnvelope(envelope, code) {
  const uploadId = `${Date.now()}-${getCloudDeviceId()}-${Math.random().toString(36).slice(2, 8)}`;
  const chunks = [];
  for (let offset = 0; offset < envelope.ciphertext.length; offset += CLOUD_SYNC_CHUNK_CHARS) {
    chunks.push(envelope.ciphertext.slice(offset, offset + CLOUD_SYNC_CHUNK_CHARS));
  }

  for (let index = 0; index < chunks.length; index += 1) {
    await requestCloudSync(
      'PUT',
      code,
      {
        uploadId,
        index,
        chunk: chunks[index],
      },
      { part: String(index) },
    );
  }

  const manifest = {
    format: envelope.format,
    schemaVersion: envelope.schemaVersion,
    appVersion: envelope.appVersion,
    updatedAt: envelope.updatedAt,
    deviceId: envelope.deviceId,
    salt: envelope.salt,
    iv: envelope.iv,
    uploadId,
    chunkCount: chunks.length,
    ciphertextLength: envelope.ciphertext.length,
  };

  await requestCloudSync('PUT', code, manifest, { manifest: '1' });
  return manifest;
}

async function downloadCloudEnvelope(code, options = {}) {
  const { previous = false } = options;
  const requestParams = previous ? { history: '1' } : {};
  const manifest = await requestCloudSync('GET', code, null, requestParams);
  if (!manifest) return null;

  if (typeof manifest.ciphertext === 'string') {
    return manifest;
  }

  const chunkCount = Number(manifest.chunkCount);
  if (
    !manifest.uploadId ||
    !Number.isInteger(chunkCount) ||
    chunkCount < 1 ||
    chunkCount > 100
  ) {
    throw new Error('Облачная база повреждена: отсутствуют части файла');
  }

  const chunks = new Array(chunkCount);
  for (let index = 0; index < chunkCount; index += 1) {
    const part = await requestCloudSync('GET', code, null, {
      ...requestParams,
      part: String(index),
    });
    if (!part || part.uploadId !== manifest.uploadId || typeof part.chunk !== 'string') {
      throw new Error(`Облачная база повреждена: не найдена часть ${index + 1}`);
    }
    chunks[index] = part.chunk;
  }

  const ciphertext = chunks.join('');
  if (
    Number(manifest.ciphertextLength) &&
    ciphertext.length !== Number(manifest.ciphertextLength)
  ) {
    throw new Error('Облачная база повреждена: неверный размер');
  }

  return {
    ...manifest,
    ciphertext,
  };
}

function databaseStats(data) {
  const clients = Array.isArray(data?.clients) ? data.clients.length : 0;
  const works = Array.isArray(data?.clients) ? countClientWorks(data.clients) : 0;
  return { clients, works };
}

function databaseStatsText(stats) {
  return `${stats.clients} клиентов, ${stats.works} работ`;
}

function databaseIsEmpty(stats) {
  return stats.clients === 0 && stats.works === 0;
}

function databaseIsSmaller(source, target) {
  return source.clients < target.clients || source.works < target.works;
}

function confirmReducedDatabase(direction, source, target) {
  const answer = window.prompt(
    `${direction} уменьшит количество данных.\n\n` +
      `Источник: ${databaseStatsText(source)}.\n` +
      `Сейчас: ${databaseStatsText(target)}.\n\n` +
      'Для подтверждения введите слово ЗАМЕНИТЬ.',
    '',
  );
  return toText(answer).trim().toUpperCase() === 'ЗАМЕНИТЬ';
}

function normalizedBackupData(parsed) {
  return {
    clients: parsed.clients,
    favorites: parsed.favorites,
    recent: parsed.recent,
    businessProfile: parsed.businessProfile,
  };
}

async function localDataFingerprint(payload = createBackupPayload()) {
  const parsed = payload?.data ? parseBackupPayload(payload) : payload;
  return sha256Hex(JSON.stringify(normalizedBackupData(parsed)));
}

async function rememberCloudSyncPoint(payload, fingerprint = '') {
  const parsed = payload?.data ? parseBackupPayload(payload) : payload;
  const resolvedFingerprint = fingerprint || (await localDataFingerprint(parsed));
  const updatedAt = parsed.dataUpdatedAt || parsed.exportedAt || ensureDataUpdatedAt();
  setCloudSyncPoint(updatedAt, resolvedFingerprint);
}


function setCloudSyncBusy(busy) {
  cloudSyncInProgress = busy;
  ['cloudUploadBtn', 'cloudDownloadBtn', 'cloudRestorePreviousBtn', 'saveCloudSyncCodeBtn', 'generateCloudSyncCodeBtn'].forEach(
    (id) => {
      const element = document.getElementById(id);
      if (element) element.disabled = busy;
    },
  );
}

function setCloudSyncStatus(message, tone = '') {
  cloudSyncStatusOverride = message;
  const status = $('#cloudSyncStatus');
  const badge = $('#cloudSyncBadge');

  if (status) {
    status.textContent = message;
    status.className = `cloud-sync-status ${tone}`.trim();
  }

  if (badge) {
    badge.textContent =
      tone === 'ok' ? 'Синхронизировано' : tone === 'error' ? 'Ошибка' : tone === 'warn' ? 'Внимание' : 'Подключено';
    badge.className = `cloud-sync-badge ${tone}`.trim();
  }
}

function renderCloudSyncInfo() {
  const code = getCloudSyncCode();
  const input = $('#cloudSyncCodeInput');
  const disconnect = $('#disconnectCloudSyncBtn');
  const badge = $('#cloudSyncBadge');
  const status = $('#cloudSyncStatus');
  const lastSync = getCloudLastSyncedAt();

  if (input && document.activeElement !== input) {
    input.value = formatCloudSyncCode(code);
  }

  disconnect?.classList.toggle('hidden', !code);

  if (!code) {
    cloudSyncStatusOverride = '';
    if (badge) {
      badge.textContent = 'Не настроена';
      badge.className = 'cloud-sync-badge warn';
    }
    if (status) {
      status.textContent = 'Создайте один код и введите его на Mac, iPhone и iPad.';
      status.className = 'cloud-sync-status';
    }
    return;
  }

  if (cloudSyncStatusOverride) return;

  if (badge) {
    badge.textContent = navigator.onLine ? 'Подключено' : 'Офлайн';
    badge.className = `cloud-sync-badge ${navigator.onLine ? 'ok' : 'warn'}`;
  }

  if (status) {
    const suffix = lastSync
      ? `Последняя синхронизация: ${new Date(lastSync).toLocaleString('ru-RU')}`
      : 'Облачная база ещё не синхронизирована.';
    status.textContent = navigator.onLine ? suffix : `Нет интернета. ${suffix}`;
    status.className = `cloud-sync-status ${navigator.onLine ? '' : 'warn'}`.trim();
  }
}

function refreshCurrentViewAfterSync() {
  if (state.mode === 'clients') {
    renderClients();
  } else if (state.mode === 'plan') {
    renderPlan();
  } else if (state.mode === 'about') {
    renderBackupInfo();
    runSystemDiagnostics();
  } else {
    renderHome();
  }
}

async function uploadCloudDatabase(options = {}) {
  const { manual = false, skipRemoteCheck = false } = options;
  const code = getCloudSyncCode();
  if (!code) {
    if (manual) window.alert('Сначала сохраните код синхронизации.');
    return false;
  }
  if (!navigator.onLine) {
    setCloudSyncStatus('Нет интернета — изменения сохранены на устройстве', 'warn');
    return false;
  }

  const localPayload = createBackupPayload();
  const localParsed = parseBackupPayload(localPayload);
  const localStats = databaseStats(localParsed);
  const localFingerprint = await localDataFingerprint(localParsed);

  if (databaseIsEmpty(localStats)) {
    if (manual) {
      window.alert(
        'Пустая база не отправляется в облако. Это защищает клиентов и работы от случайного удаления.',
      );
    }
    setCloudSyncStatus('Пустая база не может заменить облачную', 'warn');
    return false;
  }

  if (!skipRemoteCheck) {
    const remoteEnvelope = await downloadCloudEnvelope(code);
    if (remoteEnvelope) {
      const remotePayload = await decryptCloudPayload(remoteEnvelope, code);
      const remoteParsed = parseBackupPayload(remotePayload);
      const remoteStats = databaseStats(remoteParsed);
      const remoteFingerprint = await localDataFingerprint(remoteParsed);

      if (localFingerprint === remoteFingerprint) {
        await rememberCloudSyncPoint(localParsed, localFingerprint);
        setCloudSyncStatus('Все устройства используют одну базу', 'ok');
        return true;
      }

      if (databaseIsSmaller(localStats, remoteStats)) {
        if (!manual || !confirmReducedDatabase('Отправка в облако', localStats, remoteStats)) {
          setCloudSyncStatus('Отправка остановлена: на устройстве меньше данных', 'warn');
          return false;
        }
      } else if (
        manual &&
        parseTimestamp(remoteParsed.dataUpdatedAt || remoteParsed.exportedAt) >
          parseTimestamp(localPayload.dataUpdatedAt)
      ) {
        const approved = window.confirm(
          'В облаке есть более новые данные с другого устройства.\n\n' +
            'Нажмите OK, чтобы заменить их данными с этого устройства.',
        );
        if (!approved) return false;
      }
    }
  }

  const envelope = await encryptCloudPayload(localPayload, code);
  await uploadCloudEnvelope(envelope, code);
  await rememberCloudSyncPoint(localParsed, localFingerprint);
  setCloudSyncStatus('База отправлена в облако', 'ok');
  renderCloudSyncInfo();
  return true;
}

async function downloadCloudDatabase(options = {}) {
  const { manual = false, skipConfirm = false, previous = false } = options;
  const code = getCloudSyncCode();
  if (!code) {
    if (manual) window.alert('Сначала сохраните код синхронизации.');
    return false;
  }
  if (!navigator.onLine) {
    setCloudSyncStatus('Нет интернета — облачная база недоступна', 'warn');
    return false;
  }

  const envelope = await downloadCloudEnvelope(code, { previous });
  if (!envelope) {
    if (manual) {
      window.alert(
        previous
          ? 'Предыдущая облачная копия ещё не создана.'
          : 'В облаке пока нет базы. Сначала отправьте её с основного устройства.',
      );
    }
    setCloudSyncStatus(previous ? 'Предыдущей облачной копии нет' : 'Облачная база пока пуста', 'warn');
    return false;
  }

  const remotePayload = await decryptCloudPayload(envelope, code);
  const imported = parseBackupPayload(remotePayload);
  const remoteStats = databaseStats(imported);
  const localStats = databaseStats({ clients: state.clients });
  const remoteFingerprint = await localDataFingerprint(imported);

  if (databaseIsEmpty(remoteStats) && !databaseIsEmpty(localStats)) {
    if (manual) {
      window.alert(
        'Облачная база пуста. Загрузка остановлена, чтобы не удалить клиентов и работы на этом устройстве.',
      );
    }
    setCloudSyncStatus('Пустая облачная база заблокирована', 'warn');
    return false;
  }

  if (databaseIsSmaller(remoteStats, localStats)) {
    if (!manual || !confirmReducedDatabase('Загрузка из облака', remoteStats, localStats)) {
      setCloudSyncStatus('Загрузка остановлена: в облаке меньше данных', 'warn');
      return false;
    }
  } else if (manual && !skipConfirm) {
    const approved = window.confirm(
      `${previous ? 'Восстановить предыдущую облачную копию?' : 'Загрузить облачную базу?'}\n\n` +
        `В облаке: ${databaseStatsText(remoteStats)}.\n` +
        `На устройстве: ${databaseStatsText(localStats)}.\n\n` +
        'Перед заменой ГОРН сохранит точку отмены.',
    );
    if (!approved) return false;
  }

  localStorage.setItem(PRE_IMPORT_BACKUP_KEY, JSON.stringify(createBackupPayload()));
  const remoteUpdatedAt = imported.dataUpdatedAt || imported.exportedAt || new Date().toISOString();
  applyImportedData(imported, {
    dataUpdatedAt: remoteUpdatedAt,
    sync: false,
  });
  await rememberCloudSyncPoint(imported, remoteFingerprint);

  if (previous) {
    await uploadCloudDatabase({ manual: false, skipRemoteCheck: true });
    setCloudSyncStatus('Предыдущая облачная копия восстановлена', 'ok');
  } else {
    setCloudSyncStatus('Облачная база загружена на устройство', 'ok');
  }

  refreshCurrentViewAfterSync();
  renderCloudSyncInfo();
  return true;
}

async function synchronizeCloudDatabase(options = {}) {
  const { manual = false } = options;
  const code = getCloudSyncCode();
  if (!code || cloudSyncInProgress) {
    renderCloudSyncInfo();
    return;
  }
  if (!navigator.onLine) {
    renderCloudSyncInfo();
    return;
  }

  setCloudSyncBusy(true);
  setCloudSyncStatus('Безопасная синхронизация…');

  try {
    const localPayload = createBackupPayload();
    const localParsed = parseBackupPayload(localPayload);
    const localStats = databaseStats(localParsed);
    const localFingerprint = await localDataFingerprint(localParsed);
    const remoteEnvelope = await downloadCloudEnvelope(code);

    if (!remoteEnvelope) {
      if (databaseIsEmpty(localStats)) {
        setCloudSyncStatus('Нет данных для первой отправки в облако', 'warn');
      } else if (manual) {
        const approved = window.confirm(
          `В облаке пока нет базы. Отправить данные этого устройства?\n\n${databaseStatsText(localStats)}.`,
        );
        if (approved) await uploadCloudDatabase({ manual: false, skipRemoteCheck: true });
      } else {
        setCloudSyncStatus('Облако пусто — нажмите «Отправить в облако»', 'warn');
      }
      return;
    }

    const remotePayload = await decryptCloudPayload(remoteEnvelope, code);
    const remoteParsed = parseBackupPayload(remotePayload);
    const remoteStats = databaseStats(remoteParsed);
    const remoteFingerprint = await localDataFingerprint(remoteParsed);
    const lastFingerprint = getCloudLastFingerprint();

    if (localFingerprint === remoteFingerprint) {
      await rememberCloudSyncPoint(remoteParsed, remoteFingerprint);
      setCloudSyncStatus('Все устройства используют одну базу', 'ok');
      return;
    }

    if (!lastFingerprint) {
      if (databaseIsEmpty(localStats) && !databaseIsEmpty(remoteStats)) {
        await downloadCloudDatabase({ manual: false, skipConfirm: true });
        return;
      }

      if (!databaseIsEmpty(localStats) && databaseIsEmpty(remoteStats)) {
        if (manual) {
          const approved = window.confirm(
            `Облачная база пуста. Отправить восстановленные данные этого устройства?\n\n${databaseStatsText(localStats)}.`,
          );
          if (approved) await uploadCloudDatabase({ manual: false, skipRemoteCheck: true });
        } else {
          setCloudSyncStatus('Облако пусто — данные устройства сохранены', 'warn');
        }
        return;
      }

      setCloudSyncStatus('Нужно выбрать основную базу вручную', 'warn');
      if (manual) {
        const choice = toText(
          window.prompt(
            `На устройстве и в облаке разные базы.\n\n` +
              `Устройство: ${databaseStatsText(localStats)}.\n` +
              `Облако: ${databaseStatsText(remoteStats)}.\n\n` +
              'Введите УСТРОЙСТВО, чтобы отправить текущую базу, или ОБЛАКО, чтобы загрузить облачную.',
            '',
          ),
        ).trim().toUpperCase();
        if (choice === 'УСТРОЙСТВО') await uploadCloudDatabase({ manual: true });
        if (choice === 'ОБЛАКО') await downloadCloudDatabase({ manual: true });
      }
      return;
    }

    const localChanged = localFingerprint !== lastFingerprint;
    const remoteChanged = remoteFingerprint !== lastFingerprint;

    if (localChanged && !remoteChanged) {
      if (databaseIsSmaller(localStats, remoteStats)) {
        setCloudSyncStatus('Удаления не отправлены автоматически — подтвердите вручную', 'warn');
        if (manual) await uploadCloudDatabase({ manual: true });
      } else {
        await uploadCloudDatabase({ manual: false, skipRemoteCheck: true });
      }
      return;
    }

    if (!localChanged && remoteChanged) {
      if (databaseIsSmaller(remoteStats, localStats)) {
        setCloudSyncStatus('Облачная база меньше — автозагрузка остановлена', 'warn');
        if (manual) await downloadCloudDatabase({ manual: true });
      } else {
        await downloadCloudDatabase({ manual: false, skipConfirm: true });
      }
      return;
    }

    setCloudSyncStatus('На двух устройствах есть разные изменения', 'warn');
    if (manual) {
      const choice = toText(
        window.prompt(
          `Конфликт синхронизации.\n\n` +
            `Устройство: ${databaseStatsText(localStats)}.\n` +
            `Облако: ${databaseStatsText(remoteStats)}.\n\n` +
            'Введите УСТРОЙСТВО или ОБЛАКО. Отмена ничего не изменит.',
          '',
        ),
      ).trim().toUpperCase();
      if (choice === 'УСТРОЙСТВО') await uploadCloudDatabase({ manual: true });
      if (choice === 'ОБЛАКО') await downloadCloudDatabase({ manual: true });
    }
  } catch (error) {
    console.error('ГОРН: ошибка облачной синхронизации', error);
    setCloudSyncStatus(error.message || 'Не удалось синхронизировать базу', 'error');
    if (manual) window.alert(error.message || 'Не удалось синхронизировать базу.');
  } finally {
    setCloudSyncBusy(false);
    renderCloudSyncInfo();
  }
}

function scheduleCloudSync(delay = 3500) {
  if (!getCloudSyncCode() || !navigator.onLine) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => synchronizeCloudDatabase({ manual: false }), delay);
}

function initializeCloudSync() {
  ensureDataUpdatedAt();
  renderCloudSyncInfo();
  if (getCloudSyncCode() && navigator.onLine) {
    setTimeout(() => synchronizeCloudDatabase({ manual: false }), 700);
  }
}

function saveCloudSyncCode() {
  const input = $('#cloudSyncCodeInput');
  const code = normalizeCloudSyncCode(input?.value);

  if (code.length < CLOUD_SYNC_MIN_CODE_LENGTH) {
    window.alert(`Код должен содержать не меньше ${CLOUD_SYNC_MIN_CODE_LENGTH} букв или цифр.`);
    return;
  }

  try {
    localStorage.setItem(CLOUD_SYNC_CODE_KEY, code);
    clearCloudSyncPoint();
  } catch (error) {
    window.alert('Не удалось сохранить код на этом устройстве.');
    return;
  }

  cloudSyncStatusOverride = '';
  if (input) input.value = formatCloudSyncCode(code);
  renderCloudSyncInfo();
  showToast('Синхронизация подключена');
  synchronizeCloudDatabase({ manual: true });
}

function disconnectCloudSync() {
  if (!getCloudSyncCode()) return;
  if (!window.confirm('Отключить облачную синхронизацию на этом устройстве? Локальные данные сохранятся.')) {
    return;
  }

  localStorage.removeItem(CLOUD_SYNC_CODE_KEY);
  clearCloudSyncPoint();
  cloudSyncStatusOverride = '';
  const input = $('#cloudSyncCodeInput');
  if (input) input.value = '';
  renderCloudSyncInfo();
  showToast('Синхронизация отключена');
}

async function copyCloudSyncCode() {
  const code = formatCloudSyncCode(
    normalizeCloudSyncCode($('#cloudSyncCodeInput')?.value) || getCloudSyncCode(),
  );
  if (!code) {
    showToast('Сначала создайте код');
    return;
  }

  try {
    await navigator.clipboard.writeText(code);
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
  showToast('Код скопирован');
}


function countClientWorks(clients = state.clients) {
  return clients.reduce(
    (total, client) => total + (Array.isArray(client.works) ? client.works.length : 0),
    0,
  );
}

function createBackupPayload() {
  return {
    format: BACKUP_FORMAT,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    appVersion: APP_META.version,
    exportedAt: new Date().toISOString(),
    dataUpdatedAt: ensureDataUpdatedAt(),
    deviceId: getCloudDeviceId(),
    data: {
      clients: state.clients,
      favorites: state.favorites,
      recent: state.recent,
      businessProfile: state.businessProfile,
    },
  };
}

function backupFileName(prefix = 'GORN_DATA_BACKUP') {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
  ].join('-');
  return `${prefix}_${stamp}.json`;
}

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportBackup() {
  downloadJson(createBackupPayload(), backupFileName());
  showToast('Резервная копия скачана');
}

function normalizeImportedClients(rawClients) {
  if (!Array.isArray(rawClients)) {
    throw new Error('В резервной копии отсутствует список клиентов');
  }

  const usedClientIds = new Set();
  return rawClients.map((rawClient, clientIndex) => {
    const client = normalizeClient(rawClient, clientIndex);
    if (usedClientIds.has(client.id)) client.id = createClientId();
    usedClientIds.add(client.id);

    const usedWorkIds = new Set();
    client.works = client.works.map((work, workIndex) => {
      const normalizedWork = normalizeWork(work, workIndex);
      if (usedWorkIds.has(normalizedWork.id)) normalizedWork.id = createWorkId();
      usedWorkIds.add(normalizedWork.id);
      return normalizedWork;
    });
    return client;
  });
}

function parseBackupPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object') {
    throw new Error('Файл не содержит резервную копию GORN');
  }
  if (rawPayload.format !== BACKUP_FORMAT) {
    throw new Error('Это не файл резервной копии GORN');
  }
  if (Number(rawPayload.schemaVersion) !== BACKUP_SCHEMA_VERSION) {
    throw new Error('Версия формата резервной копии не поддерживается');
  }
  if (!rawPayload.data || typeof rawPayload.data !== 'object') {
    throw new Error('В резервной копии отсутствуют данные');
  }

  const clients = normalizeImportedClients(rawPayload.data.clients);
  const favorites = toArray(rawPayload.data.favorites);
  const recent = toArray(rawPayload.data.recent);
  const businessProfile = normalizeBusinessProfile(rawPayload.data.businessProfile);

  return {
    clients,
    favorites,
    recent,
    businessProfile,
    appVersion: toText(rawPayload.appVersion, 'не указана'),
    exportedAt: toText(rawPayload.exportedAt),
    dataUpdatedAt: toText(rawPayload.dataUpdatedAt || rawPayload.exportedAt),
    deviceId: toText(rawPayload.deviceId),
  };
}

function applyImportedData(data, options = {}) {
  const { dataUpdatedAt = new Date().toISOString(), sync = true } = options;
  state.clients = data.clients;
  state.favorites = data.favorites.filter((id) => state.cards.some((card) => card.id === id));
  state.recent = data.recent.filter((id) => state.cards.some((card) => card.id === id));
  state.businessProfile = normalizeBusinessProfile(data.businessProfile);
  state.clientSearch = '';
  state.clientStatusFilter = stateDefaults.clientStatusFilter;
  state.clientSort = stateDefaults.clientSort;
  state.editingClientId = null;
  state.editingWorkId = null;
  state.workChecklistDraft = null;
  state.workEstimateDraft = null;
  localStorage.setItem(CLOUD_SYNC_UPDATED_KEY, dataUpdatedAt);
  save({ markChanged: false, sync });
}

function readUndoImportBackup() {
  try {
    const raw = localStorage.getItem(PRE_IMPORT_BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('GORN: точка отмены импорта повреждена', error);
    localStorage.removeItem(PRE_IMPORT_BACKUP_KEY);
    return null;
  }
}

async function importBackupFile(event) {
  const input = event.target;
  const file = input?.files?.[0];
  if (!file) return;

  try {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Файл слишком большой — максимум 10 МБ');
    }

    const rawPayload = JSON.parse(await file.text());
    const imported = parseBackupPayload(rawPayload);
    const currentWorks = countClientWorks(state.clients);
    const importedWorks = countClientWorks(imported.clients);
    const approved = window.confirm(
      `Импорт заменит текущую базу.\n\n` +
        `Сейчас: ${state.clients.length} клиентов, ${currentWorks} работ.\n` +
        `В файле: ${imported.clients.length} клиентов, ${importedWorks} работ.\n\n` +
        'Перед заменой GORN сохранит точку отмены на этом устройстве. Продолжить?',
    );
    if (!approved) return;

    localStorage.setItem(PRE_IMPORT_BACKUP_KEY, JSON.stringify(createBackupPayload()));
    applyImportedData(imported, { dataUpdatedAt: imported.dataUpdatedAt || new Date().toISOString() });
    closeClientForm();
    renderBackupInfo();
    showToast('База восстановлена');
  } catch (error) {
    console.error('GORN: ошибка импорта резервной копии', error);
    window.alert(`Не удалось импортировать базу.\n${error.message || 'Проверьте файл.'}`);
  } finally {
    if (input) input.value = '';
  }
}

function undoLastImport() {
  const rawPayload = readUndoImportBackup();
  if (!rawPayload) {
    showToast('Точки отмены нет');
    renderBackupInfo();
    return;
  }

  try {
    const previous = parseBackupPayload(rawPayload);
    const works = countClientWorks(previous.clients);
    if (
      !window.confirm(
        `Вернуть базу до последнего импорта: ${previous.clients.length} клиентов, ${works} работ?`,
      )
    ) {
      return;
    }

    applyImportedData(previous, { dataUpdatedAt: previous.dataUpdatedAt || new Date().toISOString() });
    localStorage.removeItem(PRE_IMPORT_BACKUP_KEY);
    closeClientForm();
    renderBackupInfo();
    showToast('Предыдущая база возвращена');
  } catch (error) {
    console.error('GORN: не удалось отменить импорт', error);
    localStorage.removeItem(PRE_IMPORT_BACKUP_KEY);
    renderBackupInfo();
    window.alert('Точка отмены повреждена и была удалена.');
  }
}

function renderBackupInfo() {
  const stats = $('#backupStats');
  const undoButton = $('#undoImportBtn');
  const works = countClientWorks(state.clients);
  if (stats) {
    stats.textContent = `В текущей базе: ${state.clients.length} клиентов, ${works} работ`;
  }
  if (undoButton) {
    undoButton.classList.toggle('hidden', !readUndoImportBackup());
  }
  renderCloudSyncInfo();
}

function formatStorageBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function setSystemCheck(id, text, tone = 'ok') {
  const element = $(`#${id}`);
  if (!element) return;
  element.textContent = text;
  element.className = `check-${tone}`;
}

function validateRuntimeDatabase() {
  const cardIds = new Set();
  const clientIds = new Set();
  let duplicateCards = 0;
  let duplicateClients = 0;

  state.cards.forEach((card) => {
    if (cardIds.has(card.id)) duplicateCards += 1;
    cardIds.add(card.id);
  });
  state.clients.forEach((client) => {
    if (clientIds.has(client.id)) duplicateClients += 1;
    clientIds.add(client.id);
  });

  return {
    valid: state.cards.length > 0 && duplicateCards === 0 && duplicateClients === 0,
    duplicateCards,
    duplicateClients,
  };
}

async function runSystemDiagnostics() {
  const summary = $('#systemCheckSummary');
  if (summary) {
    summary.textContent = 'Выполняется проверка…';
    summary.className = 'system-check-summary';
  }

  const issues = [];
  const online = navigator.onLine;
  setSystemCheck('checkOnline', online ? 'Есть соединение' : 'Офлайн', online ? 'ok' : 'warn');

  let storageOk = false;
  try {
    const testKey = '__gorn_storage_test__';
    localStorage.setItem(testKey, 'ok');
    storageOk = localStorage.getItem(testKey) === 'ok';
    localStorage.removeItem(testKey);
  } catch (error) {
    storageOk = false;
  }
  setSystemCheck('checkStorage', storageOk ? 'Работает' : 'Ошибка', storageOk ? 'ok' : 'error');
  if (!storageOk) issues.push('локальное хранилище');

  const hasServiceWorker = 'serviceWorker' in navigator;
  let serviceWorkerReady = false;
  if (hasServiceWorker) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      serviceWorkerReady = Boolean(registration && (registration.active || registration.waiting));
    } catch (error) {
      serviceWorkerReady = false;
    }
  }
  setSystemCheck(
    'checkServiceWorker',
    serviceWorkerReady ? 'Готов' : hasServiceWorker ? 'Устанавливается' : 'Не поддерживается',
    serviceWorkerReady ? 'ok' : 'warn',
  );
  if (!serviceWorkerReady) issues.push('офлайн-режим');

  const validation = validateRuntimeDatabase();
  setSystemCheck(
    'checkCards',
    validation.valid ? `${state.cards.length} карточек` : 'Есть ошибки',
    validation.valid ? 'ok' : 'error',
  );
  if (!validation.valid) issues.push('база карточек');

  const works = countClientWorks(state.clients);
  setSystemCheck('checkDatabase', `${state.clients.length} клиентов, ${works} работ`, 'ok');

  const cloudCode = getCloudSyncCode();
  setSystemCheck(
    'checkCloudSync',
    cloudCode ? (navigator.onLine ? 'Подключена' : 'Офлайн') : 'Не настроена',
    cloudCode ? (navigator.onLine ? 'ok' : 'warn') : 'warn',
  );

  let usageLabel = 'Недоступно';
  let usageTone = 'warn';
  if (navigator.storage?.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = Number(estimate.usage) || 0;
      const quota = Number(estimate.quota) || 0;
      usageLabel = quota
        ? `${formatStorageBytes(usage)} из ${formatStorageBytes(quota)}`
        : formatStorageBytes(usage);
      usageTone = quota && usage / quota > 0.85 ? 'warn' : 'ok';
      if (quota && usage / quota > 0.95) issues.push('свободная память');
    } catch (error) {
      usageLabel = 'Недоступно';
    }
  }
  setSystemCheck('checkStorageUsage', usageLabel, usageTone);

  if (summary) {
    if (!issues.length) {
      summary.textContent = 'Система готова к рабочему использованию';
      summary.className = 'system-check-summary ok';
    } else {
      summary.textContent = `Требует внимания: ${issues.join(', ')}`;
      summary.className = 'system-check-summary warn';
    }
  }
}



function parseAmountNumber(value) {
  const digits = toText(value).replace(/[^\d]/g, '');
  if (!digits) return 0;
  const amount = Number(digits);
  return Number.isFinite(amount) ? amount : 0;
}

function formatRubles(value) {
  const amount = Number(value) || 0;
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(amount)} ₽`;
}


function comparePlanEntries(a, b) {
  return String(a.work.date).localeCompare(String(b.work.date)) ||
    String(a.work.startTime || '99:99').localeCompare(String(b.work.startTime || '99:99')) ||
    String(b.work.updatedAt).localeCompare(String(a.work.updatedAt));
}

function calendarSafeFilename(value, fallback = 'событие') {
  const cleaned = toText(value, fallback)
    .replace(/[\\/:*?\"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 80);
  return cleaned || fallback;
}

function escapeIcsText(value) {
  return toText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function icsDate(value) {
  return toText(value).replaceAll('-', '');
}

function icsLocalDateTime(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function icsUtcTimestamp(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function foldIcsLine(line) {
  const width = 72;
  if (line.length <= width) return line;
  const parts = [];
  for (let index = 0; index < line.length; index += width) {
    parts.push(`${index ? ' ' : ''}${line.slice(index, index + width)}`);
  }
  return parts.join('\r\n');
}

function calendarDescription(entry, occurrence = {}) {
  const { clientName, clientPhone, work } = entry;
  const totalDays = normalizeWorkDaysCount(work.daysCount);
  const dayLabel = totalDays > 1 && occurrence.dayIndex
    ? `День проекта: ${occurrence.dayIndex} из ${totalDays}`
    : '';
  return [
    clientName ? `Клиент: ${clientName}` : '',
    clientPhone ? `Телефон: ${clientPhone}` : '',
    totalDays > 1 ? `Период работ: ${workPeriodText(work, false)}` : '',
    dayLabel,
    work.status ? `Статус: ${work.status}` : '',
    work.amount ? `Стоимость: ${work.amount}` : '',
    work.notes ? `Договорённости: ${work.notes}` : '',
    '',
    'ГОРН — Там, где рождается тепло дома.',
  ].filter((line, index, lines) => line || (index && lines[index - 1])).join('\n');
}

function buildIcsEvent(entry, occurrenceDate = entry.work.date, dayIndex = 1, totalDays = 1) {
  const { clientId, clientAddress, work } = entry;
  const title = totalDays > 1
    ? `ГОРН — ${work.title} — день ${dayIndex} из ${totalDays}`
    : `ГОРН — ${work.title}`;
  const lines = [
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(`gorn-${clientId}-${work.id}-${occurrenceDate}-${dayIndex}@ingorn.ru`)}`,
    `DTSTAMP:${icsUtcTimestamp()}`,
    `SUMMARY:${escapeIcsText(title)}`,
  ];

  if (work.startTime) {
    const start = new Date(`${occurrenceDate}T${work.startTime}:00`);
    const end = new Date(start.getTime() + (Number(work.durationMinutes) || 180) * 60000);
    lines.push(`DTSTART:${icsLocalDateTime(start)}`);
    lines.push(`DTEND:${icsLocalDateTime(end)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${icsDate(occurrenceDate)}`);
    lines.push(`DTEND;VALUE=DATE:${icsDate(addDaysISO(occurrenceDate, 1))}`);
  }

  const address = work.address || clientAddress;
  if (address) lines.push(`LOCATION:${escapeIcsText(address)}`);
  lines.push(`DESCRIPTION:${escapeIcsText(calendarDescription(entry, { dayIndex, totalDays }))}`);
  lines.push('STATUS:CONFIRMED');

  if (work.startTime && Number(work.reminderMinutes) > 0) {
    lines.push('BEGIN:VALARM');
    lines.push(`TRIGGER:-PT${Math.round(Number(work.reminderMinutes))}M`);
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:${escapeIcsText(`Напоминание ГОРН: ${work.title}`)}`);
    lines.push('END:VALARM');
  }

  lines.push('END:VEVENT');
  return lines.map(foldIcsLine).join('\r\n');
}

function buildIcsCalendar(entries, calendarName = 'План работ ГОРН') {
  const events = entries.flatMap((entry) => {
    const dates = workScheduleDates(entry.work);
    return dates.map((date, index) => buildIcsEvent(entry, date, index + 1, dates.length));
  }).join('\r\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GORN//MASTER SYSTEM//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    events,
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

async function shareCalendarFile(content, filename, title) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const file = new File([blob], filename, { type: 'text/calendar' });

  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share({
        title,
        text: 'Событие из ГОРН MASTER SYSTEM',
        files: [file],
      });
      showToast('Календарь передан в меню отправки');
      return;
    }
  } catch (error) {
    if (error?.name === 'AbortError') return;
    console.warn('GORN: меню отправки календаря недоступно', error);
  }

  downloadBlob(blob, filename);
  showToast('Файл календаря сформирован');
}

function findCalendarEntry(clientId, workId) {
  const client = state.clients.find((item) => item.id === clientId);
  const work = client?.works?.find((item) => item.id === workId);
  if (!client || !work) return null;
  return {
    clientId: client.id,
    clientName: client.name,
    clientPhone: client.phone,
    clientAddress: client.address,
    clientStatus: client.status,
    work,
  };
}

async function exportSavedWorkCalendar(clientId, workId) {
  const entry = findCalendarEntry(clientId, workId);
  if (!entry) {
    showToast('Работа не найдена');
    return;
  }
  const filename = `GORN_${calendarSafeFilename(entry.clientName)}_${calendarSafeFilename(entry.work.title)}_${entry.work.date}.ics`;
  await shareCalendarFile(
    buildIcsCalendar([entry], `ГОРН — ${entry.work.title}`),
    filename,
    `ГОРН — ${entry.work.title}`,
  );
}

function workCalendarEntryFromForm() {
  const client = currentEditingClient();
  if (!client) return null;
  const title = toText($('#workTitle')?.value);
  if (!title) {
    showToast('Укажите вид работы');
    return null;
  }

  const work = normalizeWork({
    id: state.editingWorkId || `DRAFT-${Date.now()}`,
    title,
    date: $('#workDate')?.value || localDateISO(),
    startTime: $('#workStartTime')?.value || '',
    durationMinutes: Number($('#workDurationMinutes')?.value) || 180,
    reminderMinutes: Number($('#workReminderMinutes')?.value) || 0,
    daysCount: normalizeWorkDaysCount($('#workDaysCount')?.value),
    skipWeekends: Boolean($('#workSkipWeekends')?.checked),
    address: $('#workAddress')?.value || client.address,
    status: $('#workStatus')?.value || 'Планируется',
    amount: $('#workAmount')?.value || '',
    notes: $('#workNotes')?.value || '',
  });

  return {
    clientId: client.id,
    clientName: client.name,
    clientPhone: client.phone,
    clientAddress: client.address,
    clientStatus: client.status,
    work,
  };
}

async function exportWorkCalendarFromForm() {
  dismissSoftKeyboard();
  const entry = workCalendarEntryFromForm();
  if (!entry) return;
  const filename = `GORN_${calendarSafeFilename(entry.clientName)}_${calendarSafeFilename(entry.work.title)}_${entry.work.date}.ics`;
  await shareCalendarFile(
    buildIcsCalendar([entry], `ГОРН — ${entry.work.title}`),
    filename,
    `ГОРН — ${entry.work.title}`,
  );
}

async function exportPlanCalendar() {
  const entries = collectPlanEntries()
    .filter((entry) => isActivePlanWork(entry.work))
    .sort(comparePlanEntries);
  if (!entries.length) {
    showToast('В плане пока нет активных работ');
    return;
  }
  await shareCalendarFile(
    buildIcsCalendar(entries, 'План работ ГОРН'),
    `GORN_План_работ_${localDateISO()}.ics`,
    'План работ ГОРН',
  );
}

function collectPlanEntries() {
  return state.clients.flatMap((client) =>
    (client.works || []).map((work) => ({
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientAddress: client.address,
      clientStatus: client.status,
      work,
    })),
  );
}

function isActivePlanWork(work) {
  return work.status === 'Планируется' || work.status === 'В работе';
}

function renderPlan() {
  const today = localDateISO();
  const allEntries = collectPlanEntries();
  const query = normalizeSearchText(state.planSearch);
  const tokens = query.split(' ').filter(Boolean);

  const visibleEntries = allEntries.filter((entry) => {
    if (!tokens.length) return true;
    const text = [
      entry.clientName,
      entry.clientPhone,
      entry.clientAddress,
      entry.clientStatus,
      entry.work.title,
      entry.work.date,
      entry.work.startTime,
      entry.work.address,
      entry.work.status,
      entry.work.amount,
      entry.work.notes,
    ].join(' ');
    return fieldContainsTokens(text, tokens);
  });

  const todayEntries = visibleEntries
    .filter((entry) => isActivePlanWork(entry.work) && isWorkScheduledOnDate(entry.work, today))
    .sort(comparePlanEntries);

  const overdueEntries = visibleEntries
    .filter((entry) => isActivePlanWork(entry.work) && workEndDate(entry.work) < today)
    .sort((a, b) =>
      String(workEndDate(a.work)).localeCompare(String(workEndDate(b.work))) ||
      String(b.work.updatedAt).localeCompare(String(a.work.updatedAt)),
    );

  const upcomingEntries = visibleEntries
    .filter((entry) =>
      isActivePlanWork(entry.work) &&
      !isWorkScheduledOnDate(entry.work, today) &&
      workEndDate(entry.work) >= today
    )
    .sort((a, b) =>
      String(nextScheduledWorkDate(a.work, today)).localeCompare(String(nextScheduledWorkDate(b.work, today))) ||
      comparePlanEntries(a, b)
    );

  const plannedAmount = allEntries
    .filter((entry) => entry.work.status === 'Планируется')
    .reduce((total, entry) => total + parseAmountNumber(entry.work.amount), 0);
  const completedAmount = allEntries
    .filter((entry) => entry.work.status === 'Завершено')
    .reduce((total, entry) => total + parseAmountNumber(entry.work.amount), 0);
  const allTodayCount = allEntries.filter(
    (entry) => isActivePlanWork(entry.work) && isWorkScheduledOnDate(entry.work, today),
  ).length;
  const allOverdueCount = allEntries.filter(
    (entry) => isActivePlanWork(entry.work) && workEndDate(entry.work) < today,
  ).length;

  $('#planTodayCount').textContent = String(allTodayCount);
  $('#planOverdueCount').textContent = String(allOverdueCount);
  $('#planPlannedAmount').textContent = formatRubles(plannedAmount);
  $('#planCompletedAmount').textContent = formatRubles(completedAmount);

  const activeCalendarEntries = allEntries
    .filter((entry) => isActivePlanWork(entry.work))
    .sort(comparePlanEntries);
  const exportPlanButton = $('#exportPlanCalendarBtn');
  if (exportPlanButton) {
    exportPlanButton.disabled = activeCalendarEntries.length === 0;
    exportPlanButton.textContent = activeCalendarEntries.length
      ? `🗓 В календарь (${activeCalendarEntries.length})`
      : '🗓 В календарь';
  }

  renderPlanSection('Today', todayEntries, tokens.length > 0);
  renderPlanSection('Overdue', overdueEntries, tokens.length > 0);
  renderPlanSection('Upcoming', upcomingEntries, tokens.length > 0);

  document.querySelectorAll('[data-plan-client-id]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      openClientFromPlan(button.dataset.planClientId);
    };
  });
  document.querySelectorAll('[data-plan-calendar-client-id]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      exportSavedWorkCalendar(
        button.dataset.planCalendarClientId,
        button.dataset.planCalendarWorkId,
      );
    };
  });
}

function renderPlanSection(section, entries, isSearch) {
  const list = $(`#plan${section}List`);
  const empty = $(`#plan${section}Empty`);
  const badge = $(`#plan${section}Badge`);
  if (!list || !empty || !badge) return;

  list.innerHTML = entries.map(planWorkCard).join('');
  badge.textContent = `(${entries.length})`;
  empty.textContent = isSearch
    ? 'По вашему запросу ничего не найдено'
    : {
        Today: 'На сегодня работ нет',
        Overdue: 'Просроченных работ нет',
        Upcoming: 'Ближайших работ пока нет',
      }[section];
  empty.classList.toggle('hidden', entries.length > 0);
}

function planWorkCard(entry) {
  const { clientId, clientName, clientPhone, clientAddress, work } = entry;
  const phoneHref = toText(clientPhone).replace(/[^\d+]/g, '');
  const statusClass = {
    'Планируется': 'planned',
    'В работе': 'progress',
    'Завершено': 'done',
    'Отменено': 'cancelled',
  }[work.status] || 'planned';
  const address = work.address || clientAddress;
  const checklist = workChecklistProgress(work.checklist);
  const details = [
    work.date ? `🗓 ${esc(workPeriodText(work))}` : '',
    currentWorkDayText(work) ? `🏗 ${esc(currentWorkDayText(work))}` : '',
    work.startTime ? `🕒 ${esc(work.startTime)}` : '',
    clientName ? `👤 ${esc(clientName)}` : '',
    address ? `📍 ${esc(address)}` : '',
    work.amount ? `💰 ${esc(work.amount)}` : '',
    checklist.total ? `☑ ${checklist.done}/${checklist.total}` : '',
    checklist.photos ? `📷 ${checklist.photos}` : '',
  ].filter(Boolean);

  return `
    <article class="plan-work-card">
      <div class="plan-work-main">
        <div class="plan-work-heading">
          <div>
            <div class="plan-work-title">${esc(work.title)}</div>
            <div class="plan-work-details">${details.join('<span>•</span>')}</div>
          </div>
          <span class="work-status ${esc(statusClass)}">${esc(work.status)}</span>
        </div>
        ${work.notes ? `<div class="plan-work-notes">${esc(work.notes)}</div>` : ''}
      </div>
      <div class="plan-work-actions">
        ${phoneHref ? `<a class="client-call" href="tel:${esc(phoneHref)}">Позвонить</a>` : ''}
        <button class="calendar-action-btn" data-plan-calendar-client-id="${esc(clientId)}" data-plan-calendar-work-id="${esc(work.id)}" type="button">🗓 В календарь</button>
        <button class="client-open-btn" data-plan-client-id="${esc(clientId)}" type="button">Открыть клиента</button>
      </div>
    </article>`;
}

function dismissSoftKeyboard() {
  const active = document.activeElement;
  if (
    active &&
    active !== document.body &&
    typeof active.blur === 'function'
  ) {
    active.blur();
  }
}

function openClientFromPlan(clientId) {
  if (!state.clients.some((client) => client.id === clientId)) {
    showToast('Клиент не найден');
    return;
  }
  showClientsView(true);
  openClientForm(clientId);
}


function renderClients() {
  const query = normalizeSearchText(state.clientSearch);
  const tokens = query.split(' ').filter(Boolean);
  const totalClients = state.clients.length;
  let clients = [...state.clients].filter((client) => {
    const statusMatches =
      state.clientStatusFilter === 'Все' || client.status === state.clientStatusFilter;
    if (!statusMatches) return false;
    if (!tokens.length) return true;

    const worksText = (client.works || [])
      .flatMap((work) => [work.title, work.date, work.address, work.status, work.amount, work.notes])
      .join(' ');
    const text = [
      client.name,
      client.phone,
      client.address,
      client.notes,
      client.date,
      client.status,
      worksText,
    ].join(' ');
    return fieldContainsTokens(text, tokens);
  });

  const sorters = {
    updated: (a, b) =>
      String(b.updatedAt).localeCompare(String(a.updatedAt)) ||
      String(b.date).localeCompare(String(a.date)),
    dateDesc: (a, b) =>
      String(b.date).localeCompare(String(a.date)) ||
      String(b.updatedAt).localeCompare(String(a.updatedAt)),
    nameAsc: (a, b) => String(a.name).localeCompare(String(b.name), 'ru'),
  };
  clients.sort(sorters[state.clientSort] || sorters.updated);

  const isFiltered = Boolean(query) || state.clientStatusFilter !== 'Все';
  $('#clientsCountBadge').textContent = isFiltered
    ? `(${clients.length} из ${totalClients})`
    : `(${totalClients})`;
  $('#clientsList').innerHTML = clients.map(clientCard).join('');
  $('#clientsEmpty').textContent = query || state.clientStatusFilter !== 'Все'
    ? 'Ничего не найдено'
    : 'Клиентов пока нет';
  $('#clientsEmpty').classList.toggle('hidden', clients.length > 0);

  document.querySelectorAll('[data-client-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.clientFilter === state.clientStatusFilter);
  });
  const clientSort = $('#clientSort');
  if (clientSort && clientSort.value !== state.clientSort) clientSort.value = state.clientSort;

  document.querySelectorAll('[data-client-id]').forEach((element) => {
    element.onclick = () => openClientForm(element.dataset.clientId);
  });

  document.querySelectorAll('.client-call').forEach((link) => {
    link.onclick = (event) => event.stopPropagation();
  });
}

function clientCard(client) {
  const phoneHref = client.phone.replace(/[^\d+]/g, '');
  const works = Array.isArray(client.works) ? client.works : [];
  const statusClass = clientStatusClass(client.status);
  const latestWork = [...works].sort(
    (a, b) => String(b.date).localeCompare(String(a.date)) || String(b.updatedAt).localeCompare(String(a.updatedAt)),
  )[0];
  const details = [
    client.phone ? `☎ ${esc(client.phone)}` : '',
    client.address ? `📍 ${esc(client.address)}` : '',
    client.date ? `🗓 ${esc(formatClientDate(client.date))}` : '',
    works.length ? `🧱 ${esc(workCountLabel(works.length))}` : '',
  ].filter(Boolean);
  const preview = latestWork
    ? `${latestWork.title}${latestWork.status ? ` · ${latestWork.status}` : ''}`
    : client.notes;

  return `
    <article class="client-card" data-client-id="${esc(client.id)}">
      <div class="client-card-main">
        <div class="client-avatar">👤</div>
        <div class="client-card-content">
          <div class="client-name-row">
            <div class="client-name">${esc(client.name)}</div>
            <span class="client-status ${esc(statusClass)}">${esc(client.status)}</span>
          </div>
          <div class="client-details">${details.join('<span>•</span>')}</div>
          ${preview ? `<div class="client-notes-preview">${esc(preview)}</div>` : ''}
        </div>
      </div>
      <div class="client-card-actions">
        ${phoneHref ? `<a class="client-call" href="tel:${esc(phoneHref)}">Позвонить</a>` : ''}
        <button class="client-open-btn" type="button">Открыть</button>
      </div>
    </article>`;
}

function openClientForm(clientId = null) {
  dismissSoftKeyboard();
  const client = clientId ? state.clients.find((item) => item.id === clientId) : null;
  state.editingClientId = client?.id || null;
  state.editingWorkId = null;

  $('#clientFormTitle').textContent = client ? 'Карточка клиента' : 'Новый клиент';
  $('#clientName').value = client?.name || '';
  $('#clientPhone').value = client?.phone || '';
  $('#clientAddress').value = client?.address || '';
  $('#clientDate').value = client?.date || localDateISO();
  $('#clientStatus').value = client?.status || 'Новый';
  $('#clientNotes').value = client?.notes || '';
  $('#deleteClientBtn').classList.toggle('hidden', !client);
  $('#clientFormWrap').classList.remove('hidden');
  $('#clientsList').classList.add('hidden');
  $('#clientsEmpty').classList.add('hidden');
  $('#clientsTools')?.classList.add('hidden');
  $('#newClientBtn').classList.add('hidden');
  closeWorkForm();
  renderWorkHistory(client);
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function closeClientForm() {
  dismissSoftKeyboard();
  state.editingClientId = null;
  state.editingWorkId = null;
  $('#clientForm')?.reset();
  $('#workForm')?.reset();
  $('#clientFormWrap')?.classList.add('hidden');
  $('#workHistoryWrap')?.classList.add('hidden');
  $('#workFormWrap')?.classList.add('hidden');
  $('#clientsList')?.classList.remove('hidden');
  $('#clientsTools')?.classList.remove('hidden');
  $('#newClientBtn')?.classList.remove('hidden');
  if (state.mode === 'clients') renderClients();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function saveClientFromForm(event) {
  event.preventDefault();

  const name = toText($('#clientName').value);
  if (!name) {
    $('#clientName').focus();
    showToast('Укажите имя клиента');
    return;
  }

  const now = new Date().toISOString();
  const existingIndex = state.clients.findIndex((client) => client.id === state.editingClientId);
  const existing = existingIndex >= 0 ? state.clients[existingIndex] : null;
  const client = normalizeClient(
    {
      id: existing?.id || createClientId(),
      name,
      phone: $('#clientPhone').value,
      address: $('#clientAddress').value,
      date: $('#clientDate').value || localDateISO(),
      notes: $('#clientNotes').value,
      status: $('#clientStatus').value,
      works: existing?.works || [],
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    },
    state.clients.length,
  );

  if (existingIndex >= 0) {
    state.clients.splice(existingIndex, 1, client);
  } else {
    state.clients.unshift(client);
  }

  save();
  closeClientForm();
  showToast(existing ? 'Карточка обновлена' : 'Клиент сохранён');
}

function deleteEditingClient() {
  const client = state.clients.find((item) => item.id === state.editingClientId);
  if (!client) return;
  if (!window.confirm(`Удалить клиента «${client.name}»?`)) return;

  state.clients = state.clients.filter((item) => item.id !== client.id);
  save();
  closeClientForm();
  showToast('Клиент удалён');
}

function currentEditingClient() {
  return state.clients.find((client) => client.id === state.editingClientId) || null;
}

function renderWorkHistory(client = currentEditingClient()) {
  const wrap = $('#workHistoryWrap');
  if (!wrap) return;

  if (!client) {
    wrap.classList.add('hidden');
    return;
  }

  wrap.classList.remove('hidden');
  const allWorks = [...(client.works || [])];
  let works = allWorks.filter(
    (work) => state.workStatusFilter === 'Все' || work.status === state.workStatusFilter,
  );

  const sorters = {
    dateDesc: (a, b) =>
      String(b.date).localeCompare(String(a.date)) ||
      String(b.updatedAt).localeCompare(String(a.updatedAt)),
    dateAsc: (a, b) =>
      String(a.date).localeCompare(String(b.date)) ||
      String(a.updatedAt).localeCompare(String(b.updatedAt)),
    updated: (a, b) =>
      String(b.updatedAt).localeCompare(String(a.updatedAt)) ||
      String(b.date).localeCompare(String(a.date)),
  };
  works.sort(sorters[state.workSort] || sorters.dateDesc);

  const isFiltered = state.workStatusFilter !== 'Все';
  $('#workCountBadge').textContent = isFiltered
    ? `(${works.length} из ${allWorks.length})`
    : `(${allWorks.length})`;
  $('#workList').innerHTML = works.map(workCard).join('');
  $('#workEmpty').textContent = isFiltered ? 'Работ с таким статусом нет' : 'История работ пока пуста';
  $('#workEmpty').classList.toggle('hidden', works.length > 0);

  document.querySelectorAll('[data-work-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.workFilter === state.workStatusFilter);
  });
  const workSort = $('#workSort');
  if (workSort && workSort.value !== state.workSort) workSort.value = state.workSort;

  document.querySelectorAll('[data-work-id]').forEach((element) => {
    element.onclick = () => openWorkForm(element.dataset.workId);
  });
  document.querySelectorAll('[data-work-calendar-id]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      exportSavedWorkCalendar(state.editingClientId, button.dataset.workCalendarId);
    };
  });
}

function workCard(work) {
  const checklist = workChecklistProgress(work.checklist);
  const estimate = calculateWorkEstimate(work.estimate);
  const shownAmount = work.amount || (estimate.total ? formatRubles(estimate.total) : '');
  const details = [
    work.date ? `🗓 ${esc(workPeriodText(work))}` : '',
    currentWorkDayText(work) ? `🏗 ${esc(currentWorkDayText(work))}` : '',
    work.startTime ? `🕒 ${esc(work.startTime)}` : '',
    work.address ? `📍 ${esc(work.address)}` : '',
    shownAmount ? `💰 ${esc(shownAmount)}` : '',
    estimate.lineCount ? `🧾 ${estimate.lineCount}` : '',
    checklist.total ? `☑ ${checklist.done}/${checklist.total}` : '',
    checklist.photos ? `📷 ${checklist.photos}` : '',
  ].filter(Boolean);
  const statusClass = {
    'Планируется': 'planned',
    'В работе': 'progress',
    'Завершено': 'done',
    'Отменено': 'cancelled',
  }[work.status] || 'planned';

  return `
    <article class="work-card" data-work-id="${esc(work.id)}">
      <div class="work-card-top">
        <div>
          <div class="work-title">${esc(work.title)}</div>
          <div class="work-details">${details.join('<span>•</span>')}</div>
        </div>
        <span class="work-status ${esc(statusClass)}">${esc(work.status)}</span>
      </div>
      ${work.notes ? `<div class="work-notes-preview">${esc(work.notes)}</div>` : ''}
      <div class="work-card-actions">
        <button class="calendar-action-btn" data-work-calendar-id="${esc(work.id)}" type="button">🗓 В календарь</button>
        <button class="work-open-btn" type="button">Открыть запись</button>
      </div>
    </article>`;
}


function renderWorkChecklistDraft() {
  const checklist = state.workChecklistDraft || normalizeWorkChecklist({});
  CHECKLIST_GROUPS.forEach(({ key }) => {
    const list = $(`[data-checklist-list="${key}"]`);
    if (!list) return;
    const items = checklist[key] || [];
    list.innerHTML = items.length
      ? items
          .map(
            (item) => `
              <div class="checklist-row ${item.done ? 'done' : ''}">
                <label class="checklist-check">
                  <input type="checkbox" data-check-toggle="${esc(key)}" data-check-id="${esc(item.id)}" ${item.done ? 'checked' : ''}>
                  <span>${esc(item.text)}</span>
                </label>
                <button class="checklist-remove" data-check-remove="${esc(key)}" data-check-id="${esc(item.id)}" type="button" aria-label="Удалить пункт">×</button>
              </div>`,
          )
          .join('')
      : '<div class="checklist-empty">Пунктов пока нет</div>';
  });

  const measurements = $('#workMeasurements');
  if (measurements && measurements.value !== checklist.measurements) {
    measurements.value = checklist.measurements || '';
  }

  renderWorkPhotos();
  renderChecklistProgress();
}

function renderChecklistProgress() {
  const progress = workChecklistProgress(state.workChecklistDraft);
  const label = $('#workChecklistProgress');
  if (!label) return;
  label.textContent = progress.total
    ? `Выполнено ${progress.done} из ${progress.total} • фото ${progress.photos}`
    : `Чек-лист пуст • фото ${progress.photos}`;
}

function addWorkChecklistItem(group) {
  if (!CHECKLIST_GROUPS.some((item) => item.key === group)) return;
  if (!state.workChecklistDraft) state.workChecklistDraft = normalizeWorkChecklist({});
  const input = $(`[data-checklist-input="${group}"]`);
  const text = toText(input?.value);
  if (!text) {
    input?.focus();
    return;
  }

  state.workChecklistDraft[group].push({
    id: createChecklistItemId(group),
    text,
    done: false,
  });
  if (input) input.value = '';
  renderWorkChecklistDraft();
  input?.focus();
}

function handleWorkChecklistChange(event) {
  const toggle = event.target.closest('[data-check-toggle]');
  if (!toggle || !state.workChecklistDraft) return;
  const group = toggle.dataset.checkToggle;
  const item = state.workChecklistDraft[group]?.find((entry) => entry.id === toggle.dataset.checkId);
  if (!item) return;
  item.done = toggle.checked;
  renderWorkChecklistDraft();
}

function handleWorkChecklistClick(event) {
  const remove = event.target.closest('[data-check-remove]');
  if (remove && state.workChecklistDraft) {
    const group = remove.dataset.checkRemove;
    state.workChecklistDraft[group] = (state.workChecklistDraft[group] || []).filter(
      (item) => item.id !== remove.dataset.checkId,
    );
    renderWorkChecklistDraft();
    return;
  }

  const removePhoto = event.target.closest('[data-photo-remove]');
  if (removePhoto && state.workChecklistDraft) {
    state.workChecklistDraft.photos = state.workChecklistDraft.photos.filter(
      (photo) => photo.id !== removePhoto.dataset.photoRemove,
    );
    renderWorkChecklistDraft();
    return;
  }

  const openPhoto = event.target.closest('[data-photo-open]');
  if (openPhoto && state.workChecklistDraft) {
    const photo = state.workChecklistDraft.photos.find(
      (item) => item.id === openPhoto.dataset.photoOpen,
    );
    if (photo?.dataUrl) window.open(photo.dataUrl, '_blank', 'noopener');
  }
}

function renderWorkPhotos() {
  const grid = $('#workPhotoGrid');
  if (!grid) return;
  const photos = state.workChecklistDraft?.photos || [];
  grid.innerHTML = photos.length
    ? photos
        .map(
          (photo) => `
            <article class="work-photo-card">
              <button class="work-photo-preview" data-photo-open="${esc(photo.id)}" type="button" aria-label="Открыть фото">
                <img src="${esc(photo.dataUrl)}" alt="${esc(photo.name)}">
              </button>
              <div class="work-photo-meta">
                <span title="${esc(photo.name)}">${esc(photo.name)}</span>
                <button data-photo-remove="${esc(photo.id)}" type="button">Удалить</button>
              </div>
            </article>`,
        )
        .join('')
    : '<div class="checklist-empty photo-empty">Фотографий пока нет</div>';

  const addButton = $('#addWorkPhotoBtn');
  if (addButton) addButton.classList.toggle('hidden', photos.length >= MAX_WORK_PHOTOS);
}

async function handleWorkPhotoFiles(event) {
  const input = event.target;
  const files = Array.from(input?.files || []).filter((file) => file.type.startsWith('image/'));
  if (!files.length || !state.workChecklistDraft) {
    if (input) input.value = '';
    return;
  }

  const available = MAX_WORK_PHOTOS - state.workChecklistDraft.photos.length;
  if (available <= 0) {
    showToast(`Можно сохранить не более ${MAX_WORK_PHOTOS} фото`);
    input.value = '';
    return;
  }

  let added = 0;
  for (const file of files.slice(0, available)) {
    try {
      const dataUrl = await compressWorkPhoto(file);
      const currentSize = state.workChecklistDraft.photos.reduce(
        (sum, photo) => sum + photo.dataUrl.length,
        0,
      );
      if (
        dataUrl.length > MAX_WORK_PHOTO_CHARS ||
        currentSize + dataUrl.length > MAX_WORK_PHOTOS_TOTAL_CHARS
      ) {
        showToast('Фото слишком большое для памяти устройства');
        continue;
      }
      state.workChecklistDraft.photos.push({
        id: createChecklistItemId('photo'),
        name: toText(file.name, `Фото ${state.workChecklistDraft.photos.length + 1}`),
        dataUrl,
        createdAt: new Date().toISOString(),
      });
      added += 1;
    } catch (error) {
      console.warn('GORN: не удалось обработать фотографию', error);
      showToast('Не удалось добавить одно из фото');
    }
  }

  input.value = '';
  renderWorkChecklistDraft();
  if (added) showToast(`Добавлено фото: ${added}`);
}

function compressWorkPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Не удалось открыть изображение'));
      image.onload = () => {
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Canvas недоступен'));
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.68));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}


function renderEstimateGroup(group) {
  const list = $(`[data-estimate-list="${group}"]`);
  if (!list || !state.workEstimateDraft) return;
  const items = state.workEstimateDraft[group] || [];

  list.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <div class="estimate-row" data-estimate-row="${esc(item.id)}">
              <input
                class="estimate-name"
                type="text"
                maxlength="180"
                value="${esc(item.name)}"
                data-estimate-group="${esc(group)}"
                data-estimate-id="${esc(item.id)}"
                data-estimate-field="name"
                aria-label="Наименование"
              >
              <input
                class="estimate-quantity"
                type="text"
                inputmode="decimal"
                maxlength="20"
                value="${esc(item.quantity)}"
                data-estimate-group="${esc(group)}"
                data-estimate-id="${esc(item.id)}"
                data-estimate-field="quantity"
                aria-label="Количество"
              >
              <input
                class="estimate-unit"
                type="text"
                maxlength="20"
                value="${esc(item.unit)}"
                data-estimate-group="${esc(group)}"
                data-estimate-id="${esc(item.id)}"
                data-estimate-field="unit"
                aria-label="Единица"
              >
              <input
                class="estimate-price"
                type="text"
                inputmode="decimal"
                maxlength="40"
                value="${esc(item.price)}"
                data-estimate-group="${esc(group)}"
                data-estimate-id="${esc(item.id)}"
                data-estimate-field="price"
                aria-label="Цена"
              >
              <strong>${esc(formatRubles(parseEstimateQuantity(item.quantity) * parseAmountNumber(item.price)))}</strong>
              <button
                class="estimate-remove"
                type="button"
                data-estimate-remove="${esc(group)}"
                data-estimate-id="${esc(item.id)}"
                aria-label="Удалить строку"
              >×</button>
            </div>`,
        )
        .join('')
    : '<div class="estimate-empty">Строк пока нет</div>';
}

function estimateQuantityLabel(item) {
  const quantity = toText(item.quantity, '1');
  const unit = toText(item.unit);
  return unit ? `${quantity} ${unit}` : quantity;
}

function buildEstimateClientText() {
  const client = currentEditingClient();
  const estimate = state.workEstimateDraft || normalizeWorkEstimate({});
  const totals = calculateWorkEstimate(estimate);
  const title = toText($('#workTitle')?.value, 'Работа');
  const address = toText($('#workAddress')?.value, client?.address || '');
  const profile = normalizeBusinessProfile(state.businessProfile);
  const lines = [
    `Смета ГОРН № ${estimate.documentNumber}`,
    `Дата: ${formatDocumentDate(estimate.documentDate)}`,
  ];

  if (estimate.validUntil) lines.push(`Действительна до: ${formatDocumentDate(estimate.validUntil)}`);
  if (client?.name) lines.push(`Клиент: ${client.name}`);
  if (client?.phone) lines.push(`Телефон: ${client.phone}`);
  if (address) lines.push(`Объект: ${address}`);
  if (title) lines.push(`Работа: ${title}`);

  const appendGroup = (label, key) => {
    const items = estimate[key] || [];
    if (!items.length) return;
    lines.push('', `${label}:`);
    items.forEach((item, index) => {
      const quantity = parseEstimateQuantity(item.quantity);
      const price = parseAmountNumber(item.price);
      const total = quantity * price;
      lines.push(
        `${index + 1}. ${item.name} — ${estimateQuantityLabel(item)} × ${formatRubles(price)} = ${formatRubles(total)}`,
      );
    });
  };

  appendGroup('Работы', 'labor');
  appendGroup('Материалы', 'materials');

  const extras = [];
  if (toText(estimate.delivery)) extras.push(`Доставка материалов — ${formatRubles(totals.deliveryTotal)}`);
  if (toText(estimate.wasteRemoval)) extras.push(`Вывоз строительного мусора — ${formatRubles(totals.wasteRemovalTotal)}`);
  if (extras.length) lines.push('', 'Дополнительно:', ...extras);

  lines.push('', `Итого: ${formatRubles(totals.total)}`);
  if (totals.prepayment) lines.push(`Предоплата: ${formatRubles(totals.prepayment)}`);
  lines.push(
    totals.balance >= 0
      ? `Остаток: ${formatRubles(totals.balance)}`
      : `Переплата: ${formatRubles(Math.abs(totals.balance))}`,
  );
  if (estimate.paymentTerms) lines.push('', `Условия оплаты: ${estimate.paymentTerms}`);
  if (estimate.clientNote) lines.push(`Примечание: ${estimate.clientNote}`);

  const contacts = [profile.masterName, profile.phone, profile.website].filter(Boolean).join(' · ');
  if (contacts) lines.push('', `ГОРН: ${contacts}`);

  return lines.join('\n');
}

function renderWorkEstimateSummary() {
  const estimate = state.workEstimateDraft || normalizeWorkEstimate({});
  const totals = calculateWorkEstimate(estimate);

  const labor = $('#estimateLaborTotal');
  const materials = $('#estimateMaterialsTotal');
  const total = $('#estimateGrandTotal');
  const balance = $('#estimateBalance');
  if (labor) labor.textContent = formatRubles(totals.laborTotal);
  if (materials) materials.textContent = formatRubles(totals.materialsTotal);
  if (total) total.textContent = formatRubles(totals.total);
  if (balance) {
    balance.textContent =
      totals.balance >= 0
        ? formatRubles(totals.balance)
        : `−${formatRubles(Math.abs(totals.balance))}`;
    balance.classList.toggle('negative', totals.balance < 0);
  }

  renderEstimateDocumentFields();
  renderBusinessProfileForm();

  const clientText = $('#estimateClientText');
  if (clientText) clientText.textContent = buildEstimateClientText();

  const copyButton = $('#copyEstimateBtn');
  if (copyButton) copyButton.disabled = totals.lineCount === 0;
  const downloadButton = $('#downloadEstimatePdfBtn');
  if (downloadButton) downloadButton.disabled = totals.lineCount === 0;
  const shareButton = $('#shareEstimatePdfBtn');
  if (shareButton) shareButton.disabled = totals.lineCount === 0;
  const applyButton = $('#applyEstimateTotalBtn');
  if (applyButton) applyButton.disabled = totals.lineCount === 0;

  if (totals.lineCount && $('#workAmount')) {
    $('#workAmount').value = formatRubles(totals.total);
  }
}

function renderWorkEstimateDraft() {
  if (!state.workEstimateDraft) {
    state.workEstimateDraft = normalizeWorkEstimate(createDefaultWorkEstimate());
  }

  ESTIMATE_GROUPS.forEach(({ key }) => renderEstimateGroup(key));
  renderEstimateCatalogs();
  const prepayment = $('#estimatePrepayment');
  if (prepayment && prepayment.value !== state.workEstimateDraft.prepayment) {
    prepayment.value = state.workEstimateDraft.prepayment || '';
  }
  renderWorkEstimateSummary();
}

function addWorkEstimateItem(group) {
  if (!ESTIMATE_GROUPS.some((item) => item.key === group)) return;
  if (!state.workEstimateDraft) {
    state.workEstimateDraft = normalizeWorkEstimate(createDefaultWorkEstimate());
  }

  const nameInput = $(`[data-estimate-new-name="${group}"]`);
  const quantityInput = $(`[data-estimate-new-quantity="${group}"]`);
  const unitInput = $(`[data-estimate-new-unit="${group}"]`);
  const priceInput = $(`[data-estimate-new-price="${group}"]`);
  const name = toText(nameInput?.value);
  if (!name) {
    nameInput?.focus();
    showToast('Укажите наименование');
    return;
  }

  state.workEstimateDraft[group].push({
    id: createEstimateItemId(group),
    name,
    quantity: toText(quantityInput?.value, '1'),
    unit: toText(unitInput?.value, group === 'labor' ? 'усл.' : 'шт.'),
    price: toText(priceInput?.value),
  });

  if (nameInput) nameInput.value = '';
  if (quantityInput) quantityInput.value = '1';
  if (unitInput) unitInput.value = group === 'labor' ? 'усл.' : 'шт.';
  if (priceInput) priceInput.value = '';
  renderWorkEstimateDraft();
  nameInput?.focus();
}

function handleWorkEstimateInput(event) {
  if (!state.workEstimateDraft) return;
  const target = event.target;

  const simpleFields = {
    estimatePrepayment: 'prepayment',
    estimateDelivery: 'delivery',
    estimateWasteRemoval: 'wasteRemoval',
    estimateDocumentNumber: 'documentNumber',
    estimateDocumentDate: 'documentDate',
    estimateValidUntil: 'validUntil',
    estimatePaymentTerms: 'paymentTerms',
    estimateClientNote: 'clientNote',
  };
  if (simpleFields[target.id]) {
    state.workEstimateDraft[simpleFields[target.id]] = target.value;
    renderWorkEstimateSummary();
    return;
  }

  const group = target.dataset.estimateGroup;
  const itemId = target.dataset.estimateId;
  const field = target.dataset.estimateField;
  if (!group || !itemId || !['name', 'quantity', 'unit', 'price'].includes(field)) return;
  const item = (state.workEstimateDraft[group] || []).find((entry) => entry.id === itemId);
  if (!item) return;
  item[field] = target.value;

  const row = target.closest('.estimate-row');
  const totalCell = row?.querySelector('strong');
  if (totalCell) {
    totalCell.textContent = formatRubles(
      parseEstimateQuantity(item.quantity) * parseAmountNumber(item.price),
    );
  }
  renderWorkEstimateSummary();
}

function handleWorkEstimateClick(event) {
  const removeButton = event.target.closest('[data-estimate-remove]');
  if (!removeButton || !state.workEstimateDraft) return;
  const group = removeButton.dataset.estimateRemove;
  const itemId = removeButton.dataset.estimateId;
  state.workEstimateDraft[group] = (state.workEstimateDraft[group] || []).filter(
    (item) => item.id !== itemId,
  );
  renderWorkEstimateDraft();
}


function catalogItems(group) {
  return (ESTIMATE_CATALOGS[group] || []).flatMap((section) =>
    section.items.map((item) => ({ ...item, category: section.category })),
  );
}

function renderEstimateCatalogs() {
  document.querySelectorAll('[data-estimate-preset-select]').forEach((select) => {
    const group = select.dataset.estimatePresetSelect;
    if (!group || select.dataset.ready === 'true') return;
    const sections = ESTIMATE_CATALOGS[group] || [];
    select.innerHTML = '<option value="">Быстрый выбор из списка…</option>' + sections
      .map(
        (section) => `<optgroup label="${esc(section.category)}">${section.items
          .map(
            (item) => `<option value="${esc(item.name)}" data-unit="${esc(item.unit)}">${esc(item.name)}</option>`,
          )
          .join('')}</optgroup>`,
      )
      .join('');
    select.dataset.ready = 'true';
  });
}

function updateEstimatePresetUnit(group) {
  const select = $(`[data-estimate-preset-select="${group}"]`);
  const unitInput = $(`[data-estimate-preset-unit="${group}"]`);
  const unit = select?.selectedOptions?.[0]?.dataset?.unit || (group === 'labor' ? 'усл.' : 'шт.');
  if (unitInput) unitInput.value = unit;
}

function addEstimatePresetItem(group) {
  if (!ESTIMATE_GROUPS.some((item) => item.key === group)) return;
  if (!state.workEstimateDraft) state.workEstimateDraft = normalizeWorkEstimate(createDefaultWorkEstimate());

  const select = $(`[data-estimate-preset-select="${group}"]`);
  const quantityInput = $(`[data-estimate-preset-quantity="${group}"]`);
  const unitInput = $(`[data-estimate-preset-unit="${group}"]`);
  const priceInput = $(`[data-estimate-preset-price="${group}"]`);
  const name = toText(select?.value);
  if (!name) {
    select?.focus();
    showToast('Выберите позицию из списка');
    return;
  }

  state.workEstimateDraft[group].push({
    id: createEstimateItemId(group),
    name,
    quantity: toText(quantityInput?.value, '1'),
    unit: toText(unitInput?.value, group === 'labor' ? 'усл.' : 'шт.'),
    price: toText(priceInput?.value),
  });

  if (select) select.value = '';
  if (quantityInput) quantityInput.value = '1';
  if (unitInput) unitInput.value = group === 'labor' ? 'усл.' : 'шт.';
  if (priceInput) priceInput.value = '';
  renderWorkEstimateDraft();
  select?.focus();
}

function renderEstimateDocumentFields() {
  if (!state.workEstimateDraft) return;
  const values = {
    estimateDocumentNumber: state.workEstimateDraft.documentNumber,
    estimateDocumentDate: state.workEstimateDraft.documentDate,
    estimateValidUntil: state.workEstimateDraft.validUntil,
    estimateDelivery: state.workEstimateDraft.delivery,
    estimateWasteRemoval: state.workEstimateDraft.wasteRemoval,
    estimatePaymentTerms: state.workEstimateDraft.paymentTerms,
    estimateClientNote: state.workEstimateDraft.clientNote,
  };
  Object.entries(values).forEach(([id, value]) => {
    const input = $(`#${id}`);
    if (input && document.activeElement !== input && input.value !== toText(value)) input.value = toText(value);
  });
}

function renderBusinessProfileForm() {
  const profile = normalizeBusinessProfile(state.businessProfile);
  document.querySelectorAll('[data-business-profile]').forEach((input) => {
    const field = input.dataset.businessProfile;
    if (document.activeElement !== input && input.value !== toText(profile[field])) {
      input.value = toText(profile[field]);
    }
  });
}

function handleBusinessProfileInput(event) {
  const field = event.target.dataset.businessProfile;
  if (!field || !(field in DEFAULT_BUSINESS_PROFILE)) return;
  state.businessProfile = normalizeBusinessProfile({
    ...state.businessProfile,
    [field]: event.target.value,
  });
  save();
  renderWorkEstimateSummary();
}

function formatDocumentDate(value) {
  const date = new Date(`${toText(value, localDateISO())}T12:00:00`);
  return Number.isNaN(date.getTime()) ? toText(value) : date.toLocaleDateString('ru-RU');
}

function preloadEstimateAssets() {
  if (!estimateLogoPromise) {
    estimateLogoPromise = new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = `icon-192.png?v=${APP_META.version}`;
    });
  }
  return estimateLogoPromise;
}

function estimatePdfFilename() {
  const client = currentEditingClient();
  const estimate = state.workEstimateDraft || normalizeWorkEstimate({});
  const clean = (value) => toText(value, 'client').replace(/[^a-zA-Zа-яА-Я0-9_-]+/g, '_').slice(0, 60);
  return `GORN_Смета_${clean(client?.name)}_${clean(estimate.documentNumber)}.pdf`;
}

function estimateDocumentPayload() {
  const client = currentEditingClient();
  const estimate = normalizeWorkEstimate(state.workEstimateDraft || createDefaultWorkEstimate());
  return {
    client,
    profile: normalizeBusinessProfile(state.businessProfile),
    estimate,
    totals: calculateWorkEstimate(estimate),
    workTitle: toText($('#workTitle')?.value, 'Работы по печи или камину'),
    workAddress: toText($('#workAddress')?.value, client?.address || ''),
    workNotes: toText($('#workNotes')?.value),
  };
}

function canvasWrappedLines(context, text, maxWidth) {
  const paragraphs = String(text || '').split(/\n/);
  const lines = [];
  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      return;
    }
    let line = '';
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (line && context.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    });
    if (line) lines.push(line);
    if (paragraphIndex < paragraphs.length - 1) lines.push('');
  });
  return lines;
}

async function renderEstimatePdfPages(payload) {
  const WIDTH = 1240;
  const HEIGHT = 1754;
  const MARGIN = 78;
  const FOOTER_TOP = 1640;
  const COLORS = {
    graphite: '#0D0D0F',
    panel: '#F4F0E8',
    gold: '#B78324',
    goldDark: '#7A571A',
    flame: '#E34B26',
    text: '#171719',
    muted: '#66615A',
    line: '#D5C7A9',
    light: '#F7F3EB',
    green: '#2D7C4A',
  };
  const logo = await preloadEstimateAssets();
  const pages = [];
  let canvas;
  let context;
  let y = 0;
  let pageIndex = 0;

  const setFont = (size, weight = 400, family = 'Arial') => {
    context.font = `${weight} ${size}px ${family}`;
  };

  const drawLines = (lines, x, startY, lineHeight, color = COLORS.text) => {
    context.fillStyle = color;
    lines.forEach((line, index) => context.fillText(line, x, startY + index * lineHeight));
    return startY + lines.length * lineHeight;
  };

  const drawWrapped = (text, x, startY, maxWidth, options = {}) => {
    const { size = 25, weight = 400, lineHeight = 34, color = COLORS.text, family = 'Arial' } = options;
    setFont(size, weight, family);
    const lines = canvasWrappedLines(context, text, maxWidth);
    return drawLines(lines, x, startY, lineHeight, color);
  };

  const drawFooter = () => {
    context.strokeStyle = COLORS.gold;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(MARGIN, FOOTER_TOP);
    context.lineTo(WIDTH - MARGIN, FOOTER_TOP);
    context.stroke();
    setFont(20, 700, 'Georgia');
    context.fillStyle = COLORS.goldDark;
    context.fillText(payload.profile.slogan || 'ГОРН', MARGIN, FOOTER_TOP + 38);
    setFont(18, 400);
    context.fillStyle = COLORS.muted;
    const contacts = [payload.profile.masterName, payload.profile.phone, payload.profile.website, payload.profile.email]
      .filter(Boolean)
      .join(' · ');
    context.fillText(contacts, MARGIN, FOOTER_TOP + 72);
  };

  const createPage = (continuation = false) => {
    if (canvas) drawFooter();
    canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    context = canvas.getContext('2d');
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, WIDTH, HEIGHT);
    pages.push(canvas);
    pageIndex += 1;

    context.fillStyle = COLORS.graphite;
    context.fillRect(0, 0, WIDTH, 185);
    if (logo) context.drawImage(logo, MARGIN, 32, 112, 112);
    setFont(48, 700, 'Georgia');
    context.fillStyle = '#E8C96A';
    context.fillText('ГОРН', logo ? 220 : MARGIN, 78);
    setFont(22, 400);
    context.fillStyle = '#F4F0E8';
    context.fillText('Профессиональный помощник печника', logo ? 220 : MARGIN, 116);
    setFont(18, 700);
    context.fillStyle = '#D4AF37';
    context.fillText(payload.profile.region || '', logo ? 220 : MARGIN, 148);

    y = 235;
    setFont(37, 800);
    context.fillStyle = COLORS.text;
    context.fillText(continuation ? 'СМЕТА - ПРОДОЛЖЕНИЕ' : 'СМЕТА НА ВЫПОЛНЕНИЕ РАБОТ', MARGIN, y);
    y += 46;
    setFont(21, 700);
    context.fillStyle = COLORS.goldDark;
    context.fillText(`№ ${payload.estimate.documentNumber}`, MARGIN, y);
    const dateText = `от ${formatDocumentDate(payload.estimate.documentDate)}`;
    context.fillText(dateText, WIDTH - MARGIN - context.measureText(dateText).width, y);
    y += 35;
    return canvas;
  };

  const ensureSpace = (height) => {
    if (y + height <= FOOTER_TOP - 35) return;
    createPage(true);
  };

  const drawSectionHeader = (title) => {
    ensureSpace(58);
    context.fillStyle = '#EEE5D3';
    context.fillRect(MARGIN, y, WIDTH - MARGIN * 2, 46);
    setFont(22, 800);
    context.fillStyle = COLORS.goldDark;
    context.fillText(title, MARGIN + 16, y + 31);
    y += 58;
  };

  const drawInfoBlock = (label, value, x, width) => {
    setFont(16, 700);
    context.fillStyle = COLORS.goldDark;
    context.fillText(label.toUpperCase(), x, y);
    drawWrapped(value || '—', x, y + 29, width, { size: 22, lineHeight: 29 });
  };

  createPage(false);

  // Client and contractor information.
  ensureSpace(185);
  const half = (WIDTH - MARGIN * 2 - 34) / 2;
  const infoTop = y;
  context.strokeStyle = COLORS.line;
  context.lineWidth = 2;
  context.strokeRect(MARGIN, infoTop, half, 155);
  context.strokeRect(MARGIN + half + 34, infoTop, half, 155);
  y = infoTop + 32;
  drawInfoBlock('Исполнитель', [payload.profile.companyName, payload.profile.masterName, payload.profile.phone, payload.profile.website].filter(Boolean).join(' · '), MARGIN + 18, half - 36);
  y = infoTop + 32;
  drawInfoBlock('Заказчик', [payload.client?.name, payload.client?.phone].filter(Boolean).join(' · '), MARGIN + half + 52, half - 36);
  y = infoTop + 184;

  drawSectionHeader('ОБЪЕКТ И ЗАДАЧА');
  // Текст рисуется по базовой линии, поэтому нужен дополнительный отступ
  // после цветной плашки, чтобы крупные буквы не заходили на заголовок.
  y += 16;
  y = drawWrapped(`Объект: ${payload.workAddress || 'не указан'}`, MARGIN, y, WIDTH - MARGIN * 2, { size: 23, weight: 700, lineHeight: 32 });
  y += 5;
  y = drawWrapped(`Работа: ${payload.workTitle}`, MARGIN, y, WIDTH - MARGIN * 2, { size: 23, lineHeight: 32 });
  if (payload.workNotes) {
    y += 5;
    y = drawWrapped(`Договорённости: ${payload.workNotes}`, MARGIN, y, WIDTH - MARGIN * 2, { size: 20, color: COLORS.muted, lineHeight: 29 });
  }
  y += 18;

  const drawTableHeader = () => {
    ensureSpace(50);
    context.fillStyle = COLORS.graphite;
    context.fillRect(MARGIN, y, WIDTH - MARGIN * 2, 44);
    setFont(17, 700);
    context.fillStyle = '#FFFFFF';
    context.fillText('НАИМЕНОВАНИЕ', MARGIN + 16, y + 29);
    context.fillText('КОЛ-ВО', 730, y + 29);
    context.fillText('ЦЕНА', 900, y + 29);
    context.fillText('СУММА', 1070, y + 29);
    y += 44;
  };

  const drawTableRow = (item, index) => {
    setFont(21, 400);
    const nameLines = canvasWrappedLines(context, `${index}. ${item.name}`, 600);
    const rowHeight = Math.max(54, nameLines.length * 29 + 18);
    ensureSpace(rowHeight + 2);
    context.fillStyle = index % 2 ? '#FFFFFF' : COLORS.light;
    context.fillRect(MARGIN, y, WIDTH - MARGIN * 2, rowHeight);
    context.strokeStyle = '#E5DCCB';
    context.strokeRect(MARGIN, y, WIDTH - MARGIN * 2, rowHeight);
    drawLines(nameLines, MARGIN + 16, y + 31, 29, COLORS.text);
    setFont(19, 400);
    context.fillStyle = COLORS.text;
    context.fillText(estimateQuantityLabel(item), 730, y + 32);
    const price = parseAmountNumber(item.price);
    const sum = parseEstimateQuantity(item.quantity) * price;
    context.fillText(formatRubles(price), 900, y + 32);
    setFont(19, 700);
    context.fillStyle = COLORS.goldDark;
    context.fillText(formatRubles(sum), 1070, y + 32);
    y += rowHeight;
  };

  let itemNo = 1;
  const drawGroup = (title, items) => {
    if (!items.length) return;
    drawSectionHeader(title);
    drawTableHeader();
    items.forEach((item) => drawTableRow(item, itemNo++));
    y += 15;
  };

  drawGroup('РАБОТЫ', payload.estimate.labor);
  drawGroup('МАТЕРИАЛЫ', payload.estimate.materials);

  const extras = [];
  if (toText(payload.estimate.delivery)) extras.push({ name: 'Доставка материалов', quantity: '1', unit: 'усл.', price: payload.estimate.delivery });
  if (toText(payload.estimate.wasteRemoval)) extras.push({ name: 'Вывоз строительного мусора', quantity: '1', unit: 'усл.', price: payload.estimate.wasteRemoval });
  drawGroup('ДОПОЛНИТЕЛЬНО', extras);

  ensureSpace(260);
  drawSectionHeader('ИТОГОВЫЙ РАСЧЁТ');
  const totals = [
    ['Работы', payload.totals.laborTotal],
    ['Материалы', payload.totals.materialsTotal],
  ];
  if (toText(payload.estimate.delivery)) totals.push(['Доставка', payload.totals.deliveryTotal]);
  if (toText(payload.estimate.wasteRemoval)) totals.push(['Вывоз мусора', payload.totals.wasteRemovalTotal]);
  totals.forEach(([label, value]) => {
    setFont(22, 400);
    context.fillStyle = COLORS.text;
    context.fillText(label, MARGIN + 12, y + 28);
    setFont(22, 700);
    const valueText = formatRubles(value);
    context.fillText(valueText, WIDTH - MARGIN - context.measureText(valueText).width - 12, y + 28);
    y += 38;
  });
  context.strokeStyle = COLORS.gold;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(MARGIN, y + 4);
  context.lineTo(WIDTH - MARGIN, y + 4);
  context.stroke();
  y += 43;
  setFont(31, 800);
  context.fillStyle = COLORS.goldDark;
  context.fillText('ИТОГО', MARGIN + 12, y);
  const grand = formatRubles(payload.totals.total);
  context.fillText(grand, WIDTH - MARGIN - context.measureText(grand).width - 12, y);
  y += 44;
  if (payload.totals.prepayment) {
    setFont(22, 600);
    context.fillStyle = COLORS.green;
    context.fillText(`Предоплата: ${formatRubles(payload.totals.prepayment)}`, MARGIN + 12, y);
    y += 34;
  }
  setFont(23, 700);
  context.fillStyle = COLORS.text;
  context.fillText(`Остаток: ${formatRubles(payload.totals.balance)}`, MARGIN + 12, y);
  y += 55;

  drawSectionHeader('УСЛОВИЯ');
  // Такой же безопасный отступ для первой строки раздела условий.
  y += 16;
  y = drawWrapped(`Срок действия сметы: до ${formatDocumentDate(payload.estimate.validUntil)}.`, MARGIN, y, WIDTH - MARGIN * 2, { size: 20, weight: 700, lineHeight: 29 });
  y += 6;
  y = drawWrapped(`Условия оплаты: ${payload.estimate.paymentTerms}`, MARGIN, y, WIDTH - MARGIN * 2, { size: 20, lineHeight: 29 });
  y += 6;
  y = drawWrapped(payload.estimate.clientNote, MARGIN, y, WIDTH - MARGIN * 2, { size: 20, lineHeight: 29, color: COLORS.muted });

  drawFooter();
  pages.forEach((page, index) => {
    const ctx = page.getContext('2d');
    ctx.font = '700 18px Arial';
    ctx.fillStyle = COLORS.muted;
    const pageText = `Страница ${index + 1} из ${pages.length}`;
    ctx.fillText(pageText, WIDTH - MARGIN - ctx.measureText(pageText).width, FOOTER_TOP + 72);
  });
  return pages;
}

async function createEstimatePdfBlob() {
  const totals = calculateWorkEstimate(state.workEstimateDraft || {});
  if (!totals.lineCount) throw new Error('Смета пока пуста');
  const JsPdf = window.jspdf?.jsPDF;
  if (!JsPdf) throw new Error('Модуль PDF не загрузился. Обновите приложение и повторите.');
  const pages = await renderEstimatePdfPages(estimateDocumentPayload());
  const pdf = new JsPdf({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  pages.forEach((page, index) => {
    if (index > 0) pdf.addPage('a4', 'portrait');
    pdf.addImage(page.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  });
  return pdf.output('blob');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function downloadEstimatePdf() {
  const button = $('#downloadEstimatePdfBtn');
  if (button) button.disabled = true;
  try {
    const blob = await createEstimatePdfBlob();
    downloadBlob(blob, estimatePdfFilename());
    showToast('PDF-смета сформирована');
  } catch (error) {
    console.error('GORN: не удалось сформировать PDF', error);
    window.alert(error.message || 'Не удалось сформировать PDF.');
  } finally {
    renderWorkEstimateSummary();
  }
}

async function shareEstimatePdf() {
  const button = $('#shareEstimatePdfBtn');
  if (button) button.disabled = true;
  try {
    const blob = await createEstimatePdfBlob();
    const filename = estimatePdfFilename();
    const file = new File([blob], filename, { type: 'application/pdf' });
    const client = currentEditingClient();
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share({
        title: `Смета ГОРН для ${client?.name || 'клиента'}`,
        text: 'Направляю смету на согласованные работы.',
        files: [file],
      });
      showToast('Смета передана в меню отправки');
    } else {
      downloadBlob(blob, filename);
      showToast('PDF скачан — отправьте его клиенту');
    }
  } catch (error) {
    if (error?.name === 'AbortError') return;
    console.error('GORN: не удалось поделиться PDF', error);
    try {
      const blob = await createEstimatePdfBlob();
      downloadBlob(blob, estimatePdfFilename());
      showToast('PDF скачан — отправьте его клиенту');
    } catch (fallbackError) {
      window.alert(fallbackError.message || 'Не удалось сформировать PDF.');
    }
  } finally {
    renderWorkEstimateSummary();
  }
}

function applyEstimateTotalToWork() {
  const totals = calculateWorkEstimate(state.workEstimateDraft || {});
  if (!totals.lineCount) {
    showToast('Смета пока пуста');
    return;
  }
  $('#workAmount').value = formatRubles(totals.total);
  showToast('Итог сметы подставлен');
}

function updateWorkSchedulePreview() {
  const preview = $('#workPeriodPreview');
  if (!preview) return;
  const work = normalizeWork({
    date: $('#workDate')?.value || localDateISO(),
    daysCount: normalizeWorkDaysCount($('#workDaysCount')?.value),
    skipWeekends: Boolean($('#workSkipWeekends')?.checked),
  });
  const dates = workScheduleDates(work);
  const weekendNote = work.skipWeekends && dates.length > 1 ? ' · выходные пропускаются' : '';
  preview.textContent = dates.length === 1
    ? `Работа запланирована на ${formatClientDate(dates[0])}`
    : `Период: ${formatClientDate(dates[0])} — ${formatClientDate(dates[dates.length - 1])} · ${dates.length} рабочих дней${weekendNote}`;

  document.querySelectorAll('[data-work-days]').forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.workDays) === dates.length);
  });
}

function openWorkForm(workId = null) {
  dismissSoftKeyboard();
  const client = currentEditingClient();
  if (!client) return;
  const work = workId ? (client.works || []).find((item) => item.id === workId) : null;
  state.editingWorkId = work?.id || null;
  state.workChecklistDraft = work
    ? cloneWorkChecklist(work.checklist)
    : normalizeWorkChecklist(createDefaultWorkChecklist());
  state.workEstimateDraft = work
    ? cloneWorkEstimate(work.estimate)
    : normalizeWorkEstimate(createDefaultWorkEstimate());

  $('#workFormTitle').textContent = work ? 'Запись о работе' : 'Новая работа';
  $('#workTitle').value = work?.title || '';
  $('#workDate').value = work?.date || localDateISO();
  $('#workStartTime').value = work?.startTime || '';
  $('#workDurationMinutes').value = String(work?.durationMinutes || 180);
  $('#workReminderMinutes').value = String(work ? work.reminderMinutes : 60);
  $('#workDaysCount').value = String(work?.daysCount || 1);
  $('#workSkipWeekends').checked = work ? work.skipWeekends !== false : true;
  $('#workAddress').value = work?.address || client.address || '';
  $('#workStatus').value = work?.status || 'Планируется';
  $('#workAmount').value = work?.amount || '';
  $('#workNotes').value = work?.notes || '';
  $('#deleteWorkBtn').classList.toggle('hidden', !work);
  $('#workFormWrap').classList.remove('hidden');
  $('#workList').classList.add('hidden');
  $('#workEmpty').classList.add('hidden');
  $('#workTools')?.classList.add('hidden');
  $('#addWorkBtn').classList.add('hidden');
  renderWorkChecklistDraft();
  renderWorkEstimateDraft();
  updateWorkSchedulePreview();
  $('#workFormWrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeWorkForm() {
  dismissSoftKeyboard();
  state.editingWorkId = null;
  state.workChecklistDraft = null;
  state.workEstimateDraft = null;
  $('#workForm')?.reset();
  $('#workFormWrap')?.classList.add('hidden');
  $('#workList')?.classList.remove('hidden');
  $('#workTools')?.classList.remove('hidden');
  $('#addWorkBtn')?.classList.remove('hidden');
  const client = currentEditingClient();
  if (client) renderWorkHistory(client);
  $('#workHistoryWrap')?.scrollIntoView({ behavior: 'auto', block: 'start' });
}

function saveWorkFromForm(event) {
  event.preventDefault();
  const clientIndex = state.clients.findIndex((client) => client.id === state.editingClientId);
  if (clientIndex < 0) return;

  const title = toText($('#workTitle').value);
  if (!title) {
    $('#workTitle').focus();
    showToast('Укажите вид работы');
    return;
  }

  const client = state.clients[clientIndex];
  const works = [...(client.works || [])];
  const existingIndex = works.findIndex((work) => work.id === state.editingWorkId);
  const existing = existingIndex >= 0 ? works[existingIndex] : null;
  const now = new Date().toISOString();
  if (state.workChecklistDraft) {
    state.workChecklistDraft.measurements = $('#workMeasurements')?.value || '';
  }
  const estimate = normalizeWorkEstimate(
    state.workEstimateDraft || createDefaultWorkEstimate(),
  );
  const estimateTotals = calculateWorkEstimate(estimate);

  const work = normalizeWork(
    {
      id: existing?.id || createWorkId(),
      title,
      date: $('#workDate').value || localDateISO(),
      startTime: $('#workStartTime').value || '',
      durationMinutes: Number($('#workDurationMinutes').value) || 180,
      reminderMinutes: Number($('#workReminderMinutes').value) || 0,
      daysCount: normalizeWorkDaysCount($('#workDaysCount').value),
      skipWeekends: Boolean($('#workSkipWeekends').checked),
      address: $('#workAddress').value,
      status: $('#workStatus').value,
      amount: estimateTotals.lineCount ? formatRubles(estimateTotals.total) : $('#workAmount').value,
      notes: $('#workNotes').value,
      checklist: state.workChecklistDraft || normalizeWorkChecklist({}),
      estimate,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    },
    works.length,
  );

  if (existingIndex >= 0) {
    works.splice(existingIndex, 1, work);
  } else {
    works.unshift(work);
  }

  const previousClient = state.clients[clientIndex];
  state.clients.splice(clientIndex, 1, {
    ...client,
    works,
    updatedAt: now,
  });

  if (!save()) {
    state.clients.splice(clientIndex, 1, previousClient);
    window.alert(
      'Не удалось сохранить работу: память браузера заполнена.\nУдалите часть фотографий и повторите сохранение.',
    );
    return;
  }

  closeWorkForm();
  showToast(existing ? 'Запись обновлена' : 'Работа добавлена');
}

function deleteEditingWork() {
  const clientIndex = state.clients.findIndex((client) => client.id === state.editingClientId);
  if (clientIndex < 0) return;
  const client = state.clients[clientIndex];
  const work = (client.works || []).find((item) => item.id === state.editingWorkId);
  if (!work) return;
  if (!window.confirm(`Удалить запись «${work.title}»?`)) return;

  state.clients.splice(clientIndex, 1, {
    ...client,
    works: (client.works || []).filter((item) => item.id !== work.id),
    updatedAt: new Date().toISOString(),
  });
  save();
  closeWorkForm();
  showToast('Запись удалена');
}

function createWorkId() {
  if (globalThis.crypto?.randomUUID) return `WORK-${globalThis.crypto.randomUUID()}`;
  return `WORK-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clientStatusClass(status) {
  return {
    'Новый': 'new',
    'Связаться': 'contact',
    'Выезд назначен': 'visit',
    'В работе': 'progress',
    'Завершён': 'done',
    'Отказ': 'cancelled',
  }[status] || 'new';
}

function workCountLabel(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const word = mod10 === 1 && mod100 !== 11
    ? 'работа'
    : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
      ? 'работы'
      : 'работ';
  return `${count} ${word}`;
}

function createClientId() {
  if (globalThis.crypto?.randomUUID) return `CLIENT-${globalThis.crypto.randomUUID()}`;
  return `CLIENT-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatClientDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ru-RU');
}

function renderCategories() {
  const categories = ['Все', ...new Set(state.cards.map((card) => card.category))];
  $('#categories').innerHTML = categories
    .map(
      (category) =>
        `<button class="category-chip ${category === state.category ? 'active' : ''}" data-category="${esc(category)}">${esc(category)}</button>`,
    )
    .join('');

  document.querySelectorAll('.category-chip[data-category]').forEach((button) => {
    button.onclick = () => {
      state.category = button.dataset.category;
      renderCategories();
      renderHome();
    };
  });
}

function normalizeSearchText(value) {
  return toText(value)
    .toLowerCase()
    .replaceAll('ё', 'е')
    .replace(/[^a-zа-я0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenMatches(queryToken, textToken) {
  if (!queryToken || !textToken) return false;
  if (textToken.includes(queryToken)) return true;

  const minimumPrefixLength = 4;
  return (
    queryToken.length >= minimumPrefixLength &&
    textToken.length >= minimumPrefixLength &&
    (textToken.startsWith(queryToken) || queryToken.startsWith(textToken))
  );
}

function fieldContainsTokens(value, tokens) {
  const fieldTokens = normalizeSearchText(value).split(' ').filter(Boolean);
  return tokens.every((queryToken) =>
    fieldTokens.some((fieldToken) => tokenMatches(queryToken, fieldToken)),
  );
}

function buildSearchFields(card) {
  return {
    title: normalizeSearchText(card.title),
    category: normalizeSearchText(card.category),
    keywords: normalizeSearchText(card.keywords.join(' ')),
    details: normalizeSearchText(
      [
        ...card.reply,
        ...card.price,
        ...card.replyVariants.map((variant) => `${variant.label} ${variant.text}`),
        ...card.priceVariants.map((variant) => `${variant.label} ${variant.text}`),
        ...card.phone,
        ...card.photos,
        ...card.check,
        ...card.materials,
        ...card.flags,
        card.risk.text,
        card.time,
        card.repairability,
      ].join(' '),
    ),
  };
}

function searchScore(card, rawQuery) {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 1;

  const tokens = query.split(' ').filter(Boolean);
  const fields = buildSearchFields(card);
  const allText = `${fields.title} ${fields.category} ${fields.keywords} ${fields.details}`;

  if (!fieldContainsTokens(allText, tokens)) return 0;

  let score = 10;
  if (fields.title === query) score += 500;
  else if (fields.title.startsWith(query)) score += 350;
  else if (fields.title.includes(query)) score += 250;

  tokens.forEach((token) => {
    if (fieldContainsTokens(fields.title, [token])) score += 80;
    if (fieldContainsTokens(fields.keywords, [token])) score += 45;
    if (fieldContainsTokens(fields.category, [token])) score += 25;
    if (fieldContainsTokens(fields.details, [token])) score += 10;
  });

  return score;
}

function filtered() {
  const query = state.cardSearch;
  const favoritesOnly = state.mode === 'favorites';

  return state.cards
    .map((card) => ({ card, score: searchScore(card, query) }))
    .filter(({ card, score }) => {
      const matchesCategory = state.category === 'Все' || card.category === state.category;
      const matchesFavorite = !favoritesOnly || state.favorites.includes(card.id);
      return matchesCategory && matchesFavorite && score > 0;
    })
    .sort((a, b) => b.score - a.score || a.card.sourceIndex - b.card.sourceIndex)
    .map(({ card }) => card);
}


function dashboardMetrics() {
  const today = localDateISO();
  const entries = collectPlanEntries();
  const activeClientStatuses = new Set(['Новый', 'Связаться', 'Выезд назначен', 'В работе']);
  const activeEntries = entries.filter((entry) => isActivePlanWork(entry.work));
  const plannedEntries = entries.filter((entry) => entry.work.status === 'Планируется');
  const completedEntries = entries.filter((entry) => entry.work.status === 'Завершено');

  return {
    clientsTotal: state.clients.length,
    activeClients: state.clients.filter((client) => activeClientStatuses.has(client.status)).length,
    todayCount: activeEntries.filter((entry) => isWorkScheduledOnDate(entry.work, today)).length,
    overdueCount: activeEntries.filter((entry) => entry.work.date && workEndDate(entry.work) < today).length,
    plannedWorks: plannedEntries.length,
    plannedAmount: plannedEntries.reduce(
      (total, entry) => total + parseAmountNumber(entry.work.amount),
      0,
    ),
    completedWorks: completedEntries.length,
    completedAmount: completedEntries.reduce(
      (total, entry) => total + parseAmountNumber(entry.work.amount),
      0,
    ),
  };
}

function collectDashboardAttention() {
  const today = localDateISO();
  const workItems = collectPlanEntries()
    .filter((entry) => isActivePlanWork(entry.work))
    .filter((entry) =>
      entry.work.date &&
      (workEndDate(entry.work) < today || isWorkScheduledOnDate(entry.work, today))
    )
    .map((entry) => ({
      type: workEndDate(entry.work) < today ? 'overdue' : 'today',
      priority: workEndDate(entry.work) < today ? 0 : 1,
      clientId: entry.clientId,
      clientName: entry.clientName,
      phone: entry.clientPhone,
      title: entry.work.title,
      date: entry.work.date,
      address: entry.work.address || entry.clientAddress,
      amount: entry.work.amount,
      updatedAt: entry.work.updatedAt,
    }));

  const clientsWithFollowUp = state.clients
    .filter((client) => client.status === 'Связаться')
    .map((client) => ({
      type: 'contact',
      priority: 2,
      clientId: client.id,
      clientName: client.name,
      phone: client.phone,
      title: 'Связаться с клиентом',
      date: client.date,
      address: client.address,
      amount: '',
      updatedAt: client.updatedAt,
    }));

  return [...workItems, ...clientsWithFollowUp]
    .sort(
      (a, b) =>
        a.priority - b.priority ||
        String(a.date || '').localeCompare(String(b.date || '')) ||
        String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')),
    )
    .slice(0, 5);
}

function dashboardAttentionCard(item) {
  const phoneHref = toText(item.phone).replace(/[^\d+]/g, '');
  const badge = {
    overdue: ['Просрочено', 'overdue'],
    today: ['Сегодня', 'today'],
    contact: ['Связаться', 'contact'],
  }[item.type] || ['Задача', 'contact'];

  const details = [
    item.clientName ? `👤 ${esc(item.clientName)}` : '',
    item.date ? `🗓 ${esc(formatClientDate(item.date))}` : '',
    item.address ? `📍 ${esc(item.address)}` : '',
    item.amount ? `💰 ${esc(item.amount)}` : '',
  ].filter(Boolean);

  return `
    <article class="dashboard-attention-card">
      <div class="dashboard-attention-main">
        <div class="dashboard-attention-title-row">
          <div class="dashboard-attention-title">${esc(item.title)}</div>
          <span class="dashboard-attention-badge ${badge[1]}">${badge[0]}</span>
        </div>
        <div class="dashboard-attention-details">${details.join('<span>•</span>')}</div>
      </div>
      <div class="dashboard-attention-actions">
        ${phoneHref ? `<a href="tel:${esc(phoneHref)}">Позвонить</a>` : ''}
        <button data-dashboard-client-id="${esc(item.clientId)}" type="button">Открыть</button>
      </div>
    </article>`;
}

function renderDashboard() {
  const dashboard = $('.home-dashboard');
  if (!dashboard) return;

  const metrics = dashboardMetrics();
  $('#dashboardClientsTotal').textContent = String(metrics.clientsTotal);
  $('#dashboardActiveClients').textContent = String(metrics.activeClients);
  $('#dashboardTodayCount').textContent = String(metrics.todayCount);
  $('#dashboardOverdueCount').textContent = String(metrics.overdueCount);
  $('#dashboardPlannedAmount').textContent = formatRubles(metrics.plannedAmount);
  $('#dashboardPlannedWorks').textContent = String(metrics.plannedWorks);
  $('#dashboardCompletedAmount').textContent = formatRubles(metrics.completedAmount);
  $('#dashboardCompletedWorks').textContent = String(metrics.completedWorks);

  const attention = collectDashboardAttention();
  const list = $('#dashboardAttentionList');
  const empty = $('#dashboardAttentionEmpty');

  if (list) list.innerHTML = attention.map(dashboardAttentionCard).join('');
  if (empty) empty.classList.toggle('hidden', attention.length > 0);

  document.querySelectorAll('[data-dashboard-client-id]').forEach((button) => {
    button.onclick = () => openClientFromPlan(button.dataset.dashboardClientId);
  });
}

function renderHome() {
  const list = filtered();
  renderDashboard();
  renderQuick();
  $('#countBadge').textContent = `(${list.length})`;
  $('#list').innerHTML = list.map(listCard).join('');
  $('#empty').classList.toggle('hidden', list.length > 0);

  document.querySelectorAll('[data-open-card]').forEach((element) => {
    element.onclick = () => openCard(element.dataset.openCard);
  });

  document.querySelectorAll('[data-favorite]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      toggleFavorite(button.dataset.favorite);
    };
  });
}

function renderQuick() {
  const favorites = state.favorites
    .map((id) => state.cards.find((card) => card.id === id))
    .filter(Boolean);
  const recent = state.recent
    .map((id) => state.cards.find((card) => card.id === id))
    .filter(Boolean);
  const source = favorites.length
    ? favorites
    : recent.length
      ? recent
      : state.cards.slice(0, 4);

  $('#quick').innerHTML = source
    .slice(0, 4)
    .map(
      (card) => `
        <article class="quick-card" data-open-card="${esc(card.id)}">
          <div class="quick-icon">${esc(card.icon)}</div>
          <div class="quick-title">${esc(card.title)}</div>
          <div class="quick-category">${esc(card.category)}</div>
        </article>`,
    )
    .join('');
}

function listCard(card) {
  const isFavorite = state.favorites.includes(card.id);
  return `
    <article class="list-card" data-open-card="${esc(card.id)}">
      <div class="list-left">
        <div class="list-icon">${esc(card.icon)}</div>
        <div>
          <div class="list-title">${esc(card.title)}</div>
          <div class="list-category">${esc(card.category)}</div>
        </div>
      </div>
      <button class="star-btn ${isFavorite ? 'on' : ''}" data-favorite="${esc(card.id)}" type="button">${isFavorite ? '★' : '☆'}</button>
    </article>`;
}

function openCard(id, pushHistory = true) {
  const card = state.cards.find((item) => item.id === id);
  if (!card) return;

  state.current = card;
  state.recent = [id, ...state.recent.filter((item) => item !== id)].slice(0, 8);
  save({ sync: false });
  showOnly('cardView');
  updateFavoriteButton();

  if (pushHistory) {
    history.pushState({ view: 'card', cardId: id }, '', window.location.href);
  }

  const riskIcon = card.risk.level === 'red' ? '🔴' : card.risk.level === 'green' ? '🟢' : '🟡';

  $('#cardContent').innerHTML = `
    <h2 class="detail-title">${esc(card.icon)} ${esc(card.title)}</h2>
    <div class="risk ${esc(card.risk.level)}">${riskIcon} ${esc(card.risk.text)}</div>
    <div class="meta-grid">
      <div class="meta-card"><strong>⏱ Обычно занимает</strong>${esc(card.time)}</div>
      <div class="meta-card"><strong>🛠 Ремонтопригодность</strong>${esc(card.repairability)}</div>
    </div>
    ${responseVariantSection('📩 Варианты ответа клиенту', card.replyVariants, 'reply')}
    ${responseVariantSection('💰 Варианты ответа о стоимости', card.priceVariants, 'price')}
    ${listSection('☎️ Что спросить', card.phone)}
    ${listSection('📷 Какие фото попросить', card.photos)}
    ${listSection('🔍 Что проверить', card.check)}
    ${listSection('🧰 Что взять / материалы', card.materials)}
    ${listSection('⚠️ Красные флаги', card.flags, 'flags')}`;

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.onclick = () => copyText(button.dataset.copy, button);
  });
  bindResponseVariantSections();
}

function responseVariantSection(title, variants = [], sectionKey = 'response') {
  const safeVariants = normalizeResponseVariants(variants, [], sectionKey);
  if (!safeVariants.length) return '';

  const groupId = `response-${state.current.id}-${sectionKey}`;
  const tabs = safeVariants
    .map(
      (variant, index) => `
        <button
          class="response-variant-chip ${index === 0 ? 'active' : ''}"
          data-response-tab="${esc(groupId)}"
          data-response-index="${index}"
          type="button"
        >${esc(variant.label)}</button>`,
    )
    .join('');

  const panels = safeVariants
    .map((variant, index) => {
      const panelId = `${groupId}-${index}`;
      return `
        <div
          id="${esc(panelId)}"
          class="reply response-variant-text ${index === 0 ? 'active' : 'hidden'}"
          data-response-panel="${esc(groupId)}"
          data-response-index="${index}"
        >${esc(variant.text)}</div>`;
    })
    .join('');

  return `
    <section class="block response-variant-block" data-response-section="${esc(groupId)}">
      <h3>${title}</h3>
      <div class="response-variant-chips" role="tablist">${tabs}</div>
      ${panels}
      <button
        class="copy-btn"
        data-response-copy="${esc(groupId)}"
        data-copy="${esc(`${groupId}-0`)}"
        type="button"
      >📋 Копировать выбранный вариант</button>
    </section>`;
}

function bindResponseVariantSections() {
  document.querySelectorAll('[data-response-tab]').forEach((button) => {
    button.onclick = () => {
      const groupId = button.dataset.responseTab;
      const index = button.dataset.responseIndex;
      const section = document.querySelector(
        `[data-response-section="${CSS.escape(groupId)}"]`,
      );
      if (!section) return;

      section.querySelectorAll('[data-response-tab]').forEach((item) => {
        item.classList.toggle('active', item === button);
      });

      section.querySelectorAll('[data-response-panel]').forEach((panel) => {
        const isActive = panel.dataset.responseIndex === index;
        panel.classList.toggle('active', isActive);
        panel.classList.toggle('hidden', !isActive);
      });

      const copyButton = section.querySelector('[data-response-copy]');
      if (copyButton) copyButton.dataset.copy = `${groupId}-${index}`;
    };
  });

  document.querySelectorAll('[data-response-copy]').forEach((button) => {
    button.onclick = () => copyText(button.dataset.copy, button);
  });
}

function copySection(title, items = [], sectionKey = 'text') {
  const safeItems = toArray(items);
  if (!safeItems.length) return '';

  return `
    <section class="block">
      <h3>${title}</h3>
      ${safeItems
        .map((item, index) => {
          const id = `copy-${state.current.id}-${sectionKey}-${index}`;
          return `<div class="reply" id="${esc(id)}">${esc(item)}</div><button class="copy-btn" data-copy="${esc(id)}" type="button">📋 Копировать</button>`;
        })
        .join('')}
    </section>`;
}

function listSection(title, items = [], className = '') {
  const safeItems = toArray(items);
  if (!safeItems.length) return '';

  return `
    <section class="block">
      <h3>${title}</h3>
      <ul class="${esc(className)}">${safeItems.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
    </section>`;
}

function goBack() {
  if (history.state?.view && history.state.view !== 'home') {
    history.back();
    return;
  }
  showListView('home', false);
}

function toggleFavorite(id) {
  state.favorites = state.favorites.includes(id)
    ? state.favorites.filter((item) => item !== id)
    : [id, ...state.favorites];
  save();

  if (!$('#homeView').classList.contains('hidden')) {
    renderHome();
  }
}

function updateFavoriteButton() {
  $('#favoriteBtn').textContent =
    state.current && state.favorites.includes(state.current.id) ? '★ Закреплено' : '☆ Закрепить';
}

async function copyText(id, button) {
  const source = document.getElementById(id);
  if (!source) return;
  const text = source.innerText;
  const originalLabel = button?.textContent || '📋 Копировать';

  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API недоступен');
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  button.classList.add('done');
  button.textContent = '✓ Скопировано';
  showToast('Скопировано');

  setTimeout(() => {
    button.classList.remove('done');
    button.textContent = originalLabel;
  }, 1100);
}

let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1400);
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

init();
