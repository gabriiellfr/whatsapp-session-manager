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

<aside class="bg-teal-700 text-white w-20 flex flex-col items-center py-6">
    {#each tabs as { name, icon: Icon }}
        <button
            class="mb-8 relative group hover:bg-teal-600 focus:bg-teal-600 rounded-full p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            on:click={() => setActiveTab(name)}
            on:keydown={(e) => handleKeydown(e, () => setActiveTab(name))}
            aria-label={name}
        >
            <Icon
                size={28}
                class={activeTab === name ? 'text-white' : 'text-gray-300'}
            />
        </button>
    {/each}
</aside>
