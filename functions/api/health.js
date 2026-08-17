/* Diagnóstico: abre /api/health en el navegador para ver qué está fallando. */
export async function onRequestGet(context) {
  const { env } = context;
  const info = { funcion: 'ok', kv: null, error: null };

  if (!env.RANKING_KV) {
    info.kv = 'sin binding';
    info.error = 'Falta enlazar el KV namespace como "RANKING_KV" en Settings → Functions → KV namespace bindings';
    return Response.json(info, { status: 500 });
  }

  try {
    await env.RANKING_KV.put('__health__', JSON.stringify({ ts: Date.now() }));
    const leido = await env.RANKING_KV.get('__health__');
    await env.RANKING_KV.delete('__health__');
    info.kv = leido ? 'ok' : 'escribe pero no lee';
  } catch (err) {
    info.kv = 'error';
    info.error = String(err && err.message ? err.message : err);
  }

  return Response.json(info, { status: info.kv === 'ok' ? 200 : 500 });
}
