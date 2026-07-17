const APP_META = {
  version: '1.0.1',
  status: 'Stable',
  updated: '17.07.2026',
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
    price: toText(source.price),
  };
}

function createDefaultWorkEstimate() {
  return {
    labor: [],
    materials: [],
    prepayment: '',
  };
}

function normalizeWorkEstimate(rawEstimate) {
  const source = rawEstimate && typeof rawEstimate === 'object' ? rawEstimate : {};
  const result = {
    labor: [],
    materials: [],
    prepayment: toText(source.prepayment),
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
  const total = laborTotal + materialsTotal;
  const prepayment = parseAmountNumber(normalized.prepayment);

  return {
    laborTotal,
    materialsTotal,
    total,
    prepayment,
    balance: total - prepayment,
    lineCount: normalized.labor.length + normalized.materials.length,
  };
}

function normalizeWork(rawWork, index = 0) {
  const source = rawWork && typeof rawWork === 'object' ? rawWork : {};
  const createdAt = toText(source.createdAt, new Date().toISOString());
  const rawStatus = toText(source.status, 'Планируется');

  return {
    id: toText(source.id, `WORK-${index + 1}-${Date.now()}`),
    title: toText(source.title, 'Работа без названия'),
    date: toText(source.date, localDateISO()),
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

function setCloudLastSyncedAt(value) {
  try {
    localStorage.setItem(CLOUD_SYNC_LAST_SYNC_KEY, toText(value, new Date().toISOString()));
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

async function downloadCloudEnvelope(code) {
  const manifest = await requestCloudSync('GET', code);
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
    const part = await requestCloudSync('GET', code, null, { part: String(index) });
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

async function localDataFingerprint(payload = createBackupPayload()) {
  return sha256Hex(JSON.stringify(payload.data));
}

function setCloudSyncBusy(busy) {
  cloudSyncInProgress = busy;
  ['cloudUploadBtn', 'cloudDownloadBtn', 'saveCloudSyncCodeBtn', 'generateCloudSyncCodeBtn'].forEach(
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

  if (!skipRemoteCheck) {
    const remoteEnvelope = await downloadCloudEnvelope(code);
    if (remoteEnvelope) {
      const remotePayload = await decryptCloudPayload(remoteEnvelope, code);
      const remoteParsed = parseBackupPayload(remotePayload);
      const localFingerprint = await localDataFingerprint(localPayload);
      const remoteFingerprint = await localDataFingerprint(remotePayload);
      const remoteIsNewer =
        parseTimestamp(remoteParsed.dataUpdatedAt || remoteParsed.exportedAt) >
        parseTimestamp(localPayload.dataUpdatedAt);

      if (manual && remoteIsNewer && localFingerprint !== remoteFingerprint) {
        const approved = window.confirm(
          'В облаке есть более новые данные с другого устройства.\n\n' +
            'Нажмите OK, чтобы всё равно заменить облачную базу данными с этого устройства.',
        );
        if (!approved) return false;
      }
    }
  }

  const envelope = await encryptCloudPayload(localPayload, code);
  await uploadCloudEnvelope(envelope, code);
  setCloudLastSyncedAt(localPayload.dataUpdatedAt);
  setCloudSyncStatus('База отправлена в облако', 'ok');
  renderCloudSyncInfo();
  return true;
}

async function downloadCloudDatabase(options = {}) {
  const { manual = false, skipConfirm = false } = options;
  const code = getCloudSyncCode();
  if (!code) {
    if (manual) window.alert('Сначала сохраните код синхронизации.');
    return false;
  }
  if (!navigator.onLine) {
    setCloudSyncStatus('Нет интернета — облачная база недоступна', 'warn');
    return false;
  }

  const envelope = await downloadCloudEnvelope(code);
  if (!envelope) {
    if (manual) window.alert('В облаке пока нет базы. Сначала отправьте её с основного устройства.');
    setCloudSyncStatus('Облачная база пока пуста', 'warn');
    return false;
  }

  const remotePayload = await decryptCloudPayload(envelope, code);
  const imported = parseBackupPayload(remotePayload);
  const remoteWorks = countClientWorks(imported.clients);

  if (manual && !skipConfirm) {
    const approved = window.confirm(
      `Загрузить облачную базу?\n\n` +
        `В облаке: ${imported.clients.length} клиентов, ${remoteWorks} работ.\n` +
        `На устройстве: ${state.clients.length} клиентов, ${countClientWorks(state.clients)} работ.\n\n` +
        'Перед заменой GORN сохранит точку отмены.',
    );
    if (!approved) return false;
  }

  localStorage.setItem(PRE_IMPORT_BACKUP_KEY, JSON.stringify(createBackupPayload()));
  const remoteUpdatedAt = imported.dataUpdatedAt || imported.exportedAt || new Date().toISOString();
  applyImportedData(imported, {
    dataUpdatedAt: remoteUpdatedAt,
    sync: false,
  });
  setCloudLastSyncedAt(remoteUpdatedAt);
  setCloudSyncStatus('Облачная база загружена на устройство', 'ok');
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
  setCloudSyncStatus('Синхронизация…');

  try {
    const localPayload = createBackupPayload();
    const remoteEnvelope = await downloadCloudEnvelope(code);

    if (!remoteEnvelope) {
      await uploadCloudDatabase({ manual: false, skipRemoteCheck: true });
      return;
    }

    const remotePayload = await decryptCloudPayload(remoteEnvelope, code);
    const remoteParsed = parseBackupPayload(remotePayload);
    const localFingerprint = await localDataFingerprint(localPayload);
    const remoteFingerprint = await localDataFingerprint(remotePayload);
    const localUpdatedAt = localPayload.dataUpdatedAt;
    const remoteUpdatedAt = remoteParsed.dataUpdatedAt || remoteParsed.exportedAt;
    const lastSyncedAt = getCloudLastSyncedAt();

    if (localFingerprint === remoteFingerprint) {
      const newest = parseTimestamp(remoteUpdatedAt) > parseTimestamp(localUpdatedAt)
        ? remoteUpdatedAt
        : localUpdatedAt;
      if (newest) {
        localStorage.setItem(CLOUD_SYNC_UPDATED_KEY, newest);
        setCloudLastSyncedAt(newest);
      }
      setCloudSyncStatus('Все устройства используют одну базу', 'ok');
      return;
    }

    const localChanged = parseTimestamp(localUpdatedAt) > parseTimestamp(lastSyncedAt);
    const remoteChanged = parseTimestamp(remoteUpdatedAt) > parseTimestamp(lastSyncedAt);

    if (localChanged && remoteChanged && lastSyncedAt) {
      setCloudSyncStatus('На двух устройствах есть разные изменения', 'warn');
      if (manual) {
        const useRemote = window.confirm(
          'Обнаружены разные изменения на этом и другом устройстве.\n\n' +
            'OK — загрузить облачную базу на это устройство.\n' +
            'Отмена — оставить данные этого устройства и отправить их в облако.',
        );
        if (useRemote) {
          await downloadCloudDatabase({ manual: false, skipConfirm: true });
        } else {
          await uploadCloudDatabase({ manual: false, skipRemoteCheck: true });
        }
      }
      return;
    }

    if (parseTimestamp(remoteUpdatedAt) > parseTimestamp(localUpdatedAt)) {
      await downloadCloudDatabase({ manual: false, skipConfirm: true });
    } else {
      await uploadCloudDatabase({ manual: false, skipRemoteCheck: true });
    }
  } catch (error) {
    console.error('GORN: ошибка облачной синхронизации', error);
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
    localStorage.removeItem(CLOUD_SYNC_LAST_SYNC_KEY);
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
  localStorage.removeItem(CLOUD_SYNC_LAST_SYNC_KEY);
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

  return {
    clients,
    favorites,
    recent,
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
      entry.work.address,
      entry.work.status,
      entry.work.amount,
      entry.work.notes,
    ].join(' ');
    return fieldContainsTokens(text, tokens);
  });

  const todayEntries = visibleEntries
    .filter((entry) => isActivePlanWork(entry.work) && entry.work.date === today)
    .sort((a, b) => String(b.work.updatedAt).localeCompare(String(a.work.updatedAt)));

  const overdueEntries = visibleEntries
    .filter((entry) => isActivePlanWork(entry.work) && entry.work.date < today)
    .sort((a, b) =>
      String(a.work.date).localeCompare(String(b.work.date)) ||
      String(b.work.updatedAt).localeCompare(String(a.work.updatedAt)),
    );

  const upcomingEntries = visibleEntries
    .filter((entry) => isActivePlanWork(entry.work) && entry.work.date > today)
    .sort((a, b) =>
      String(a.work.date).localeCompare(String(b.work.date)) ||
      String(b.work.updatedAt).localeCompare(String(a.work.updatedAt)),
    );

  const plannedAmount = allEntries
    .filter((entry) => entry.work.status === 'Планируется')
    .reduce((total, entry) => total + parseAmountNumber(entry.work.amount), 0);
  const completedAmount = allEntries
    .filter((entry) => entry.work.status === 'Завершено')
    .reduce((total, entry) => total + parseAmountNumber(entry.work.amount), 0);
  const allTodayCount = allEntries.filter(
    (entry) => isActivePlanWork(entry.work) && entry.work.date === today,
  ).length;
  const allOverdueCount = allEntries.filter(
    (entry) => isActivePlanWork(entry.work) && entry.work.date < today,
  ).length;

  $('#planTodayCount').textContent = String(allTodayCount);
  $('#planOverdueCount').textContent = String(allOverdueCount);
  $('#planPlannedAmount').textContent = formatRubles(plannedAmount);
  $('#planCompletedAmount').textContent = formatRubles(completedAmount);

  renderPlanSection('Today', todayEntries, tokens.length > 0);
  renderPlanSection('Overdue', overdueEntries, tokens.length > 0);
  renderPlanSection('Upcoming', upcomingEntries, tokens.length > 0);

  document.querySelectorAll('[data-plan-client-id]').forEach((button) => {
    button.onclick = (event) => {
      event.stopPropagation();
      openClientFromPlan(button.dataset.planClientId);
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
    work.date ? `🗓 ${esc(formatClientDate(work.date))}` : '',
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
        <button class="client-open-btn" data-plan-client-id="${esc(clientId)}" type="button">Открыть клиента</button>
      </div>
    </article>`;
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
  $('#clientName').focus();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function closeClientForm() {
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
}

function workCard(work) {
  const checklist = workChecklistProgress(work.checklist);
  const estimate = calculateWorkEstimate(work.estimate);
  const shownAmount = work.amount || (estimate.total ? formatRubles(estimate.total) : '');
  const details = [
    work.date ? `🗓 ${esc(formatClientDate(work.date))}` : '',
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
      <button class="work-open-btn" type="button">Открыть запись</button>
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

function buildEstimateClientText() {
  const client = currentEditingClient();
  const estimate = state.workEstimateDraft || normalizeWorkEstimate({});
  const totals = calculateWorkEstimate(estimate);
  const title = toText($('#workTitle')?.value, 'Работа');
  const address = toText($('#workAddress')?.value, client?.address || '');
  const lines = ['Расчёт GORN'];

  if (client?.name) lines.push(`Клиент: ${client.name}`);
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
        `${index + 1}. ${item.name} — ${item.quantity || 1} × ${formatRubles(price)} = ${formatRubles(total)}`,
      );
    });
  };

  appendGroup('Работы', 'labor');
  appendGroup('Материалы', 'materials');

  lines.push('', `Итого: ${formatRubles(totals.total)}`);
  if (totals.prepayment) lines.push(`Предоплата: ${formatRubles(totals.prepayment)}`);
  lines.push(
    totals.balance >= 0
      ? `Остаток: ${formatRubles(totals.balance)}`
      : `Переплата: ${formatRubles(Math.abs(totals.balance))}`,
  );

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

  const clientText = $('#estimateClientText');
  if (clientText) clientText.textContent = buildEstimateClientText();

  const copyButton = $('#copyEstimateBtn');
  if (copyButton) copyButton.disabled = totals.lineCount === 0;
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
    price: toText(priceInput?.value),
  });

  if (nameInput) nameInput.value = '';
  if (quantityInput) quantityInput.value = '1';
  if (priceInput) priceInput.value = '';
  renderWorkEstimateDraft();
  nameInput?.focus();
}

function handleWorkEstimateInput(event) {
  if (!state.workEstimateDraft) return;
  const target = event.target;

  if (target.id === 'estimatePrepayment') {
    state.workEstimateDraft.prepayment = target.value;
    renderWorkEstimateSummary();
    return;
  }

  const group = target.dataset.estimateGroup;
  const itemId = target.dataset.estimateId;
  const field = target.dataset.estimateField;
  if (!group || !itemId || !['name', 'quantity', 'price'].includes(field)) return;
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

function applyEstimateTotalToWork() {
  const totals = calculateWorkEstimate(state.workEstimateDraft || {});
  if (!totals.lineCount) {
    showToast('Смета пока пуста');
    return;
  }
  $('#workAmount').value = formatRubles(totals.total);
  showToast('Итог сметы подставлен');
}

function openWorkForm(workId = null) {
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
  $('#workTitle').focus();
  $('#workFormWrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeWorkForm() {
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
    todayCount: activeEntries.filter((entry) => entry.work.date === today).length,
    overdueCount: activeEntries.filter((entry) => entry.work.date && entry.work.date < today).length,
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
    .filter((entry) => entry.work.date && entry.work.date <= today)
    .map((entry) => ({
      type: entry.work.date < today ? 'overdue' : 'today',
      priority: entry.work.date < today ? 0 : 1,
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
    ${copySection('📩 Готовый ответ клиенту', card.reply, 'reply')}
    ${copySection('💰 Как назвать стоимость', card.price, 'price')}
    ${listSection('☎️ Что спросить', card.phone)}
    ${listSection('📷 Какие фото попросить', card.photos)}
    ${listSection('🔍 Что проверить', card.check)}
    ${listSection('🧰 Что взять / материалы', card.materials)}
    ${listSection('⚠️ Красные флаги', card.flags, 'flags')}`;

  document.querySelectorAll('[data-copy]').forEach((button) => {
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
