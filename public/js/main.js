document.addEventListener('DOMContentLoaded', () => {
    const loadStylesheetWhenVisible = (selector, href) => {
        const target = document.querySelector(selector);
        if (!target) return;

        const load = () => {
            if (document.querySelector(`link[href="${href}"]`)) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        };

        if (!('IntersectionObserver' in window)) {
            load();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries.some(entry => entry.isIntersecting)) {
                load();
                observer.disconnect();
            }
        });
        observer.observe(target);
    };

    loadStylesheetWhenVisible('#skills', '/css/devicon.min.css');
    loadStylesheetWhenVisible('#contact', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

    const videos = document.querySelectorAll('video');
    const loadVideo = (video) => {
        if (video.dataset.src) {
            video.src = video.dataset.src;
            delete video.dataset.src;
            video.load();
        }
    };

    if (!('IntersectionObserver' in window)) {
        videos.forEach(video => {
            loadVideo(video);
            if (!video.hasAttribute('data-play-on-hover')) {
                video.play().catch(() => {});
            }
        });
    } else {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    loadVideo(video);
                    if (!video.hasAttribute('data-play-on-hover')) {
                        video.play().catch(() => {});
                    }
                } else {
                    video.pause();
                }
            });
        }, { rootMargin: '200px 0px' });

        videos.forEach(video => videoObserver.observe(video));
    }

    document.querySelectorAll('video[data-play-on-hover]').forEach(video => {
        const card = video.closest('.event-card');
        if (!card) return;

        const play = () => {
            loadVideo(video);
            video.play().catch(() => {});
        };
        const pause = () => video.pause();

        if (window.matchMedia('(hover: hover)').matches) {
            card.addEventListener('mouseenter', play);
            card.addEventListener('mouseleave', pause);
        }

        card.addEventListener('focusin', play);
        card.addEventListener('focusout', pause);
    });

    const isMobile = window.innerWidth <= 768;
    const gridConfigs = {
        '.skills-grid': isMobile ? 2 : 4,
        '.events-grid': 5,
        '.friends-grid': 5,
        '.team-grid': 2
    };

    Object.entries(gridConfigs).forEach(([selector, modulo]) => {
        document.querySelectorAll(selector).forEach(grid => {
            Array.from(grid.children).forEach((child, index) => {
                if (!child.hasAttribute('data-aos-delay')) {
                    child.setAttribute('data-aos-delay', ((index % modulo) + 1) * 100);
                }
            });
        });
    });

    const projectFilters = document.querySelectorAll('.project-filter');
    const projectItems = document.querySelectorAll('.project-item');
    const visibleProjectCount = document.getElementById('visible-project-count');
    const projectMap = document.querySelector('.project-map');
    const mapProgressBar = document.querySelector('.map-progress i');
    const mapPrevButton = document.querySelector('[data-map-direction="prev"]');
    const mapNextButton = document.querySelector('[data-map-direction="next"]');

    const updateMapControls = () => {
        if (!projectMap) return;
        const maxScroll = Math.max(0, projectMap.scrollWidth - projectMap.clientWidth);
        const progress = maxScroll ? projectMap.scrollLeft / maxScroll : 0;

        if (mapProgressBar) mapProgressBar.style.transform = `scaleX(${progress})`;
        if (mapPrevButton) mapPrevButton.disabled = projectMap.scrollLeft <= 2;
        if (mapNextButton) mapNextButton.disabled = projectMap.scrollLeft >= maxScroll - 2;
    };

    if (projectMap && projectMap.classList.contains('manual-scroll-map')) {
        projectMap.addEventListener('scroll', updateMapControls, { passive: true });

        projectMap.addEventListener('wheel', event => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

            const maxScroll = projectMap.scrollWidth - projectMap.clientWidth;
            const movingForward = event.deltaY > 0 && projectMap.scrollLeft < maxScroll - 2;
            const movingBackward = event.deltaY < 0 && projectMap.scrollLeft > 2;

            if (movingForward || movingBackward) {
                event.preventDefault();
                projectMap.scrollLeft += event.deltaY;
            }
        }, { passive: false });

        let dragStartX = 0;
        let dragStartScroll = 0;
        let mapDragged = false;

        projectMap.addEventListener('pointerdown', event => {
            if (event.pointerType === 'touch' || event.button !== 0) return;
            dragStartX = event.clientX;
            dragStartScroll = projectMap.scrollLeft;
            mapDragged = false;
            projectMap.setPointerCapture(event.pointerId);
            projectMap.classList.add('is-dragging');
        });

        projectMap.addEventListener('pointermove', event => {
            if (!projectMap.hasPointerCapture(event.pointerId)) return;
            const distance = event.clientX - dragStartX;
            if (Math.abs(distance) > 5) mapDragged = true;
            projectMap.scrollLeft = dragStartScroll - distance;
        });

        const finishMapDrag = event => {
            if (projectMap.hasPointerCapture(event.pointerId)) projectMap.releasePointerCapture(event.pointerId);
            projectMap.classList.remove('is-dragging');
        };

        projectMap.addEventListener('pointerup', finishMapDrag);
        projectMap.addEventListener('pointercancel', finishMapDrag);
        projectMap.addEventListener('click', event => {
            if (mapDragged) {
                event.preventDefault();
                event.stopPropagation();
                mapDragged = false;
            }
        }, true);

        updateMapControls();
    }

    document.querySelectorAll('.map-control-button').forEach(button => {
        button.addEventListener('click', () => {
            if (!projectMap) return;
            const direction = button.dataset.mapDirection === 'next' ? 1 : -1;
            projectMap.scrollBy({ left: direction * Math.min(720, projectMap.clientWidth * 0.82), behavior: 'smooth' });
        });
    });

    projectFilters.forEach(button => {
        button.addEventListener('click', () => {
            const selectedCategory = button.dataset.filter;
            let visibleCount = 0;

            projectFilters.forEach(filterButton => {
                const isSelected = filterButton === button;
                filterButton.classList.toggle('is-active', isSelected);
                filterButton.setAttribute('aria-pressed', String(isSelected));
            });

            projectItems.forEach(item => {
                const isVisible = selectedCategory === 'all' || item.dataset.category === selectedCategory;
                item.classList.toggle('is-hidden', !isVisible);
                if (isVisible) visibleCount += 1;
            });

            document.querySelectorAll('.project-lane').forEach(lane => {
                lane.classList.toggle('is-hidden', selectedCategory !== 'all' && lane.dataset.lane !== selectedCategory);
            });

            if (projectMap) projectMap.scrollTo({ left: 0, behavior: 'smooth' });

            if (visibleProjectCount) {
                visibleProjectCount.textContent = visibleCount;
            }

            window.setTimeout(updateMapControls, 350);

            if (typeof AOS !== 'undefined') {
                AOS.refreshHard();
            }
        });
    });

    const horizontalPortfolio = document.querySelector('.horizontal-portfolio');
    const horizontalTrack = document.querySelector('.scroll-driven-track');
    const projectViewport = document.querySelector('.project-viewport');
    const scrollProgress = document.querySelector('.project-scroll-progress i');
    const currentProjectNumber = document.getElementById('current-project-number');

    if (horizontalPortfolio && horizontalTrack && projectViewport) {
        let horizontalDistance = 0;
        let scrollTicking = false;

        const measureHorizontalPortfolio = () => {
            horizontalDistance = Math.max(0, horizontalTrack.scrollWidth - projectViewport.clientWidth + 80);
            const travelHeight = Math.max(window.innerHeight * 3.5, horizontalDistance + window.innerHeight);
            horizontalPortfolio.style.height = `${travelHeight}px`;
        };

        const renderHorizontalPortfolio = () => {
            const sectionTop = horizontalPortfolio.offsetTop;
            const travel = Math.max(1, horizontalPortfolio.offsetHeight - window.innerHeight);
            const progress = Math.min(1, Math.max(0, (window.scrollY - sectionTop) / travel));
            const easedProgress = progress * progress * (3 - 2 * progress);

            horizontalTrack.style.transform = `translate3d(${-easedProgress * horizontalDistance}px, 0, 0)`;
            if (scrollProgress) scrollProgress.style.transform = `scaleX(${progress})`;
            if (currentProjectNumber) {
                currentProjectNumber.textContent = String(Math.min(17, Math.floor(progress * 17) + 1)).padStart(2, '0');
            }
            scrollTicking = false;
        };

        const requestPortfolioRender = () => {
            if (scrollTicking) return;
            scrollTicking = true;
            window.requestAnimationFrame(renderHorizontalPortfolio);
        };

        measureHorizontalPortfolio();
        renderHorizontalPortfolio();
        window.addEventListener('scroll', requestPortfolioRender, { passive: true });
        window.addEventListener('resize', () => {
            measureHorizontalPortfolio();
            requestPortfolioRender();
        });
    }

    if (history.scrollRestoration) {
        history.scrollRestoration = 'auto';
    }

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });

        window.addEventListener('load', () => {
            setTimeout(() => AOS.refresh(), 100);
        });
    }

    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        const birthdayDay = 27;
        const birthdayMonth = 3;

        const container = countdownElement.parentElement;
        const label = container.querySelector('p');

        function updateCountdown() {
            const now = new Date();
            let year = now.getFullYear();
            let birthday = new Date(year, birthdayMonth, birthdayDay);

            const isBirthday = now.getMonth() === birthdayMonth && now.getDate() === birthdayDay;

            if (isBirthday) {
                container.classList.add('is-birthday');
                if (label) {
                    label.innerText = 'Happy Birthday!';
                    label.classList.add('birthday-title');
                }
                countdownElement.innerHTML = `<span class="countdown-text">就在今天啦 🎉</span>`;
                countdownElement.classList.add('birthday-text');
                countdownElement.setAttribute('data-birthday', 'HAPPY BIRTHDAY');

                if (typeof confetti === 'function' && !window.confettiFired) {
                    window.confettiFired = true;
                    const duration = 15 * 1000;
                    const animationEnd = Date.now() + duration;
                    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                    function randomInRange(min, max) {
                        return Math.random() * (max - min) + min;
                    }

                    const interval = setInterval(function () {
                        const timeLeft = animationEnd - Date.now();

                        if (timeLeft <= 0) {
                            return clearInterval(interval);
                        }

                        const particleCount = 50 * (timeLeft / duration);
                        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
                    }, 250);

                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
                return;
            }

            container.classList.remove('is-birthday');
            if (label) {
                label.innerText = '距離生日還有：';
                label.classList.remove('birthday-title');
            }
            countdownElement.classList.remove('birthday-text');

            if (now > birthday) {
                birthday.setFullYear(year + 1);
            }

            const diff = birthday - now;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            countdownElement.innerHTML = `<span class="countdown-text">${days}天 ${hours}時 ${minutes}分 ${seconds}秒</span>`;

            const y = birthday.getFullYear();
            const m = String(birthday.getMonth() + 1).padStart(2, '0');
            const d = String(birthday.getDate()).padStart(2, '0');

            countdownElement.setAttribute('data-birthday', `${y}/${m}/${d}`);
        }

        container.addEventListener('click', () => {
            if (container.classList.contains('is-birthday') && typeof confetti === 'function') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        });

        setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                const navLinks = document.querySelector('.nav-links');
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        gsap.to(".laptop", {
            rotateY: "0deg",
            rotateX: "-5deg",
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: 1,
            }
        });

        gsap.to(".laptop", {
            y: -15,
            repeat: -1,
            yoyo: true,
            duration: 4,
            ease: "sine.inOut",
            scrollTrigger: {
                trigger: ".hero",
                start: "top bottom",
                end: "bottom top",
                toggleActions: "play pause resume pause"
            }
        });

        const codeSnippets = [
            'npm i discord.js', 'npm run start', 'pm2 start index.js --name "bot"',
            'node src/index.js', 'docker-compose up -d', 'npx prisma db push',
            'git commit -m "feat: add slash commands"', 'npm i @discordjs/rest discord-api-types',
            'client.login(process.env.TOKEN);', 'new SlashCommandBuilder().setName("ping");',
            'await interaction.reply({ content: "Pong!" });', 'const guild = await client.guilds.fetch(id);',
            'interaction.options.getString("target");', 'new ActionRowBuilder().addComponents(button);',
            'if (!interaction.isChatInputCommand()) return;', 'const member = interaction.member;',
            'channel.send({ embeds: [embed] });', 'client.on("ready", () => console.log("Bot Online!"));',
            'new EmbedBuilder().setColor("#5865F2");', 'await interaction.deferReply({ ephemeral: true });',
            'const collector = channel.createMessageComponentCollector();'
        ];

        function createFloatingCode() {
            const existing = document.querySelectorAll('.code-float');
            if (existing.length > 10) {
                existing[0].remove();
            }

            const span = document.createElement('span');
            span.className = 'code-float';
            span.innerText = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
            span.style.left = Math.random() * 95 + 'vw';
            span.style.top = Math.random() * 100 + 'vh';
            span.style.fontSize = (Math.random() * 0.5 + 0.5) + 'rem';
            document.body.appendChild(span);

            gsap.to(span, {
                y: -100,
                opacity: 0.2,
                duration: Math.random() * 10 + 8,
                ease: "none",
                onComplete: () => span.remove()
            });
        }

        setInterval(createFloatingCode, 8000);
    }

    const keysGrid = document.querySelector('.keys-grid');
    if (keysGrid) {
        for (let i = 0; i < 60; i++) {
            const key = document.createElement('div');
            key.className = 'key';
            keysGrid.appendChild(key);
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const gravatarImages = document.querySelectorAll('img[data-gravatar-email]');
    gravatarImages.forEach(img => {
        const email = img.getAttribute('data-gravatar-email');
        if (email && email.trim() !== '') {
            const hash = md5(email.trim().toLowerCase());
            img.src = `https://www.gravatar.com/avatar/${hash}?s=200&d=mp`;
        }
    });
});
