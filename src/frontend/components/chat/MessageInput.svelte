<script>
    import { Paperclip, Mic, Send } from 'lucide-svelte';

    import { messagesStore } from '../../stores/messagesStore';

    export let message;

    async function sendMessage() {
        if (message.body.trim()) {
            await messagesStore.sendMessage(message);
            message.body = '';
        }
    }
</script>

<div class="p-2 bg-gray-800">
    <form
        on:submit|preventDefault={sendMessage}
        class="flex items-center space-x-2"
    >
        <button
            type="button"
            class="p-2 bg-gray-800 text-gray-200 hover:text-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-200 rounded-full"
            aria-label="Attach file"
        >
            <Paperclip size={24} />
        </button>
        <input
            type="text"
            bind:value={message.body}
            placeholder="Type a message"
            class="flex-1 px-4 py-2 bg-white border-none rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {#if !message.body}
            <button
                type="button"
                class="p-2 bg-teal-700 text-white rounded-full hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors duration-200"
                aria-label="Record voice message"
            >
                <Mic size={24} />
            </button>
        {:else}
            <button
                type="submit"
                class="p-2 bg-teal-700 text-white rounded-full hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-colors duration-200"
                aria-label="Send message"
            >
                <Send size={24} />
            </button>
        {/if}
    </form>
</div>
