// ─────────────────────────────────────────────────────────────────────────────
// api/proxy.js  —  Proxy serverless para el API de Armi
//
// ¿Qué hace este archivo?
// El navegador no puede llamar directamente al API de Armi por CORS.
// Este archivo vive en los servidores de Vercel y actúa como intermediario:
//   Navegador  →  proxy.js (Vercel)  →  API de Armi  →  proxy.js  →  Navegador
// Así el navegador nunca llama a Armi directamente, y el CORS desaparece.
// ─────────────────────────────────────────────────────────────────────────────
 
export default async function handler(req, res) {
  // Permitir llamadas desde cualquier origen (soluciona el CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  // Responder al preflight de CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
 
  // Leer parámetros que envía el dashboard
  const {
    page = 1,
    pageSize = 100,
    country = 'VEN',
    endpoint,
    apikey
  } = req.query;
 
  // Construir la URL del API real de Armi
  // Si el dashboard envía su propio endpoint, úsalo; si no, usa el de por defecto
  const baseUrl = endpoint
    ? decodeURIComponent(endpoint)
    : 'https://tu-armi.com/business-monitor/order/filter';
 
  const armiKey = apikey
    ? decodeURIComponent(apikey)
    : '87efc80c-f21a-4e76-8a80-7eae5575720c';
 
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
 
    // Si el API de Armi responde con error, lo pasamos tal cual
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
