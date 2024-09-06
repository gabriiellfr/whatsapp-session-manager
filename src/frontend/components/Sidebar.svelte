<script>
    import { Link } from 'svelte-routing';
    import { MessageSquare, Settings, Monitor, Activity } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { currentRoute, updateCurrentRoute } from '../stores/routeStore';

    onMount(() => {
        window.addEventListener('popstate', updateCurrentRoute);
        return () => window.removeEventListener('popstate', updateCurrentRoute);
    });

    const tabs = [
        { name: 'chat', icon: MessageSquare, path: '/chat' },
        { name: 'status', icon: Activity, path: '/status' },
        { name: 'flow', icon: Settings, path: '/flow' },
        { name: 'monitor', icon: Monitor, path: '/monitor' },
    ];

    function handleKeydown(event, path) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            currentRoute.set(path);
            window.history.pushState({}, '', path);
        }
    }
</script>

<aside class="bg-gray-900 text-white w-20 flex flex-col items-center py-6">
    {#each tabs as { name, icon: Icon, path }}
        <Link
            to={path}
            class="mb-8 relative group hover:bg-gray-800 focus:bg-gray-800 rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 transform hover:scale-110"
            on:click={() => currentRoute.set(path)}
            on:keydown={(e) => handleKeydown(e, path)}
            aria-label={name}
        >
            <Icon
                size={28}
                class={$currentRoute === path
                    ? 'text-green-500'
                    : 'text-gray-400'}
            />
            {#if $currentRoute === path}
                <span
                    class="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-500 rounded-full"
                ></span>
            {/if}
        </Link>
    {/each}
</aside>
