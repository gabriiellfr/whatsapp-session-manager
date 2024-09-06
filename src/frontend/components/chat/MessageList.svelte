<script>
    import { onMount, afterUpdate } from 'svelte';
    import { slide } from 'svelte/transition';
    import { messagesStore } from '../../stores/messagesStore';

    let messageContainer;

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    function scrollToBottom() {
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }

    $: if ($messagesStore.messages) {
        setTimeout(scrollToBottom, 500);
    }

    onMount(scrollToBottom);
    afterUpdate(scrollToBottom);
</script>

<div class="flex flex-col h-full bg-gray-900 text-gray-100">
    <div
        bind:this={messageContainer}
        class="flex-1 overflow-y-auto p-2 space-y-2"
    >
        {#if $messagesStore.isLoading}
            <div class="flex items-center justify-center h-full">
                <div class="animate-pulse space-y-2">
                    {#each Array(3) as _, i}
                        <div class="flex items-center space-x-2">
                            <div class="w-8 h-8 bg-gray-700 rounded-full"></div>
                            <div class="flex-1 space-y-1">
                                <div
                                    class="h-3 bg-gray-700 rounded w-3/4"
                                ></div>
                                <div
                                    class="h-3 bg-gray-700 rounded w-1/2"
                                ></div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {:else if $messagesStore.messages.length > 0}
            {#each $messagesStore.messages as msg (msg.id)}
                <div
                    class={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                    transition:slide|local={{ duration: 200 }}
                >
                    <div
                        class={`max-w-[75%] rounded-lg overflow-hidden ${
                            msg.fromMe
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-100'
                        }`}
                    >
                        <div class="p-2 text-sm">
                            <pre class="whitespace-pre-wrap break-words"><code
                                    >{msg.body}</code
                                ></pre>
                        </div>
                        <div
                            class={`px-2 py-1 text-xs ${
                                msg.fromMe
                                    ? 'bg-blue-700 text-blue-200'
                                    : 'bg-gray-700 text-gray-400'
                            }`}
                        >
                            {formatTimestamp(msg.timestamp)}
                        </div>
                    </div>
                </div>
            {/each}
        {:else}
            <div class="flex items-center justify-center h-full">
                <div class="text-center space-y-2">
                    <svg
                        class="w-12 h-12 mx-auto text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        ></path>
                    </svg>
                    <h3 class="text-lg font-semibold text-gray-300">
                        No messages yet
                    </h3>
                    <p class="text-sm text-gray-500">
                        Start a conversation to see messages appear here.
                    </p>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .overflow-y-auto {
        scrollbar-width: thin;
        scrollbar-color: #4b5563 #1f2937;
    }

    .overflow-y-auto::-webkit-scrollbar {
        width: 4px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
        background: #1f2937;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
        background-color: #4b5563;
        border-radius: 10px;
    }

    pre {
        margin: 0;
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.875rem;
        background-color: transparent;
        overflow-x: auto;
        white-space: pre-wrap;
        max-width: 100%;
    }

    code {
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.875rem;
        line-height: 1.4;
        color: inherit;
    }
</style>
