<script>
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { Info, AlertTriangle } from 'lucide-svelte';

    export let infoMessages;

    function getIcon(info) {
        return info.error ? AlertTriangle : Info;
    }

    function getIconColor(info) {
        return info.error ? 'text-red-600' : 'text-teal-600';
    }
</script>

<ul class="space-y-4">
    {#each infoMessages as info}
        <li
            class="bg-gray-50 p-4 rounded-lg border border-gray-200"
            in:fly={{ y: 20, duration: 300, easing: quintOut }}
        >
            <div class="flex items-start">
                <svelte:component
                    this={getIcon(info)}
                    size={18}
                    class="{getIconColor(info)} mr-2 mt-1 flex-shrink-0"
                />
                <div>
                    <span class="font-semibold text-gray-800"
                        >{info.message}</span
                    >
                    {#if info.error}
                        <pre
                            class="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded overflow-x-auto">
                            {JSON.stringify(info.error, null, 2)}
                        </pre>
                    {/if}
                </div>
            </div>
        </li>
    {/each}
</ul>
