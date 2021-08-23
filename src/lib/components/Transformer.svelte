<script>
	import { isJson } from '$lib/utils/is-json';
	import { transform } from '$lib/utils/transform';

	let input = '';
	let copied = {};
	let errorMessage = null;
	let transformedJson = {};
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
			transformedJson = transformedValue.result;
			missingKeys = transformedValue.missingKeys;
			missingKeysDownloadHref = `data:application/octet-stream,${csvPair(missingKeys)}`;
		}
	}

	async function copy(group) {
		await navigator.clipboard.writeText(JSON.stringify(transformedJson[group], null, 2));
		copied[group] = true;

		setTimeout(() => {
			copied[group] = false;
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

<textarea
	bind:value={input}
	placeholder="Paste configuration object copied from consul"
	class="w-full px-2 py-1 border-2 border-gray-300 rounded h-80"
/>

{#each Object.keys(transformedJson) as group}
	<div class="mt-6">
		<div class="flex justify-between items-center px-2 py-4">
			<h3 class="text-lg font-medium">{group}</h3>

			<button
				class="px-4 py-1 text-sm bg-white text-gray-500 rounded-md hover:bg-gray-200 flex items-center"
				class:pointer-events-none={!input}
				class:opacity-60={!input}
				disabled={!input}
				on:click={() => copy(group)}
			>
				<svg
					class="mr-2 fill-current"
					viewBox="0 0 24 24"
					width="16"
					height="16"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M20 2H10c-1.11 0-2 .89-2 2v4H4c-1.11 0-2 .89-2 2v10a2 2 0 002 2h10c1.1 0 2-.9 2-2v-4h4c1.1 0 2-.9 2-2V4a2 2 0 00-2-2zM4 20V10h10v10H3.99zm16-6h-4v-4a2 2 0 00-2-2h-4V4h10v10z"
					/>
					<path d="M6 12h6v2H6zm0 4h6v2H6z" />
				</svg>

				{#if copied[group]}
					Copied!
				{:else}
					Copy
				{/if}
			</button>
		</div>

		<pre
			class="px-2 pt-1.5 pb-1 bg-gray-200 border border-gray-300 rounded-md whitespace-pre-wrap max-h-96 overflow-auto">
			{ JSON.stringify(transformedJson[group], null, 2) }
		</pre>
	</div>
{/each}

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
					<div class="w-2/3 px-1 overflow-x-hidden bg-gray-200 border border-gray-300">
						{setOfKeys.oldKey}
					</div>
					
					<div class="w-1/3 px-1 overflow-x-hidden bg-gray-200 border border-gray-300">
						{setOfKeys.newKey}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="flex justify-center w-full my-6">
		<a
			class="px-5 py-2 bg-white text-gray-500 rounded-md hover:bg-gray-200 flex items-center"
			href={missingKeysDownloadHref}
			download="missing-keys.csv"
		>
			<svg viewBox="0 0 24 24" class="mr-2 fill-current" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M14.31 16.38L13 17.64V12c0-.56-.45-1-1-1-.56 0-1 .44-1 1v5.59l-1.29-1.3c-.4-.4-1.03-.4-1.42-.01-.4.39-.4 1.02-.01 1.42l3 3c.18.18.44.29.71.29h-.01c.25-.01.5-.11.69-.28l3-2.9h-.01c.42-.36.48-.99.13-1.41-.36-.43-.99-.49-1.41-.14-.04.03-.08.06-.11.1z"
				/>
				<path
					d="M17.67 7l-.01-.01c-1.09-3.14-4.51-4.8-7.64-3.71-1.74.6-3.11 1.96-3.71 3.7v-.01a5 5 0 00-4.3 5.61c.13.98.55 1.9 1.21 2.65l-.01-.01c.27.48.88.64 1.36.37.48-.28.64-.89.37-1.37-.07-.11-.15-.21-.24-.29a3.003 3.003 0 012.24-5.01h.1l-.01-.01c.48 0 .9-.33 1-.8h-.01a3.992 3.992 0 014.71-3.13c1.57.31 2.8 1.54 3.12 3.12l-.01-.01c.09.47.51.8.99.8h.06-.01a2.988 2.988 0 012.24 4.99h-.01a.989.989 0 00.08 1.41c.18.16.41.24.66.25v-.001c.28-.01.56-.13.75-.34v-.01a5.009 5.009 0 00-3.09-8.34z"
				/>
			</svg>

			Download report
		</a>
	</div>
{/if}
