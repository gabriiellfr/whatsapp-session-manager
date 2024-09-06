import express from 'express';

export default function (whatsAppClient, autoFlowService) {
    const router = express.Router();

    router.post('/start', async (req, res) => {
        try {
            await whatsAppClient.initialize();
            await autoFlowService.initialize();
            res.json({ message: 'Services initialized successfully' });
        } catch (error) {
            console.error('Error starting services:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/reload', async (req, res) => {
        try {
            await whatsAppClient.stop();

            await whatsAppClient.initialize();
            await autoFlowService.initialize();
            res.json({ message: 'Services reloaded successfully' });
        } catch (error) {
            console.error('Error starting services:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/stop', async (req, res) => {
        try {
            await whatsAppClient.stop();
            res.json({ message: 'WhatsApp client stopped successfully' });
        } catch (error) {
            console.error('Error stopping WhatsApp client:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/logout', async (req, res) => {
        try {
            await whatsAppClient.logout();
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error('Error logging out:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/contacts', async (req, res) => {
        try {
            const contacts = await whatsAppClient.getAllChats();
            res.json(contacts);
        } catch (error) {
            console.error('Error getting contacts:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/contacts/:chatId/messages', async (req, res) => {
        try {
            const { chatId } = req.params;
            const messages = await whatsAppClient.getMessages(chatId);
            res.json(messages);
        } catch (error) {
            console.error('Error getting messages:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/sendMessage', async (req, res) => {
        const { to, body } = req.body;
        try {
            await whatsAppClient.sendMessage({ to, body });
            res.json({ message: 'Message sent successfully' });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // AutoFlowService routes
    router.get('/flows', async (req, res) => {
        try {
            const flows = await autoFlowService.getFlows();
            res.json(flows);
        } catch (error) {
            console.error('Error getting flows:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/flows', async (req, res) => {
        try {
            await autoFlowService.addFlow(req.body);
            res.json({ message: 'Flow added successfully' });
        } catch (error) {
            console.error('Error adding flow:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.put('/flows/:id', async (req, res) => {
        try {
            await autoFlowService.updateFlow(req.body);
            res.json({ message: 'Flow updated successfully' });
        } catch (error) {
            console.error('Error updating flow:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.delete('/flows/:id', async (req, res) => {
        try {
            await autoFlowService.deleteFlow(req.params.id);
            res.json({ message: 'Flow deleted successfully' });
        } catch (error) {
            console.error('Error deleting flow:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
