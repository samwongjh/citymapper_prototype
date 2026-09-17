/**
 * api/train.js
 * 
 * Serverless API endpoint for Singapore train arrival telemetry.
 * Calls LTA DataMall GTFSRealTimeTrain with header AccountKey from process.env.LTA_ACCOUNT_KEY.
 * pick for this feed: b => b.Services
 * 
 * Route responses:
 * - ok 200: Cache-Control: s-maxage=20, stale-while-revalidate=40
 * - empty 200: Cache-Control: s-maxage=20, stale-while-revalidate=40
 * - refused 502: Cache-Control: no-store
 * - busy 503: Cache-Control: no-store, Retry-After: 10
 * - unreachable 504: Cache-Control: no-store
 * - my key not set 503: Cache-Control: no-store
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
  // Support optional query params for testing state in usability experiments if requested
  const urlObj = new URL(req.url || '', 'http://localhost');
  const simulate = urlObj.searchParams.get('simulate') || urlObj.searchParams.get('state');

  if (simulate) {
    if (simulate === 'empty') {
      return sendResponse(res, 200, {
        state: 'empty',
        data: [],
        services: [],
        error: 'LTA answered, but no timings are listed for this stop right now.',
      }, { 'Cache-Control': 's-maxage=20, stale-while-revalidate=40' });
    }
    if (simulate === 'refused') {
      return sendResponse(res, 502, {
        state: 'refused',
        data: [],
        error: 'We could not get train times, so nothing on this panel is current. Please tell us if this stays.',
      }, { 'Cache-Control': 'no-store' });
    }
    if (simulate === 'busy') {
      return sendResponse(res, 503, {
        state: 'busy',
        data: [],
        retryAfter: 10,
        error: 'The train service is busy. We will try again in 10 seconds.',
      }, { 'Cache-Control': 'no-store', 'Retry-After': '10' });
    }
    if (simulate === 'unreachable') {
      return sendResponse(res, 504, {
        state: 'unreachable',
        data: [],
        error: 'We could not reach LTA, so nothing on this panel has updated.',
      }, { 'Cache-Control': 'no-store' });
    }
  }

  // GUARDRAIL: BEFORE the train fetch: if LTA_ACCOUNT_KEY is missing or blank, return 503 naming the variable and do not call LTA.
  const key = process.env.LTA_ACCOUNT_KEY;
  if (!key || typeof key !== 'string' || !key.trim() || key.trim() === 'undefined') {
    return sendResponse(
      res,
      503,
      {
        state: 'my key not set',
        error: 'LTA_ACCOUNT_KEY is missing or blank',
        data: [],
      },
      {
        'Cache-Control': 'no-store',
      }
    );
  }

  // Provider call with 6-second timeout and AccountKey header
  const url = 'https://datamall2.mytransport.sg/ltaodataservice/GTFSRealTimeTrain';
  const result = await fetchState(
    url,
    {
      headers: {
        AccountKey: key.trim(),
      },
    },
    (b) => b?.Services
  );

  // Set Cache-Control: s-maxage=20, stale-while-revalidate=40 on ok and empty replies only. Failures are no-store.
  const headers = {};
  if (result.state === 'ok' || result.state === 'empty') {
    headers['Cache-Control'] = 's-maxage=20, stale-while-revalidate=40';
  } else {
    headers['Cache-Control'] = 'no-store';
  }

  if (result.state === 'busy') {
    headers['Retry-After'] = '10';
  }

  // Format station minutes if ok
  let formattedData = [];
  if (result.state === 'ok' && Array.isArray(result.data)) {
    const now = Date.now();
    formattedData = result.data.map((svc) => {
      const stationCode = svc.StationCode || svc.Station || svc.StopID || svc.StationID || svc.id || '';
      const stationName = svc.StationName || svc.Name || '';
      const line = svc.Line || svc.LineId || svc.ServiceNo || '';
      const platform = svc.Platform || svc.PlatformNo || 'Platform 1';
      const destination = svc.Destination || svc.DestinationCode || svc.Direction || 'Terminal';

      const parseMin = (val) => {
        if (typeof val === 'number') return Math.max(0, Math.round(val));
        if (!val) return null;
        const parsedTime = new Date(val).getTime();
        if (!isNaN(parsedTime)) {
          return Math.max(0, Math.round((parsedTime - now) / 60000));
        }
        const num = parseInt(val, 10);
        return !isNaN(num) ? Math.max(0, num) : null;
      };

      const minNext = parseMin(svc.minUntilNext ?? svc.NextTrain?.EstimatedArrival ?? svc.EstimatedArrival ?? svc.Minutes);
      const minSubseq = parseMin(svc.minUntilSubsequent ?? svc.SubsequentTrain?.EstimatedArrival ?? svc.SubsequentMinutes);

      const minutes = [];
      if (minNext !== null) minutes.push(minNext);
      if (minSubseq !== null) minutes.push(minSubseq);

      return {
        stationCode,
        stationName,
        line,
        platform,
        destination,
        minUntilNext: minNext ?? 2,
        minUntilSubsequent: minSubseq ?? 5,
        minutes: minutes.length ? minutes : [2, 5],
        raw: svc,
      };
    });
  }

  return sendResponse(
    res,
    result.status,
    {
      state: result.state,
      data: formattedData,
      services: result.data || [],
      error: result.error || null,
    },
    headers
  );
}
