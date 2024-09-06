<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { MessageSquare, AlertTriangle, ArrowRight } from 'lucide-svelte';
    import { Link } from 'svelte-routing';

    import { contactsStore } from '../stores/contactsStore';
    import { messagesStore } from '../stores/messagesStore';
    import { statusStore } from '../stores/statusStore';
    import { currentRoute } from '../stores/routeStore';

    import ContactList from '../components/chat/ContactList.svelte';
    import ChatHeader from '../components/chat/ChatHeader.svelte';
    import MessageList from '../components/chat/MessageList.svelte';
    import MessageInput from '../components/chat/MessageInput.svelte';

    let searchQuery = '';
    let message = { to: '', body: '' };
    let previousContactId = null;
    let hasInitiallyFetchedContacts = false;

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

    $: if (
        $statusStore.status.status === 'ready' &&
        !hasInitiallyFetchedContacts
    ) {
        contactsStore.fetchContacts();
        hasInitiallyFetchedContacts = true;
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

    function goToStatusPage() {
        currentRoute.set('/status');
    }

    onMount(() => {
        if ($statusStore.status.status === 'ready') {
            contactsStore.fetchContacts();
            hasInitiallyFetchedContacts = true;
        }
    });
</script>

<div class="flex h-full w-full bg-gray-900 relative">
    {#if $statusStore.status.status !== 'ready'}
        <div
            class="absolute inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center"
            in:fade={{ duration: 300, easing: quintOut }}
            out:fade={{ duration: 300, easing: quintOut }}
        >
            <div class="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
                <AlertTriangle size={64} class="text-yellow-500 mx-auto mb-4" />
                <h2 class="text-2xl font-bold text-white mb-4">
                    Client Not Ready
                </h2>
                <p class="text-gray-300 mb-6">
                    The chat service is currently not ready. Please check the
                    status page for more information.
                </p>
                <Link
                    to="/status"
                    class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg transition-colors hover:bg-blue-700"
                    on:click={goToStatusPage}
                >
                    Go to Status Page
                    <ArrowRight class="ml-2" size={20} />
                </Link>
            </div>
        </div>
    {/if}

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
