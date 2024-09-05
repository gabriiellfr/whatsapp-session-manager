import WhatsAppClient from './whatsappClient.js';
import { AutoFlowService } from './autoFlowService.js';

let whatsAppClient = null;
let autoFlowService = null;

export async function initializeServices() {
    if (whatsAppClient) {
        await stopServices();
    }

    whatsAppClient = new WhatsAppClient();
    await whatsAppClient.initialize();

    autoFlowService = new AutoFlowService(whatsAppClient);
    await autoFlowService.initialize();

    return { whatsAppClient, autoFlowService };
}

export async function stopServices() {
    if (whatsAppClient) {
        await whatsAppClient.stop();
        whatsAppClient = null;
    }
    if (autoFlowService) {
        autoFlowService = null;
    }
}
