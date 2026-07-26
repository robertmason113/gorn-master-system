const MAX_CALENDAR_BYTES = 750_000;

function textResponse(message, status = 400) {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function sanitizeFilename(value) {
  const cleaned = String(value || 'GORN_calendar.ics')
    .replace(/[\\/:*?"<>|\r\n]+/g, '-')
    .trim()
    .slice(0, 150);
  return (cleaned || 'GORN_calendar.ics').toLowerCase().endsWith('.ics')
    ? (cleaned || 'GORN_calendar.ics')
    : `${cleaned || 'GORN_calendar'}.ics`;
}

function asciiFilename(value) {
  const safe = value
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120);
  return safe.toLowerCase().endsWith('.ics') ? safe : `${safe || 'GORN_calendar'}.ics`;
}

function normalizeCalendar(value) {
  return `${String(value || '').replace(/\r?\n/g, '\r\n').trim()}\r\n`;
}

function isValidCalendar(value) {
  return value.startsWith('BEGIN:VCALENDAR\r\n') &&
    value.includes('\r\nBEGIN:VEVENT\r\n') &&
    value.endsWith('END:VCALENDAR\r\n');
}

export default async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        Allow: 'POST, OPTIONS',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  if (request.method !== 'POST') {
    return textResponse('Используйте кнопку «Добавить в календарь» в приложении ГОРН.', 405);
  }

  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_CALENDAR_BYTES) {
      return textResponse('Календарь слишком большой.', 413);
    }

    const params = new URLSearchParams(body);
    const calendar = normalizeCalendar(params.get('calendar'));
    if (!isValidCalendar(calendar)) {
      return textResponse('Файл календаря повреждён или не содержит событий.', 400);
    }

    const filename = sanitizeFilename(params.get('filename'));
    const fallback = asciiFilename(filename);

    return new Response(calendar, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'",
        'Referrer-Policy': 'no-referrer',
      },
    });
  } catch (error) {
    console.error('GORN calendar function error', error);
    return textResponse('Не удалось подготовить календарь. Вернитесь в ГОРН и повторите попытку.', 500);
  }
};
