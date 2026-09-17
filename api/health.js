/**
 * api/health.js
 * 
 * Reports keyConfigured and, for LTA, reachable, status and ms.
 * It NEVER prints the key or echoes any request header.
 * Uses lib/fetchState.js and lib/classify.js under the hood.
 */

import { fetchState } from '../lib/fetchState.js';

function sendResponse(res, statusCode, body, headers = {}) {
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  if (typeof res.status === 'function') {
    return res.status(statusCode).json(body);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  const key = process.env.LTA_ACCOUNT_KEY;
  const keyConfigured = Boolean(
    key && typeof key === 'string' && key.trim() && key.trim() !== 'undefined'
  );

  let reachable = false;
  let status = null;
  let ms = 0;

  try {
    const headers = keyConfigured ? { AccountKey: key.trim() } : {};
    const result = await fetchState(
      'https://datamall2.mytransport.sg/ltaodataservice/GTFSRealtimeTrainTrip',
      { headers },
      (b) => b?.Services
    );

    reachable = result.state !== 'unreachable';
    status = result.providerStatus ?? null;
    ms = typeof result.ms === 'number' ? result.ms : 0;
  } catch {
    reachable = false;
    status = null;
    ms = 0;
  }

  // Strictly never print the key or echo any request header
  return sendResponse(
    res,
    200,
    {
      state: 'ok',
      keyConfigured,
      reachable,
      status,
      ms,
      lta: {
        reachable,
        status,
        ms,
      },
    },
    {
      'Cache-Control': 'no-store',
    }
  );
}
