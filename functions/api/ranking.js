export async function onRequestGet(context) {
  const { env } = context;

  if (!env.RANKING_KV) {
    return Response.json({ error: 'Falta el binding KV "RANKING_KV" en la configuración de Pages' }, { status: 500 });
  }

  try {
    const { keys } = await env.RANKING_KV.list();

    const registros = await Promise.all(
      keys.map((k) => env.RANKING_KV.get(k.name).then((v) => (v ? JSON.parse(v) : null)).catch(() => null))
    );

    const ranking = registros
      .filter(Boolean)
      .sort((a, b) => b.aciertos - a.aciertos || a.segundos - b.segundos)
      .slice(0, 50);

    return Response.json(
      { ranking, participantes: registros.filter(Boolean).length },
      { headers: { 'cache-control': 'no-store' } }
    );
  } catch (err) {
    console.error('ranking:', err);
    return Response.json({ error: 'No se pudo leer el ranking' }, { status: 500 });
  }
}
