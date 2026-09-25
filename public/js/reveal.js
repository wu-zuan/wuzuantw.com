document.addEventListener('DOMContentLoaded', () => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    document.documentElement.classList.add('reveal-enabled');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
            if (!isIntersecting) return;
            target.classList.add('is-revealed');
            observer.unobserve(target);
        });
    }, { rootMargin: '0px 0px -100px 0px' });

    elements.forEach(element => {
        const delay = Math.min(500, Number(element.dataset.aosDelay) || 0);
        element.style.setProperty('--reveal-delay', `${delay}ms`);
        observer.observe(element);
    });
});
