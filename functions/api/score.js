/* Una clave por persona: cada participante solo escribe su propio registro,
   así no hay condiciones de carrera aunque todos terminen al mismo tiempo. */
const DIACRITICOS = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g');

function slug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
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

  if (!env.RANKING_KV) {
    return Response.json({ error: 'Falta el binding KV "RANKING_KV" en la configuración de Pages' }, { status: 500 });
  }

  try {
    const previoRaw = await env.RANKING_KV.get(clave);
    const previo = previoRaw ? JSON.parse(previoRaw) : null;

    const registro = { nombre, aciertos, total, segundos, fecha: new Date().toISOString() };

    // Se conserva el mejor intento: más aciertos, y a igualdad, menos tiempo.
    const esMejor =
      !previo ||
      aciertos > previo.aciertos ||
      (aciertos === previo.aciertos && segundos < previo.segundos);

    if (esMejor) await env.RANKING_KV.put(clave, JSON.stringify(registro));

    return Response.json({
      guardado: esMejor,
      registro: esMejor ? registro : previo,
      mensaje: esMejor ? 'Puntaje guardado' : 'Ya tenías un mejor intento registrado'
    });
  } catch (err) {
    console.error('score:', err);
    return Response.json({ error: 'No se pudo guardar el puntaje' }, { status: 500 });
  }
}
