import { writable } from 'svelte/store';
import { api } from '../utils/api';

function createStatusStore() {
    const { subscribe, set, update } = writable({
        status: {},
        infoMessages: [],
    });

    return {
        subscribe,
        updateStatus: (newStatus) => {
            update((store) => ({ ...store, status: newStatus }));
        },
        addInfoMessage: (message) => {
            update((store) => ({
                ...store,
                infoMessages: [...store.infoMessages, message],
            }));
        },
        initialize: async () => {
            try {
                await api.post('/start');
            } catch (error) {
                console.error('Failed to initialize:', error);
            }
        },
        reload: async () => {
            try {
                await api.post('/reload');
            } catch (error) {
                console.error('Failed to initialize:', error);
            }
        },
        logout: async () => {
            try {
                await api.post('/logout');
            } catch (error) {
                console.error('Failed to logout:', error);
            }
        },
        stop: async () => {
            try {
                await api.post('/stop');
            } catch (error) {
                console.error('Failed to stop:', error);
            }
        },
    };
}

export const statusStore = createStatusStore();
