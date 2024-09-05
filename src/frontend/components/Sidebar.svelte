<script>
    import { Link } from 'svelte-routing';
    import { MessageSquare, Settings, Monitor, Activity } from 'lucide-svelte';
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';

    const currentRoute = writable(window.location.pathname);

    onMount(() => {
        const updateRoute = () => currentRoute.set(window.location.pathname);
        window.addEventListener('popstate', updateRoute);
        return () => window.removeEventListener('popstate', updateRoute);
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
            window.location.href = path;
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
