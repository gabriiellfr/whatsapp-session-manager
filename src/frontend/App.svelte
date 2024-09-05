<script>
    import { onMount, onDestroy } from 'svelte';
    import { v4 as uuidv4 } from 'uuid';

    import Sidebar from './components/Sidebar.svelte';
    import Header from './components/Header.svelte';

    import ChatArea from './components/chat/ChatArea.svelte';
    import StatusArea from './components/status/StatusArea.svelte';

    import FlowManager from './components/flow/FlowManager.svelte';
    import OngoingChatsMonitor from './components/monitor/OngoingChatsMonitor.svelte';

    let status = {};
    let message = { to: '', body: '' };
    let infoMessages = [];
    let ws;
    let activeTab = 'status';
    let contacts = [];
    let messages = [];
    let selectedContact = null;
    let searchQuery = '';
    let contactsFetched = false;
    let messagesFetched = false;
    let flows = [];
    let ongoingChats = new Map();

    onMount(() => {
        connectWebSocket();
        fetchFlows();
    });

    onDestroy(() => {
        if (ws) ws.close();
    });

    function connectWebSocket() {
        ws = new WebSocket(`ws://${window.location.host}`);

        ws.onmessage = (event) => {
            const { type, data } = JSON.parse(event.data);

            if (type === 'status') {
                status = data;

                if (status.status === 'ready' && !contactsFetched) {
                    fetchContacts();
                }
            } else if (type === 'info') {
                infoMessages = [...infoMessages, data];
            } else if (type === 'incoming_message') {
                handleIncomingMessage(data);
            } else if (type === 'ongoing_chat_update') {
                updateOngoingChat(data);
            }
        };

        ws.onclose = () => {
            console.log(
                'WebSocket connection closed. Attempting to reconnect...'
            );
            setTimeout(connectWebSocket, 5000);
        };
    }

    function handleIncomingMessage(data) {
        contacts = contacts.map((contact) => {
            if (contact.id === data.from) {
                const unreadCount = contact.unreadCount + 1;
                return {
                    ...contact,
                    unreadCount,
                    lastMessage: data.body,
                    timestamp: data.timestamp || Date.now(),
                };
            }
            return contact;
        });

        contacts.sort((a, b) => b.timestamp - a.timestamp);

        contacts = [...contacts];

        if (selectedContact && data.from === selectedContact.id) {
            messages = [...messages, data];
        }
    }

    async function fetchContacts() {
        if (contactsFetched) return;

        try {
            const response = await fetch('/api/contacts');
            contacts = await response.json();
            contactsFetched = true;
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        }
    }

    async function fetchMessages(chatId) {
        try {
            const response = await fetch(`/api/contacts/${chatId}/messages`);
            messages = await response.json();
            messagesFetched = true;
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    }

    async function fetchFlows() {
        try {
            const response = await fetch('/api/flows');

            flows = await response.json();
        } catch (error) {
            console.error('Failed to fetch flows:', error);
        }
    }

    async function initialize() {
        await fetch('/api/start', { method: 'POST' });
    }

    async function stop() {
        await fetch('/api/stop', { method: 'POST' });
    }

    async function sendMessage() {
        if (!message.body.trim()) return;

        const response = await fetch('/api/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
        });
        const result = await response.json();

        messages = [
            ...messages,
            {
                ...message,
                id: uuidv4(),
                fromMe: true,
                timestamp: new Date().getTime(),
            },
        ];

        message.body = '';
    }

    function setActiveTab(tab) {
        activeTab = tab;
    }

    function selectContact(contact) {
        if (message.to === contact.id) return;

        selectedContact = contact;
        message.to = contact.id;

        fetchMessages(contact.id);
    }

    function updateOngoingChat(chatData) {
        ongoingChats.set(chatData.chatId, chatData);
        ongoingChats = ongoingChats;
    }

    async function saveFlow(flow) {
        const method = flow.id ? 'PUT' : 'POST';
        const url = flow.id ? `/api/flows/${flow.id}` : '/api/flows';

        if (!flow.id) flow.id = uuidv4();

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flow),
            });
            if (response.ok) {
                await fetchFlows();
            }
        } catch (error) {
            console.error('Failed to save flow:', error);
        }
    }

    async function deleteFlow(flowId) {
        try {
            const response = await fetch(`/api/flows/${flowId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchFlows();
            }
        } catch (error) {
            console.error('Failed to delete flow:', error);
        }
    }

    $: filteredContacts = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
</script>

<main class="flex h-screen bg-gray-100">
    <Sidebar {activeTab} {setActiveTab} />
    <div class="flex-1 w-full flex flex-col bg-gray-100">
        <Header />
        <div class="flex-1 overflow-hidden flex w-full">
            {#if activeTab === 'chat'}
                <ChatArea
                    {filteredContacts}
                    {selectedContact}
                    {selectContact}
                    bind:searchQuery
                    bind:messages
                    bind:message
                    {sendMessage}
                />
            {:else if activeTab === 'status'}
                <StatusArea {status} {infoMessages} {initialize} {stop} />
            {:else if activeTab === 'flow'}
                <FlowManager {flows} {saveFlow} {deleteFlow} {fetchFlows} />
            {:else if activeTab === 'monitor'}
                <OngoingChatsMonitor {ongoingChats} />
            {/if}
        </div>
    </div>
</main>

<style global lang="postcss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    body {
        @apply bg-gray-100 text-gray-900 font-sans;
    }

    ::-webkit-scrollbar {
        width: 6px;
    }

    ::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
</style>
