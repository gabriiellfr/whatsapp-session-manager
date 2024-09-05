import { writable } from 'svelte/store';
import { api } from '../utils/api';

function createMessagesStore() {
    const { subscribe, set, update } = writable({
        messages: [],
        isLoading: false,
    });

    return {
        subscribe,
        fetchMessages: async (chatId) => {
            update((store) => ({ ...store, isLoading: true }));
            try {
                const messages = await api.get(`/contacts/${chatId}/messages`);
                update((store) => ({ ...store, messages, isLoading: false }));

                console.log(messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
                update((store) => ({ ...store, isLoading: false }));
            }
        },
        sendMessage: async (message) => {
            try {
                await api.post('/sendMessage', message);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        },
        handleIncomingMessage: (data) => {
            console.log(data);
            update((store) => {
                if (
                    !store.messages.some(
                        (message) => message.id.id === data.id.id
                    )
                ) {
                    return { ...store, messages: [...store.messages, data] };
                }
                return store;
            });
        },
    };
}

export const messagesStore = createMessagesStore();
