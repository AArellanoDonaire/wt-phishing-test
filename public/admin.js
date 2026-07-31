const stage = document.getElementById('stage');
const CLAVE_SESSION = 'wt_admin_key';

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const fecha = (iso) => new Date(iso).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });

async function llamar(method, body) {
  const key = sessionStorage.getItem(CLAVE_SESSION) || '';
  const res = await fetch('/api/admin', {
    method,
    headers: { 'content-type': 'application/json', 'x-admin-key': key },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401) {
    sessionStorage.removeItem(CLAVE_SESSION);
    pantallaClave('La clave no es correcta o expiró. Ingrésala de nuevo.');
    throw new Error('No autorizado');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

/* ---------------------------------------------------------------------- */
function pantallaClave(mensajeError = '') {
  stage.innerHTML = `
    <article class="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 max-w-sm mx-auto">
      <h2 class="text-lg font-bold text-wt-ink">Acceso restringido</h2>
      <p class="text-sm text-slate-500 mt-1">Ingresa la clave de administración.</p>
      ${mensajeError ? `<p class="text-sm text-rose-600 font-medium mt-3">${esc(mensajeError)}</p>` : ''}
      <input id="clave" type="password" autocomplete="off"
             class="w-full border-2 border-slate-200 focus:border-wt-cyan rounded-xl px-4 py-3 mt-4 outline-none transition"
             placeholder="Clave">
      <button id="btn-entrar" type="button"
              class="mt-4 w-full bg-wt-ink hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition active:scale-[.98]">
        Entrar
      </button>
    </article>`;

  const input = document.getElementById('clave');
  const entrar = () => {
    const v = input.value.trim();
    if (!v) return;
    sessionStorage.setItem(CLAVE_SESSION, v);
    cargarPanel();
  };
  document.getElementById('btn-entrar').addEventListener('click', entrar);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') entrar(); });
  input.focus();
}

/* ---------------------------------------------------------------------- */
function aCSV(registros) {
  const encabezado = ['nombre', 'aciertos', 'total', 'segundos', 'fecha'];
  const filas = registros.map((r) =>
    [r.nombre, r.aciertos, r.total, r.segundos, r.fecha]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [encabezado.join(','), ...filas].join('\n');
}

function descargar(nombreArchivo, contenido, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------------------------------------------------------------- */
async function cargarPanel() {
  stage.innerHTML = `<p class="text-center text-sm text-slate-400 py-10">Cargando ranking…</p>`;
  try {
    const { registros } = await llamar('GET');
    pintarPanel(registros);
  } catch (err) {
    if (err.message !== 'No autorizado') {
      stage.innerHTML = `<p class="text-center text-sm text-rose-600 py-10">${esc(err.message)}</p>`;
    }
  }
}

function pintarPanel(registros) {
  const total = registros.length;
  const promedio = total ? (registros.reduce((s, r) => s + r.aciertos / r.total, 0) / total * 100).toFixed(0) : 0;

  const filas = registros.map((r, i) => `
    <tr class="${i % 2 ? 'bg-slate-50' : ''}">
      <td class="px-3 py-2.5 font-semibold text-slate-700">${esc(r.nombre)}</td>
      <td class="px-3 py-2.5 text-center tabular-nums">${r.aciertos}/${r.total}</td>
      <td class="px-3 py-2.5 text-center tabular-nums text-slate-500">${mmss(r.segundos)}</td>
      <td class="px-3 py-2.5 text-slate-400 text-xs">${fecha(r.fecha)}</td>
      <td class="px-3 py-2.5 text-right">
        <button data-clave="${esc(r.clave)}" data-nombre="${esc(r.nombre)}"
                class="btn-borrar-uno text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition">
          Borrar
        </button>
      </td>
    </tr>`).join('');

  stage.innerHTML = `
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="bg-white rounded-2xl shadow-lg p-4 text-center">
        <p class="text-2xl font-extrabold text-wt-ink tabular-nums">${total}</p>
        <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">Participantes</p>
      </div>
      <div class="bg-white rounded-2xl shadow-lg p-4 text-center">
        <p class="text-2xl font-extrabold text-wt-ink tabular-nums">${promedio}%</p>
        <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">Promedio</p>
      </div>
      <div class="bg-white rounded-2xl shadow-lg p-4 text-center">
        <p class="text-2xl font-extrabold text-wt-ink tabular-nums">${total ? registros[0].aciertos : '—'}</p>
        <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">Mejor puntaje</p>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      <button id="btn-refrescar" class="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition">
        Refrescar
      </button>
      <button id="btn-csv" class="bg-wt-blue hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition" ${total ? '' : 'disabled'}>
        Exportar CSV
      </button>
      <button id="btn-borrar-todo" class="ml-auto bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-sm font-semibold px-4 py-2 rounded-xl transition" ${total ? '' : 'disabled'}>
        Limpiar ranking completo
      </button>
    </div>

    <article class="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
      ${total ? `
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 border-b border-slate-100">
                <th class="px-3 py-2.5">Nombre</th>
                <th class="px-3 py-2.5 text-center">Puntaje</th>
                <th class="px-3 py-2.5 text-center">Tiempo</th>
                <th class="px-3 py-2.5">Fecha</th>
                <th class="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">${filas}</tbody>
          </table>
        </div>` : `
        <p class="text-center text-sm text-slate-400 py-10">Todavía no hay participantes.</p>`}
    </article>`;

  document.getElementById('btn-refrescar').addEventListener('click', cargarPanel);

  document.getElementById('btn-csv').addEventListener('click', () => {
    descargar(`ranking-phishing-${new Date().toISOString().slice(0, 10)}.csv`, aCSV(registros), 'text/csv;charset=utf-8');
  });

  document.getElementById('btn-borrar-todo').addEventListener('click', async () => {
    if (!confirm(`¿Borrar los ${total} registros del ranking? Esta acción no se puede deshacer.`)) return;
    try {
      await llamar('DELETE', { todo: true });
      cargarPanel();
    } catch (err) {
      if (err.message !== 'No autorizado') alert(err.message);
    }
  });

  stage.querySelectorAll('.btn-borrar-uno').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm(`¿Borrar el registro de "${btn.dataset.nombre}"?`)) return;
      try {
        await llamar('DELETE', { clave: btn.dataset.clave });
        cargarPanel();
      } catch (err) {
        if (err.message !== 'No autorizado') alert(err.message);
      }
    });
  });
}

/* ---------------------------------------------------------------------- */
if (sessionStorage.getItem(CLAVE_SESSION)) cargarPanel();
else pantallaClave();
