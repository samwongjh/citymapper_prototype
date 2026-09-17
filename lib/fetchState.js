/**
 * lib/fetchState.js
 * 
 * Executes an HTTP fetch with a 6-second timeout, reading status, content-type,
 * and text body (never calling .json() directly), and applies classify to determine state.
 */

import { classify } from './classify.js';

export async function fetchState(url, options = {}, pick = (b) => b) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  const start = Date.now();

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const ms = Date.now() - start;
    const status = res.status;
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    const classification = classify({ status, contentType, text, pick });
    return {
      ...classification,
      ms,
      providerStatus: status,
      contentType,
      text,
    };
  } catch (err) {
    const ms = Date.now() - start;
    return {
      state: 'unreachable',
      status: 504,
      ms,
      providerStatus: null,
      data: null,
      error: 'We could not reach LTA, so nothing on this panel has updated.',
    };
  } finally {
    clearTimeout(timer);
  }
}

export default fetchState;
