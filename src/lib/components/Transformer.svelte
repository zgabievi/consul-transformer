<script>
	import { isJson } from '$lib/utils/is-json';
	import { transform } from '$lib/utils/transform';

	let input = '';
	let copied = false;
	let errorMessage = null;
	let transformedJson = JSON.stringify({}, null, 2);
	let missingKeysDownloadHref = '';
	let missingKeys = [];

	$: transformConfig(input);

	function transformConfig(value) {
		if (value) {
			if (!isJson(value)) {
				errorMessage = 'You have entered invalid JSON. Please paste correct configuration object.';
				return;
			}

			errorMessage = null;
			const transformedValue = transform(value);
			transformedJson = JSON.stringify(transformedValue.result, null, 2);
			missingKeys = transformedValue.missingKeys;
			missingKeysDownloadHref = `data:application/octet-stream,${csvPair(missingKeys)}`;
		}
	}

	async function copy() {
		await navigator.clipboard.writeText(transformedJson);
		copied = true;

		setTimeout(() => {
			copied = false;
		}, 1000);
	}

	function csvPair(arr) {
		return [{ oldKey: 'OLD VERSION', newKey: 'NEW VERSION' }, ...arr]
			.map(({ oldKey, newKey }) => `${oldKey}%2C${newKey}`)
			.join('%0A');
	}
</script>

{#if errorMessage}
	<div class="flex items-center px-6 py-4 mb-6 text-red-500 bg-red-200 rounded-md">
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current">
			<path
				d="M12 2h-.01c-5.53 0-10 4.47-10 10 0 5.52 4.47 10 10 9.99 5.52-.01 10-4.48 9.99-10.01 0-5.53-4.48-10-10-10zm2.71 11.29c.39.38.39 1.02 0 1.41h-.02c-.39.39-1.03.39-1.42 0l-.01-.01-1.29-1.3-1.29 1.3h-.01c-.39.39-1.03.39-1.42 0l-.01-.01a.999.999 0 01-.01-1.42v-.01l1.3-1.29-1.3-1.29-.01-.01a.99.99 0 010-1.42.99.99 0 011.42 0l1.29 1.3 1.29-1.3h-.01c.39-.4 1.02-.4 1.42-.01.39.39.39 1.02 0 1.42l-1.3 1.29z"
			/>
		</svg>
		<span class="ml-2 text-sm font-medium">{errorMessage}</span>
	</div>
{/if}

{#if input && missingKeys.length}
	<div class="flex items-center px-6 py-4 mb-6 text-yellow-500 bg-yellow-200 rounded-md">
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current">
			<path
				d="M12 2h-.01c-5.53 0-10 4.47-10 10 0 5.52 4.47 10 10 9.99 5.52-.01 10-4.48 9.99-10.01 0-5.53-4.48-10-10-10zm2.71 11.29c.39.38.39 1.02 0 1.41h-.02c-.39.39-1.03.39-1.42 0l-.01-.01-1.29-1.3-1.29 1.3h-.01c-.39.39-1.03.39-1.42 0l-.01-.01a.999.999 0 01-.01-1.42v-.01l1.3-1.29-1.3-1.29-.01-.01a.99.99 0 010-1.42.99.99 0 011.42 0l1.29 1.3 1.29-1.3h-.01c.39-.4 1.02-.4 1.42-.01.39.39.39 1.02 0 1.42l-1.3 1.29z"
			/>
		</svg>
		<span class="ml-2 text-sm font-medium">
			There are some keys missing in the config you've pasted. Scroll down to see them.
		</span>
	</div>
{/if}

<textarea bind:value={input} class="w-full px-2 py-1 border-2 border-gray-300 rounded h-80" />

<pre
	class="px-2 pt-1.5 pb-1 mt-6 bg-gray-200 border border-gray-300 rounded-md whitespace-pre-wrap max-h-96 overflow-scroll">
{ transformedJson }
</pre>

<div class="flex justify-center w-full mt-6">
	<button
		class="px-4 py-1 text-white bg-purple-500 rounded-md hover:bg-purple-400"
		class:pointer-events-none={!input}
		class:opacity-60={!input}
		disabled={!input}
		on:click={copy}
	>
		{#if copied}
			Copied!
		{:else}
			Copy
		{/if}
	</button>
</div>

{#if input && missingKeys.length}
	<div>
		<hr class="my-4" />

		<h2 class="text-xl font-bold">MISSING KEYS</h2>

		<div class="flex flex-wrap my-6 space-y-2 text-orange-500 bg-orange-200 rounded-md">
			<div class="flex items-center w-full space-x-2">
				<div class="w-2/3 px-1 font-medium">OLD VARIANT</div>
				<div class="w-1/3 px-1 font-medium">NEW VARIANT</div>
			</div>

			{#each missingKeys as setOfKeys}
				<div class="flex items-center w-full space-x-2">
					<div class="w-2/3 px-1 overflow-x-scroll bg-gray-200 border border-gray-300">
						{setOfKeys.oldKey}
					</div>
					<div class="w-1/3 px-1 overflow-x-scroll bg-gray-200 border border-gray-300">
						{setOfKeys.newKey}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="flex justify-center w-full my-6">
		<a
			class="px-4 py-1 text-white bg-purple-500 rounded-md hover:bg-purple-400"
			href={missingKeysDownloadHref}
			download="missing-keys.csv"
		>
			Download report
		</a>
	</div>
{/if}
