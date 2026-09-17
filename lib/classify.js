/**
 * lib/classify.js
 * 
 * Classifies HTTP response status, content type, and body text into state representations:
 * ok 200 | empty 200 | refused 502 | busy 503 | unreachable 504
 */

export function classify(input, maybeContentType, maybeText, maybePick) {
  let status;
  let contentType = '';
  let text = '';
  let pick = (b) => b;

  if (typeof input === 'object' && input !== null) {
    status = input.status;
    contentType = input.contentType || input.headers?.get?.('content-type') || '';
    text = input.text ?? input.body ?? '';
    pick = input.pick || maybePick || ((b) => b);
  } else {
    status = input;
    contentType = maybeContentType || '';
    text = maybeText || '';
    pick = maybePick || ((b) => b);
  }

  // 1. Busy state: 429 Too Many Requests or 503 Service Unavailable
  if (status === 429 || status === 503) {
    return {
      state: 'busy',
      status: 503,
      retryAfter: 10,
      data: null,
      error: 'The train service is busy. We will try again in 10 seconds.',
    };
  }

  // 2. Refused state: 401 Unauthorized, 403 Forbidden, 404 Not Found, or 5xx provider failure
  if (status === 401 || status === 403 || status === 404 || status >= 500) {
    return {
      state: 'refused',
      status: 502,
      data: null,
      error: 'We could not get train times, so nothing on this panel is current. Please tell us if this stays.',
    };
  }

  // Any non-2xx status is refused
  if (status < 200 || status >= 300) {
    return {
      state: 'refused',
      status: 502,
      data: null,
      error: 'We could not get train times, so nothing on this panel is current. Please tell us if this stays.',
    };
  }

  // 3. Status 200 OK: Never call .json() directly; safely parse text
  if (!text || !text.trim()) {
    return {
      state: 'empty',
      status: 200,
      data: [],
      error: 'LTA answered, but no timings are listed for this stop right now.',
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    // If response status is 200 but body is invalid JSON (e.g. plain text error)
    return {
      state: 'refused',
      status: 502,
      data: null,
      error: 'We could not get train times, so nothing on this panel is current. Please tell us if this stays.',
    };
  }

  const picked = typeof pick === 'function' ? pick(parsed) : parsed;

  const isEmpty =
    picked === null ||
    picked === undefined ||
    (Array.isArray(picked) && picked.length === 0) ||
    (typeof picked === 'object' && Object.keys(picked).length === 0);

  if (isEmpty) {
    return {
      state: 'empty',
      status: 200,
      data: Array.isArray(picked) ? [] : (picked ?? []),
      error: 'LTA answered, but no timings are listed for this stop right now.',
    };
  }

  return {
    state: 'ok',
    status: 200,
    data: picked,
  };
}

export default classify;
