<script>
    import { fade, slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { Power, StopCircle, ChevronDown, ChevronUp } from 'lucide-svelte';
    import StatusDisplay from './StatusDisplay.svelte';
    import QRCode from './QRCode.svelte';
    import ClientInfo from './ClientInfo.svelte';
    import InfoMessages from './InfoMessages.svelte';

    export let status;
    export let infoMessages;
    export let initialize;
    export let stop;

    let showInfoMessages = false;

    $: isConnected =
        status.status === 'ready' || status.status === 'authenticated';
</script>

<div
    class="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-100"
    in:fade={{ duration: 300, easing: quintOut }}
>
    <div class="max-w-3xl mx-auto space-y-4">
        <header class="bg-white p-4 rounded-lg shadow-sm">
            <h1 class="text-2xl font-bold text-gray-800">
                WhatsApp Connection Manager
            </h1>
            <p class="text-sm text-gray-600 mt-1">
                Monitor and control your WhatsApp connection status
            </p>
        </header>

        <StatusDisplay {status} />

        <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="flex space-x-4">
                <button
                    on:click={initialize}
                    class="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors duration-200 font-semibold flex items-center justify-center text-sm"
                    disabled={isConnected}
                >
                    <Power size={16} class="mr-2" />
                    Initialize
                </button>
                <button
                    on:click={stop}
                    class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 font-semibold flex items-center justify-center text-sm"
                    disabled={!isConnected}
                >
                    <StopCircle size={16} class="mr-2" />
                    Stop
                </button>
            </div>
        </div>

        {#if status.status === 'qr_ready' && status.statusInfo && status.statusInfo.qrUrl}
            <QRCode qrUrl={status.statusInfo.qrUrl} />
        {/if}

        {#if status.clientInfo}
            <ClientInfo clientInfo={status.clientInfo} />
        {/if}

        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <button
                on:click={() => (showInfoMessages = !showInfoMessages)}
                class="w-full px-4 py-3 flex justify-between items-center text-left focus:outline-none focus:bg-gray-50"
            >
                <span class="font-semibold text-gray-700">Info Messages</span>
                <svelte:component
                    this={showInfoMessages ? ChevronUp : ChevronDown}
                    size={20}
                    class="text-gray-500"
                />
            </button>
            {#if showInfoMessages}
                <div transition:slide|local>
                    <InfoMessages {infoMessages} />
                </div>
            {/if}
        </div>
    </div>
</div>
