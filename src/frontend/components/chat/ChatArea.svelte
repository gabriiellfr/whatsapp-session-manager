<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { MessageSquare } from 'lucide-svelte';

    import { contactsStore } from '../stores/contactsStore';
    import { messagesStore } from '../stores/messagesStore';

    import ContactList from '../components/ContactList.svelte';
    import ChatHeader from '../components/ChatHeader.svelte';
    import MessageList from '../components/MessageList.svelte';
    import MessageInput from '../components/MessageInput.svelte';

    let searchQuery = '';
    let message = { to: '', body: '' };

    $: filteredContacts = $contactsStore.contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    $: if ($contactsStore.selectedContact) {
        messagesStore.fetchMessages($contactsStore.selectedContact.id);
        message.to = $contactsStore.selectedContact.id;
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

<div class="w-1/3 border-r border-gray-700 overflow-y-auto bg-gray-800">
    <ContactList contacts={filteredContacts} {selectContact} bind:searchQuery />
</div>

<div class="flex-1 flex flex-col bg-gray-900">
    {#if $contactsStore.selectedContact}
        <ChatHeader contact={$contactsStore.selectedContact} />
        <MessageList
            messages={$messagesStore.messages}
            isLoading={$messagesStore.isLoading}
        />
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
