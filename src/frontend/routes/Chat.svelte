<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { MessageSquare } from 'lucide-svelte';

    import { contactsStore } from '../stores/contactsStore';
    import { messagesStore } from '../stores/messagesStore';

    import ContactList from '../components/chat/ContactList.svelte';
    import ChatHeader from '../components/chat/ChatHeader.svelte';
    import MessageList from '../components/chat/MessageList.svelte';
    import MessageInput from '../components/chat/MessageInput.svelte';

    let searchQuery = '';
    let message = { to: '', body: '' };
    let previousContactId = null;

    $: filteredContacts = $contactsStore.contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    $: if (
        $contactsStore.selectedContact &&
        $contactsStore.selectedContact.id !== previousContactId
    ) {
        messagesStore.fetchMessages($contactsStore.selectedContact.id);
        message.to = $contactsStore.selectedContact.id;
        previousContactId = $contactsStore.selectedContact.id;
    }

    function selectContact(contact) {
        contactsStore.selectContact(contact);
    }

    function sendMessage() {
        if (message.body.trim()) {
            messagesStore.sendMessage(message);
            message.body = '';
        }
    }

    onMount(() => {
        contactsStore.fetchContacts();
    });
</script>

<div class="flex h-full w-full bg-gray-900">
    <div class="w-1/3 border-r border-gray-700 flex flex-col bg-gray-800">
        <ContactList {filteredContacts} {selectContact} bind:searchQuery />
    </div>

    <div class="flex-1 flex flex-col bg-gray-900">
        {#if $contactsStore.selectedContact}
            <ChatHeader />
            <div class="flex-1 flex flex-col overflow-hidden">
                <div class="flex-1 overflow-y-auto">
                    <MessageList />
                </div>
                <div class="flex-shrink-0">
                    <MessageInput bind:message {sendMessage} />
                </div>
            </div>
        {:else}
            <div
                class="flex-1 flex items-center justify-center bg-gray-800"
                in:fade={{ duration: 300, easing: quintOut }}
            >
                <div class="text-center">
                    <MessageSquare
                        size={64}
                        class="text-green-500 mx-auto mb-4"
                    />
                    <p class="text-xl text-gray-300 font-medium">
                        Select a contact to start chatting
                    </p>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
    }

    :global(#app) {
        height: 100%;
        width: 100%;
    }
</style>
