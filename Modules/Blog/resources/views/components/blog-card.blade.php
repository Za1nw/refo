@props([
	'article',
	'variant' => 'compact',
	'index' => null,
	'ctaLabel' => __('landing.view'),
])

@php
	$resolvedVariant = in_array($variant, ['featured', 'side'], true) ? $variant : 'compact';
@endphp

@include('blog::components.blog-card.' . $resolvedVariant, [
	'article' => $article,
	'index' => $index,
	'herf' => route('client.blogs.show', $article),
	'ctaLabel' => $ctaLabel,
	'attributes' => $attributes,
])
