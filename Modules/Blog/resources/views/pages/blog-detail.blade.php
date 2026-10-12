<x-layouts.app :title="$blog->title">
    @push('styles')
        <style>
            #reading-progress {
                transform-origin: right;
                transition: transform 0.1s ease-out;
            }



            .editorial-blockquote {
                border-right: 4px solid #003594;
            }

            .hover-lift {
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .hover-lift:hover {
                transform: translateY(-8px);
            }
        </style>
        @vite('resources/css/tiptap.css')
    @endpush
    <!-- Hero Section -->
    <header class="relative w-full h-[870px] overflow-hidden flex items-end">
        <div class="absolute inset-0 z-0">
            <img alt="Hero Background" class="w-full h-full object-cover grayscale-[20%] brightness-75 scale-105"
                data-alt="A cinematic, low-angle shot of a grand, sun-drenched library with towering dark wood bookshelves reaching towards a vaulted ceiling. Soft morning light filters through large arched windows, illuminating dust motes dancing in the air. The scene is captured in a rich, editorial style with deep primary blues and warm wooden tones, evoking a sense of profound intellectual discovery and timeless wisdom."
                src="{{ $media->getUrl('hero') }}">
            <div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>
        <div class="relative z-10 w-full px-4 md:px-6 pb-20">
            <div class="max-w-[1200px] mx-auto">
                <div
                    class="inline-block px-3 py-1 bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary rounded-lg mb-6 font-label-md">
                    {{ $blog->category->name }}
                </div>
                <h1
                    class="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-8 leading-tight max-w-[900px]">
                    {{ $blog->title }}
                </h1>
                <div class="flex flex-wrap items-center gap-6 text-on-surface-variant font-label-md">
                    <span class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">calendar_today</span>
                        {{ $blog->created_at->translatedFormat('d M Y') }}
                    </span>
                    <span class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-[20px]">schedule</span>
                        {{ $blog->created_at->diffForHumans() }}
                    </span>
                </div>
            </div>
        </div>
    </header>
    <!-- Article Content -->
    <article class="relative z-20 -mt-16 bg-background rounded-t-[3rem] px-4 pt-20">
        <div class="max-w-5xl mx-auto tiptap ProseMirror prose">
            {!! $blog->content !!}
        </div>
    </article>
    <!-- Related Articles Section -->
    <section class="py-8 mt-8">
        <div class="max-w-300 mx-auto px-gutter">
            <div class="flex justify-between items-end mb-12">
                <div>
                    <h3 class="font-headline-md text-headline-md text-on-surface mb-2">مقالات ذات صلة</h3>
                    <p class="font-body-md text-on-surface-variant">تابع رحلة الاستكشاف في عالم التصميم والفكر</p>
                </div>
            </div>
            {{-- Articles Grid --}}
            <div class="grid grid-cols-1 gap-5  sm:grid-cols-2 xl:grid-cols-3">
                @forelse ($relatedPosts as $article)
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
        </div>
    </section>
</x-layouts.app>
