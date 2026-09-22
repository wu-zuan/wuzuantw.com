import { createBirthdayInk } from './birthday-ink.mjs?v=1';

const DAY = 86400000;
const TAIPEI_OFFSET = 8 * 60 * 60 * 1000;

// The birthday starts at midnight in Taiwan, independent of the visitor's zone.
export function getBirthdayState(nowMs = Date.now()) {
    const local = new Date(nowMs + TAIPEI_OFFSET);
    const year = local.getUTCFullYear();
    const thisBirthday = Date.UTC(year, 3, 27) - TAIPEI_OFFSET;
    const isBirthday = nowMs >= thisBirthday && nowMs < thisBirthday + DAY;
    const nextYear = nowMs >= thisBirthday + DAY ? year + 1 : year;
    const target = Date.UTC(nextYear, 3, 27) - TAIPEI_OFFSET;
    const remaining = Math.max(0, Math.ceil((target - nowMs) / 1000));
    return {
        isBirthday,
        date: `${nextYear}-04-27`,
        days: Math.floor(remaining / 86400),
        hours: Math.floor(remaining / 3600) % 24,
        minutes: Math.floor(remaining / 60) % 60,
        seconds: remaining % 60,
    };
}

export function initBirthday(container) {
    if (!container || container.dataset.birthdayReady) return;
    container.dataset.birthdayReady = 'true';
    const trigger = container.querySelector('.countdown-trigger');
    const timer = container.querySelector('#countdown');
    const details = container.querySelector('.birthday-details');
    const heading = container.querySelector('[data-birthday-heading]');
    const hint = container.querySelector('[data-birthday-hint]');
    const greeting = container.querySelector('.birthday-greeting');
    const date = container.querySelector('.birthday-date');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const ink = createBirthdayInk(container, motion);
    const values = [...container.querySelectorAll('[data-unit]')];
    let previous;
    let visible = true;
    let showingDate = false;
    let mouseInside = false;

    function update() {
        const state = getBirthdayState();
        container.classList.toggle('is-birthday', state.isBirthday);
        heading.textContent = showingDate ? '我的生日：' : state.isBirthday ? '今天是我的生日！' : '距離生日還有：';
        timer.hidden = showingDate || state.isBirthday;
        greeting.hidden = showingDate || !state.isBirthday;
        timer.setAttribute('aria-label', `${state.days}天 ${state.hours}時 ${state.minutes}分 ${state.seconds}秒`);
        date.dateTime = state.date;
        date.textContent = '04 / 27';

        for (const value of values) {
            const unit = value.dataset.unit;
            const next = unit === 'days' ? String(state[unit]) : String(state[unit]).padStart(2, '0');
            if (value.textContent === next) continue;
            value.textContent = next;
            if (previous && !showingDate && !state.isBirthday && !motion.matches && visible && !document.hidden) {
                value.animate?.([
                    { transform: 'translateY(7px) rotateX(-25deg)', opacity: .3 },
                    { transform: 'translateY(0) rotateX(0)', opacity: 1 },
                ], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
            }
        }
        previous = state;
    }

    function showDate(show) {
        const changed = showingDate !== show;
        const source = showingDate ? details : previous?.isBirthday ? greeting : timer;
        const from = changed && !motion.matches ? ink.capture(source) : [];
        showingDate = show;
        trigger.setAttribute('aria-expanded', String(show));
        details.hidden = !show;
        hint.textContent = hover.matches
            ? (show ? '移開恢復倒數' : '移入查看生日日期')
            : (show ? '點按恢復倒數' : '點按查看生日日期');
        container.classList.toggle('is-open', show);
        update();
        if (changed) ink.morph(from, ink.capture(show ? details : previous.isBirthday ? greeting : timer), show);
    }

    container.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') {
            mouseInside = true;
            showDate(true);
        }
    });
    container.addEventListener('pointerleave', event => {
        if (event.pointerType === 'mouse') {
            mouseInside = false;
            showDate(false);
        }
    });
    trigger.addEventListener('click', event => {
        // Mouse hover owns its state; touch and keyboard activation can toggle it.
        showDate(event.detail > 0 && mouseInside ? true : !showingDate);
    });
    trigger.addEventListener('keydown', event => {
        if (event.key === 'Escape') showDate(false);
    });
    trigger.addEventListener('blur', () => { if (!mouseInside) showDate(false); });
    hover.addEventListener('change', () => showDate(false));

    motion.addEventListener('change', () => {
        if (motion.matches) {
            container.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
        }
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            container.classList.toggle('is-offscreen', !visible);
            if (!visible) ink.stop();
            if (visible) update();
        });
        observer.observe(container);
    }
    document.addEventListener('visibilitychange', () => {
        container.classList.toggle('is-paused', document.hidden);
        if (!document.hidden) update();
    });
    showDate(false);
    trigger.disabled = false;
    window.setInterval(() => { if (visible && !document.hidden) update(); }, 1000);
}

if (typeof document !== 'undefined') {
    initBirthday(document.querySelector('.countdown-container'));
}
