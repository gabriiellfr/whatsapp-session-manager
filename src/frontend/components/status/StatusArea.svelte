<script>
    import { fade, slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { Power, StopCircle, ChevronDown, ChevronUp } from 'lucide-svelte';

    import { statusStore } from '../../stores';

    import StatusDisplay from '../../components/StatusDisplay.svelte';
    import QRCode from '../../components/QRCode.svelte';
    import ClientInfo from '../../components/ClientInfo.svelte';
    import InfoMessages from '../../components/InfoMessages.svelte';

    let showInfoMessages = false;

    $: isConnected =
        $statusStore.status.status === 'ready' ||
        $statusStore.status.status === 'authenticated';
</script>

<div
    class="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-800"
    in:fade={{ duration: 300, easing: quintOut }}
>
    <div class="max-w-3xl mx-auto space-y-4">
        <header class="bg-gray-600 p-4 rounded-lg shadow-sm">
            <h1 class="text-2xl font-bold text-gray-100">
                WhatsApp Connection Manager
            </h1>
            <p class="text-sm text-gray-400 mt-1">
                Monitor and control your WhatsApp connection status
            </p>
        </header>

        <StatusDisplay status={$statusStore.status} />

        <div class="bg-gray-600 p-4 rounded-lg shadow-sm">
            <div class="flex space-x-4">
                <button
                    on:click={statusStore.initialize}
                    class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200 font-semibold flex items-center justify-center text-sm"
                    disabled={isConnected}
                >
                    <Power size={16} class="mr-2" />
                    Initialize
                </button>
                <button
                    on:click={statusStore.stop}
                    class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200 font-semibold flex items-center justify-center text-sm"
                    disabled={!isConnected}
                >
                    <StopCircle size={16} class="mr-2" />
                    Stop
                </button>
            </div>
        </div>

        {#if $statusStore.status.status === 'qr_ready' && $statusStore.status.statusInfo && $statusStore.status.statusInfo.qrUrl}
            <QRCode qrUrl={$statusStore.status.statusInfo.qrUrl} />
        {/if}

        {#if $statusStore.status.clientInfo}
            <ClientInfo clientInfo={$statusStore.status.clientInfo} />
        {/if}

        <div class="bg-gray-600 rounded-lg shadow-sm overflow-hidden">
            <button
                on:click={() => (showInfoMessages = !showInfoMessages)}
                class="w-full px-4 py-3 flex justify-between items-center text-left focus:outline-none"
            >
                <span class="font-semibold text-gray-200">Info Messages</span>
                <svelte:component
                    this={showInfoMessages ? ChevronUp : ChevronDown}
                    size={20}
                    class="text-gray-400"
                />
            </button>
            {#if showInfoMessages}
                <div transition:slide|local>
                    <InfoMessages infoMessages={$statusStore.infoMessages} />
                </div>
            {/if}
        </div>
    </div>
</div>
