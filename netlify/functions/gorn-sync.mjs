import { getStore } from '@netlify/blobs';

const STORE_NAME = 'gorn-cloud-sync';
const MAX_PART_BYTES = 1_100_000;
const MAX_PARTS = 100;
const KEY_PATTERN = /^[a-f0-9]{64}$/;
const UPLOAD_ID_PATTERN = /^[A-Za-z0-9-]{12,120}$/;

const responseHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
};

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...responseHeaders,
      ...extraHeaders,
    },
  });
}

function parsePart(url) {
  const raw = url.searchParams.get('part');
  if (raw === null) return null;
  const part = Number(raw);
  return Number.isInteger(part) && part >= 0 && part < MAX_PARTS ? part : NaN;
}

function validateManifest(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Тело запроса должно содержать JSON');
  }
  if (payload.format !== 'GORN_CLOUD_SYNC') {
    throw new Error('Неизвестный формат облачной базы');
  }
  if (Number(payload.schemaVersion) !== 1) {
    throw new Error('Неподдерживаемая версия облачной базы');
  }
  if (
    typeof payload.salt !== 'string' ||
    typeof payload.iv !== 'string' ||
    !UPLOAD_ID_PATTERN.test(String(payload.uploadId || ''))
  ) {
    throw new Error('Облачная база повреждена');
  }

  const chunkCount = Number(payload.chunkCount);
  if (!Number.isInteger(chunkCount) || chunkCount < 1 || chunkCount > MAX_PARTS) {
    throw new Error('Неверное количество частей облачной базы');
  }
}

function validatePart(payload, requestedPart) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Тело запроса должно содержать JSON');
  }
  if (!UPLOAD_ID_PATTERN.test(String(payload.uploadId || ''))) {
    throw new Error('Неверный идентификатор загрузки');
  }
  if (Number(payload.index) !== requestedPart || typeof payload.chunk !== 'string') {
    throw new Error('Неверная часть облачной базы');
  }
  if (new TextEncoder().encode(payload.chunk).byteLength > MAX_PART_BYTES) {
    throw new Error('Часть облачной базы слишком большая');
  }
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...responseHeaders,
        Allow: 'GET, PUT, OPTIONS',
      },
    });
  }

  const url = new URL(request.url);
  const key = (url.searchParams.get('key') || '').toLowerCase();
  const part = parsePart(url);
  const isManifestWrite = url.searchParams.get('manifest') === '1';
  const useHistory = url.searchParams.get('history') === '1';

  if (!KEY_PATTERN.test(key)) {
    return jsonResponse({ error: 'Неверный ключ синхронизации' }, 400);
  }
  if (Number.isNaN(part)) {
    return jsonResponse({ error: 'Неверный номер части' }, 400);
  }

  const store = getStore({
    name: STORE_NAME,
    consistency: 'strong',
  });

  try {
    if (request.method === 'GET') {
      const manifestKey = useHistory ? `${key}/history/latest` : key;
      if (part !== null) {
        const manifest = await store.get(manifestKey, { type: 'json' });
        if (!manifest) {
          return jsonResponse({ error: 'Облачная база не найдена' }, 404);
        }

        const uploadId = String(manifest.uploadId || '');
        if (!UPLOAD_ID_PATTERN.test(uploadId)) {
          return jsonResponse({ error: 'Манифест облачной базы повреждён' }, 500);
        }

        const entry = await store.get(`${key}/chunks/${uploadId}/${part}`, { type: 'json' });
        if (entry === null) {
          return jsonResponse({ error: 'Часть облачной базы не найдена' }, 404);
        }
        return jsonResponse(entry);
      }

      const entry = await store.get(manifestKey, { type: 'json' });
      if (entry === null) {
        return jsonResponse({ error: 'Облачная база не найдена' }, 404);
      }
      return jsonResponse(entry);
    }

    if (request.method === 'PUT') {
      const text = await request.text();
      const size = new TextEncoder().encode(text).byteLength;
      if (!text || size > MAX_PART_BYTES) {
        return jsonResponse({ error: 'Запрос синхронизации слишком большой' }, 413);
      }

      const payload = JSON.parse(text);

      if (part !== null) {
        validatePart(payload, part);
        await store.setJSON(`${key}/chunks/${payload.uploadId}/${part}`, payload);
        return jsonResponse({ ok: true, part });
      }

      if (!isManifestWrite) {
        return jsonResponse({ error: 'Не указан тип записи облачной базы' }, 400);
      }

      validateManifest(payload);
      const previous = await store.get(key, { type: 'json' });
      const olderHistory = await store.get(`${key}/history/latest`, { type: 'json' });

      if (previous) {
        await store.setJSON(`${key}/history/latest`, previous, {
          metadata: {
            appVersion: String(previous.appVersion || ''),
            updatedAt: String(previous.updatedAt || ''),
            chunkCount: Number(previous.chunkCount) || 0,
          },
        });
      }

      await store.setJSON(key, payload, {
        metadata: {
          appVersion: String(payload.appVersion || ''),
          updatedAt: String(payload.updatedAt || ''),
          chunkCount: Number(payload.chunkCount) || 0,
        },
      });

      const obsoleteUploadId = String(olderHistory?.uploadId || '');
      const obsoleteChunkCount = Number(olderHistory?.chunkCount) || 0;
      const previousUploadId = String(previous?.uploadId || '');
      if (
        obsoleteUploadId &&
        obsoleteUploadId !== previousUploadId &&
        obsoleteUploadId !== payload.uploadId &&
        UPLOAD_ID_PATTERN.test(obsoleteUploadId)
      ) {
        await Promise.all(
          Array.from(
            { length: Math.min(obsoleteChunkCount, MAX_PARTS) },
            (_, index) => store.delete(`${key}/chunks/${obsoleteUploadId}/${index}`),
          ),
        );
      }

      return jsonResponse({
        ok: true,
        updatedAt: payload.updatedAt || new Date().toISOString(),
        chunkCount: payload.chunkCount,
      });
    }

    return jsonResponse(
      { error: 'Метод не поддерживается' },
      405,
      { Allow: 'GET, PUT, OPTIONS' },
    );
  } catch (error) {
    console.error('GORN cloud sync error', error);
    const message =
      error instanceof SyntaxError
        ? 'Не удалось прочитать JSON облачной базы'
        : error?.message || 'Внутренняя ошибка синхронизации';
    return jsonResponse({ error: message }, 500);
  }
};
