<script>
    import { onMount, afterUpdate } from 'svelte';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { messagesStore } from '../../stores/messagesStore';

    let messageContainer;
    let autoscroll = true;

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    onMount(() => {
        scrollToBottom();
    });

    afterUpdate(() => {
        if (autoscroll) {
            scrollToBottom();
        }
    });

    function scrollToBottom() {
        messageContainer.scrollTo(0, messageContainer.scrollHeight);
    }

    function handleScroll() {
        const { scrollTop, scrollHeight, clientHeight } = messageContainer;
        const atBottom = scrollHeight - scrollTop - clientHeight < 20;
        autoscroll = atBottom;
    }
</script>

<div
    bind:this={messageContainer}
    on:scroll={handleScroll}
    class="flex-1 min-h-full overflow-y-auto bg-gray-600 p-2 sm:p-3 flex flex-col"
>
    {#if $messagesStore.isLoading}
        <div class="flex-1 flex items-center justify-center">
            <p
                class="text-gray-300 text-center bg-gray-800 rounded-lg p-3 shadow-sm text-sm"
            >
                Loading messages...
            </p>
        </div>
    {:else if $messagesStore.messages.length > 0}
        <div class="flex-1 flex flex-col justify-end">
            <div class="max-w-2xl mx-auto space-y-2 w-full">
                {#each $messagesStore.messages as msg (msg.id)}
                    <div
                        class={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                        in:fly={{ y: 20, duration: 300, easing: quintOut }}
                    >
                        <div
                            class={`max-w-[85%] rounded-lg p-2 shadow-sm
                                    ${
                                        msg.fromMe
                                            ? 'bg-green-900 text-white rounded-br-none'
                                            : 'bg-gray-700 text-gray-100 rounded-bl-none'
                                    }`}
                        >
                            <pre
                                class="whitespace-pre-wrap break-words text-sm font-sans"><code
                                    >{msg.body}</code
                                ></pre>
                            <div
                                class={`text-xs mt-1 ${msg.fromMe ? 'text-green-200' : 'text-gray-400'}`}
                            >
                                {formatTimestamp(msg.timestamp)}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        <div class="flex-1 flex items-center justify-center">
            <p
                class="text-gray-300 text-center bg-gray-800 rounded-lg p-3 shadow-sm text-sm"
            >
                No messages yet. Start a conversation!
            </p>
        </div>
    {/if}
</div>

<style>
    /* Custom scrollbar styles */
    .overflow-y-auto {
        scrollbar-width: thin;
        scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
    }

    .overflow-y-auto::-webkit-scrollbar {
        width: 4px;
    }

    .overflow-y-auto::-webkit-scrollbar-track {
        background: transparent;
    }

    .overflow-y-auto::-webkit-scrollbar-thumb {
        background-color: rgba(75, 85, 99, 0.5);
        border-radius: 20px;
        border: transparent;
    }

    /* Styles for pre and code tags */
    pre {
        margin: 0;
        font-family: inherit;
    }

    code {
        font-family: inherit;
    }
</style>
