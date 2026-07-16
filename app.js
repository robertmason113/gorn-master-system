const APP_META = {
  version: '0.3.3',
  status: 'Stable',
  updated: '16.07.2026',
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
  editingClientId: null,
  favorites: readStoredArray('gornFavorites'),
  recent: readStoredArray('gornRecent'),
  clients: readStoredClients(),
};

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

function normalizeClient(rawClient, index = 0) {
  const source = rawClient && typeof rawClient === 'object' ? rawClient : {};
  const createdAt = toText(source.createdAt, new Date().toISOString());
  return {
    id: toText(source.id, `CLIENT-${index + 1}-${Date.now()}`),
    name: toText(source.name, 'Без имени'),
    phone: toText(source.phone),
    address: toText(source.address),
    notes: toText(source.notes),
    date: toText(source.date, localDateISO()),
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
    save();

    renderCategories();
    showListView('home', false);
    history.replaceState({ view: 'home' }, '', window.location.href);
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

  $('#newClientBtn')?.addEventListener('click', () => openClientForm());
  $('#closeClientFormBtn')?.addEventListener('click', closeClientForm);
  $('#clientForm')?.addEventListener('submit', saveClientFromForm);
  $('#deleteClientBtn')?.addEventListener('click', deleteEditingClient);

  document.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.nav));
  });

  window.addEventListener('popstate', (event) => restoreHistoryView(event.state));
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const hadController = Boolean(navigator.serviceWorker.controller);
  let refreshing = false;

  navigator.serviceWorker
    .register('service-worker.js', { updateViaCache: 'none' })
    .then((registration) => registration.update())
    .catch((error) => console.warn('GORN: Service Worker не зарегистрирован', error));

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || refreshing) return;
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
    if (pushHistory) history.pushState({ view: 'about' }, '', window.location.href);
    return;
  }

  if (where === 'clients') {
    showClientsView(pushHistory);
    return;
  }

  const mode = where === 'favorites' ? 'favorites' : 'home';
  showListView(mode, pushHistory);
}

function showListView(mode = state.mode, pushHistory = false) {
  state.mode = mode === 'favorites' ? 'favorites' : 'home';
  state.current = null;
  state.editingClientId = null;
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
  setActiveNav('clients');
  setSearchContext('clients');
  showOnly('clientsView');
  closeClientForm();
  renderClients();

  if (pushHistory) {
    history.pushState({ view: 'clients' }, '', window.location.href);
  }
}

function setSearchContext(context) {
  const search = $('#search');
  if (!search) return;

  const isClients = context === 'clients';
  search.value = isClients ? state.clientSearch : state.cardSearch;
  search.placeholder = isClients
    ? 'Поиск клиентов: имя, телефон, адрес...'
    : 'Поиск: дымит, кирпич, чистка...';
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

  showListView(view === 'favorites' ? 'favorites' : 'home', false);
}

function showOnly(id) {
  ['homeView', 'cardView', 'clientsView', 'aboutView'].forEach((viewId) => {
    $(`#${viewId}`).classList.toggle('hidden', viewId !== id);
  });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function save() {
  try {
    localStorage.setItem('gornFavorites', JSON.stringify(state.favorites));
    localStorage.setItem('gornRecent', JSON.stringify(state.recent));
    localStorage.setItem('gornClients', JSON.stringify(state.clients));
  } catch (error) {
    console.warn('GORN: не удалось сохранить локальные данные', error);
  }
}


function renderClients() {
  const query = normalizeSearchText(state.clientSearch);
  const tokens = query.split(' ').filter(Boolean);
  const clients = [...state.clients]
    .filter((client) => {
      if (!tokens.length) return true;
      const text = [client.name, client.phone, client.address, client.notes, client.date].join(' ');
      return fieldContainsTokens(text, tokens);
    })
    .sort(
      (a, b) =>
        String(b.date).localeCompare(String(a.date)) ||
        String(b.updatedAt).localeCompare(String(a.updatedAt)),
    );

  $('#clientsCountBadge').textContent = `(${clients.length})`;
  $('#clientsList').innerHTML = clients.map(clientCard).join('');
  $('#clientsEmpty').textContent = query ? 'Ничего не найдено' : 'Клиентов пока нет';
  $('#clientsEmpty').classList.toggle('hidden', clients.length > 0);

  document.querySelectorAll('[data-client-id]').forEach((element) => {
    element.onclick = () => openClientForm(element.dataset.clientId);
  });

  document.querySelectorAll('.client-call').forEach((link) => {
    link.onclick = (event) => event.stopPropagation();
  });
}

function clientCard(client) {
  const phoneHref = client.phone.replace(/[^\d+]/g, '');
  const details = [
    client.phone ? `☎ ${esc(client.phone)}` : '',
    client.address ? `📍 ${esc(client.address)}` : '',
    client.date ? `🗓 ${esc(formatClientDate(client.date))}` : '',
  ].filter(Boolean);

  return `
    <article class="client-card" data-client-id="${esc(client.id)}">
      <div class="client-card-main">
        <div class="client-avatar">👤</div>
        <div class="client-card-content">
          <div class="client-name">${esc(client.name)}</div>
          <div class="client-details">${details.join('<span>•</span>')}</div>
          ${client.notes ? `<div class="client-notes-preview">${esc(client.notes)}</div>` : ''}
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

  $('#clientFormTitle').textContent = client ? 'Карточка клиента' : 'Новый клиент';
  $('#clientName').value = client?.name || '';
  $('#clientPhone').value = client?.phone || '';
  $('#clientAddress').value = client?.address || '';
  $('#clientDate').value = client?.date || localDateISO();
  $('#clientNotes').value = client?.notes || '';
  $('#deleteClientBtn').classList.toggle('hidden', !client);
  $('#clientFormWrap').classList.remove('hidden');
  $('#clientsList').classList.add('hidden');
  $('#clientsEmpty').classList.add('hidden');
  $('#newClientBtn').classList.add('hidden');
  $('#clientName').focus();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function closeClientForm() {
  state.editingClientId = null;
  $('#clientForm')?.reset();
  $('#clientFormWrap')?.classList.add('hidden');
  $('#clientsList')?.classList.remove('hidden');
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

function renderHome() {
  const list = filtered();
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
  save();
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
    ${copySection('📩 Готовый ответ клиенту', card.reply)}
    ${copySection('💰 Как назвать стоимость', card.price)}
    ${listSection('☎️ Что спросить', card.phone)}
    ${listSection('📷 Какие фото попросить', card.photos)}
    ${listSection('🔍 Что проверить', card.check)}
    ${listSection('🧰 Что взять / материалы', card.materials)}
    ${listSection('⚠️ Красные флаги', card.flags, 'flags')}`;

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.onclick = () => copyText(button.dataset.copy, button);
  });
}

function copySection(title, items = []) {
  const safeItems = toArray(items);
  if (!safeItems.length) return '';

  return `
    <section class="block">
      <h3>${title}</h3>
      ${safeItems
        .map((item, index) => {
          const id = `copy-${state.current.id}-${index}-${title.length}`;
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
    button.textContent = '📋 Копировать';
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
