import { getStore } from '@netlify/blobs';

const STORE = 'ranking-phishing';

/* Clave de administrador: se configura como variable de entorno en Netlify
   (Site settings → Environment variables → ADMIN_PASSWORD). Nunca se sube
   al repositorio. Si no está configurada, el endpoint queda cerrado por
   completo — evita que alguien lo use sin querer con una clave vacía. */
function autorizado(req) {
  const clave = process.env.ADMIN_PASSWORD;
  if (!clave) return false;
  const enviada = req.headers.get('x-admin-key') || '';
  return enviada === clave;
}

export default async (req) => {
  if (!autorizado(req)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const store = getStore(STORE);

  if (req.method === 'GET') {
    try {
      const { blobs } = await store.list();
      const registros = await Promise.all(
        blobs.map(async (b) => {
          const valor = await store.get(b.key, { type: 'json' }).catch(() => null);
          return valor ? { clave: b.key, ...valor } : null;
        })
      );
      const lista = registros.filter(Boolean).sort((a, b) => b.aciertos - a.aciertos || a.segundos - b.segundos);
      return Response.json({ registros: lista });
    } catch (err) {
      console.error('admin GET:', err);
      return Response.json({ error: 'No se pudo leer el ranking' }, { status: 500 });
    }
  }

  if (req.method === 'DELETE') {
    let body;
    try { body = await req.json(); } catch { body = {}; }

    try {
      if (body.todo === true) {
        const { blobs } = await store.list();
        await Promise.all(blobs.map((b) => store.delete(b.key)));
        return Response.json({ eliminados: blobs.length });
      }
      if (typeof body.clave === 'string' && body.clave) {
        await store.delete(body.clave);
        return Response.json({ eliminados: 1 });
      }
      return Response.json({ error: 'Falta indicar qué borrar' }, { status: 400 });
    } catch (err) {
      console.error('admin DELETE:', err);
      return Response.json({ error: 'No se pudo borrar' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Método no permitido' }, { status: 405 });
};
