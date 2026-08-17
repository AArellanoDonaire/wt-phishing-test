/* Worker único: sirve los archivos estáticos de /public vía env.ASSETS
   y maneja las rutas /api/* a mano (KV como base de datos del ranking). */

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

async function autorizado(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const clave = await env.ADMIN_PASSWORD.get();
  if (!clave) return false;
  const enviada = request.headers.get('x-admin-key') || '';
  return enviada === clave;
}

function sinBinding() {
  return Response.json({ error: 'Falta el binding KV "RANKING_KV" en la configuración del Worker' }, { status: 500 });
}

/* ---- /api/score ---- */
async function handleScore(request, env) {
  if (!env.RANKING_KV) return sinBinding();

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

/* ---- /api/ranking ---- */
async function handleRanking(env) {
  if (!env.RANKING_KV) return sinBinding();

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

/* ---- /api/admin ---- */
async function listarAdmin(env) {
  const { keys } = await env.RANKING_KV.list();
  const registros = await Promise.all(
    keys.map(async (k) => {
      const raw = await env.RANKING_KV.get(k.name);
      const valor = raw ? JSON.parse(raw) : null;
      return valor ? { clave: k.name, ...valor } : null;
    })
  );
  return registros.filter(Boolean).sort((a, b) => b.aciertos - a.aciertos || a.segundos - b.segundos);
}

async function handleAdmin(request, env) {
  if (!(await autorizado(request, env))) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (!env.RANKING_KV) return sinBinding();

  if (request.method === 'GET') {
    try {
      const lista = await listarAdmin(env);
      return Response.json({ registros: lista });
    } catch (err) {
      console.error('admin GET:', err);
      return Response.json({ error: 'No se pudo leer el ranking' }, { status: 500 });
    }
  }

  if (request.method === 'DELETE') {
    let body;
    try { body = await request.json(); } catch { body = {}; }

    try {
      if (body.todo === true) {
        const { keys } = await env.RANKING_KV.list();
        await Promise.all(keys.map((k) => env.RANKING_KV.delete(k.name)));
        return Response.json({ eliminados: keys.length });
      }
      if (typeof body.clave === 'string' && body.clave) {
        await env.RANKING_KV.delete(body.clave);
        return Response.json({ eliminados: 1 });
      }
      return Response.json({ error: 'Falta indicar qué borrar' }, { status: 400 });
    } catch (err) {
      console.error('admin DELETE:', err);
      return Response.json({ error: 'No se pudo borrar' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Método no permitido' }, { status: 405 });
}

/* ---- /api/health ---- */
async function handleHealth(env) {
  const info = { funcion: 'ok', kv: null, error: null };

  if (!env.RANKING_KV) {
    info.kv = 'sin binding';
    info.error = 'Falta enlazar el KV namespace como "RANKING_KV" en el Worker';
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

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/score' && request.method === 'POST') return handleScore(request, env);
    if (pathname === '/api/ranking' && request.method === 'GET') return handleRanking(env);
    if (pathname === '/api/admin') return handleAdmin(request, env);
    if (pathname === '/api/health' && request.method === 'GET') return handleHealth(env);
    if (pathname.startsWith('/api/')) return Response.json({ error: 'Método no permitido' }, { status: 405 });

    return env.ASSETS.fetch(request);
  }
};
