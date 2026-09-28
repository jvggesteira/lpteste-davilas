/* D'avila's Concept — script único da página.
   Fica em arquivo externo de propósito: permite uma CSP com script-src 'self',
   sem 'unsafe-inline'. Qualquer código novo entra aqui, nunca em <script> inline. */

/* ---------------------------------------------------------------------------
   1. Consentimento de cookies (LGPD)
   As tags de medição só carregam depois do "Aceitar". Antes disso, nenhum
   cookie de terceiro é gravado.
--------------------------------------------------------------------------- */
(function () {
  var GTM = 'GTM-XXXXXXX';           // preencher ao criar o contêiner
  var KEY = 'davilas-consent';
  var bar = document.getElementById('lgpd');
  if (!bar) return;

  function loadTags() {
    if (GTM.indexOf('X') > -1 || window.dataLayer) return;
    window.dataLayer = [{ 'gtm.start': +new Date(), event: 'gtm.js' }];
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM;
    document.head.appendChild(s);
  }

  var saved;
  try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
  if (saved === 'yes') return loadTags();
  if (saved === 'no') return;

  bar.hidden = false;
  bar.addEventListener('click', function (e) {
    var choice = e.target.getAttribute('data-consent');
    if (!choice) return;
    try { localStorage.setItem(KEY, choice); } catch (e2) {}
    bar.hidden = true;
    if (choice === 'yes') loadTags();
  });
})();

/* ---------------------------------------------------------------------------
   2. Vídeo do topo
   O vídeo é o conteúdo da peça, não enfeite: toca sempre, inclusive com
   "reduzir movimento" ligado. As animações decorativas já respeitam a
   preferência pelo CSS.
--------------------------------------------------------------------------- */
(function () {
  var v = document.getElementById('heroVideo');
  if (!v) return;

  v.muted = true;
  v.defaultMuted = true;
  v.setAttribute('muted', '');

  function attempt() {
    var p;
    try { p = v.play(); } catch (e) { return; }
    if (p && typeof p.catch === 'function') p.catch(function () {});
  }

  if (v.readyState >= 2) attempt();
  else v.addEventListener('loadeddata', attempt, { once: true });

  // Se o navegador recusar o autoplay, tenta de novo no primeiro gesto.
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (evt) {
    document.addEventListener(evt, function again() {
      if (v.paused) attempt();
      if (!v.paused) document.removeEventListener(evt, again);
    }, { passive: true });
  });
})();
