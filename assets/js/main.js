document.addEventListener('DOMContentLoaded', () => {

    const initLazyLoading = () => {
        const lazyImages = document.querySelectorAll('img.lazyload');

        if ('IntersectionObserver' in window) {
            let lazyImageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        let lazyImage = entry.target;
                        if (lazyImage.dataset.src) {
                            lazyImage.src = lazyImage.dataset.src;
                            lazyImage.classList.remove('lazyload');
                            lazyImageObserver.unobserve(lazyImage);
                        }
                    }
                });
            });

            lazyImages.forEach(lazyImage => {
                lazyImageObserver.observe(lazyImage);
            });
        } else {
            lazyImages.forEach(lazyImage => {
                if (lazyImage.dataset.src) {
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove('lazyload');
                }
            });
        }
    };


    class TransformationSlider {
        constructor(containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) return;

            this.sliderList = this.container.querySelector('.transformation-slider__list');
            this.items = Array.from(this.sliderList.querySelectorAll('.transformation-slider__item'));
            this.prevButton = this.container.querySelector('.transformation-slider__arrow--prev');
            this.nextButton = this.container.querySelector('.transformation-slider__arrow--next');
            this.dots = Array.from(this.container.querySelectorAll('.transformation-slider__dot'));

            this.slides = [
                [0, 1],
                [2],
                [3, 4],
                [5],
                [6]
            ];

            this.currentIndex = 0;
            this.isMobile = window.innerWidth <= 768;

            this.init();
        }

        init() {
            if (this.isMobile) {
                this.setupMobileSlider();
            }
            this.addEventListeners();
            window.addEventListener('resize', this.handleResize.bind(this));
        }

        setupMobileSlider() {
            this.showSlide(this.currentIndex);


        }


        showSlide(index) {
            this.items.forEach(item => item.style.display = 'none');
            this.slides[index].forEach(i => {
                if (this.items[i]) {
                    this.items[i].style.display = 'flex';
                }
            });

            this.updateDots(index);

            this.updateButtons();
        }

        updateDots(index) {
            this.dots.forEach((dot, i) => {
                dot.classList.toggle('transformation-slider__dot--active', i === index);
            });
        }

        updateButtons() {
            const prevDisabled = this.currentIndex === 0;
            const nextDisabled = this.currentIndex === this.slides.length - 1;

            const setState = (btn, disabled) => {
                btn.classList.toggle('transformation-slider__arrow--disabled', disabled);
                btn.setAttribute('aria-disabled', String(disabled));
                if (disabled) {
                    btn.setAttribute('tabindex', '-1');
                } else {
                    btn.removeAttribute('tabindex');
                }
            };

            setState(this.prevButton, prevDisabled);
            setState(this.nextButton, nextDisabled);
        }

        nextSlide() {
            if (this.currentIndex < this.slides.length - 1) {
                this.currentIndex++;
                this.showSlide(this.currentIndex);
            }
        }

        prevSlide() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.showSlide(this.currentIndex);
            }
        }


        handleResize() {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;

            if (this.isMobile && !wasMobile) {
                this.setupMobileSlider();
            } else if (!this.isMobile && wasMobile) {
                this.resetDesktopView();
            }
        }

        resetDesktopView() {
            this.items.forEach(item => {
                item.style.display = 'block';
            });

            this.dots.forEach(dot => {
                dot.classList.remove('transformation-slider__dot--active');
            });
            this.dots[0].classList.add('transformation-slider__dot--active');
        }

        addEventListeners() {
            if (this.prevButton) {
                this.prevButton.addEventListener('click', () => this.prevSlide());
            }
            if (this.nextButton) {
                this.nextButton.addEventListener('click', () => this.nextSlide());
            }
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    this.currentIndex = index;
                    this.showSlide(index);
                });
            });
        }
    }

    class TournamentSlider {
        constructor(containerId, modalInstance) {
            this.container = document.getElementById(containerId);
            if (!this.container) return;

            this.modal = modalInstance;
            this.slider = this.container;
            this.prevButton = document.querySelector('.tournament-section__arrow--prev');
            this.nextButton = document.querySelector('.tournament-section__arrow--next');
            this.autoScrollDelay = 4000;

            this.cardsData = [
                {
                    name: "Хозе-Рауль Капабланка",
                    title: "Чемпион мира по шахматам",
                    image: "/assets/images/content/champion.svg",
                },
                {
                    name: "Эмануил Ласкер",
                    title: "Чемпион мира по шахматам",
                    image: "/assets/images/content/champion.svg",
                },
                {
                    name: "Александр Алехин",
                    title: "Чемпион мира по шахматам",
                    image: "/assets/images/content/champion.svg",
                },
                {
                    name: "Арон Нимцович",
                    title: "Чемпион мира по шахматам",
                    image: "/assets/images/content/champion.svg",
                },
                {
                    name: "Рихард Рети",
                    title: "Чемпион мира по шахматам",
                    image: "/assets/images/content/champion.svg",
                },
                {
                    name: "Остап Бендер",
                    title: "Чемпион мира по шахматам",
                    image: "/assets/images/content/champion.svg",
                }
            ];
            this.currentIndex = 0;
            this.cardWidth = 0;
            this.gap = 20;
            this.visibleCardsCount = 3;

            this.init();
        }

        init() {
            this.createCards();
            this.handleResize();
            this.updateTotalSlides();
            this.addEventListeners();
            this.startAutoScroll();
            this.setupIntersectionObserver();
            window.addEventListener('resize', this.handleResize.bind(this), {passive: true});
        }

        setupIntersectionObserver() {
            const options = {
                root: this.slider,
                threshold: 0.5,
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const cardIndex = parseInt(entry.target.dataset.index);
                        this.updateVisibleRange(cardIndex);
                    }
                });
            }, options);

            this.slider.querySelectorAll('.tournament-card').forEach((card, index) => {
                card.dataset.index = index;
                this.observer.observe(card);
            });
        }

        updateVisibleRange(cardIndex) {
            this.currentIndex = cardIndex;
            this.updateCounter();
        }

        updateCounter() {
            if (window.innerWidth <= 768) {
                const mobileCurrent = document.querySelector('[data-counter="current-mobile"]');
                const mobileTotal = document.querySelector('[data-counter="total-mobile"]');
                if (mobileCurrent) mobileCurrent.textContent = this.currentIndex + 1;
                if (mobileTotal) mobileTotal.textContent = this.cardsData.length;
            } else {
                const totalPages = Math.ceil(this.cardsData.length / this.visibleCardsCount);
                const currentPage = Math.floor(this.currentIndex / this.visibleCardsCount) + 1;
                const desktopCurrent = document.querySelector('[data-counter="current-desktop"]');
                const desktopTotal = document.querySelector('[data-counter="total-desktop"]');
                if (desktopCurrent) desktopCurrent.textContent = currentPage;
                if (desktopTotal) desktopTotal.textContent = totalPages;
            }
        }


        createCards() {
            this.slider.innerHTML = '';
            this.cardsData.forEach(data => {
                const card = document.createElement('div');
                card.className = 'tournament-card';
                card.innerHTML = `<img class="tournament-card__image lazyload" data-src="${data.image}" alt="${data.name}" />
<p class="tournament-card__name">${data.name}</p>
<p class="tournament-card__title">${data.title}</p>
<button class="tournament-card__button" data-name="${data.name}" data-description="${data.description}">Подробнее</button>`;
                this.slider.appendChild(card);
            });
            this.updateTotalSlides();
            this.addCardButtonListeners();
            initLazyLoading();
        }

        addCardButtonListeners() {
            this.slider.querySelectorAll('.tournament-card__button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const name = event.target.dataset.name;
                    const description = event.target.dataset.description;
                    if (this.modal) this.modal.open(name, description);
                });
            });
        }

        startAutoScroll() {
            this.autoScrollInterval = setInterval(() => {
                this.nextSlide();
            }, this.autoScrollDelay);
        }

        resetAutoScroll() {
            clearInterval(this.autoScrollInterval);
            this.startAutoScroll();
        }

        nextSlide() {
            if (window.innerWidth <= 768) {
                this.currentIndex = (this.currentIndex + 1) % this.cardsData.length;
            } else {
                const totalPages = Math.ceil(this.cardsData.length / this.visibleCardsCount);
                const currentPage = Math.floor(this.currentIndex / this.visibleCardsCount);
                const nextPage = (currentPage + 1) % totalPages;
                this.currentIndex = nextPage * this.visibleCardsCount;
            }
            this.render();
            this.resetAutoScroll();
        }

        prevSlide() {
            if (window.innerWidth <= 768) {
                this.currentIndex = (this.currentIndex - 1 + this.cardsData.length) % this.cardsData.length;
            } else {
                const totalPages = Math.ceil(this.cardsData.length / this.visibleCardsCount);
                const currentPage = Math.floor(this.currentIndex / this.visibleCardsCount);
                const prevPage = (currentPage - 1 + totalPages) % totalPages;
                this.currentIndex = prevPage * this.visibleCardsCount;
            }
            this.render();
            this.resetAutoScroll();
        }

        addEventListeners() {
            if (this.prevButton) this.prevButton.addEventListener('click', () => this.prevSlide());
            if (this.nextButton) this.nextButton.addEventListener('click', () => this.nextSlide());

            const mobilePrevButton = document.querySelector('.tournament-section__pagination--mobile .tournament-section__arrow--prev');
            const mobileNextButton = document.querySelector('.tournament-section__pagination--mobile .tournament-section__arrow--next');

            if (mobilePrevButton) mobilePrevButton.addEventListener('click', () => this.prevSlide());
            if (mobileNextButton) mobileNextButton.addEventListener('click', () => this.nextSlide());

            this.slider.addEventListener('mouseenter', () => clearInterval(this.autoScrollInterval));
            this.slider.addEventListener('mouseleave', () => this.resetAutoScroll());
            this.slider.addEventListener('touchstart', () => clearInterval(this.autoScrollInterval), {passive: true});
            this.slider.addEventListener('touchend', () => this.resetAutoScroll(), {passive: true});
        }

        handleResize() {
            const sliderWidth = this.slider.offsetWidth;
            if (window.innerWidth <= 768) {
                this.visibleCardsCount = 1;
                this.cardWidth = sliderWidth - this.gap;
            } else {
                this.visibleCardsCount = 3;
                this.cardWidth = (sliderWidth - (this.visibleCardsCount - 1) * this.gap) / this.visibleCardsCount;
            }

            this.slider.querySelectorAll('.tournament-card').forEach(card => {
                card.style.flexBasis = `${this.cardWidth}px`;
                card.style.minWidth = `${this.cardWidth}px`;
            });

            this.updateCounter();
        }

        render() {
            if (window.innerWidth <= 768) {
                const offset = this.currentIndex * (this.cardWidth + this.gap);
                this.slider.scrollTo({left: offset, behavior: 'smooth'});
            } else {
                const offset = this.currentIndex * (this.cardWidth + this.gap);
                this.slider.scrollTo({left: offset, behavior: 'smooth'});
            }
            this.updateCounter();
        }

        updateTotalSlides() {
            const totalPages = Math.ceil(this.cardsData.length / this.visibleCardsCount);

            const desktopTotal = document.querySelector('[data-counter="total-desktop"]');
            const mobileTotal = document.querySelector('[data-counter="total-mobile"]');

            if (desktopTotal) desktopTotal.textContent = totalPages;
            if (mobileTotal) mobileTotal.textContent = this.cardsData.length;
        }
    }

    initLazyLoading();
    new TransformationSlider('transformation-slider');
    new TournamentSlider('tournament-slider');

});


document.querySelectorAll('.hero-section__content, .debut-section__content, .chess-session__container, .transformation-section, .tournament-section')
    .forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);
        }
    });
}, {threshold: 0.15});

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

function createTickerHTML() {
    return `
        <section class="ticker-section">
            <div class="ticker ticker--red">
                <div class="ticker__inner">
                    <span>ДЕЛО ПОМОЩИ УТОПАЮЩИМ — ДЕЛО РУК САМИХ УТОПАЮЩИХ! </span>
                    <div class="ticker__dot"></div>
                    <span>ШАХМАТЫ ДВИГАЮТ ВПЕРЕД НЕ ТОЛЬКО КУЛЬТУРУ, НО И ЭКОНОМИКУ!</span>
                    <div class="ticker__dot"></div>
                    <span>ЛЕД ТРОНУЛСЯ, ГОСПОДА ПРИСЯЖНЫЕ ЗАСЕДАТЕЛИ!</span>
                    <div class="ticker__dot"></div>
                </div>
            </div>
        </section>
    `;
}

const topContainer = document.getElementById('ticker-top');
const bottomContainer = document.getElementById('ticker-bot');

const tickerHTML = createTickerHTML();

if (topContainer) {
    topContainer.innerHTML = tickerHTML;
}
if (bottomContainer) {
    bottomContainer.innerHTML = tickerHTML;
}