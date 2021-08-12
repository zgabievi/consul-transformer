<script>
	import Header from '$lib/components/header/Header.svelte';
	import '../app.css';
</script>

<Header />

<main class="w-full max-w-2xl mx-auto">
	<slot></slot>
</main>