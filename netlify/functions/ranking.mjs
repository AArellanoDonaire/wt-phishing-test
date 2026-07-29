import { getStore } from '@netlify/blobs';

const STORE = 'ranking-phishing';

export default async () => {
  try {
    const store = getStore(STORE);
    const { blobs } = await store.list();

    const registros = await Promise.all(
      blobs.map((b) => store.get(b.key, { type: 'json' }).catch(() => null))
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
};
