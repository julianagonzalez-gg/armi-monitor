// ─────────────────────────────────────────────────────────────────────────────
// api/proxy.js — Proxy serverless para el API de Armi
// Maneja dos endpoints:
//   1. /api/proxy → orders filter (paginado, acumulado día)
//   2. /api/proxy?mode=order&orderId=497167 → historial de estados de una orden
// ─────────────────────────────────────────────────────────────────────────────

const API_KEY = '87efc80c-f21a-4e76-8a80-7eae5575720c';
const ORDERS_BASE = 'https://tu-armi.com/business-monitor/order/filter';
const HISTORY_BASE = 'https://armi-business-monitor-dot-armirene-369418.uc.r.appspot.com/monitor/order';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mode, orderId, page=1, pageSize=100, country='COL', endpoint, apikey } = req.query;

  // ── MODO 2: historial de estados de una orden específica ──
  if (mode === 'order' && orderId) {
    try {
      const url = `${HISTORY_BASE}/${orderId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'COUNTRY': country,
          'armi-business-api-key': API_KEY,
        },
      });
      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({
          error: `HTTP ${response.status}`, detail: text.substring(0, 200)
        });
      }
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Error conectando al historial', detail: err.message });
    }
  }

  // ── MODO 1: listado de órdenes paginado (comportamiento original) ──
  const baseUrl = endpoint ? decodeURIComponent(endpoint) : ORDERS_BASE;
  const armiKey = apikey ? decodeURIComponent(apikey) : API_KEY;
  const url = `${baseUrl}?page=${page}&pageSize=${pageSize}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'COUNTRY': country,
        'armi-business-api-key': armiKey,
      },
    });
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `API de Armi respondió con HTTP ${response.status}`,
        detail: text.substring(0, 300)
      });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: 'El proxy no pudo conectar con el API de Armi',
      detail: err.message
    });
  }
}
