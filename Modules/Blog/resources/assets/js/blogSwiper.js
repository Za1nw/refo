// blogSwiper.js - باستخدام waapi.animate() من Anime.js + WAAPI
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { waapi, stagger } from 'animejs';

// ==================== Configuration ====================
const CONFIG = {
    autoplay: {
        delay: 6000,
        pauseOnMouseEnter: true,
        disableOnInteraction: false
    }
};

// ==================== Helpers ====================
const DIR = document.documentElement?.dir === 'rtl' ? -1 : 1;
const rtlX = (value) => value * DIR;

// ==================== Animation Presets ====================
const PRESETS = {
    fadeUp: {
        badge: { translateY: [30, 0], opacity: [0, 1], duration: 600 },
        title: { translateY: [40, 0], opacity: [0, 1], duration: 800 },
        text:  { translateY: [30, 0], opacity: [0, 1], duration: 700 },
        cta:   { translateY: [20, 0], opacity: [0, 1], duration: 600 }
    },
    slideRight: {
        badge: { translateX: [rtlX(40), 0], opacity: [0, 1], duration: 600 },
        title: { translateX: [rtlX(50), 0], opacity: [0, 1], duration: 800 },
        text:  { translateX: [rtlX(40), 0], opacity: [0, 1], duration: 700 },
        cta:   { translateX: [rtlX(25), 0], opacity: [0, 1], duration: 600 }
    },
    slideLeft: {
        badge: { translateX: [rtlX(-40), 0], opacity: [0, 1], duration: 600 },
        title: { translateX: [rtlX(-50), 0], opacity: [0, 1], duration: 800 },
        text:  { translateX: [rtlX(-40), 0], opacity: [0, 1], duration: 700 },
        cta:   { translateX: [rtlX(-25), 0], opacity: [0, 1], duration: 600 }
    },
    scaleUp: {
        badge: { scale: [0.8, 1], opacity: [0, 1], duration: 600 },
        title: { scale: [0.9, 1], opacity: [0, 1], duration: 800 },
        text:  { scale: [0.9, 1], opacity: [0, 1], duration: 700 },
        cta:   { scale: [0.85, 1], opacity: [0, 1], duration: 600 }
    }
};

// ==================== SlideAnimator Class ====================
class SlideAnimator {
    constructor() {
        this.presetKeys = Object.keys(PRESETS);
        this.lastPreset = null;
        this.animations = [];
    }

    getRandomPreset() {
        const available = this.presetKeys.filter(p => p !== this.lastPreset);
        const preset = available[Math.floor(Math.random() * available.length)];
        this.lastPreset = preset;
        return preset;
    }

    getElements(slide) {
        if (!slide) return null;
        return {
            badge: slide.querySelector('span.anim-item'),
            title: slide.querySelector('h2.anim-item'),
            text:  slide.querySelector('p.anim-item'),
            cta:   slide.querySelector('a.anim-item, button.anim-item'),
            image: slide.querySelector('.bg-parallax'),
            motion: slide.querySelector('.bg-motion-layer')
        };
    }

    // إلغاء جميع الأنميشنات النشطة
    cancelAll() {
        this.animations.forEach(anim => {
            try { anim.cancel(); } catch(e) {}
        });
        this.animations = [];
    }

    // إعادة تعيين السلايد للحالة الأولية
    resetSlide(slide) {
        const els = this.getElements(slide);
        if (!els) return;

        this.cancelAll();

        // تعيين العناصر النصية للحالة المخفية
        [els.badge, els.title, els.text, els.cta].forEach(el => {
            if (!el) return;
            el.style.opacity = '0';
            el.style.transform = 'none';
        });

        // تعيين الخلفية للحالة الأولية
        if (els.image) {
            els.image.style.transform = 'scale(1.05)';
        }
        if (els.motion) {
            els.motion.style.opacity = '0';
            els.motion.style.transform = 'translateX(0)';
        }
    }

    // أنميشن الدخول باستخدام waapi.animate()
    animateEntrance(slide, presetName) {
        const els = this.getElements(slide);
        if (!els) return;

        this.cancelAll();

        const preset = PRESETS[presetName] || PRESETS.fadeUp;

        // أنميشن العناصر النصية
        const items = [
            { el: els.badge, props: preset.badge, delay: 0 },
            { el: els.title, props: preset.title, delay: 150 },
            { el: els.text,  props: preset.text,  delay: 300 },
            { el: els.cta,   props: preset.cta,   delay: 450 }
        ];

        items.forEach(({ el, props, delay }) => {
            if (!el) return;

            // 🔥 استخدام waapi.animate() من Anime.js
            const anim = waapi.animate(el, {
                ...props,
                delay: delay,
                ease: 'outExpo',
                onComplete: () => {
                    // 🔥 تثبيت القيم النهائية بعد انتهاء الأنميشن
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                }
            });

            this.animations.push(anim);
        });

        // أنميشن الخلفية
        if (els.image) {
            const anim = waapi.animate(els.image, {
                scale: [1.05, 1],
                duration: 4000,
                ease: 'linear',
                onComplete: () => {
                    els.image.style.transform = 'scale(1)';
                }
            });
            this.animations.push(anim);
        }

        // أنميشن الطبقة الحركية
        if (els.motion) {
            const anim = waapi.animate(els.motion, {
                opacity: [0, 0.2],
                translateX: [0, 8],
                duration: 4000,
                ease: 'linear',
                onComplete: () => {
                    els.motion.style.opacity = '0.2';
                    els.motion.style.transform = 'translateX(8px)';
                }
            });
            this.animations.push(anim);
        }
    }

    // أنميشن الخروج
    animateExit(slide) {
        const els = this.getElements(slide);
        if (!els) return;

        [els.badge, els.title, els.text, els.cta].forEach(el => {
            if (!el) return;

            const anim = waapi.animate(el, {
                opacity: [1, 0],
                translateY: [0, -10],
                duration: 250,
                ease: 'inCubic'
            });

            this.animations.push(anim);
        });
    }
}

// ==================== Initialize ====================
const initBlogSwiper = () => {
    const animator = new SlideAnimator();

    const swiper = new Swiper('.featuredSwiper', {
        modules: [Navigation, Pagination, Autoplay, EffectFade],

        loop: true,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        speed: 800,

        grabCursor: true,
        keyboard: { enabled: true, onlyInViewport: true },

        autoplay: CONFIG.autoplay,

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },

        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },

        on: {
            init(swiper) {
                swiper.el.style.opacity = '1';
                swiper.el.classList.add('swiper-ready');

                swiper.slides.forEach(slide => animator.resetSlide(slide));

                const firstSlide = swiper.slides[swiper.activeIndex];
                const preset = animator.getRandomPreset();

                setTimeout(() => {
                    animator.animateEntrance(firstSlide, preset);
                }, 300);
            },

            slideChangeTransitionStart(swiper) {
                const currentSlide = swiper.slides[swiper.previousIndex];
                const nextSlide = swiper.slides[swiper.activeIndex];

                animator.animateExit(currentSlide);
                animator.resetSlide(nextSlide);

                const preset = animator.getRandomPreset();

                setTimeout(() => {
                    animator.animateEntrance(nextSlide, preset);
                }, 150);
            },

            slideChangeTransitionEnd(swiper) {
                const prevSlide = swiper.slides[swiper.previousIndex];
                animator.resetSlide(prevSlide);
            }
        }
    });

    // التعامل مع visibility
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            swiper.autoplay?.stop();
            animator.cancelAll();
        } else {
            const slide = swiper.slides[swiper.activeIndex];
            animator.resetSlide(slide);
            const preset = animator.getRandomPreset();
            setTimeout(() => animator.animateEntrance(slide, preset), 200);
            swiper.autoplay?.start();
        }
    });

    window.__blogSwiper = { swiper, animator };
};

// بدء التشغيل
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogSwiper);
} else {
    initBlogSwiper();
}
