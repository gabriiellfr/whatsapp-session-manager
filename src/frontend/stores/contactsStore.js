// src/stores/contactsStore.js
import { writable } from 'svelte/store';
import { api } from '../utils/api';

function createContactsStore() {
    const { subscribe, set, update } = writable({
        contacts: [],
        selectedContact: null,
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
        handleIncomingMessage: (data) => {
            update((store) => {
                const sender = data.fromMe ? data.to : data.from;

                const updatedContacts = store.contacts.map((contact) => {
                    if (contact.id === sender) {
                        const unreadCount =
                            store.selectedContact &&
                            store.selectedContact.id === contact.id
                                ? 0
                                : (contact.unreadCount || 0) + 1;
                        return {
                            ...contact,
                            unreadCount,
                            lastMessage: data.body,
                            timestamp: data.timestamp || Date.now(),
                        };
                    }
                    return contact;
                });

                updatedContacts.sort((a, b) => b.timestamp - a.timestamp);

                return {
                    ...store,
                    contacts: updatedContacts,
                };
            });
        },
    };
}

export const contactsStore = createContactsStore();
