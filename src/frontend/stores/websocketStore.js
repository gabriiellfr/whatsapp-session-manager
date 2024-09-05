import { writable, get } from 'svelte/store';
import { statusStore } from './statusStore';
import { contactsStore } from './contactsStore';
import { messagesStore } from './messagesStore';

function createWebsocketStore() {
    const { subscribe, set, update } = writable({
        status: {},
        infoMessages: [],
    });

    let ws;

    function connect() {
        ws = new WebSocket(`ws://${window.location.host}`);

        ws.onmessage = (event) => {
            const { type, data } = JSON.parse(event.data);

            update((store) => {
                if (type === 'status') {
                    statusStore.updateStatus(data);
                    if (data.status === 'ready') {
                        contactsStore.fetchContacts();
                    }
                } else if (type === 'info') {
                    statusStore.addInfoMessage(data);
                } else if (type === 'incoming_message') {
                    const selectedContactId =
                        get(contactsStore).selectedContact;

                    const sender = data.fromMe ? data.to : data.from;

                    if (selectedContactId && selectedContactId.id === sender) {
                        messagesStore.handleIncomingMessage(data);
                    }

                    // Handle contact updates
                    contactsStore.handleIncomingMessage(data);
                } else if (type === 'ongoing_chat_update') {
                    // Handle ongoing chat update
                }
                return store;
            });
        };

        ws.onclose = () => {
            console.log(
                'WebSocket connection closed. Attempting to reconnect...'
            );
            setTimeout(connect, 5000);
        };
    }

    return {
        subscribe,
        connect,
        sendMessage: (message) => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(message));
            }
        },
    };
}

export const websocketStore = createWebsocketStore();
