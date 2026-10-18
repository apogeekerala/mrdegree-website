/* Mr.Degree website script: menu, scroll loader, credit estimator, enquiry form */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- analytics: paste your IDs here before launch ---------- */
  var GA4_ID = '';          // e.g. 'G-XXXXXXXXXX'  (Google Analytics 4)
  var META_PIXEL_ID = '';   // e.g. '123456789012345' (Meta / Facebook Pixel)

  function loadScript(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  if (GA4_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + GA4_ID);
  }
  if (META_PIXEL_ID) {
    (function (f, b, e, v, n) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []; loadScript(v); })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }
  var PIXEL_MAP = { generate_lead: 'Lead', contact_whatsapp: 'Contact', contact_call: 'Contact', route_quiz_complete: 'CompleteRegistration' };
  function track(name, params) {
    try {
      if (window.gtag) window.gtag('event', name, params || {});
      if (window.fbq) { if (PIXEL_MAP[name]) window.fbq('track', PIXEL_MAP[name], params || {}); else window.fbq('trackCustom', name, params || {}); }
    } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (h.indexOf('wa.me') > -1) track('contact_whatsapp', { location: a.className || 'link' });
    else if (h.indexOf('tel:') === 0) track('contact_call', { location: a.className || 'link' });
  });

  /* remember ad source (utm_*) for the enquiry form */
  var utm = '';
  try {
    var qs = new URLSearchParams(location.search), parts = [];
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'gclid', 'fbclid'].forEach(function (k) { if (qs.get(k)) parts.push(k + '=' + qs.get(k)); });
    if (parts.length) { utm = parts.join('&'); sessionStorage.setItem('mrd_utm', utm); } else { utm = sessionStorage.getItem('mrd_utm') || ''; }
  } catch (e) {}

  /* always open a page at the top (unless the link points to a section like #faq).
     Some viewers restore the previous scroll position or focus the enquiry form at the bottom. */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  var userActed = false;
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, function () { userActed = true; }, { once: true, passive: true, capture: true });
  });
  function toTop() {
    if (userActed || location.hash.length > 1) return;
    var a = document.activeElement;
    if (a && a !== document.body && /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(a.tagName)) a.blur();
    var d = document.documentElement, prev = d.style.scrollBehavior;
    d.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    d.style.scrollBehavior = prev;
  }
  toTop();
  document.addEventListener('DOMContentLoaded', toTop);
  window.addEventListener('load', function () { toTop(); setTimeout(toTop, 60); setTimeout(toTop, 350); });
  window.addEventListener('pageshow', toTop);
  document.addEventListener('focusin', function (e) {
    if (!userActed && location.hash.length < 2 && e.target.closest && e.target.closest('form')) { setTimeout(toTop, 0); }
  });

  /* mobile menu */
  var header = $('.site-header');
  var toggle = $('.nav-toggle');
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('.mnav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu'); document.body.style.overflow = '';
      });
    });
  }

  /* services dropdown (click / keyboard) */
  function closeDrops(except) {
    $$('.has-drop.open').forEach(function (p) {
      if (p !== except) { p.classList.remove('open'); $('.drop-btn', p).setAttribute('aria-expanded', 'false'); }
    });
  }
  $$('.drop-btn').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var p = b.parentElement;
      closeDrops(p);
      var open = p.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    $$('.has-drop.open').forEach(function (p) { if (!p.contains(e.target)) closeDrops(); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeDrops();
      if (header && header.classList.contains('open')) { header.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    }
  });

  /* header loading bar follows scroll */
  var segs = $$('.hload i');
  var ticking = false;
  function updateLoader() {
    ticking = false;
    var d = document.documentElement;
    var max = d.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    segs.forEach(function (s, i) {
      var f = Math.min(1, Math.max(0, p * segs.length - i));
      s.style.transform = 'scaleX(' + f + ')';
    });
  }
  if (segs.length) {
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(updateLoader); } }, { passive: true });
    window.addEventListener('resize', updateLoader);
    updateLoader();
  }

  /* credit estimator */
  var est = $('#estimator');
  if (est) {
    var course = $('#est-course', est), sem = $('#est-sem', est), semOut = $('#est-sem-out', est);
    var bar = $('.segbar', est), carryOut = $('#est-carry', est), studyOut = $('#est-study', est), savedOut = $('#est-saved', est), note = $('#est-note', est);
    function yrs(s) { if (s === 1) return '6 months'; var y = s / 2; return (y % 1 === 0 ? y : y.toFixed(1)) + (y === 1 ? ' year' : ' years'); }
    function render() {
      var n = parseInt(course.options[course.selectedIndex].getAttribute('data-sems'), 10);
      sem.max = String(n - 1);
      if (parseInt(sem.value, 10) > n - 1) sem.value = String(n - 1);
      var k = parseInt(sem.value, 10);
      var half = n / 2;
      var carry = Math.min(k, half);
      var study = n - carry;
      semOut.textContent = k;
      sem.setAttribute('aria-valuetext', k + ' of ' + n + ' semesters');
      bar.innerHTML = '';
      for (var i = 0; i < n; i++) {
        var s = document.createElement('span');
        s.className = 'seg ' + (i < carry ? 'carry' : 'study');
        bar.appendChild(s);
      }
      bar.setAttribute('aria-label', carry + ' of ' + n + ' semesters may carry over, ' + study + ' to study');
      carryOut.textContent = carry + ' sem';
      studyOut.textContent = study + ' sem';
      savedOut.textContent = yrs(carry);
      note.textContent = k > half
        ? 'You cleared ' + k + ' semesters, but at least half of a degree must be earned at the university that awards it. So up to ' + half + ' semesters can carry over.'
        : 'Indicative only. The partner university decides the final credit transfer after checking each course you passed.';
    }
    course.addEventListener('change', render);
    sem.addEventListener('input', render);
    render();
  }

  /* enquiry forms */
  $$('form.lead-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var st = $('.form-status', f);
      var phone = $('[name=phone]', f);
      var digits = (phone.value || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
      if (digits.length !== 10) {
        st.dataset.state = 'error';
        st.textContent = 'Please enter a 10-digit mobile number.';
        phone.focus();
        return;
      }
      var consent = $('[name=consent]', f);
      if (consent && !consent.checked) {
        st.dataset.state = 'error';
        st.textContent = 'Please tick the box so our counsellor can contact you.';
        consent.focus();
        return;
      }
      var first = (($('[name=name]', f).value || '').trim().split(/\s+/)[0]) || 'there';
      var pg = $('[name=page]', f); if (pg) pg.value = location.pathname.split('/').pop() || 'index.html';
      var um = $('[name=utm]', f); if (um) um.value = utm;
      var leadInfo = { form_id: f.id, course: ($('[name=course]', f) || {}).value || '' };
      var endpoint = f.getAttribute('data-endpoint');
      if (endpoint) {
        st.dataset.state = '';
        st.textContent = 'Sending...';
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(f)).toString() })
          .then(function (r) { if (!r.ok) throw new Error(r.status); st.dataset.state = 'ok'; st.textContent = 'Thank you, ' + first + '. A counsellor will call you soon.'; track('generate_lead', leadInfo); f.reset(); })
          .catch(function () { st.dataset.state = 'error'; st.textContent = 'Your details were not sent. Please try again or WhatsApp us.'; });
      } else {
        st.dataset.state = 'ok';
        st.textContent = 'Thank you, ' + first + '. This is a demo form for now. It will be connected to the Mr.Degree CRM before launch.';
      }
    });
  });

  /* ---------- exit popup (once per visit) ---------- */
  var pop = $('#exit-pop');
  if (pop) {
    var EKEY = 'mrd_exit_seen', shown = false, started = Date.now(), lastFocus = null;
    var seen = function () { try { return sessionStorage.getItem(EKEY) === '1'; } catch (e) { return false; } };
    var markSeen = function () { try { sessionStorage.setItem(EKEY, '1'); } catch (e) {} };
    var showPop = function () {
      if (shown || seen() || Date.now() - started < 8000) return;
      if ($('.form-status[data-state="ok"]')) return;
      shown = true; markSeen(); lastFocus = document.activeElement;
      pop.hidden = false; document.body.style.overflow = 'hidden';
      try { $('.exit-x', pop).focus({ preventScroll: true }); } catch (e) {}
      track('exit_popup_view');
    };
    var hidePop = function () {
      pop.hidden = true; document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
    };
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0) showPop(); });
    var touchOnly = window.matchMedia && window.matchMedia('(hover: none)').matches;
    if (touchOnly) {
      window.addEventListener('scroll', function () {
        var d = document.documentElement, p = window.scrollY / Math.max(1, d.scrollHeight - window.innerHeight);
        if (p > 0.6 && Date.now() - started > 35000) showPop();
      }, { passive: true });
    }
    pop.addEventListener('click', function (e) {
      if (e.target === pop || e.target.closest('.exit-x, .exit-no, [data-exit-close]')) { hidePop(); }
    });
    document.addEventListener('keydown', function (e) {
      if (pop.hidden) return;
      if (e.key === 'Escape') hidePop();
      if (e.key === 'Tab') {
        var f = $$('a[href], button', pop), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- route finder quiz ---------- */
  var quiz = $('#quiz');
  if (quiz) {
    var Q = [
      { id: 'goal', q: 'What do you want to do?', opts: [['btech', 'Finish my BTech / BE'], ['degree', 'Finish my BA, BCom, BSc, BBA or BCA'], ['plus2', 'Finish Plus Two (Class 12)'], ['abroad', 'Get certificates attested for abroad'], ['admission', 'Choose a new course or college']] },
      { id: 'stage', q: function (a) { return { btech: 'How far did you get in BTech?', degree: 'How far did you get in your degree?', plus2: 'Where are you now?', abroad: 'What do you need the attestation for?', admission: 'Where are you now?' }[a.goal]; },
        opts: function (a) { return {
          btech: [['early', '1 or 2 semesters'], ['mid', '3 to 5 semesters'], ['late', '6 or more semesters'], ['backlog', 'All semesters done, papers pending']],
          degree: [['y1', 'Finished the first year'], ['y2', 'Finished the second year'], ['final', 'Final year, papers pending']],
          plus2: [['failed', 'I failed Class 12'], ['after10', 'I stopped after Class 10'], ['switch', 'I am in school but want to switch']],
          abroad: [['job', 'A job abroad'], ['study', 'Higher studies abroad'], ['family', 'Family or residence visa']],
          admission: [['ug', 'Finished Plus Two'], ['pg', 'Finished a degree'], ['dip', 'Finished a diploma']] }[a.goal]; } },
      { id: 'work', q: 'Are you working now?', opts: [['full', 'Yes, full-time'], ['part', 'Yes, part-time'], ['no', 'No']] },
      { id: 'state', q: 'Where do you live?', opts: [['Kerala', 'Kerala'], ['Tamil Nadu', 'Tamil Nadu'], ['Karnataka', 'Karnataka'], ['Andhra Pradesh / Telangana', 'Andhra Pradesh / Telangana'], ['North India', 'North India'], ['Other', 'Somewhere else']] },
      { id: 'lang', q: 'Which language should our counsellor speak?', opts: ['Malayalam', 'Tamil', 'Telugu', 'Kannada', 'Hindi', 'Marathi', 'Bengali', 'Gujarati', 'Odia', 'Punjabi', 'English'].map(function (l) { return [l, l]; }) }
    ];
    var ans = {}, step = 0;
    var body = $('#quiz-body'), count = $('#quiz-count'), back = $('#quiz-back'), result = $('#quiz-result');
    var segsQ = $$('.qbar span', quiz);
    var val = function (x) { return typeof x === 'function' ? x(ans) : x; };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var drawStep = function (focus) {
      var s = Q[step];
      segsQ.forEach(function (sg, i) { sg.classList.toggle('on', i <= step); });
      count.textContent = 'Question ' + (step + 1) + ' of ' + Q.length;
      body.innerHTML = '<h2 class="qtitle" id="quiz-q" tabindex="-1">' + esc(val(s.q)) + '</h2><div class="opts" role="group" aria-labelledby="quiz-q">' +
        val(s.opts).map(function (o) { return '<button type="button" class="opt' + (ans[s.id] === o[0] ? ' sel' : '') + '" data-v="' + esc(o[0]) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>';
      back.hidden = step === 0;
      if (focus) { try { $('#quiz-q').focus({ preventScroll: true }); } catch (e) {} }
    };
    body.addEventListener('click', function (e) {
      var b = e.target.closest('.opt'); if (!b) return;
      ans[Q[step].id] = b.getAttribute('data-v');
      if (Q[step].id === 'goal') { delete ans.stage; }
      if (step < Q.length - 1) { step++; drawStep(true); } else { showResult(); }
    });
    back.addEventListener('click', function () { if (step > 0) { step--; drawStep(true); } });
    $('#quiz-restart').addEventListener('click', function () {
      ans = {}; step = 0; result.hidden = true; quiz.hidden = false; drawStep(true);
      quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    var R = {
      transfer_b: ['transfer', 'Credit transfer to an AICTE-approved BTech', 'Your passed courses move through the Academic Bank of Credits and you join a later semester at a partner university.', 'btech-completion.html'],
      wp: ['briefcase', 'BTech for working professionals', 'Evening or weekend BTech at an AICTE-approved institute within 75 km of your workplace. Needs at least one year of work experience.', 'btech-completion.html'],
      wilp: ['cap', 'Work-integrated learning (WILP)', 'Work-linked BTech from an Institution of Eminence, usually with your employer\'s support.', 'btech-completion.html'],
      transfer_d: ['transfer', 'Credit transfer to a recognised university', 'Your passed courses carry over and you complete the remaining part of your degree.', 'degree-completion.html'],
      reentry: ['refresh', 'Re-entry under NEP 2020', 'Universities following the UGC framework let you come back and finish within the period they allow.', 'degree-completion.html'],
      online: ['laptop', 'Online degree completion', 'Study at a UGC-DEB entitled university on its online portal, with credit transfer where allowed.', 'online-degree.html'],
      distance: ['parcel', 'Distance degree completion', 'Study material, contact classes and exam centres at a UGC-DEB approved university.', 'distance-degree.html'],
      nios: ['book', 'NIOS Senior Secondary (Plus Two)', 'Complete Class 12 through the national open school, with subjects you choose.', 'nios-plus-two.html'],
      attest: ['stamp', 'Certificate attestation or apostille', 'Notary, state, MEA and embassy attestation, or an apostille, depending on the country.', 'embassy-attestation.html'],
      adm: ['compass', 'Admission counselling', 'A shortlist of approved courses and colleges that match your marks, budget and goals.', 'admission-consulting.html']
    };
    var showResult = function () {
      var g = ans.goal, st = ans.stage, working = ans.work !== 'no', routes = [], notes = [], lead = '', course = '';
      if (g === 'btech') {
        course = 'BTech / BE';
        routes.push('transfer_b'); if (working) { routes.push('wp', 'wilp'); }
        if (st === 'early') notes.push('With 1 or 2 semesters done, credit transfer saves less time. Your counsellor will also compare starting fresh in a regular or working-professional BTech.');
        if (st === 'late' || st === 'backlog') notes.push('At least half of the credits must be earned at the new university, so expect to study at least 2 years there, even if you cleared more.');
        if (st === 'mid') notes.push('Only courses you passed carry over. The university maps each one against its syllabus.');
        notes.push('BTech is not possible through distance or online mode. Do not pay anyone who offers it.');
        lead = 'Credit transfer is your main route' + (working ? ', and as a working person you also have weekend and work-integrated options.' : '.');
      } else if (g === 'degree') {
        course = 'BA / BCom / BSc';
        routes.push('transfer_d');
        if (working) routes.push('online', 'distance'); else routes.push(st === 'final' ? 'online' : 'reentry');
        notes.push('At least half of your degree credits must be earned at the university that awards it.');
        if (st === 'y1' || st === 'y2') notes.push('Under NEP 2020, many universities award a certificate after one year and a diploma after two, if you meet their credit rules.');
        notes.push('Online and distance study is valid only at UGC-DEB entitled universities, for that exact programme and year.');
        lead = working ? 'You can carry your credits and finish while you work.' : 'You can carry your credits and complete the rest of your degree.';
      } else if (g === 'plus2') {
        course = 'NIOS Plus Two'; routes.push('nios');
        if (st === 'failed') notes.push('Through Transfer of Credit, NIOS can carry up to 2 subjects you passed in your board, so you study fewer subjects.');
        if (st === 'switch') notes.push('Talk to your school and parents first. NIOS suits students who need flexible study.');
        notes.push('Choose subjects that match your next course, for example Physics, Chemistry and Maths for engineering.');
        notes.push('NIOS conducts the exams and issues the certificate. Fees are paid directly to NIOS.');
        lead = 'NIOS lets you complete Class 12 on your own schedule.';
      } else if (g === 'abroad') {
        course = 'Embassy attestation'; routes.push('attest');
        notes.push('Countries in the Hague Apostille Convention accept an MEA apostille. Others need embassy attestation after MEA.');
        if (st === 'job') notes.push('Gulf employers usually ask for your highest educational certificate, and sometimes Plus Two and mark lists.');
        notes.push('We only process genuine documents issued by recognised institutions.');
        lead = 'Your documents need the attestation chain for the country you are going to.';
      } else {
        course = 'Admission guidance'; routes.push('adm'); if (st === 'pg' && working) routes.push('online');
        notes.push('We guide you. Admission is decided by the institution or its official counselling and merit process.');
        notes.push('We never sell seats or take capitation fees.');
        lead = 'A counsellor will help you shortlist approved options that fit your marks and budget.';
      }
      $('#qr-lead').textContent = lead + ' This is a starting point. Your counsellor confirms it after checking your documents.';
      $('#qr-routes').innerHTML = routes.map(function (k, i) {
        var r = R[k];
        return '<div class="route' + (i === 0 ? ' best' : '') + '"><span class="ico">' + (icons[r[0]] || '') + '</span>' + (i === 0 ? '<span class="tag">Best match</span>' : '') +
          '<h3>' + esc(r[1]) + '</h3><p>' + esc(r[2]) + '</p><a class="more" href="' + r[3] + '">Learn more ' + icons.arrow + '</a></div>';
      }).join('');
      $('#qr-notes').innerHTML = notes.map(function (n) { return '<li><span class="ico">' + icons.shield + '</span><p>' + esc(n) + '</p></li>'; }).join('');
      var f = $('#quiz-form');
      if (f) {
        var summary = Q.map(function (q) { var v = ans[q.id]; var o = (val(q.opts) || []).filter(function (x) { return x[0] === v; })[0]; return q.id + ': ' + (o ? o[1] : v); }).join(' | ');
        $('[name=quiz]', f).value = summary;
        var cs = $('[name=course]', f); if (cs) cs.value = course;
        var ls = $('[name=language]', f); if (ls) ls.value = ans.lang;
      }
      quiz.hidden = true; result.hidden = false;
      try { $('#qr-title').focus({ preventScroll: true }); } catch (e) {}
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      track('route_quiz_complete', { goal: g, stage: st || '', working: ans.work, state: ans.state, language: ans.lang });
    };
    var icons = {};
    var svgOf = function (sel) { var el = document.querySelector(sel); return el ? el.outerHTML : ''; };
    var tpl = document.getElementById('quiz-icons');
    if (tpl) { $$('[data-icon]', tpl.content || tpl).forEach(function (el) { icons[el.getAttribute('data-icon')] = el.innerHTML; }); }
    drawStep(false);
  }

  /* ---------- verify a university ---------- */
  var vtool = $('#vtool');
  if (vtool) {
    var data = []; try { data = JSON.parse($('#vu-data').textContent); } catch (e) {}
    var nameIn = $('#vu-name'), list = $('#vu-list'), head = $('#vu-head'), ask = $('#vu-ask');
    var arrowSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12 H19 M13 6 L19 12 L13 18"/></svg>';
    var escV = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var waBase = ask.getAttribute('href').split('?')[0];
    var renderV = function (fromClick) {
      var name = nameIn.value.trim();
      var mode = ($('input[name="vu-mode"]:checked', vtool) || {}).value || 'regular';
      var label = name || 'the university';
      head.textContent = 'Your checklist for ' + label;
      list.innerHTML = data.filter(function (c) { return c.modes.indexOf(mode) > -1; }).map(function (c) {
        return '<li><div><strong>' + escV(c.t) + '</strong><p>' + escV(c.d.replace(/\{name\}/g, label)) + '</p>' +
          (c.url ? '<a href="' + c.url + '" target="_blank" rel="noopener">' + escV(c.site) + ' ' + arrowSvg + '</a>' : '') + '</div></li>';
      }).join('');
      var modeLabel = ($('input[name="vu-mode"]:checked + span', vtool) || {}).textContent || '';
      ask.href = waBase + '?text=' + encodeURIComponent('Hi Mr.Degree, please help me verify ' + (name || 'a university') + ' for ' + modeLabel + '.');
      if (fromClick) { track('verify_university', { mode: mode }); }
    };
    $('#vu-go').addEventListener('click', function () { renderV(true); });
    nameIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); renderV(true); } });
    $$('input[name="vu-mode"]', vtool).forEach(function (r) { r.addEventListener('change', function () { renderV(false); }); });
  }

  /* footer year */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
