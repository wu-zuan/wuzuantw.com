// Sample the site's own handwritten lettering; every strand starts and ends
// on a real glyph instead of substituting a separate animation font.
export function createBirthdayInk(container, motion) {
    const display = container.querySelector('.birthday-display');
    const canvas = document.createElement('canvas');
    canvas.className = 'birthday-ink';
    canvas.setAttribute('aria-hidden', 'true');
    display.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const scratch = document.createElement('canvas');
    const sample = scratch.getContext('2d', { willReadFrequently: true });
    if (!ctx || !sample) return { capture: () => [], morph() {}, stop() {} };

    let width = 0, height = 0, frame = 0, run = null;
    let points = [], active = false, lastTime = 0;
    const pointer = { x: .5, y: .5, targetX: .5, targetY: .5 };
    const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
    const ease = n => n * n * (3 - 2 * n);

    function size() {
        const rect = display.getBoundingClientRect();
        if (rect.width === width && rect.height === height) return;
        width = rect.width;
        height = rect.height;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        scratch.width = Math.ceil(width);
        scratch.height = Math.ceil(height);
    }

    function capture(element) {
        size();
        if (!width || !height || !element) return [];
        sample.clearRect(0, 0, width, height);
        const origin = display.getBoundingClientRect();
        const pieces = element.querySelectorAll('strong, .countdown-unit > span, .birthday-date');
        for (const el of pieces.length ? pieces : [element]) {
            const box = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            sample.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            sample.textBaseline = 'alphabetic';
            sample.fillStyle = '#fff';
            const text = el.textContent.trim();
            const metrics = sample.measureText(text);
            // Match centered line boxes without baking in a specific font size.
            const x = style.textAlign === 'center'
                ? box.left - origin.left + (box.width - metrics.width) / 2
                : box.left - origin.left + parseFloat(style.paddingLeft || 0);
            const y = box.top - origin.top + (box.height + metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
            sample.fillText(text, x, y);
        }
        const pixels = sample.getImageData(0, 0, scratch.width, scratch.height).data;
        const result = [];
        for (let x = 1; x < scratch.width; x += 2) {
            for (let y = 1; y < scratch.height; y += 2) {
                if (pixels[(y * scratch.width + x) * 4 + 3] > 75) result.push({ x, y });
            }
        }
        return result;
    }

    function stop() {
        cancelAnimationFrame(frame);
        frame = 0;
        run = null;
        points = [];
        ctx.clearRect(0, 0, width, height);
        container.classList.remove('is-inking');
    }

    function schedule() {
        if (!frame && !motion.matches && !document.hidden) frame = requestAnimationFrame(draw);
    }

    function draw(now) {
        frame = 0;
        const delta = Math.min((now - lastTime) || 16, 40);
        lastTime = now;
        const follow = 1 - Math.exp(-delta / 70);
        pointer.x += (pointer.targetX - pointer.x) * follow;
        pointer.y += (pointer.targetY - pointer.y) * follow;
        ctx.clearRect(0, 0, width, height);

        if (run) {
            const progress = clamp((now - run.start) / run.duration, 0, 1);
            points = run.from.map((from, i) => {
                const to = run.to[i];
                const local = ease(clamp((progress - (i % 11) * .012) / .868, 0, 1));
                const envelope = Math.sin(local * Math.PI);
                const direction = run.open ? 1 : -1;
                const curl = Math.sin(i * 2.399 + local * Math.PI * 2) * 15;
                const x = from.x + (to.x - from.x) * local
                    + envelope * ((pointer.x - .5) * 90 + Math.sin(i * .37) * 20);
                const y = from.y + (to.y - from.y) * local
                    + envelope * (curl * direction + (pointer.y - .5) * 32);
                return { x: clamp(x, 3, width - 3), y: clamp(y, 3, height - 3) };
            });

            // Sparse, long pen strands make the transition read as ink being
            // pulled between letters rather than generic confetti.
            const tension = Math.sin(progress * Math.PI);
            ctx.lineWidth = .65;
            for (let i = 0; i < points.length; i += 13) {
                const point = points[i];
                const from = run.from[i];
                const to = run.to[i];
                ctx.strokeStyle = i % 2 ? `rgba(112,0,255,${tension * .55})` : `rgba(0,242,255,${tension * .35})`;
                ctx.beginPath();
                ctx.moveTo(from.x + (point.x - from.x) * .65, from.y + (point.y - from.y) * .65);
                ctx.quadraticCurveTo(point.x, point.y + Math.sin(i) * 18 * tension,
                    point.x + (to.x - point.x) * .2, point.y + (to.y - point.y) * .2);
                ctx.stroke();
            }
            points.forEach((point, i) => {
                ctx.fillStyle = i % 7 === 0 && tension > .25 ? '#a36aff' : '#00f2ff';
                ctx.globalAlpha = .75 + (i % 4) * .08;
                ctx.fillRect(point.x, point.y, 1.65, 1.65);
            });
            ctx.globalAlpha = 1;
            if (progress === 1) {
                run = null;
                points = [];
                container.classList.remove('is-inking');
                ctx.clearRect(0, 0, width, height);
            }
        }

        // Two responsive ink threads remain below the date. They bend toward
        // the pointer, then stop rendering once its eased position settles.
        if (active && !run) {
            const end = Math.min(width - 8, 152);
            const y = height - 3;
            for (let i = 0; i < 2; i++) {
                ctx.strokeStyle = i ? 'rgba(112,0,255,.65)' : 'rgba(0,242,255,.7)';
                ctx.lineWidth = i ? .8 : 1.3;
                ctx.beginPath();
                ctx.moveTo(3, y - i * 3);
                ctx.bezierCurveTo(end * pointer.x, y - 6 - pointer.y * 12,
                    end * .7, y + 3 - pointer.x * 10, end, y - i * 3);
                ctx.stroke();
            }
        }
        if (run || Math.abs(pointer.x - pointer.targetX) + Math.abs(pointer.y - pointer.targetY) > .002) schedule();
    }

    function morph(from, to, open) {
        active = open;
        if (motion.matches || !from.length || !to.length || !visible()) {
            stop();
            return;
        }
        // A reversal starts from the current ink positions, even mid-stroke.
        const start = run && points.length ? points : from;
        const count = Math.min(850, Math.max(start.length, to.length));
        const spread = list => Array.from({ length: count }, (_, i) => list[Math.floor(i * list.length / count)]);
        run = { from: spread(start), to: spread(to), open, start: performance.now(), duration: open ? 1120 : 860 };
        container.classList.add('is-inking');
        schedule();
    }

    function visible() { return !document.hidden && !container.classList.contains('is-offscreen'); }

    container.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse' || motion.matches) return;
        const rect = display.getBoundingClientRect();
        pointer.targetX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        pointer.targetY = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        if (active || run) schedule();
    });
    motion.addEventListener('change', () => { if (motion.matches) stop(); });
    // Resizing invalidates the sampled coordinates. Show the live text until
    // the next deliberate interaction rather than stretching stale glyphs.
    if ('ResizeObserver' in window) new ResizeObserver(() => { stop(); size(); }).observe(display);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    return { capture, morph, stop };
}
