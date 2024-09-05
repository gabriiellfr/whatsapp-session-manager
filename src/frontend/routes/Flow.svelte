<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';

    import { flowsStore } from '../stores/flowsStore';

    import FlowManager from '../components/flow/FlowManager.svelte';

    onMount(() => {
        flowsStore.fetchFlows();
    });
</script>

<div
    in:fade={{ duration: 300 }}
    class="min-h-full w-full bg-gray-800 text-gray-100 p-4"
>
    <div class="container mx-auto">
        <h1 class="text-4xl font-bold mb-4">Flow Management</h1>
        <FlowManager />
    </div>
</div>

<style>
    /* You can add any route-specific styles here if needed */
</style>
