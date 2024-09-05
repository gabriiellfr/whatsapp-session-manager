import { writable } from 'svelte/store';
import { api } from '../utils/api';

function createContactsStore() {
    const { subscribe, set, update } = writable({
        contacts: [],
        selectedContact: null,
        messages: [],
    });

    return {
        subscribe,
        fetchContacts: async () => {
            try {
                const contacts = await api.get('/contacts');
                update((store) => ({ ...store, contacts }));
            } catch (error) {
                console.error('Failed to fetch contacts:', error);
            }
        },
        selectContact: (contact) => {
            update((store) => ({ ...store, selectedContact: contact }));
        },
        fetchMessages: async (chatId) => {
            try {
                const messages = await api.get(`/contacts/${chatId}/messages`);
                update((store) => ({ ...store, messages }));
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        },
        handleIncomingMessage: (message) => {
            update((store) => {
                // Update contacts and messages as needed
                return store;
            });
        },
    };
}

export const contactsStore = createContactsStore();
