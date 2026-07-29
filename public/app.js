/* =========================================================================
   ¿Phishing o Real? — Entrenamiento Wisetrack
   Para agregar escenarios, ve a la sección 2 (array `scenarios`).
   ========================================================================= */

/* =========================================================================
   0. ICONOS — SVG inline, heredan currentColor
   ========================================================================= */
const ICONS = {
  mail:     '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  sms:      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  whatsapp: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/>',
  phone:    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  qr:       '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM19 19h2v2h-2zM14 19h2M19 14h2"/>',
  check:    '<circle cx="12" cy="12" r="10"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  x:        '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  file:     '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  forward:  '<path d="m15 17 5-5-5-5"/><path d="M4 18v-2a4 4 0 0 1 4-4h12"/>',
  shield:   '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  warning:  '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  chevron:  '<path d="m9 18 6-6-6-6"/>',
  arrow:    '<path d="M5 12h14M12 5l7 7-7 7"/>',
  restart:  '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  trophy:   '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M6 2h12v7a6 6 0 0 1-12 0z"/><path d="M12 15v4M9 22h6"/>',
  clock:    '<circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/>',
  user:     '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  spinner:  '<path d="M12 2v4M12 18v4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M2 12h4M18 12h4M4.9 19.1l2.9-2.9M16.2 7.8l2.9-2.9"/>'
};

const ico = (n, cls = 'w-4 h-4') =>
  `<svg class="${cls} shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* Enlaces: [texto visible](destino real) → ancla que revela el destino al pasar el mouse */
function fmt(texto) {
  return esc(texto).replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, t, url) => `<a href="#" class="wt-link" data-url="${url}" onclick="clicEnlace(this);return false">${t}</a>`
  );
}

/* QR dibujado en SVG, sin imágenes externas */
function qrArt(size = 160) {
  const N = 21, c = size / N;
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const finder = (x, y) =>
    `<rect x="${x*c}" y="${y*c}" width="${7*c}" height="${7*c}" fill="#fff"/>` +
    `<rect x="${(x+1)*c}" y="${(y+1)*c}" width="${5*c}" height="${5*c}" fill="#0f172a"/>` +
    `<rect x="${(x+2)*c}" y="${(y+2)*c}" width="${3*c}" height="${3*c}" fill="#fff"/>`;
  let mods = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if ((x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9)) continue;
    if (rnd() > 0.48) mods += `<rect x="${x*c}" y="${y*c}" width="${c}" height="${c}" fill="#fff"/>`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="rounded-xl block" role="img" aria-label="Código QR">
    <rect width="${size}" height="${size}" fill="#0f172a"/>${mods}${finder(0,0)}${finder(N-7,0)}${finder(0,N-7)}</svg>`;
}

/* =========================================================================
   1. BARRA DE ESTADO — revela el destino real de un enlace
      Escritorio: hover o foco de teclado. Móvil: mantener presionado.
   ========================================================================= */
const statusbar = document.getElementById('statusbar');
const statusText = document.getElementById('statusbar-text');
let ocultarTimer = null;

function mostrarDestino(url) {
  clearTimeout(ocultarTimer);
  statusText.textContent = url;
  statusbar.classList.remove('opacity-0', 'translate-y-2');
}
function ocultarDestino(retardo = 0) {
  clearTimeout(ocultarTimer);
  ocultarTimer = setTimeout(
    () => statusbar.classList.add('opacity-0', 'translate-y-2'),
    retardo
  );
}

document.addEventListener('mouseover', (e) => {
  const a = e.target.closest('[data-url]');
  if (a) mostrarDestino(a.dataset.url);
});
document.addEventListener('mouseout', (e) => {
  if (e.target.closest('[data-url]')) ocultarDestino(120);
});
document.addEventListener('focusin', (e) => {
  const a = e.target.closest('[data-url]');
  if (a) mostrarDestino(a.dataset.url);
});
document.addEventListener('focusout', (e) => {
  if (e.target.closest('[data-url]')) ocultarDestino(120);
});
document.addEventListener('touchstart', (e) => {
  const a = e.target.closest('[data-url]');
  if (a) { mostrarDestino(a.dataset.url); ocultarDestino(3500); }
}, { passive: true });

/* =========================================================================
   1b. OVERLAY DE CLIC — qué pasa cuando alguien hace clic en vez de revisar
   ========================================================================= */
const MEME_POR_DEFECTO = { danger: '/assets/caiste.svg', safe: '/assets/enlace-seguro.svg' };

function clicEnlace(el) {
  const s = scenarios[idx];
  if (!s) return;

  const url = el.dataset.url || '';
  const esTrampa = s.tipo === 'danger';
  const img = s.meme || MEME_POR_DEFECTO[s.tipo];

  const overlay = document.getElementById('overlay');
  document.getElementById('overlay-caja').innerHTML = `
    <img src="${esc(img)}" alt="" class="w-full rounded-t-2xl bg-wt-ink" onerror="this.remove()">
    <div class="p-5 sm:p-6">
      <p class="text-[11px] font-bold uppercase tracking-wider ${esTrampa ? 'text-rose-600' : 'text-emerald-600'}">
        ${esTrampa ? 'Acabas de hacer clic' : 'Enlace legítimo'}
      </p>
      <p class="text-slate-600 leading-relaxed mt-2">
        ${esTrampa
          ? 'En un ataque real el daño ya estaría hecho: la página se abrió, el archivo se descargó o tus credenciales viajaron. El destino era:'
          : 'Este enlace era seguro, pero el hábito correcto es el mismo. El destino era:'}
      </p>
      <p class="mt-2 px-3 py-2 rounded-lg bg-wt-ink text-cyan-300 text-xs font-mono break-all">${esc(url)}</p>
      <p class="text-sm text-slate-500 leading-relaxed mt-4">
        Pasa el mouse por encima (o mantén presionado en el celular) y lee el destino abajo a la izquierda,
        <strong class="text-wt-ink">antes</strong> de hacer clic.
      </p>
      <button type="button" onclick="cerrarOverlay()"
              class="mt-5 w-full flex items-center justify-center gap-2 bg-wt-ink hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition active:scale-[.98]">
        Entendido ${ico('arrow', 'w-4 h-4')}
      </button>
    </div>`;

  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  document.body.style.overflow = 'hidden';

  // Hacer clic en un enlace malicioso cuenta como caer en el ataque.
  if (esTrampa && !bloqueado && PENALIZAR_CLIC) marcarComoClic();
}

function cerrarOverlay() {
  const overlay = document.getElementById('overlay');
  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !document.getElementById('overlay').classList.contains('hidden')) cerrarOverlay();
});

/* Si prefieres que hacer clic no penalice, cambia esto a false. */
const PENALIZAR_CLIC = true;

/* =========================================================================
   2. CONTENIDO
      Campos: id, canal, remitente, email, asunto, cuerpo, adjunto, tipo,
              explicacion, senales[]. Opcionales: avatar, verificado,
              enlaceTexto + enlaceReal, adjuntoNombre.
      En `cuerpo` puedes escribir [texto visible](url real) para incrustar
      un enlace que revele su destino al pasar el mouse.
      canal: 'email' | 'sms' | 'whatsapp' | 'llamada' | 'qr'
      tipo:  'safe' | 'danger'
   ========================================================================= */
const scenarios = [
  {
    id: 1, canal: 'email',
    remitente: 'Marcela Tapia — Transportes Andes',
    email: 'm.tapia@transportes-andes.co', avatar: 'MT',
    intro: 'Alguien está interesado en tus servicios y quiere agendar una reunión.',
    gancho: 'Incluso te manda la invitación al calendario para que la revises antes. Parece un gran negocio… ¿o no?',
    asunto: 'RE: Cotización flota 40 unidades — reunión de cierre',
    hora: '01:41 p. m.',
    cuerpo: '¿Podríamos agendar una reunión esta semana para discutir los detalles? Compartimos un breve resumen del proyecto en drive para que lo revises antes: [Haz clic aquí para poder revisarlo](http://drive-resumen.fintech-pay.com/doc).',
    invitacion: {
      mes: 'feb', dia: '26', diaSemana: 'jue',
      titulo: 'Reunión cotización servicios',
      cuando: 'jue 26 feb 2026 · 13:00 a 14:00',
      quien: 'Marcela Tapia',
      enlaceCalendario: 'http://calendar-invite.fintech-pay.com/ev/3f9a'
    },
    enlaceTexto: 'Unirse a la reunión de Microsoft Teams',
    enlaceReal: 'https://bit.ly/secure-team-review',
    respondeA: 'm.tapia.contacto@gmail.com',
    adjunto: false, tipo: 'danger',
    explicacion: 'Un correo de negocio creíble usado como envoltorio. Todo se ve normal hasta que revisas los destinos: el botón dice "Microsoft Teams" pero apunta a un acortador, la invitación de calendario no viene de Google, y la respuesta se desvía a un Gmail personal.',
    senales: [
      'El dominio del cliente es .co, no .cl — un carácter de diferencia',
      'El enlace de Teams apunta a un acortador bit.ly',
      'La invitación no viene de calendar.google.com',
      '"Responder a" desvía a un Gmail personal, no al dominio de la empresa'
    ]
  },
  {
    id: 2, canal: 'qr',
    remitente: 'Código QR físico', email: 'Restaurante — mesa 12',
    intro: 'Estás almorzando y el menú de la mesa trae un código QR.',
    gancho: 'Lo escaneas sin pensarlo, como cualquier otro día.',
    asunto: 'Menú digital y beneficios',
    cuerpo: 'Escaneas el QR pegado sobre el menú. En vez de abrir la carta, te lleva a [menu-beneficios.app/instalar](http://menu-beneficios.app/instalar.apk) y te pide instalar una app fuera de la tienda oficial.',
    adjunto: false, tipo: 'danger',
    explicacion: 'Quishing: el atacante pega su propio sticker encima del QR legítimo. El QR no se puede leer a simple vista, así que el único control es revisar la URL de destino antes de abrirla y desconfiar de cualquier instalación fuera de App Store o Play Store.',
    senales: [
      'El sticker está pegado sobre el material impreso original',
      'El destino termina en .apk: instalación directa fuera de la tienda',
      'El dominio no corresponde al restaurante'
    ]
  },
  {
    id: 3, canal: 'email',
    remitente: 'Google', email: 'no-reply@google.com', avatar: 'G', verificado: true,
    intro: 'Te avisan que tu almacenamiento está por llenarse.',
    gancho: 'Si se llena, dejas de recibir correos. Suena molesto, pero razonable.',
    asunto: 'Tu almacenamiento de Google está al 90%',
    cuerpo: 'Estás usando 13,9 GB de los 15 GB de tu cuenta. Cuando se llene, dejarás de recibir correos nuevos. Puedes liberar espacio desde la configuración de tu cuenta.',
    enlaceTexto: 'Administrar almacenamiento',
    enlaceReal: 'https://one.google.com/storage',
    adjunto: false, tipo: 'safe',
    explicacion: 'Legítimo. El dominio del remitente es exactamente google.com, el enlace apunta a un dominio propio de Google, no pide credenciales y no hay urgencia amenazante — solo información sobre tu cuenta.',
    senales: [
      'Dominio exacto: google.com, sin caracteres agregados',
      'El enlace apunta a one.google.com',
      'No pide contraseña, código ni datos personales'
    ]
  },
  {
    id: 4, canal: 'email',
    remitente: 'YouTube Support', email: 'youtube-support@gmail.com', avatar: 'YT',
    intro: 'Un correo dice que tu canal será suspendido en 24 horas.',
    gancho: 'Trae un formulario de apelación adjunto para que lo firmes y lo devuelvas.',
    asunto: 'Tu canal fue marcado por infracción de copyright',
    cuerpo: 'Tu cuenta será suspendida en 24 horas por una infracción de derechos de autor. Descarga el formulario de apelación y envíalo firmado para evitar la eliminación permanente de tu canal.',
    adjunto: true, adjuntoNombre: 'Apelacion_Copyright_YT.docm',
    tipo: 'danger',
    explicacion: 'Una empresa nunca envía notificaciones críticas desde una casilla @gmail.com — usa su propio dominio. Además, el adjunto .docm es un documento de Word con macros habilitadas, uno de los vectores de malware más comunes.',
    senales: [
      'Remitente @gmail.com haciéndose pasar por una marca',
      'Extensión .docm: documento con macros ejecutables',
      'Amenaza con plazo de 24 horas'
    ]
  },
  {
    id: 5, canal: 'email',
    remitente: 'Crunchyroll Security', email: 'security@crunchyroli.com', avatar: 'CR',
    intro: 'Alguien habría entrado a tu cuenta desde el otro lado del mundo.',
    gancho: 'El correo se ve igual a todos los que te ha mandado esta plataforma antes.',
    asunto: 'Detectamos un inicio de sesión desde Rusia',
    cuerpo: 'Alguien accedió a tu cuenta desde una ubicación no habitual. Si no fuiste tú, restablece tu contraseña de inmediato.',
    enlaceTexto: 'Restablecer mi contraseña',
    enlaceReal: 'https://crunchyroli.com/account/reset',
    adjunto: false, tipo: 'danger',
    explicacion: 'Typosquatting. El dominio es crunchyroli.com — falta una "l" respecto de crunchyroll.com. El diseño, el texto y hasta el logo pueden ser copias perfectas; el dominio es lo único que el atacante no puede falsificar.',
    senales: [
      'crunchyroli.com ≠ crunchyroll.com (falta una "l")',
      'Miedo + ubicación extranjera para forzar el clic',
      'Te lleva a un formulario de contraseña desde un correo'
    ]
  },
  {
    id: 6, canal: 'email',
    remitente: 'Jira · Wisetrack', email: 'jira@wisetrack.atlassian.net', avatar: 'J', verificado: true,
    intro: 'Te asignaron un ticket y llega la notificación de siempre.',
    gancho: 'Es el mismo correo que ves varias veces por semana.',
    asunto: '[SOP-2418] Se te asignó: Revisar respaldo semanal de SQL',
    cuerpo: 'Óscar Reyes te asignó esta incidencia con prioridad Media. Vencimiento: viernes. Puedes comentar respondiendo directamente a este correo.',
    enlaceTexto: 'Ver SOP-2418 en Jira',
    enlaceReal: 'https://wisetrack.atlassian.net/browse/SOP-2418',
    adjunto: false, tipo: 'safe',
    explicacion: 'Legítimo. Viene del subdominio real de Jira de la empresa, hace referencia a un ticket y una persona que existen, y el enlace apunta al mismo dominio del remitente. Además no pide autenticarse.',
    senales: [
      'Remitente y enlace comparten el dominio wisetrack.atlassian.net',
      'Referencias internas verificables: ticket, asignador, prioridad',
      'No solicita credenciales'
    ]
  },
  {
    id: 7, canal: 'llamada',
    remitente: 'Soporte TI Wisetrack', email: '+56 2 2938 4471',
    intro: 'Suena el teléfono y dicen ser de soporte TI.',
    gancho: 'Saben tu nombre, saben que usas VPN y suenan apurados.',
    asunto: 'Llamada entrante',
    cuerpo: 'Hola, te llamo de soporte TI. Estamos migrando la VPN esta tarde y tu cuenta quedó a medio sincronizar. Te va a llegar un código al celular en unos segundos — necesito que me lo dictes para terminar el proceso, si no vas a perder el acceso mañana.',
    adjunto: false, tipo: 'danger',
    explicacion: 'Vishing. El atacante ya tiene tu usuario y contraseña; lo único que le falta es el segundo factor, y la única forma de obtenerlo es que tú se lo dictes. Ningún equipo de soporte legítimo pide un código MFA ni una contraseña, por ningún canal.',
    senales: [
      'Pide dictar un código MFA por teléfono',
      'El código llega justo mientras hablan: el ataque está en curso',
      'Consecuencia amenazante para evitar que cortes y verifiques'
    ]
  },
  {
    id: 8, canal: 'sms',
    remitente: 'COPEC', email: '+56 9 6122 8830',
    intro: 'Un SMS te avisa que tus puntos vencen hoy a medianoche.',
    gancho: 'Son 12.400 puntos. Sería una lata perderlos por no alcanzar a canjearlos.',
    asunto: 'Puntos por vencer',
    cuerpo: '¡Tus 12.400 puntos Copec vencen HOY! Canjéalos antes de las 23:59 aquí: [bit.ly/copec-urgente](https://bit.ly/copec-urgente)',
    adjunto: false, tipo: 'danger',
    explicacion: 'Smishing. Una marca grande envía SMS desde un código corto registrado, no desde un celular común, y nunca usa acortadores. La combinación de premio + plazo vencido hoy está diseñada para que actúes antes de pensar.',
    senales: [
      'Llega desde un número de celular, no un shortcode de la marca',
      'Enlace acortado bit.ly',
      'Recompensa concreta + vencimiento inmediato'
    ]
  },
  {
    id: 9, canal: 'email',
    remitente: 'Portal Wisetrack', email: 'no-reply@wisetrack.cl', avatar: 'W', verificado: true,
    intro: 'Acabas de pedir cambiar tu contraseña y llega el código.',
    gancho: 'Lo esperabas hace unos segundos.',
    asunto: 'Tu código de verificación: 482910',
    cuerpo: 'Recibimos una solicitud para restablecer tu contraseña. Ingresa este código en la pantalla donde lo solicitaste. Si no fuiste tú, ignora este mensaje y avisa a Seguridad de la Información.',
    adjunto: false, tipo: 'safe',
    explicacion: 'Legítimo, y por una razón que importa más que el dominio: tú iniciaste el proceso hace segundos. Un código que llega sin que lo hayas pedido no es un mensaje inofensivo, es la señal de que alguien está intentando entrar con tu contraseña.',
    senales: [
      'Responde a una acción que tú iniciaste',
      'El código se ingresa en el sitio, no se responde ni se dicta',
      'No contiene enlaces ni adjuntos'
    ]
  },
  {
    id: 10, canal: 'email',
    remitente: 'Instagram', email: 'security@inst-agram.com', avatar: 'IG',
    intro: 'Instagram te avisa de un acceso que no reconoces.',
    gancho: 'El botón para proteger la cuenta está justo ahí.',
    asunto: 'Intento de inicio de sesión no reconocido',
    cuerpo: 'Detectamos un intento de acceso desde un dispositivo desconocido. Si no fuiste tú, protege tu cuenta ahora.',
    enlaceTexto: 'Proteger mi cuenta',
    enlaceReal: 'https://inst-agram.com/login',
    adjunto: false, tipo: 'danger',
    explicacion: 'El guion en "inst-agram" convierte el dominio en uno completamente distinto. Es la misma técnica de Crunchyroll con otra variante: separar la palabra en lugar de quitarle una letra. La página de destino suele ser un clon exacto del login.',
    senales: [
      'inst-agram.com no es instagram.com',
      'Alerta de seguridad que lleva a una pantalla de login',
      'Presión para actuar "ahora"'
    ]
  },
  {
    id: 11, canal: 'whatsapp',
    remitente: 'Cata (contacto guardado)', email: '+56 9 8874 2019', avatar: 'C',
    intro: 'Una amiga te manda algo que suena increíble.',
    gancho: 'Viene de un contacto que tienes guardado hace años.',
    asunto: 'Mensaje reenviado',
    cuerpo: 'oye mira esto 😳 WhatsApp sacó el "modo espía" para ver los chats de otros, actívalo acá antes que lo saquen: [wa-modoespia.net/activar](http://wa-modoespia.net/activar?ref=wsp)',
    adjunto: false, tipo: 'danger',
    explicacion: 'WhatsApp no tiene ni tendrá una función así — leer conversaciones ajenas es ilegal. El mensaje llega desde un contacto conocido porque su cuenta ya fue comprometida, lo que hace que bajes la guardia. Que venga de alguien que conoces no valida el enlace.',
    senales: [
      'Promete una función que sería ilegal',
      'Dominio no relacionado con whatsapp.com y sin HTTPS',
      'Viene de un contacto real: su cuenta ya cayó'
    ]
  },
  {
    id: 12, canal: 'email',
    remitente: 'Gerencia de Personas — Wisetrack', email: 'personas.wisetrack@outlook.com', avatar: 'GP',
    intro: 'Llega la planilla con los sueldos de toda la empresa.',
    gancho: 'Dice CONFIDENCIAL y pide que no la reenvíes a nadie.',
    asunto: 'CONFIDENCIAL — Reajuste salarial 2026 por colaborador',
    cuerpo: 'Adjuntamos la planilla con los reajustes aprobados. Es información reservada: revisa solo tu fila y no reenvíes este correo. Si el archivo pide habilitar contenido, acéptalo para ver los datos.',
    adjunto: true, adjuntoNombre: 'Reajuste_Salarial_2026_CONFIDENCIAL.xlsm',
    tipo: 'danger',
    explicacion: 'El anzuelo perfecto: información que todos quieren ver y que nadie va a comentar con un compañero, justamente porque dice "confidencial". Pero RRHH escribe desde el dominio corporativo, no desde Outlook, y "habilitar contenido" en un .xlsm significa ejecutar macros.',
    senales: [
      'Área interna escribiendo desde un correo público (@outlook.com)',
      '"Habilitar contenido" = ejecutar macros del atacante',
      'La confidencialidad impide que lo verifiques con otros'
    ]
  }
];

/* =========================================================================
   3. ESTADO
   ========================================================================= */
let idx = 0, score = 0, respuestas = [], bloqueado = false;
let nombreJugador = '', inicioMs = 0;

const stage       = document.getElementById('stage');
const scoreEl     = document.getElementById('score');
const marcador    = document.getElementById('marcador');
const barraProg   = document.getElementById('barra-progreso');
const progressBar = document.getElementById('progress-bar');
const progressLbl = document.getElementById('progress-label');
const channelLbl  = document.getElementById('channel-label');

const CANAL_META = {
  email:    { nombre: 'Correo electrónico', icono: 'mail' },
  sms:      { nombre: 'Mensaje SMS',        icono: 'sms' },
  whatsapp: { nombre: 'WhatsApp',           icono: 'whatsapp' },
  llamada:  { nombre: 'Llamada telefónica', icono: 'phone' },
  qr:       { nombre: 'Código QR',          icono: 'qr' }
};

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* =========================================================================
   4. PANTALLA DE REGISTRO
   ========================================================================= */
function pantallaRegistro() {
  marcador.classList.add('hidden');
  barraProg.classList.add('hidden');

  stage.innerHTML = `
    <div class="wt-in">
      <article class="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8">
        <h2 class="text-xl font-bold text-wt-ink">Antes de empezar</h2>
        <p class="text-slate-600 leading-relaxed mt-2">
          Vas a revisar 12 mensajes reales de tu día a día: correos, SMS, WhatsApp,
          una llamada y un código QR. En cada uno decides si es legítimo o un ataque.
        </p>

        <div class="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p class="text-sm font-bold text-wt-ink flex items-center gap-2">
            ${ico('link', 'w-4 h-4')} Pista que sirve dentro y fuera del juego
          </p>
          <p class="text-sm text-slate-600 leading-relaxed mt-1.5">
            Pasa el mouse sobre cualquier enlace (o mantenlo presionado en el celular):
            abajo a la izquierda vas a ver hacia dónde apunta <em>realmente</em>,
            igual que en tu navegador.
          </p>
        </div>

        <label for="nombre" class="block text-sm font-bold text-wt-ink mt-6 mb-2">
          Tu nombre para el ranking
        </label>
        <input id="nombre" type="text" maxlength="40" autocomplete="name"
               placeholder="Ej: Alfredo P."
               class="w-full border-2 border-slate-200 focus:border-wt-cyan rounded-xl px-4 py-3 text-lg outline-none transition">
        <p id="error-nombre" class="hidden text-sm text-rose-600 font-medium mt-2"></p>
        <p class="text-xs text-slate-400 mt-2">
          Si repites el juego, se conserva tu mejor intento.
        </p>

        <button type="button" onclick="empezar()"
                class="mt-5 w-full flex items-center justify-center gap-2 bg-wt-ink hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg transition active:scale-[.98]">
          Comenzar ${ico('arrow', 'w-5 h-5')}
        </button>

        <button type="button" onclick="verRanking()"
                class="mt-3 w-full flex items-center justify-center gap-2 text-slate-500 hover:text-wt-ink py-2 rounded-lg font-semibold text-sm transition">
          ${ico('trophy', 'w-4 h-4')} Ver ranking
        </button>
      </article>
    </div>`;

  const input = document.getElementById('nombre');
  input.value = sessionStorage.getItem('wt_nombre') || '';
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') empezar(); });
  input.focus();
}

function empezar() {
  const input = document.getElementById('nombre');
  const err = document.getElementById('error-nombre');
  const valor = input.value.trim().replace(/\s+/g, ' ');

  if (valor.length < 2) {
    err.textContent = 'Escribe tu nombre para poder guardar tu puntaje.';
    err.classList.remove('hidden');
    input.focus();
    return;
  }

  nombreJugador = valor;
  try { sessionStorage.setItem('wt_nombre', valor); } catch {}

  idx = 0; score = 0; respuestas = [];
  inicioMs = Date.now();
  scoreEl.textContent = '0';
  marcador.classList.remove('hidden');
  barraProg.classList.remove('hidden');
  render();
}

/* =========================================================================
   5. RENDERIZADORES POR CANAL
   ========================================================================= */
function avatarHTML(s, size = 44) {
  return `<div class="shrink-0 rounded-full bg-wt-ink flex items-center justify-center"
               style="width:${size}px;height:${size}px">
            <span class="text-cyan-300 font-bold" style="font-size:${Math.round(size * 0.36)}px">${esc(s.avatar || '?')}</span>
          </div>`;
}

function enlaceHTML(s) {
  if (!s.enlaceTexto) return '';
  return `
    <a href="#" onclick="clicEnlace(this);return false" data-url="${esc(s.enlaceReal)}"
       class="wt-cta mt-4 flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 transition">
      <span class="text-wt-blue">${ico('link', 'w-5 h-5')}</span>
      <span class="flex-1 min-w-0">
        <span class="block text-wt-blue font-semibold underline underline-offset-2 truncate">${esc(s.enlaceTexto)}</span>
        <span class="block text-[11px] text-slate-400 mt-0.5">Pasa el mouse o mantén presionado para ver el destino</span>
      </span>
    </a>`;
}

function invitacionHTML(s) {
  const v = s.invitacion;
  if (!v) return '';
  return `
    <div class="mt-4 border border-slate-200 rounded-xl overflow-hidden">
      <div class="flex gap-4 p-4">
        <div class="shrink-0 w-14 rounded-lg overflow-hidden border border-slate-200 text-center">
          <p class="bg-wt-blue text-white text-[10px] font-bold uppercase py-0.5">${esc(v.mes)}</p>
          <p class="text-2xl font-extrabold text-wt-ink leading-none pt-1">${esc(v.dia)}</p>
          <p class="text-[10px] text-slate-400 pb-1">${esc(v.diaSemana)}</p>
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-bold text-wt-ink leading-snug">${esc(v.titulo)}</p>
          <a href="#" onclick="clicEnlace(this);return false" data-url="${esc(v.enlaceCalendario || '')}"
             class="wt-link text-sm">Ver en Google Calendar</a>
          <dl class="mt-2 text-sm text-slate-500 space-y-0.5">
            <div class="flex gap-3"><dt class="w-14 shrink-0">Cuándo</dt><dd class="text-slate-700">${esc(v.cuando)}</dd></div>
            <div class="flex gap-3"><dt class="w-14 shrink-0">Quién</dt><dd class="text-slate-700">${esc(v.quien)}</dd></div>
          </dl>
        </div>
      </div>
      <div class="grid grid-cols-3 border-t border-slate-200 divide-x divide-slate-200 text-sm font-semibold text-slate-600">
        <button type="button" class="py-2.5 hover:bg-slate-50 transition">Sí</button>
        <button type="button" class="py-2.5 hover:bg-slate-50 transition">A lo mejor</button>
        <button type="button" class="py-2.5 hover:bg-slate-50 transition">No</button>
      </div>
    </div>`;
}

function adjuntoHTML(s) {
  if (!s.adjunto) return '';
  return `
    <div class="mt-4 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-white">
      <span class="text-slate-400">${ico('file', 'w-6 h-6')}</span>
      <div class="min-w-0">
        <p class="text-sm font-semibold text-slate-700 truncate">${esc(s.adjuntoNombre)}</p>
        <p class="text-[11px] text-slate-400">Archivo adjunto</p>
      </div>
      <span class="text-slate-300 ml-auto">${ico('download', 'w-5 h-5')}</span>
    </div>`;
}

const RENDER = {
  email: (s) => `
    <div class="p-5 sm:p-6">
      <div class="flex items-start gap-3 pb-4 border-b border-slate-100">
        ${avatarHTML(s)}
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="font-bold text-wt-ink truncate">${esc(s.remitente)}</p>
            ${s.verificado ? `<span class="text-wt-cyan" title="Remitente verificado">${ico('check', 'w-4 h-4')}</span>` : ''}
          </div>
          <p class="text-sm text-slate-500 font-mono break-all">&lt;${esc(s.email)}&gt;</p>
        </div>
        <p class="text-[11px] text-slate-400 shrink-0 tabular-nums">${esc(s.hora || '01:41 p. m.')}</p>
      </div>
      <h2 class="text-lg sm:text-xl font-bold text-wt-ink mt-4 leading-snug">${esc(s.asunto)}</h2>
      <p class="text-slate-600 leading-relaxed mt-3">${fmt(s.cuerpo)}</p>
      ${invitacionHTML(s)}
      ${enlaceHTML(s)}
      ${adjuntoHTML(s)}
      ${s.respondeA ? `<p class="mt-4 pt-3 border-t border-slate-100 text-sm text-slate-500">Responder a <span class="font-mono text-slate-700">${esc(s.respondeA)}</span></p>` : ''}
    </div>`,

  sms: (s) => `
    <div class="p-5 sm:p-6">
      <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
        <span class="text-slate-400">${ico('sms', 'w-7 h-7')}</span>
        <div>
          <p class="font-bold text-wt-ink">${esc(s.remitente)}</p>
          <p class="text-sm text-slate-500 font-mono">${esc(s.email)}</p>
        </div>
      </div>
      <div class="mt-5">
        <div class="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[92%]">
          <p class="text-slate-700 leading-relaxed break-words">${fmt(s.cuerpo)}</p>
        </div>
        <p class="text-[11px] text-slate-400 mt-1.5 ml-1">Hoy · 14:37</p>
      </div>
    </div>`,

  whatsapp: (s) => `
    <div>
      <div class="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-100">
        ${avatarHTML(s, 38)}
        <div>
          <p class="font-bold text-wt-ink">${esc(s.remitente)}</p>
          <p class="text-sm text-slate-500 font-mono">${esc(s.email)}</p>
        </div>
      </div>
      <div class="wt-chat px-5 py-6">
        <div class="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[92%] shadow-sm">
          <p class="text-[11px] text-slate-400 italic mb-1 flex items-center gap-1.5">
            ${ico('forward', 'w-3 h-3')} Reenviado muchas veces
          </p>
          <p class="text-slate-700 leading-relaxed break-words">${fmt(s.cuerpo)}</p>
          <p class="text-[10px] text-slate-400 text-right mt-1">14:37</p>
        </div>
      </div>
    </div>`,

  llamada: (s) => `
    <div class="bg-wt-ink text-white p-6 sm:p-8 text-center">
      <p class="text-[11px] font-semibold tracking-[0.2em] text-cyan-400 uppercase">${esc(s.asunto)}</p>
      <div class="my-5 flex justify-center">
        <div class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-cyan-300">
          ${ico('phone', 'w-9 h-9')}
        </div>
      </div>
      <p class="text-xl font-bold">${esc(s.remitente)}</p>
      <p class="text-slate-400 font-mono text-sm">${esc(s.email)}</p>
      <div class="mt-6 bg-white/5 rounded-2xl p-5 text-left">
        <p class="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">Transcripción</p>
        <p class="text-slate-200 leading-relaxed italic">"${esc(s.cuerpo)}"</p>
      </div>
    </div>`,

  qr: (s) => `
    <div class="p-5 sm:p-6">
      <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
        <span class="text-slate-400">${ico('qr', 'w-7 h-7')}</span>
        <div>
          <p class="font-bold text-wt-ink">${esc(s.remitente)}</p>
          <p class="text-sm text-slate-500">${esc(s.email)}</p>
        </div>
      </div>
      <div class="mt-5 flex flex-col sm:flex-row items-center gap-5">
        <div class="relative shrink-0">
          ${qrArt(160)}
          <span class="absolute -bottom-2 -right-2 bg-amber-400 text-wt-ink text-[10px] font-bold px-2 py-1 rounded-md rotate-6 shadow">STICKER</span>
        </div>
        <div>
          <h2 class="text-lg font-bold text-wt-ink leading-snug">${esc(s.asunto)}</h2>
          <p class="text-slate-600 leading-relaxed mt-2">${fmt(s.cuerpo)}</p>
        </div>
      </div>
    </div>`
};

/* =========================================================================
   6. FLUJO DEL JUEGO
   ========================================================================= */
function render() {
  bloqueado = false;
  cayoPorClic = false;
  const s = scenarios[idx];
  const meta = CANAL_META[s.canal];

  progressLbl.textContent = `Escenario ${idx + 1} de ${scenarios.length}`;
  channelLbl.innerHTML = `${ico(meta.icono, 'w-3.5 h-3.5')}${meta.nombre}`;
  progressBar.style.width = `${(idx / scenarios.length) * 100}%`;

  const intro = s.intro
    ? `<div class="mb-4 px-1">
         <p class="text-base sm:text-lg font-bold text-wt-ink leading-snug">${esc(s.intro)}</p>
         ${s.gancho ? `<p class="text-slate-500 leading-relaxed mt-1.5">${esc(s.gancho)}</p>` : ''}
       </div>`
    : '';

  stage.innerHTML = `
    <div class="wt-in">
      ${intro}
      <article id="card" class="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden border-2 border-transparent transition-all duration-300">
        ${RENDER[s.canal](s)}
      </article>

      <div id="acciones" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <button type="button" onclick="responder('safe')"
                class="flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 border-2 border-emerald-600 text-emerald-700 font-bold py-4 rounded-2xl text-lg transition active:scale-[.98]">
          ${ico('shield', 'w-5 h-5')} Es legítimo
        </button>
        <button type="button" onclick="responder('danger')"
                class="flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border-2 border-rose-600 text-rose-700 font-bold py-4 rounded-2xl text-lg transition active:scale-[.98]">
          ${ico('warning', 'w-5 h-5')} Es un ataque
        </button>
      </div>

      <div id="feedback" class="hidden mt-4"></div>
    </div>`;
}

let cayoPorClic = false;

function marcarComoClic() {
  cayoPorClic = true;
  responder(scenarios[idx].tipo === 'danger' ? 'safe' : 'danger');
}

function responder(eleccion) {
  if (bloqueado) return;
  bloqueado = true;

  const s = scenarios[idx];
  const acerto = eleccion === s.tipo;
  respuestas.push({ id: s.id, acerto, titulo: s.asunto, canal: s.canal, tipo: s.tipo });
  if (acerto) { score++; scoreEl.textContent = score; }

  const card = document.getElementById('card');
  card.classList.remove('border-transparent');
  card.classList.add(acerto ? 'border-emerald-500' : 'border-rose-500', 'wt-pop');
  document.getElementById('acciones').classList.add('opacity-40', 'pointer-events-none');

  const tono = acerto
    ? { bg: 'bg-emerald-50', bd: 'border-emerald-200', tx: 'text-emerald-900', ic: 'check', icc: 'text-emerald-600', tit: '¡Correcto!' }
    : { bg: 'bg-rose-50',    bd: 'border-rose-200',    tx: 'text-rose-900',    ic: 'x',     icc: 'text-rose-600',    tit: cayoPorClic ? 'Hiciste clic' : 'Te habrían pillado' };

  const veredicto = s.tipo === 'danger'
    ? '<span class="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md">Ataque</span>'
    : '<span class="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">Legítimo</span>';

  const senales = (s.senales || []).map((x) =>
    `<li class="flex gap-2"><span class="opacity-50 mt-1">${ico('chevron', 'w-3 h-3')}</span><span>${esc(x)}</span></li>`
  ).join('');

  const fb = document.getElementById('feedback');
  fb.className = `wt-in mt-4 rounded-2xl border ${tono.bg} ${tono.bd} ${tono.tx} p-5 sm:p-6`;
  fb.innerHTML = `
    ${!acerto ? `<img src="/assets/meme-error.png" alt="" class="w-full rounded-t-2xl -m-5 mb-4 sm:-m-6 sm:mb-4" style="width:calc(100% + 2.5rem)">` : ''}
    <div class="flex items-center gap-3 flex-wrap">
    <div class="flex items-center gap-3 flex-wrap">
      <span class="${tono.icc}">${ico(tono.ic, 'w-7 h-7')}</span>
      <p class="text-xl font-extrabold">${tono.tit}</p>
      ${veredicto}
    </div>
    <p class="mt-3 leading-relaxed">${esc(s.explicacion)}</p>
    ${senales ? `
      <div class="mt-4 pt-4 border-t border-black/10">
        <p class="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-2">Señales a reconocer</p>
        <ul class="space-y-1.5 text-sm">${senales}</ul>
      </div>` : ''}
    <button type="button" onclick="siguiente()"
            class="mt-5 w-full flex items-center justify-center gap-2 bg-wt-ink hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition active:scale-[.98]">
      ${idx + 1 < scenarios.length ? 'Siguiente escenario' : 'Ver mi resultado'} ${ico('arrow', 'w-4 h-4')}
    </button>`;

  fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function siguiente() {
  idx++;
  if (idx < scenarios.length) render();
  else final();
}

/* =========================================================================
   7. RESULTADO + RANKING
   ========================================================================= */
async function final() {
  const total = scenarios.length;
  const segundos = Math.round((Date.now() - inicioMs) / 1000);
  const pct = Math.round((score / total) * 100);

  progressBar.style.width = '100%';
  progressLbl.textContent = 'Entrenamiento completado';
  channelLbl.textContent = '';

  let banda, mensaje;
  if (pct === 100)    { banda = 'Impecable';        mensaje = 'Detectaste todos los intentos. Este es el estándar que necesitamos en toda la organización.'; }
  else if (pct >= 80) { banda = 'Buen criterio';    mensaje = 'Reconoces la mayoría de las señales. Revisa los casos fallados: suelen ser los que más se parecen a un mensaje real.'; }
  else if (pct >= 50) { banda = 'Atención parcial'; mensaje = 'Detectas los ataques evidentes, pero los bien construidos todavía pasan. El dominio del remitente y el destino real del enlace son los dos controles que más rinden.'; }
  else                { banda = 'Zona de riesgo';   mensaje = 'Varios de estos habrían funcionado. Antes de hacer clic: revisa el dominio completo del remitente y verifica por otro canal cualquier mensaje que meta urgencia.'; }

  const filas = respuestas.map((r, i) => `
    <li class="flex items-start gap-3 py-3 ${i ? 'border-t border-slate-100' : ''}">
      <span class="${r.acerto ? 'text-emerald-500' : 'text-rose-500'} mt-0.5">${ico(r.acerto ? 'check' : 'x', 'w-5 h-5')}</span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-slate-700 leading-snug">${esc(r.titulo)}</p>
        <p class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
          ${ico(CANAL_META[r.canal].icono, 'w-3 h-3')} ${CANAL_META[r.canal].nombre} · ${r.tipo === 'danger' ? 'Era un ataque' : 'Era legítimo'}
        </p>
      </div>
    </li>`).join('');

  stage.innerHTML = `
    <div class="wt-in">
      <article class="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
        <div class="bg-wt-ink text-white p-7 sm:p-9 text-center">
          <p class="text-[11px] font-semibold tracking-[0.2em] text-cyan-400 uppercase">Resultado de ${esc(nombreJugador)}</p>
          <p class="text-6xl font-extrabold mt-2 tabular-nums">${score}<span class="text-3xl text-slate-500">/${total}</span></p>
          <p class="text-xl font-bold text-cyan-300 mt-1">${banda}</p>
          <p class="text-slate-400 text-xs mt-2 flex items-center justify-center gap-1.5">${ico('clock', 'w-3.5 h-3.5')} ${mmss(segundos)}</p>
          <p class="text-slate-300 text-sm leading-relaxed mt-4 max-w-md mx-auto">${mensaje}</p>
        </div>
        <div class="p-5 sm:p-6">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Detalle por escenario</p>
          <ul>${filas}</ul>
        </div>
      </article>

      <div id="panel-ranking" class="mt-4"></div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <button type="button" onclick="pantallaRegistro()"
                class="flex items-center justify-center gap-2 bg-wt-blue hover:bg-sky-700 text-white font-bold py-4 rounded-2xl transition active:scale-[.98]">
          ${ico('restart', 'w-5 h-5')} Jugar de nuevo
        </button>
        <div class="bg-white border border-slate-200 rounded-2xl py-4 px-5 text-center sm:text-left">
          <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">¿Dudas de un mensaje?</p>
          <p class="text-sm font-semibold text-wt-ink mt-0.5">Repórtalo a Seguridad de la Información antes de hacer clic.</p>
        </div>
      </div>
    </div>`;

  window.scrollTo({ top: 0, behavior: 'smooth' });
  await guardarYMostrarRanking({ nombre: nombreJugador, aciertos: score, total, segundos });
}

function skeletonRanking(texto) {
  return `<div class="bg-white rounded-2xl shadow-lg p-5 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
            <span class="wt-spin">${ico('spinner', 'w-4 h-4')}</span> ${esc(texto)}
          </div>`;
}

async function guardarYMostrarRanking(datos) {
  const panel = document.getElementById('panel-ranking');
  if (!panel) return;
  panel.innerHTML = skeletonRanking('Guardando tu puntaje…');

  try {
    const res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!res.ok) {
      const cuerpo = await res.text();
      let detalle;
      try { detalle = JSON.parse(cuerpo).error; } catch { detalle = null; }
      if (!detalle) {
        detalle = res.status === 404
          ? 'La función /api/score no está publicada. Revisa el enrutamiento en netlify.toml.'
          : `El servidor respondió ${res.status}. Revisa /api/health y los logs de la función.`;
      }
      throw new Error(detalle);
    }
    await pintarRanking(panel, datos.nombre);
  } catch (err) {
    panel.innerHTML = `
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
        <p class="font-bold">Tu puntaje no se pudo guardar</p>
        <p class="mt-1 leading-relaxed">Tu resultado sigue siendo válido, pero no quedó en el ranking. ${esc(err.message)}</p>
      </div>`;
  }
}

async function pintarRanking(panel, resaltar = '') {
  panel.innerHTML = skeletonRanking('Cargando ranking…');
  try {
    const res = await fetch('/api/ranking');
    if (!res.ok) throw new Error('No disponible');
    const { ranking, participantes } = await res.json();

    if (!ranking.length) {
      panel.innerHTML = `<div class="bg-white rounded-2xl shadow-lg p-5 text-center text-sm text-slate-500">Todavía no hay participantes.</div>`;
      return;
    }

    const miPos = ranking.findIndex((r) => r.nombre === resaltar);
    const top = ranking.slice(0, 10);
    const yoFuera = miPos >= 10;

    const fila = (r, pos) => {
      const yo = r.nombre === resaltar;
      const medalla = ['bg-amber-400 text-wt-ink', 'bg-slate-300 text-wt-ink', 'bg-amber-700 text-white'][pos] || 'bg-slate-100 text-slate-500';
      return `
        <li class="flex items-center gap-3 py-2.5 px-3 rounded-xl ${yo ? 'bg-cyan-50 ring-1 ring-wt-cyan' : ''}">
          <span class="w-7 h-7 rounded-lg ${medalla} text-xs font-extrabold flex items-center justify-center shrink-0">${pos + 1}</span>
          <span class="flex-1 min-w-0 font-semibold text-slate-700 truncate">${esc(r.nombre)}${yo ? ' <span class="text-wt-cyan text-xs font-bold">(tú)</span>' : ''}</span>
          <span class="text-xs text-slate-400 tabular-nums flex items-center gap-1">${ico('clock', 'w-3 h-3')}${mmss(r.segundos)}</span>
          <span class="font-extrabold text-wt-ink tabular-nums w-12 text-right">${r.aciertos}/${r.total}</span>
        </li>`;
    };

    panel.innerHTML = `
      <article class="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
        <div class="flex items-center justify-between px-5 pt-5">
          <h3 class="font-extrabold text-wt-ink flex items-center gap-2">${ico('trophy', 'w-5 h-5')} Ranking</h3>
          <span class="text-[11px] font-semibold text-slate-400">${participantes} participante${participantes === 1 ? '' : 's'}</span>
        </div>
        <ul class="p-3 sm:p-4">${top.map(fila).join('')}</ul>
        ${yoFuera ? `<div class="px-3 pb-4"><p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">Tu posición</p><ul>${fila(ranking[miPos], miPos)}</ul></div>` : ''}
        <p class="px-5 pb-4 text-[11px] text-slate-400">Desempate por tiempo. Se guarda solo tu mejor intento.</p>
      </article>`;
  } catch {
    panel.innerHTML = `
      <div class="bg-slate-100 rounded-2xl p-5 text-sm text-slate-500 text-center">
        Ranking no disponible (¿estás abriendo el archivo localmente?).
      </div>`;
  }
}

async function verRanking() {
  marcador.classList.add('hidden');
  barraProg.classList.add('hidden');
  stage.innerHTML = `<div class="wt-in"><div id="panel-ranking"></div>
    <button type="button" onclick="pantallaRegistro()"
            class="mt-4 w-full flex items-center justify-center gap-2 bg-wt-ink hover:bg-slate-800 text-white py-4 rounded-2xl font-bold transition active:scale-[.98]">
      ${ico('user', 'w-5 h-5')} Volver e ingresar mi nombre
    </button></div>`;
  await pintarRanking(document.getElementById('panel-ranking'), sessionStorage.getItem('wt_nombre') || '');
}

pantallaRegistro();
