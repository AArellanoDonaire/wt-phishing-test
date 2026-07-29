import { getStore } from '@netlify/blobs';

/* Diagnóstico: abre /api/health en el navegador para ver qué está fallando. */
export default async () => {
  const info = { funcion: 'ok', blobs: null, error: null, node: process.version };
  try {
    const store = getStore('ranking-phishing');
    await store.setJSON('__health__', { ts: Date.now() });
    const leido = await store.get('__health__', { type: 'json' });
    await store.delete('__health__');
    info.blobs = leido ? 'ok' : 'escribe pero no lee';
  } catch (err) {
    info.blobs = 'error';
    info.error = String(err && err.message ? err.message : err);
  }
  return Response.json(info, { status: info.blobs === 'ok' ? 200 : 500 });
};
