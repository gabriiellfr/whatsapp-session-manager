<script>
    import { MessageSquare, Settings, Monitor, Activity } from 'lucide-svelte';
    export let activeTab;
    export let setActiveTab;

    const tabs = [
        { name: 'chat', icon: MessageSquare },
        { name: 'status', icon: Activity },
        { name: 'flow', icon: Settings },
        { name: 'monitor', icon: Monitor },
    ];

    function handleKeydown(event, action) {
        if (event.key === 'Enter' || event.key === ' ') {
            action();
            event.preventDefault();
        }
    }
</script>

<aside class="bg-gray-900 text-white w-20 flex flex-col items-center py-6">
    {#each tabs as { name, icon: Icon }}
        <button
            class="mb-8 relative group hover:bg-gray-800 focus:bg-gray-800 rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-110"
            on:click={() => setActiveTab(name)}
            on:keydown={(e) => handleKeydown(e, () => setActiveTab(name))}
            aria-label={name}
        >
            <Icon
                size={28}
                class={activeTab === name ? 'text-green-500' : 'text-gray-400'}
            />
            {#if activeTab === name}
                <span
                    class="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500 rounded-full"
                ></span>
            {/if}
        </button>
    {/each}
</aside>
