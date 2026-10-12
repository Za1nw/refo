@php
    $categoryClasses = 'bg-background/95 text-primary ring-1 ring-border backdrop-blur-md';
@endphp

<article {{ $attributes->merge(['class' => 'group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-lg transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 lg:col-span-2']) }}>
    {{-- حاوية الصورة الرئيسية --}}
    <div class="relative h-[32rem] md:h-[36rem] lg:h-[40rem] w-full overflow-hidden">
        {{-- الصورة --}}
        <img src="{{ $article?->media?->first()?->getUrl('thumb_hd') }}"
             alt="{{ $article->title }}"
             class="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:saturate-110"
             loading="lazy" />

        {{-- طبقات التدرج لتحسين وضوح النص --}}
        <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/10"></div>
        <div class="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-black/30"></div>

        {{-- تأثيرات الضوء --}}
        <div class="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/20 blur-3xl transition-all duration-700 ease-out group-hover:scale-150 group-hover:bg-primary/30"></div>
        <div class="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl transition-all duration-700 ease-out group-hover:scale-150 group-hover:bg-primary/20"></div>
    </div>

    {{-- المحتوى فوق الصورة --}}
    <div class="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
        <div class="max-w-3xl">
            {{-- شارة التصنيف --}}
            <div class="mb-6">
                <span class="inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-bold shadow-xl shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 {{ $categoryClasses }}">
                    <span class="h-2 w-2 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
                    {{ $article->category->name }}
                </span>
            </div>

            {{-- البيانات الوصفية --}}
            <div class="mb-6 flex flex-wrap items-center gap-3">
                <div class="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/20">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ $article->created_at->format('M j, Y') }}
                </div>
                <div class="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/20">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ $article->created_at->diffForHumans() }}
                </div>
            </div>

            {{-- الخط الزخرفي --}}
            <div class="mb-6 h-1 w-20 rounded-full bg-linear-to-r from-primary to-primary/50 transition-all duration-500 ease-out group-hover:w-36 group-hover:from-primary group-hover:to-primary/80"></div>

            {{-- العنوان --}}
            <h3 class="mb-5 text-3xl font-bold leading-tight text-white transition-colors duration-300 group-hover:text-primary/90 md:text-4xl lg:text-5xl">
                {{ $article->title }}
            </h3>

            {{-- الملخص --}}
            <p class="mb-8 line-clamp-2 text-base leading-relaxed text-white/80 md:text-lg">
                {{ $article->description }}
            </p>

            {{-- زر الدعوة للإجراء --}}
            <a href="{{ route('client.blogs.show', $article) }}" class="group/btn relative inline-flex w-fit items-center gap-3 overflow-hidden rounded-xl bg-primary px-7 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 hover:brightness-110 active:scale-95">
                {{-- تأثير لمعان الزر --}}
                <span class="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full"></span>
                <span class="relative z-10">{{ $ctaLabel }}</span>
                <svg class="relative z-10 h-5 w-5 transition-all duration-300 group-hover/btn:-translate-x-1.5 group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </a>
        </div>
    </div>
</article>
