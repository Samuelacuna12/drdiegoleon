'use strict';
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
let language = 'en';
const t = (en, es) => language === 'en' ? en : es;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroVideo = $('#heroVideo');
const heroPause = $('#heroPause');
let heroManuallyPaused = false;
let heroInView = true;
let returnFocus;
const cases = ['assets/case-2.webp', 'assets/case-3.webp', 'assets/case-1.webp'];
let currentCase = 0;
const videos = {
  hero: { file: 'hero.mp4', title: ['The original clinic film', 'El video original de la clínica'], portrait: false },
  promo: { file: 'smile-promo.mp4', title: ['A closer look at the care', 'Una mirada a la atención'], portrait: true },
  patient1: { file: 'patient-1.mp4', title: ['Patient story · New York', 'Historia de paciente · Nueva York'], portrait: true },
  elin: { file: 'patient-elin.mp4', title: ['A new perspective · Patient story', 'Una nueva perspectiva · Historia de paciente'], portrait: true },
  katie: { file: 'patient-katie.mp4', title: ['Patient story · Toronto', 'Historia de paciente · Toronto'], portrait: true },
  singer: { file: 'patient-singer.mp4', title: ['A smile to share · Patient story', 'Una sonrisa para compartir · Historia de paciente'], portrait: true }
};
let activeVideo = null;
function setMultiline(element, text) {
  element.replaceChildren();
  text.split('\\n').forEach((line, index) => {
    if (index) element.append(document.createElement('br'));
    element.append(document.createTextNode(line));
  });
}
function translatePage() {
  document.documentElement.lang = language;
  $$('[data-en]').forEach(el => setMultiline(el, el.dataset[language]));
  $('#language').innerHTML = language === 'en' ? 'EN <span>/ ES</span>' : '<span>EN /</span> ES';
  $('#language').setAttribute('aria-label', t('Cambiar a español', 'Switch to English'));
  $('#menuToggle').setAttribute('aria-label', t('Open menu', 'Abrir menú'));
  heroPause.setAttribute('aria-label', heroVideo.paused ? t('Play background video', 'Reproducir video de fondo') : t('Pause background video', 'Pausar video de fondo'));
  $('#whatsappLink').href = 'https://wa.me/573045776685?text=' + encodeURIComponent(t("Hello, I’d like to learn more about a smile consultation with Dr. Diego León.", 'Hola, me gustaría recibir información sobre una valoración de sonrisa con el Dr. Diego León.'));
  $('#bookingDialog').setAttribute('aria-label', t('Consultation appointment demo', 'Agenda de valoración de demostración'));
  $('#imageDialog').setAttribute('aria-label', t('Original smile case', 'Caso original de sonrisa'));
  $('#whatsappDialog').setAttribute('aria-label', t('Contact the clinic on WhatsApp', 'Contactar a la clínica por WhatsApp'));
  $('#bookingDialog [data-close]').setAttribute('aria-label', t('Close appointment panel', 'Cerrar agenda'));
  $('#videoDialog [data-close]').setAttribute('aria-label', t('Close video', 'Cerrar video'));
  $('#imageDialog [data-close]').setAttribute('aria-label', t('Close image', 'Cerrar imagen'));
  $('#whatsappDialog [data-close]').setAttribute('aria-label', t('Close WhatsApp panel', 'Cerrar WhatsApp'));
  $('#expandCase').setAttribute('aria-label', t('Enlarge case image', 'Ampliar imagen del caso'));
  if ($('#bookingDialog').open) renderBooking();
}
$('#language').addEventListener('click', () => { language = language === 'en' ? 'es' : 'en'; translatePage(); });
function closeMobileMenu() { $('#mobileNav').hidden = true; $('#menuToggle').setAttribute('aria-expanded', 'false'); }
$('#menuToggle').addEventListener('click', () => { const open = $('#mobileNav').hidden; $('#mobileNav').hidden = !open; $('#menuToggle').setAttribute('aria-expanded', String(open)); });
$$('#mobileNav a').forEach(a => a.addEventListener('click', closeMobileMenu));
function handleScroll() {
  $('#header').classList.toggle('scrolled', window.scrollY > 60);
  $('.sticky-contact').classList.toggle('visible', window.scrollY > 450);
}
window.addEventListener('scroll', handleScroll, { passive: true }); handleScroll();
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  document.body.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('shown'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));
}
function updateHeroControl() { heroPause.textContent = heroVideo.paused ? '▶' : 'Ⅱ'; heroPause.setAttribute('aria-label', heroVideo.paused ? t('Play background video', 'Reproducir video de fondo') : t('Pause background video', 'Pausar video de fondo')); }
function resumeHero() {
  if (!reducedMotion.matches && !heroManuallyPaused && heroInView && !document.hidden && !document.querySelector('dialog[open]')) heroVideo.play().catch(updateHeroControl);
}
heroVideo.addEventListener('play', updateHeroControl); heroVideo.addEventListener('pause', updateHeroControl);
heroPause.addEventListener('click', () => { if (heroVideo.paused) { heroManuallyPaused = false; heroVideo.play().catch(updateHeroControl); } else { heroManuallyPaused = true; heroVideo.pause(); } });
const heroObserver = new IntersectionObserver(entries => { heroInView = entries[0].isIntersecting; if (heroInView) resumeHero(); else heroVideo.pause(); }, { threshold: 0.1 });
heroObserver.observe($('.hero')); resumeHero();
document.addEventListener('visibilitychange', () => { if (document.hidden) { heroVideo.pause(); $('#modalVideo').pause(); } else resumeHero(); });
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { heroVideo.pause(); document.body.classList.remove('motion-ready'); } else resumeHero(); });
function openDialog(dialog) {
  returnFocus = document.activeElement; closeMobileMenu(); heroVideo.pause(); dialog.showModal(); document.body.classList.add('dialog-open');
}
$$('dialog').forEach(dialog => {
  $('[data-close]', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => {
    if (dialog.id === 'videoDialog') { const player = $('#modalVideo'); player.pause(); player.removeAttribute('src'); player.load(); activeVideo = null; }
    if (!document.querySelector('dialog[open]')) { document.body.classList.remove('dialog-open'); resumeHero(); }
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
});
$$('[data-video]').forEach(button => button.addEventListener('click', () => {
  activeVideo = button.dataset.video; const video = videos[activeVideo]; const dialog = $('#videoDialog');
  dialog.classList.toggle('portrait', video.portrait); $('#videoCaption').textContent = video.title[language === 'en' ? 0 : 1];
  $('#modalVideo').src = 'assets/' + video.file; $('#modalVideo').muted = false; openDialog(dialog); $('#modalVideo').play().catch(() => {});
}));
$$('[data-whatsapp]').forEach(button => button.addEventListener('click', () => openDialog($('#whatsappDialog'))));
$$('[data-case]').forEach(button => button.addEventListener('click', () => {
  currentCase = Number(button.dataset.case); $('#caseImage').src = cases[currentCase]; $('#caseNumber').textContent = '0' + (currentCase + 1);
  $$('[data-case]').forEach(tab => { tab.classList.toggle('active', tab === button); tab.setAttribute('aria-pressed', String(tab === button)); });
}));
$('#expandCase').addEventListener('click', () => { $('#expandedImage').src = cases[currentCase]; openDialog($('#imageDialog')); });
// This prototype uses illustrative availability only. No data leaves the browser.
const nowBogota = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const [todayYear, todayMonth, todayDate] = nowBogota.split('-').map(Number);
const todayUTC = Date.UTC(todayYear, todayMonth - 1, todayDate);
let booking = { step: 1, type: 'online', year: todayYear, month: todayMonth - 1, date: '', time: '', name: '', email: '' };
function escapeText(text) { return String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function displayDate(value) { if (!value) return ''; return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-CO', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z')); }
function typeName() { return booking.type === 'online' ? t('Online introduction', 'Primera conversación online') : t('Clinic consultation', 'Valoración en la clínica'); }
function bookingSummary() { return `<div class="appointment-summary"><strong>${typeName()}</strong><span>${displayDate(booking.date)} · ${booking.time}</span><small>${t('Colombia time · America/Bogota (UTC−5)', 'Hora de Colombia · America/Bogota (UTC−5)')}</small><small>${t('Illustrative appointment · 30 minutes', 'Cita ilustrativa · 30 minutos')}</small></div>`; }
$$('[data-book]').forEach(button => button.addEventListener('click', () => {
  booking = { step: 1, type: 'online', year: todayYear, month: todayMonth - 1, date: '', time: '', name: '', email: '' };
  renderBooking(); openDialog($('#bookingDialog'));
}));
function renderBooking() {
  const root = $('#bookingContent');
  const notice = `<div class="demo-notice">${t('DESIGN PROPOSAL · Demo calendar. No real appointment is booked and no information is sent.', 'PROPUESTA DE DISEÑO · Agenda de demostración. No se reservan citas reales ni se envía información.')}</div>`;
  const progress = `<div class="booking-progress" aria-label="${t('Step', 'Paso')} ${Math.min(booking.step, 3)} ${t('of', 'de')} 3">${[1,2,3].map(i => `<span class="${booking.step >= i ? 'active' : ''}"></span>`).join('')}</div>`;
  let content = '';
  if (booking.step === 1) {
    content = `<div class="step-label">01 / 03 · ${t('YOUR FIRST STEP','TU PRIMER PASO')}</div><h2>${t('Let’s start with<br>a conversation.', 'Empecemos con<br>una conversación.')}</h2><p class="booking-subtitle">${t('Choose how you would like to meet.', 'Elige cómo te gustaría conocernos.')}</p><div class="appointment-types">
    <button class="appointment-type ${booking.type === 'online' ? 'selected' : ''}" data-type="online" aria-pressed="${booking.type === 'online'}"><span class="type-icon">◫</span><span><span class="type-title">${t('Online introduction', 'Primera conversación online')}</span><span class="type-description">${t('From wherever you are. Meet the team and ask your first questions.', 'Desde donde estés. Conoce al equipo y resuelve tus primeras dudas.')}</span></span><span class="radio-mark"></span></button>
    <button class="appointment-type ${booking.type === 'clinic' ? 'selected' : ''}" data-type="clinic" aria-pressed="${booking.type === 'clinic'}"><span class="type-icon">⌖</span><span><span class="type-title">${t('Visit the clinic', 'Visita la clínica')}</span><span class="type-description">${t('An in-person conversation in Bucaramanga, Colombia.', 'Una conversación presencial en Bucaramanga, Colombia.')}</span></span><span class="radio-mark"></span></button></div><button class="button button-navy" id="bookingNext">${t('Choose a date & time', 'Elegir fecha y hora')} <span>↗</span></button>`;
  } else if (booking.step === 2) {
    const monthLabel = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-CO', {month:'long', year:'numeric', timeZone:'UTC'}).format(new Date(Date.UTC(booking.year,booking.month,1)));
    const firstDay = new Date(Date.UTC(booking.year,booking.month,1)).getUTCDay();
    const count = new Date(Date.UTC(booking.year,booking.month + 1,0)).getUTCDate();
    const prevDisabled = booking.year === todayYear && booking.month === todayMonth - 1;
    const offset = (booking.year - todayYear) * 12 + booking.month - (todayMonth - 1);
    let days = '<span></span>'.repeat(firstDay);
    for (let day=1;day<=count;day++) {
      const stamp = Date.UTC(booking.year,booking.month,day), weekday = new Date(stamp).getUTCDay();
      const iso = `${booking.year}-${String(booking.month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const disabled = stamp <= todayUTC || weekday === 0;
      days += `<button class="calendar-day ${booking.date === iso ? 'selected' : ''}" data-date="${iso}" ${disabled ? 'disabled' : ''} aria-pressed="${booking.date === iso}" aria-label="${escapeText(displayDate(iso))}">${day}</button>`;
    }
    const slots = booking.date && new Date(booking.date+'T12:00:00Z').getUTCDay() === 6 ? ['09:00','10:00','11:00','12:00'] : ['09:00','10:30','11:30','14:00','15:30','16:30'];
    content = `<div class="step-label">02 / 03 · ${t('MAKE SOME TIME FOR YOU', 'UN MOMENTO PARA TI')}</div><h2>${t('Your next beginning.', 'Tu próximo comienzo.')}</h2><p class="booking-subtitle">${t('Explore sample availability for your consultation.', 'Explora horarios de ejemplo para tu valoración.')}</p><div class="calendar-header"><button id="prevMonth" aria-label="${t('Previous month','Mes anterior')}" ${prevDisabled?'disabled':''}>‹</button><strong>${monthLabel}</strong><button id="nextMonth" aria-label="${t('Next month','Mes siguiente')}" ${offset >= 2?'disabled':''}>›</button></div><div class="calendar-days">${t(['Su','Mo','Tu','We','Th','Fr','Sa'],['Do','Lu','Ma','Mi','Ju','Vi','Sá']).map(d=>`<span>${d}</span>`).join('')}</div><div class="calendar-grid">${days}</div>${booking.date ? `<div class="time-label">${t('Sample times','Horarios de ejemplo')} · ${displayDate(booking.date)}</div><div class="time-grid">${slots.map(time=>`<button class="time-slot ${booking.time===time?'selected':''}" data-time="${time}" aria-pressed="${booking.time===time}">${time}</button>`).join('')}</div>` : ''}<p class="timezone-note">${t('All times shown in Colombia time (UTC−5).', 'Todos los horarios se muestran en hora de Colombia (UTC−5).')}</p><button class="button button-navy" id="bookingNext" ${!booking.date || !booking.time ? 'disabled' : ''}>${t('Continue', 'Continuar')} <span>↗</span></button><button class="booking-back" id="bookingBack">← ${t('Back', 'Volver')}</button>`;
  } else if (booking.step === 3) {
    content = `<div class="step-label">03 / 03 · ${t('THE FINAL DETAIL','EL ÚLTIMO DETALLE')}</div><h2>${t('Make it yours.', 'Hagámoslo tuyo.')}</h2><p class="booking-subtitle">${t('Use sample details to try the experience.', 'Usa datos de ejemplo para probar la experiencia.')}</p>${bookingSummary()}<form id="appointmentForm"><label class="booking-field">${t('Name', 'Nombre')}<input id="bookingName" name="name" autocomplete="off" placeholder="Alex Taylor" maxlength="100" required value="${escapeText(booking.name)}"></label><label class="booking-field">${t('Email', 'Correo electrónico')}<input id="bookingEmail" name="email" type="email" autocomplete="off" placeholder="alex@example.com" maxlength="200" required value="${escapeText(booking.email)}"></label><p class="field-hint">${t('Demo only. Details stay in this page and are cleared when you start again.', 'Solo demostración. Los datos permanecen en esta página y se borran al empezar de nuevo.')}</p><button class="button button-navy" type="submit">${t('Preview my appointment', 'Ver mi cita de ejemplo')} <span>↗</span></button></form><button class="booking-back" id="bookingBack">← ${t('Change date or time', 'Cambiar fecha u hora')}</button>`;
  } else {
    content = `<div class="booking-success"><div class="success-icon">✓</div><div class="step-label">${t('APPOINTMENT PREVIEW', 'VISTA PREVIA DE LA CITA')}</div><h2>${t('Your next chapter,<br>imagined.', 'Tu siguiente capítulo,<br>imaginado.')}</h2><p class="booking-subtitle">${t('Here is your sample appointment,', 'Esta es tu cita de ejemplo,')} ${escapeText(booking.name)}.</p>${bookingSummary()}<p class="success-note"><strong>${t('This is a demonstration, not a booking.', 'Esto es una demostración, no una reserva.')}</strong><br>${t('No appointment has been made. No email or message has been sent. In a live version, this step would connect to the clinic’s calendar.', 'No se ha reservado ninguna cita ni enviado correos o mensajes. En una versión activa, este paso se conectaría a la agenda de la clínica.')}</p><button class="button button-navy" id="bookingDone">${t('Back to the experience', 'Volver a la experiencia')} <span>↗</span></button><button class="booking-back" id="bookingRestart">${t('Try another appointment', 'Probar otra cita')}</button></div>`;
  }
  root.innerHTML = `<div class="booking-body">${notice}${booking.step < 4 ? progress : ''}${content}</div>`;
  $$('[data-type]',root).forEach(button=>button.addEventListener('click',()=>{booking.type=button.dataset.type;renderBooking();$(`[data-type="${booking.type}"]`,root).focus();}));
  $('#bookingNext',root)?.addEventListener('click',()=>{booking.step++;renderBooking();focusStep();});
  $('#bookingBack',root)?.addEventListener('click',()=>{if(booking.step===3){booking.name=$('#bookingName').value;booking.email=$('#bookingEmail').value;}booking.step--;renderBooking();focusStep();});
  $('#prevMonth',root)?.addEventListener('click',()=>changeMonth(-1));
  $('#nextMonth',root)?.addEventListener('click',()=>changeMonth(1));
  $$('[data-date]',root).forEach(button=>button.addEventListener('click',()=>{booking.date=button.dataset.date;booking.time='';renderBooking();$(`[data-date="${booking.date}"]`,root)?.focus({preventScroll:true});}));
  $$('[data-time]',root).forEach(button=>button.addEventListener('click',()=>{booking.time=button.dataset.time;renderBooking();$(`[data-time="${booking.time}"]`,root)?.focus({preventScroll:true});}));
  $('#appointmentForm',root)?.addEventListener('submit',event=>{event.preventDefault();booking.name=$('#bookingName').value.trim();booking.email=$('#bookingEmail').value.trim();if(!booking.name){$('#bookingName').setCustomValidity(t('Enter a sample name.','Escribe un nombre de ejemplo.'));$('#bookingName').reportValidity();return;}booking.step=4;renderBooking();focusStep();});
  $('#bookingName',root)?.addEventListener('input',event=>event.target.setCustomValidity(''));
  $('#bookingDone',root)?.addEventListener('click',()=>$('#bookingDialog').close());
  $('#bookingRestart',root)?.addEventListener('click',()=>{booking.step=1;booking.date='';booking.time='';booking.name='';booking.email='';renderBooking();focusStep();});
}
function changeMonth(delta){const date=new Date(Date.UTC(booking.year,booking.month+delta,1));booking.year=date.getUTCFullYear();booking.month=date.getUTCMonth();booking.date='';booking.time='';renderBooking();}
function focusStep(){const title=$('#bookingContent h2');title.setAttribute('tabindex','-1');title.focus({preventScroll:true});$('#bookingDialog').scrollTop=0;}
translatePage();
