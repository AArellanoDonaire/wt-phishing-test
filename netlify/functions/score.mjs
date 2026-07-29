import { getStore } from '@netlify/blobs';

const STORE = 'ranking-phishing';

/* Una clave por persona: cada participante solo escribe su propio registro,
   así no hay condiciones de carrera aunque todos terminen al mismo tiempo. */
function slug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export default async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Método no permitido' }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  const nombre = String(body.nombre ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const aciertos = Number(body.aciertos);
  const total = Number(body.total);
  const segundos = Math.round(Number(body.segundos));

  if (nombre.length < 2) {
    return Response.json({ error: 'Escribe tu nombre (mínimo 2 caracteres)' }, { status: 400 });
  }
  if (!Number.isInteger(total) || total < 1 || total > 100) {
    return Response.json({ error: 'Total de escenarios inválido' }, { status: 400 });
  }
  if (!Number.isInteger(aciertos) || aciertos < 0 || aciertos > total) {
    return Response.json({ error: 'Puntaje inválido' }, { status: 400 });
  }
  if (!Number.isFinite(segundos) || segundos < 0 || segundos > 86400) {
    return Response.json({ error: 'Duración inválida' }, { status: 400 });
  }

  const clave = slug(nombre);
  if (!clave) {
    return Response.json({ error: 'El nombre debe tener al menos una letra o número' }, { status: 400 });
  }

  try {
    const store = getStore(STORE);
    const previo = await store.get(clave, { type: 'json' }).catch(() => null);

    const registro = { nombre, aciertos, total, segundos, fecha: new Date().toISOString() };

    // Se conserva el mejor intento: más aciertos, y a igualdad, menos tiempo.
    const esMejor =
      !previo ||
      aciertos > previo.aciertos ||
      (aciertos === previo.aciertos && segundos < previo.segundos);

    if (esMejor) await store.setJSON(clave, registro);

    return Response.json({
      guardado: esMejor,
      registro: esMejor ? registro : previo,
      mensaje: esMejor ? 'Puntaje guardado' : 'Ya tenías un mejor intento registrado'
    });
  } catch (err) {
    console.error('score:', err);
    return Response.json({ error: 'No se pudo guardar el puntaje' }, { status: 500 });
  }
};
