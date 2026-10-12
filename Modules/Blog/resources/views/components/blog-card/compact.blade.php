@php
	$categoryClasses = $article['tagClass'] ?? 'bg-primary/90 text-primary-foreground shadow-md';
@endphp

<article
	x-data="{
		rotateX: 0,
		rotateY: 0,
		mouseMoveHandler(e) {
			const rect = this.$el.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			const mouseX = e.clientX - centerX;
			const mouseY = e.clientY - centerY;
			const rotateX = (mouseY / (rect.height / 2)) * 10;
			const rotateY = (mouseX / (rect.width / 2)) * 10;
			this.rotateX = rotateX;
			this.rotateY = rotateY;
		},
		resetRotation() {
			this.rotateX = 0;
			this.rotateY = 0;
		}
	}"
	x-on:mousemove="mouseMoveHandler"
	x-on:mouseleave="resetRotation"
	:style="`transform: perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px); transition: transform 0.1s ease-out;`"
	{{ $attributes->merge(['class' => 'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-shadow duration-300 hover:shadow-2xl']) }}>

	<div class="relative h-48 overflow-hidden bg-muted">
		<img src="{{ $article->media->first()?->getUrl('medium') ?? asset('assets/landing/background-3.jpg') }}"
		     alt="{{ $article->title }}"
		     class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
		     loading="lazy" />

		<div class="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40"></div>

		<span class="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-lg ring-1 ring-white/20 backdrop-blur-sm {{ $categoryClasses }}">
			{{ $article->category?->name ?? 'Uncategorized' }}
		</span>
	</div>

	<div class="flex flex-1 flex-col justify-between p-5">
		<div class="space-y-2.5">
			<h3 class="text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
				<a href="{{ $herf }}" class="before:absolute before:inset-0 before:content-['']">
					{{ $article->title }}
				</a>
			</h3>
			<p class="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
				{{ $article->description }}
			</p>
		</div>

		<div class="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
			<div class="flex items-center gap-3 text-xs text-muted-foreground">
				<span class="inline-flex items-center gap-1.5 transition-transform group-hover:text-primary/80">
					<svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
					<span>{{ $article->created_at->format('Y-m-d') }}</span>
				</span>
				<span class="inline-flex items-center gap-1.5 transition-transform group-hover:text-primary/80">
					<svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{{ $article->created_at->diffForHumans() }}</span>
				</span>
			</div>

			<div class="relative z-10">
				<a href="{{ $herf }}"
				   class="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary focus:outline-hidden">
					<span>{{ $ctaLabel }}</span>
					<svg class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</div>
	</div>
</article>

