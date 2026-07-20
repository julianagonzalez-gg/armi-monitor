// api/order-history.js — Endpoint dedicado para historial de estados de una orden
const API_KEY = '87efc80c-f21a-4e76-8a80-7eae5575720c';
const HISTORY_BASE = 'https://armi-business-monitor-dot-armirene-369418.uc.r.appspot.com/monitor/order';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { orderId, country = 'COL' } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId requerido' });
  }

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
        error: `HTTP ${response.status}`,
        detail: text.substring(0, 200)
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: 'Error conectando al historial',
      detail: err.message
    });
  }
}
