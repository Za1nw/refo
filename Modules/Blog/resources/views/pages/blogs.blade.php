<x-layouts.app :title="__('blog::blog.news_section_title')" :isTransparent="true">
    <div class="blog-root mx-auto w-full pt-20! px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

        @if (isset($featuredPosts) && $featuredPosts->isNotEmpty())
            <x-blog::hero-blog :featured-posts="$featuredPosts" />
        @endif

        <section class="mt-10 fade-up container mx-auto max-w-7xl">

            {{-- ============================================
                 BLOG HEADER SECTION
                 ============================================ --}}
            <div class="text-center mb-16 lg:mb-24">
                {{-- Badge --}}
                <div
                    class="header-badge inline-flex items-center gap-2 px-5 py-2 bg-white/80 backdrop-blur-sm border border-primary/10 rounded-full mb-8 shadow-sm">
                    <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    <span class="text-primary text-sm font-semibold tracking-wide uppercase">
                        {{ __('blog::blog.news_section_title') }}
                    </span>
                </div>

                {{-- Title --}}
                <h2
                    class="header-title text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6 leading-tight tracking-tight">
                    {{ __('blog::blog.news_section_title') ?? 'آخر المقالات' }}
                </h2>

                {{-- Divider --}}
                <div class="flex items-center justify-center gap-4 mb-8">
                    <div class="w-16 h-0.5 bg-gradient-to-r from-transparent to-secondary/40 rounded-full"></div>
                    <div class="flex gap-2">
                        <div class="divider-dot w-2 h-2 bg-secondary rounded-full"></div>
                        <div class="divider-dot w-2 h-2 bg-primary rounded-full"></div>
                        <div class="divider-dot w-2 h-2 bg-secondary rounded-full"></div>
                    </div>
                    <div class="w-16 h-0.5 bg-gradient-to-l from-transparent to-secondary/40 rounded-full"></div>
                </div>

                {{-- Description --}}
                <p class="header-desc text-slate-500 max-w-3xl mx-auto text-lg lg:text-xl leading-relaxed font-medium">
                    {{ __('blog::blog.news_section_description') }}
                </p>
            </div>

            {{-- Articles Grid --}}
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                @forelse ($articles as $article)
                    <x-blog::blog-card :article="$article" />
                @empty
                    <div class="col-span-full rounded-2xl border border-border bg-card px-6 py-10 text-center">
                        <h3 class="text-lg font-semibold text-foreground">{{ __('blog::blog.empty_news_title') }}</h3>
                        <p class="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            {{ __('blog::blog.empty_news_message') }}
                        </p>
                    </div>
                @endforelse
            </div>

            {{-- Pagination --}}
            @if ($articles->hasPages())
                <div class="mt-10 flex items-center justify-center">
                    {{ $articles->onEachSide(0)->links('pagination::tailwind') }}
                </div>
            @endif
        </section>
    </div>
</x-layouts.app>
