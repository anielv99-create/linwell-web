// Linwell · placa QR de mascotas y objetos (getlinwell.com/f/<token>) — sin dependencias.
// Todo el texto se pone con textContent (nunca HTML con datos que vienen de fuera).
(function () {
  'use strict';

  var API = 'https://nkpkxfywmvyxzwuakbpw.supabase.co/functions/v1/thing-public';
  var TOKEN_RE = /^[A-Za-z0-9_-]{32}$/;
  var MAX_MESSAGE = 500;
  var MAX_CONTACT = 100;

  var es = (navigator.language || 'es').toLowerCase().indexOf('es') === 0;
  document.documentElement.lang = es ? 'es' : 'en';

  var T = es
    ? {
        notFoundTitle: 'Página no encontrada',
        notFoundBody: 'Esta dirección no existe.',
        tagNotFound: 'Esta placa no existe o ya no está activa.',
        home: 'Ir a getlinwell.com',
        lost: 'Estoy perdido',
        lostItem: 'Me perdí',
        found: '¿Me encontraste?',
        intro: 'Avisa a mi familia. No necesitas instalar nada ni crear una cuenta.',
        message: 'Mensaje',
        messagePh: 'Ej.: Está conmigo en el parque de la calle 8. Estoy aquí hasta las 6.',
        contact: 'Tu teléfono o correo (opcional)',
        contactPh: 'Para que la familia pueda contactarte',
        shareLoc: 'Compartir mi ubicación (opcional)',
        locAsking: 'Pidiendo tu ubicación…',
        locOk: 'Ubicación lista ✓',
        locDenied: 'No se pudo obtener la ubicación. Puedes enviar el aviso sin ella.',
        notice: function (pet) {
          return 'Tu mensaje y tu ubicación (si la compartes) se envían solo a la familia de ' + (pet ? 'esta mascota' : 'este objeto') + '.';
        },
        privacy: 'Política de privacidad',
        privacyHref: '/es/privacy.html',
        send: 'Avisar al dueño',
        sending: 'Enviando…',
        need: 'Escribe un mensaje o comparte tu ubicación.',
        tooLong: 'El texto es demasiado largo.',
        rate: 'Ya se enviaron varios avisos desde aquí. Inténtalo de nuevo más tarde.',
        error: 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.',
        thanksTitle: '¡Gracias!',
        thanksBody: 'La familia recibió tu aviso.',
        loadError: 'No se pudo cargar la placa. Revisa tu conexión.',
      }
    : {
        notFoundTitle: 'Page not found',
        notFoundBody: "This address doesn't exist.",
        tagNotFound: "This tag doesn't exist or is no longer active.",
        home: 'Go to getlinwell.com',
        lost: "I'm lost",
        lostItem: "I'm lost",
        found: 'Did you find me?',
        intro: "Let my family know. You don't need to install anything or create an account.",
        message: 'Message',
        messagePh: "E.g. It's with me at the park on 8th Street. I'm here until 6.",
        contact: 'Your phone or email (optional)',
        contactPh: 'So the family can reach you',
        shareLoc: 'Share my location (optional)',
        locAsking: 'Getting your location…',
        locOk: 'Location ready ✓',
        locDenied: "Couldn't get your location. You can send the message without it.",
        notice: function (pet) {
          return 'Your message and your location (if you share it) are sent only to the family of this ' + (pet ? 'pet' : 'item') + '.';
        },
        privacy: 'Privacy Policy',
        privacyHref: '/privacy.html',
        send: 'Notify the owner',
        sending: 'Sending…',
        need: 'Write a message or share your location.',
        tooLong: 'The text is too long.',
        rate: 'Several messages were already sent from here. Please try again later.',
        error: "Couldn't send. Check your connection and try again.",
        thanksTitle: 'Thank you!',
        thanksBody: 'The family received your message.',
        loadError: "Couldn't load the tag. Check your connection.",
      };

  var app = document.getElementById('app');
  var privacyFoot = document.getElementById('privacy-foot');
  if (privacyFoot) {
    privacyFoot.textContent = T.privacy;
    privacyFoot.setAttribute('href', T.privacyHref);
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function clear() {
    while (app.firstChild) app.removeChild(app.firstChild);
  }
  function message(title, body) {
    clear();
    var box = el('section', 'find-card find-center');
    box.appendChild(el('h1', 'find-title', title));
    if (body) box.appendChild(el('p', 'find-muted', body));
    var a = el('a', 'find-link', T.home);
    a.href = '/';
    box.appendChild(a);
    app.appendChild(box);
  }

  // ----- ¿Qué dirección es? -----
  var m = location.pathname.match(/^\/f\/([^/?#]+)\/?$/);
  if (!m) {
    document.title = 'Linwell · 404';
    message(T.notFoundTitle, T.notFoundBody);
    return;
  }
  var token = decodeURIComponent(m[1]);
  if (!TOKEN_RE.test(token)) {
    message(T.notFoundTitle, T.tagNotFound);
    return;
  }

  // ----- Ficha -----
  fetch(API + '?t=' + encodeURIComponent(token), { method: 'GET', credentials: 'omit', referrerPolicy: 'no-referrer' })
    .then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error('http');
      return r.json();
    })
    .then(function (data) {
      if (!data) return message(T.notFoundTitle, T.tagNotFound);
      render(data);
    })
    .catch(function () {
      message(T.notFoundTitle, T.loadError);
    });

  function render(data) {
    clear();
    var pet = data.kind === 'pet';
    var name = String(data.name || '').slice(0, 60);
    document.title = name + ' · Linwell';

    var card = el('section', 'find-card' + (data.is_lost ? ' find-lost' : ''));
    if (data.is_lost) card.appendChild(el('p', 'find-badge', pet ? T.lost : T.lostItem));

    var photoUrl = typeof data.photo === 'string' && data.photo.indexOf('https://nkpkxfywmvyxzwuakbpw.supabase.co/') === 0 ? data.photo : null;
    if (photoUrl) {
      var img = el('img', 'find-photo');
      img.src = photoUrl;
      img.alt = name;
      img.width = 220;
      img.height = 220;
      card.appendChild(img);
    } else {
      card.appendChild(el('div', 'find-photo find-photo-empty', pet ? '🐾' : '🏷️'));
    }
    card.appendChild(el('h1', 'find-name', name));
    card.appendChild(el('p', 'find-muted', data.is_lost ? T.intro : T.found + ' ' + T.intro));
    app.appendChild(card);

    // ----- Formulario "Avisar al dueño" -----
    var form = el('form', 'find-card find-form');
    form.setAttribute('novalidate', '');

    var lm = el('label', 'find-label', T.message);
    lm.setAttribute('for', 'msg');
    var ta = el('textarea', 'find-input');
    ta.id = 'msg';
    ta.maxLength = MAX_MESSAGE;
    ta.rows = 4;
    ta.placeholder = T.messagePh;
    var count = el('p', 'find-count', '0 / ' + MAX_MESSAGE);
    ta.addEventListener('input', function () {
      count.textContent = ta.value.length + ' / ' + MAX_MESSAGE;
    });

    var lc = el('label', 'find-label', T.contact);
    lc.setAttribute('for', 'contact');
    var ci = el('input', 'find-input');
    ci.id = 'contact';
    ci.type = 'text';
    ci.maxLength = MAX_CONTACT;
    ci.autocomplete = 'off';
    ci.placeholder = T.contactPh;

    var pos = null;
    var locBtn = el('button', 'find-secondary', '📍 ' + T.shareLoc);
    locBtn.type = 'button';
    var locState = el('p', 'find-muted find-small', '');
    locState.setAttribute('aria-live', 'polite');
    locBtn.addEventListener('click', function () {
      if (!navigator.geolocation) {
        locState.textContent = T.locDenied;
        return;
      }
      locState.textContent = T.locAsking;
      navigator.geolocation.getCurrentPosition(
        function (p) {
          pos = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
          locState.textContent = T.locOk;
          locBtn.disabled = true;
        },
        function () {
          pos = null;
          locState.textContent = T.locDenied;
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });

    var notice = el('p', 'find-notice', T.notice(pet) + ' ');
    var pl = el('a', null, T.privacy);
    pl.href = T.privacyHref;
    pl.target = '_blank';
    pl.rel = 'noopener';
    notice.appendChild(pl);

    var err = el('p', 'find-error', '');
    err.setAttribute('role', 'alert');
    var send = el('button', 'find-primary', T.send);
    send.type = 'submit';

    [lm, ta, count, lc, ci, locBtn, locState, notice, err, send].forEach(function (n) {
      form.appendChild(n);
    });
    app.appendChild(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      var msg = ta.value.trim();
      var contact = ci.value.trim();
      if (!msg && !pos) {
        err.textContent = T.need;
        return;
      }
      if (msg.length > MAX_MESSAGE || contact.length > MAX_CONTACT) {
        err.textContent = T.tooLong;
        return;
      }
      send.disabled = true;
      send.textContent = T.sending;
      var body = { t: token, message: msg || null, contact: contact || null, lang: es ? 'es' : 'en' };
      if (pos) {
        body.lat = pos.lat;
        body.lng = pos.lng;
        body.accuracy = pos.accuracy;
      }
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      })
        .then(function (r) {
          if (r.ok) return message(T.thanksTitle, T.thanksBody);
          err.textContent = r.status === 429 ? T.rate : r.status === 400 ? T.tooLong : T.error;
          send.disabled = false;
          send.textContent = T.send;
        })
        .catch(function () {
          err.textContent = T.error;
          send.disabled = false;
          send.textContent = T.send;
        });
    });
  }
})();
