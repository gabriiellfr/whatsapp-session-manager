<script>
    import { fade, slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import {
        Power,
        RefreshCcw,
        StopCircle,
        ChevronDown,
        ChevronUp,
    } from 'lucide-svelte';

    import { statusStore } from '../stores/statusStore';

    import StatusDisplay from '../components/status/StatusDisplay.svelte';
    import QRCode from '../components/status/QRCode.svelte';
    import ClientInfo from '../components/status/ClientInfo.svelte';
    import InfoMessages from '../components/status/InfoMessages.svelte';

    let showInfoMessages = false;

    $: isConnected = $statusStore.status.status === 'ready';
</script>

<div
    class="h-full flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-800"
    in:fade={{ duration: 300, easing: quintOut }}
>
    <div class="h-auto max-w-3xl mx-auto space-y-6">
        <!-- Header -->
        <header class="bg-gray-600 p-6 rounded-lg shadow-md">
            <h1 class="text-2xl font-bold text-gray-100">
                WhatsApp Connection Manager
            </h1>
            <p class="text-sm text-gray-400 mt-1">
                Monitor and control your WhatsApp connection status
            </p>
        </header>

        <!-- QR Code -->
        {#if $statusStore.status.status === 'qr_ready' && $statusStore.status.statusInfo && $statusStore.status.statusInfo.qrUrl}
            <div class="flex justify-center">
                <QRCode qrUrl={$statusStore.status.statusInfo.qrUrl} />
            </div>
        {/if}

        <!-- Status Display -->
        <StatusDisplay status={$statusStore.status} />

        <!-- Action Buttons -->
        <div class="bg-gray-600 p-4 rounded-lg shadow-md">
            <div
                class="flex flex-col sm:flex-row gap-4 text-center justify-center"
            >
                <button
                    on:click={statusStore.initialize}
                    class="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200 font-semibold flex items-center justify-center text-sm"
                    disabled={isConnected}
                >
                    <Power size={16} class="mr-2" />
                    Initialize
                </button>
                <button
                    on:click={statusStore.reload}
                    class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 font-semibold flex items-center justify-center text-sm"
                >
                    <RefreshCcw size={16} class="mr-2" />
                    Reload
                </button>
                <button
                    on:click={statusStore.stop}
                    class="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 font-semibold flex items-center justify-center text-sm"
                >
                    <StopCircle size={16} class="mr-2" />
                    Stop
                </button>
                <button
                    on:click={statusStore.logout}
                    class="w-full sm:w-auto px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-200 font-semibold flex items-center justify-center text-sm"
                    disabled={!isConnected}
                >
                    <StopCircle size={16} class="mr-2" />
                    Logout
                </button>
            </div>
        </div>

        <!-- Client Info -->
        {#if $statusStore.status.clientInfo}
            <ClientInfo clientInfo={$statusStore.status.clientInfo} />
        {/if}

        <!-- Info Messages Toggle -->
        <div class="bg-gray-600 rounded-lg shadow-md overflow-hidden">
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
