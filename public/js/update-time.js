document.addEventListener('DOMContentLoaded', () => {
    const updateTime = document.querySelector('.last-updated[data-update-mode="live"]');
    const time = updateTime?.querySelector('time');

    if (!time) return;

    const formatLocalTime = (date) => {
        const pad = value => String(value).padStart(2, '0');

        return [
            date.getFullYear(),
            pad(date.getMonth() + 1),
            pad(date.getDate())
        ].join('/') + ' ' + [
            pad(date.getHours()),
            pad(date.getMinutes()),
            pad(date.getSeconds())
        ].join(':');
    };

    const tick = () => {
        const now = new Date();
        time.dateTime = now.toISOString();
        time.textContent = formatLocalTime(now);
    };

    tick();
    window.setInterval(tick, 1000);
});
