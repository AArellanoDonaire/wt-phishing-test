/* Clave de administrador: se configura como variable de entorno en Cloudflare Pages
   (Settings → Environment variables → ADMIN_PASSWORD). Nunca se sube al repositorio.
   Si no está configurada, el endpoint queda cerrado por completo — evita que alguien
   lo use sin querer con una clave vacía. */
function autorizado(request, env) {
  const clave = env.ADMIN_PASSWORD;
  if (!clave) return false;
  const enviada = request.headers.get('x-admin-key') || '';
  return enviada === clave;
}

async function listar(env) {
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

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!autorizado(request, env)) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (!env.RANKING_KV) {
    return Response.json({ error: 'Falta el binding KV "RANKING_KV" en la configuración de Pages' }, { status: 500 });
  }

  try {
    const lista = await listar(env);
    return Response.json({ registros: lista });
  } catch (err) {
    console.error('admin GET:', err);
    return Response.json({ error: 'No se pudo leer el ranking' }, { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!autorizado(request, env)) return Response.json({ error: 'No autorizado' }, { status: 401 });
  if (!env.RANKING_KV) {
    return Response.json({ error: 'Falta el binding KV "RANKING_KV" en la configuración de Pages' }, { status: 500 });
  }

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
