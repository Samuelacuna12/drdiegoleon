'use strict';

// Native scrolling drives chapter depth. No wheel interception or scroll hijacking.
(() => {
  const root = document.documentElement;
  const motionButton = document.querySelector('#motionToggle');
  const sections = {
    results: document.querySelector('#results'),
    approach: document.querySelector('#approach'),
    journey: document.querySelector('#journey .journey-steps'),
    stories: document.querySelector('#stories'),
    contact: document.querySelector('#contact')
  };
  const frames = [...document.querySelectorAll('.story-frame')];
  const previews = new Map();
  let activePreview = null;
  let framePending = false;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const motionAllowed = () => !motionPaused && !reducedMotion.matches;

  function renderScroll() {
    framePending = false;
    const height = window.innerHeight;
    const reading = clamp(window.scrollY / Math.max(1, document.documentElement.scrollHeight - height));
    const rects = Object.fromEntries(Object.entries(sections).map(([key, element]) => [key, element.getBoundingClientRect()]));
    root.style.setProperty('--reading', reading.toFixed(4));
    if (!motionAllowed()) return;
    const progress = key => clamp((height - rects[key].top) / (height + rects[key].height));
    if (rects.results.bottom > 0 && rects.results.top < height) {
      sections.results.style.setProperty('--chapter-drift', `${(progress('results') - .5) * 85}px`);
      sections.results.style.setProperty('--case-lift', `${(progress('results') - .5) * -45}px`);
    }
    if (rects.approach.bottom > 0 && rects.approach.top < height) {
      sections.approach.style.setProperty('--portrait-drift', `${(progress('approach') - .5) * 55}px`);
      sections.approach.style.setProperty('--precision-turn', `${progress('approach') * 210}deg`);
    }
    if (rects.journey.bottom > 0 && rects.journey.top < height) {
      sections.journey.style.setProperty('--journey-progress', clamp((height * .7 - rects.journey.top) / rects.journey.height).toFixed(4));
    }
    if (rects.stories.bottom > 0 && rects.stories.top < height) {
      const p = progress('stories') - .5;
      sections.stories.style.setProperty('--cinema-drift', `${p * -100}px`);
      frames.forEach((frame, index) => frame.style.setProperty('--story-offset', `${p * (index % 2 ? -62 : 62)}px`));
    }
    if (rects.contact.bottom > 0 && rects.contact.top < height) {
      sections.contact.style.setProperty('--orbit-turn', `${progress('contact') * 95}deg`);
      sections.contact.style.setProperty('--booking-drift', `${(progress('contact') - .5) * 55}px`);
    }
  }
  function scheduleScroll() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(renderScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  window.addEventListener('load', scheduleScroll, { once: true });
  new ResizeObserver(scheduleScroll).observe(document.body);

  function stopPreview() {
    if (!activePreview) return;
    activePreview.video.pause();
    activePreview.card.classList.remove('previewing');
    activePreview = null;
  }
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.story-card').forEach(card => {
    card.addEventListener('pointerenter', () => {
      if (!motionAllowed() || !finePointer.matches || document.hidden || document.querySelector('dialog[open]')) return;
      stopPreview();
      let video = previews.get(card);
      if (!video) {
        video = document.createElement('video');
        video.className = 'preview-video'; video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'none';
        video.setAttribute('aria-hidden', 'true'); video.setAttribute('tabindex', '-1');
        video.src = `assets/${videos[card.dataset.video].file}`;
        card.querySelector('img').after(video); previews.set(card, video);
      }
      activePreview = { card, video };
      video.play().then(() => { if (activePreview?.card === card) card.classList.add('previewing'); else video.pause(); }).catch(() => {});
    });
    card.addEventListener('pointerleave', () => { if (activePreview?.card === card) stopPreview(); });
    card.addEventListener('click', stopPreview);
  });
  const previewVisibility = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting && activePreview?.card === entry.target) stopPreview();
  }), { threshold: .1 });
  document.querySelectorAll('.story-card').forEach(card => previewVisibility.observe(card));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPreview(); else scheduleScroll(); });
  document.querySelectorAll('dialog').forEach(dialog => new MutationObserver(() => { if (dialog.open) stopPreview(); }).observe(dialog, { attributes: true, attributeFilter: ['open'] }));

  function updateMotionLabel() {
    const paused = !motionAllowed();
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', reducedMotion.matches
      ? t('Animations reduced by your device settings', 'Animaciones reducidas por la configuración de tu dispositivo')
      : paused ? t('Resume animations', 'Reanudar animaciones') : t('Pause animations', 'Pausar animaciones'));
    motionButton.querySelector('.motion-label').textContent = reducedMotion.matches
      ? t('Reduced motion', 'Movimiento reducido')
      : paused ? t('Resume motion', 'Reanudar movimiento') : t('Pause motion', 'Pausar movimiento');
    motionButton.disabled = reducedMotion.matches;
    document.body.dataset.motion = paused ? 'off' : 'on';
  }
  function applyMotionPreference() {
    if (!motionAllowed()) {
      stopPreview(); heroVideo.pause();
      document.getAnimations().filter(animation => !animation.effect?.target?.closest('dialog')).forEach(animation => {
        if (animation.effect?.getTiming().iterations !== Infinity) { try { animation.finish(); } catch {} }
      });
      document.querySelectorAll('.case-previous').forEach(image => image.remove());
    } else resumeHero();
    updateMotionLabel(); scheduleScroll();
  }
  motionButton.addEventListener('click', () => { motionPaused = !motionPaused; applyMotionPreference(); });
  reducedMotion.addEventListener('change', applyMotionPreference);
  document.addEventListener('languagechange', () => { updateMotionLabel(); scheduleScroll(); });
  updateMotionLabel(); scheduleScroll();
})();
