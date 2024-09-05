import { writable } from 'svelte/store';
import { api } from '../utils/api';

function createFlowsStore() {
    const { subscribe, set, update } = writable([]);

    return {
        subscribe,
        fetchFlows: async () => {
            try {
                const flows = await api.get('/flows');
                set(flows);
            } catch (error) {
                console.error('Failed to fetch flows:', error);
            }
        },
        saveFlow: async (flow) => {
            try {
                await api.post('/flows', flow);
                await fetchFlows();
            } catch (error) {
                console.error('Failed to save flow:', error);
            }
        },
        deleteFlow: async (flowId) => {
            try {
                await api.delete(`/flows/${flowId}`);
                await fetchFlows();
            } catch (error) {
                console.error('Failed to delete flow:', error);
            }
        },
    };
}

export const flowsStore = createFlowsStore();
