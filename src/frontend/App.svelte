<script>
    import { Router, Link, Route } from 'svelte-routing';
    import { onMount } from 'svelte';

    import { websocketStore } from './stores/websocketStore';
    import { contactsStore } from './stores/contactsStore';
    import { flowsStore } from './stores/flowsStore';

    import Header from './components/Header.svelte';
    import Sidebar from './components/Sidebar.svelte';

    import Chat from './routes/Chat.svelte';
    import Status from './routes/Status.svelte';
    import Flow from './routes/Flow.svelte';

    export let url = '';

    onMount(() => {
        websocketStore.connect();
        flowsStore.fetchFlows();
    });
</script>

<Router {url}>
    <main class="flex h-screen bg-gray-900">
        <Sidebar />
        <div class="flex-1 w-full flex flex-col bg-gray-900">
            <Header />
            <div class="flex-1 overflow-auto w-full">
                <Route path="/chat" component={Chat} />
                <Route path="/status" component={Status} />
                <Route path="/flow" component={Flow} />
            </div>
        </div>
    </main>
</Router>

<style global lang="postcss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    body {
        @apply bg-gray-900 text-gray-100 font-sans;
    }

    ::-webkit-scrollbar {
        width: 6px;
    }

    ::-webkit-scrollbar-track {
        @apply bg-gray-800;
    }

    ::-webkit-scrollbar-thumb {
        @apply bg-gray-600;
        border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
        @apply bg-gray-500;
    }
</style>
