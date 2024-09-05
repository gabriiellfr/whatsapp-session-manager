<script>
    import ContactList from './ContactList.svelte';
    import ChatHeader from './ChatHeader.svelte';
    import MessageList from './MessageList.svelte';
    import MessageInput from './MessageInput.svelte';
    import { fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { MessageSquare } from 'lucide-svelte';

    export let filteredContacts;
    export let selectedContact;
    export let selectContact;
    export let searchQuery;
    export let messages;
    export let message;
    export let sendMessage;
    export let isLoading;
</script>

<div class="w-1/3 border-r border-gray-700 overflow-y-auto bg-gray-800">
    <ContactList {filteredContacts} {selectContact} bind:searchQuery />
</div>

<div class="flex-1 flex flex-col bg-gray-900">
    {#if selectedContact}
        <ChatHeader {selectedContact} />
        <MessageList {messages} {isLoading} />
        <MessageInput bind:message {sendMessage} />
    {:else}
        <div
            class="flex-1 flex items-center justify-center bg-gray-800"
            in:fade={{ duration: 300, easing: quintOut }}
        >
            <div class="text-center">
                <MessageSquare size={64} class="text-green-500 mx-auto mb-4" />
                <p class="text-xl text-gray-300 font-medium">
                    Select a contact to start chatting
                </p>
            </div>
        </div>
    {/if}
</div>
