@props(['featuredPosts' => []])
@push('styles')
    <style>
        /* تحسينات للأداء والسلاسة */
        .featuredSwiper {
            opacity: 0;
            transition: opacity 0.4s ease;
        }

        .featuredSwiper.swiper-ready {
            opacity: 1;
        }

        .featuredSwiper .swiper-slide {
            overflow: hidden;
            /* استخدام GPU للتحسين */
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
        }

        .anim-item {
            opacity: 0;
            will-change: transform, opacity;
            /* تحسين الأداء */
            transform: translateZ(0);
        }

        .bg-parallax {
            transform-origin: center;
            will-change: transform;
            transform: scale(1.05);
            /* تحسين التحولات */
            transition: transform 0.3s ease;
        }

        .bg-motion-layer {
            opacity: 0;
            background:
                radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.42), transparent 26%),
                radial-gradient(circle at 78% 28%, rgba(14, 165, 164, 0.35), transparent 28%),
                radial-gradient(circle at 30% 78%, rgba(255, 255, 255, 0.18), transparent 24%),
                linear-gradient(120deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0));
            mix-blend-mode: screen;
            filter: blur(10px);
            will-change: transform, opacity;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        /* تحسين أزرار التنقل */
        .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.65);
            width: 10px;
            height: 10px;
            opacity: 1;
            transition: all 0.3s ease;
            transform: translateZ(0);
        }

        .swiper-pagination-bullet-active {
            transform: scale(1.15);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
            background: var(--primary, #0ea5a4);
        }

        .nav-btn {
            transition: transform 0.3s ease, background 0.3s ease;
            transform: translateZ(0);
        }

        .nav-btn:hover {
            transform: translateY(-4px) scale(1.06);
            background: rgba(255, 255, 255, 0.95) !important;
        }

        /* تحسين النصوص */
        .slide-content-wrapper {
            transition: opacity 0.3s ease;
        }
    </style>
@endpush
<section id="featured-article">
    <div class="relative w-full">
        <div class="swiper featuredSwiper rounded-2xl w-full">
            <div class="swiper-wrapper">
                @forelse($featuredPosts ?? [] as $index => $post)
                    <div class="swiper-slide" data-slide-index="{{ $index }}">
                        <article class="relative w-full min-h-[60vh] sm:min-h-[70vh] lg:min-h-[calc(100vh-250px)]">

                            {{-- Background Image --}}
                            <div class="absolute inset-0 bg-cover bg-center bg-parallax"
                                style="background-image: url('{{ $post->media->first()?->getUrl('hero') ?? asset('assets/landing/background-3.jpg') }}')"
                                aria-hidden="true">
                            </div>

                            {{-- Motion Layer --}}
                            <div class="absolute inset-0 bg-motion-layer" aria-hidden="true">

                            </div>

                            {{-- Gradient Overlay --}}
                            <div
                                class="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-black/95 via-black/60 to-transparent">
                            </div>

                            {{-- Content --}}
                            <div
                                class="relative z-10 flex items-center rtl:pr-6 ltr:pl-6 min-h-[60vh] sm:min-h-[70vh] lg:min-h-[calc(100vh-250px)]">
                                <div
                                    class="slide-content-wrapper w-full sm:w-3/4 lg:w-1/2 px-4 sm:px-8 lg:px-10 text-center sm:text-start">

                                    <span
                                        class="anim-item inline-block rounded-lg bg-background/90 px-2.5 py-1 text-xs font-bold text-primary shadow-lg backdrop-blur-sm ring-1 ring-border">
                                        {{ $post->category?->name ?? 'أخبار' }}
                                    </span>

                                    @if (!empty($post->is_featured) && $post->is_featured)
                                        <span
                                            class="anim-item inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary shadow-sm">
                                            {{ __('blog::blog.Featured') }}
                                        </span>
                                    @endif

                                    <div class="space-y-2 my-4">
                                        <h2
                                            class="anim-item text-xl sm:text-2xl lg:text-3xl font-bold leading-12 text-primary">
                                            {{ $post->t('title') ?? '...' }}
                                        </h2>
                                        <p class="anim-item line-clamp-3 text-sm leading-7 text-white">
                                            {{ $post->t('description') ?? '...' }}
                                        </p>
                                    </div>

                                    <a href="{{ $post->link ?? '#' }}"
                                        class="anim-item inline-block bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                                        اقرأ المزيد
                                    </a>

                                </div>
                            </div>
                        </article>
                    </div>
                @empty
                <div>
                    <p>لا توجد مقالات مميزة.</p>
                </div>
                @endforelse
            </div>

            {{-- Pagination --}}
            <div class="swiper-pagination *:bg-primary!"></div>
        </div>

        {{-- Navigation Buttons --}}
     @if($featuredPosts->count() > 1)
        <div class="nav-btn swiper-button-prev size-11! flex! items-center! justify-center rounded-full! bg-primary/10! backdrop-blur-md! border! border-primary/20! text-primary! md:rtl:-right-6! md:ltr:-left-6! max-sm:top-3/4! hover:bg-primary/20! hover:scale-105! transition-all! *:size-6! *:stroke-2!"
            role="button" tabindex="0" aria-label="Previous slide">
        </div>

        <div class="nav-btn swiper-button-next size-11! flex! items-center! justify-center rounded-full! bg-primary/10! backdrop-blur-md! border! border-primary/20! text-primary! md:rtl:-left-6! md:ltr:-right-6! max-sm:top-3/4! hover:bg-primary/20! hover:scale-105! transition-all! *:size-6! *:stroke-2!"
            role="button" tabindex="0" aria-label="Next slide">
        </div>
     @endif
    </div>
</section>

@push('scripts')
    @vite('Modules/Blog/resources/assets/js/blogSwiper.js')
@endpush
