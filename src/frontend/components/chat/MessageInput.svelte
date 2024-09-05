<script>
    import { Smile, Paperclip, Mic, Send } from 'lucide-svelte';

    export let message;
    export let sendMessage;
</script>

<div class="p-4 bg-gray-800">
    <form
        on:submit|preventDefault={sendMessage}
        class="flex items-center space-x-2"
    >
        <button
            type="button"
            class="p-2 text-gray-400 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full"
            aria-label="Add emoji"
        >
            <Smile size={24} />
        </button>
        <button
            type="button"
            class="p-2 text-gray-400 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full"
            aria-label="Attach file"
        >
            <Paperclip size={24} />
        </button>
        <input
            type="text"
            bind:value={message.body}
            placeholder="Type a message"
            class="flex-1 px-4 py-2 bg-gray-700 text-gray-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
        />
        {#if !message.body}
            <button
                type="button"
                class="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors duration-200"
                aria-label="Record voice message"
            >
                <Mic size={24} />
            </button>
        {:else}
            <button
                type="submit"
                class="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors duration-200"
                aria-label="Send message"
            >
                <Send size={24} />
            </button>
        {/if}
    </form>
</div>
