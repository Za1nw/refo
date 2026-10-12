@php
	$formattedIndex = $index ? str_pad((string) $index, 2, '0', STR_PAD_LEFT) : null;
@endphp

<article {{ $attributes->merge(['class' => 'group flex items-start gap-4 p-4 transition-all hover:bg-accent/30 sm:p-5']) }}>
	<div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border shadow-sm sm:h-20 sm:w-20">
		<img src="{{ $article->media->first()->getUrl('thumb_hd') }}" alt="{{ $article->title }}" class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" />
		<span class="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-md bg-background/90 text-[10px] font-bold text-primary backdrop-blur-sm sm:h-6 sm:w-6 sm:text-xs">
			{{ $formattedIndex }}
		</span>
	</div>
	<div class="min-w-0 flex-1">
		<div class="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
			<span class="rounded-md bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">{{ $article->category->name }}</span>
			<span>{{ $article->created_at->format('M j, Y') }}</span>
		</div>
		<h4 class="line-clamp-2 text-sm font-bold leading-6 text-foreground transition-colors group-hover:text-primary">
			{{ $article->title }}
		</h4>
		<div class="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
			<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
			{{ $article->created_at->diffForHumans() }}
		</div>
	</div>
</article>
