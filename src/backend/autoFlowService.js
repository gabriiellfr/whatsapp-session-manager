import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class AutoFlowService {
    constructor(whatsAppClient) {
        this.whatsAppClient = whatsAppClient;
        this.flows = [];
        this.activeFlows = new Map();
        this.flowsFilePath = path.join(
            process.cwd(),
            'src',
            'data',
            'flows.json'
        );
    }

    async initialize() {
        await this.loadFlows();
        console.log('AutoFlowService initialized');
    }

    async loadFlows() {
        try {
            const data = await fs.readFile(this.flowsFilePath, 'utf8');
            this.flows = JSON.parse(data);
            console.log(`Loaded ${this.flows.length} flows`);
        } catch (error) {
            console.error('Error loading flows:', error);
            this.flows = [];
        }
    }

    async saveFlows() {
        try {
            await fs.writeFile(
                this.flowsFilePath,
                JSON.stringify(this.flows, null, 2)
            );
            console.log('Flows saved successfully');

            await this.loadFlows();
        } catch (error) {
            console.error('Error saving flows:', error);
            throw new Error('Failed to save flows');
        }
    }

    async handleIncomingMessage(message) {
        try {
            if (this.activeFlows.has(message.from)) {
                await this.continueFlow(message);
            } else {
                await this.startNewFlowIfTriggered(message);
            }
        } catch (error) {
            console.error('Error handling incoming message:', error);
            await this.sendErrorMessage(message.from);
        }
    }

    async startNewFlowIfTriggered(message) {
        const triggeredFlow = this.flows.find(
            (flow) =>
                flow.trigger === '*' ||
                new RegExp(flow.trigger, 'i').test(message.body)
        );

        if (triggeredFlow) {
            await this.startFlow(triggeredFlow, message.from);
        }
    }

    async startFlow(flow, chatId) {
        const currentStep = flow.steps[0];
        this.activeFlows.set(chatId, {
            flowId: flow.id,
            currentStepId: currentStep.id,
            data: {},
        });
        await this.sendStepMessage(currentStep, chatId);
        console.log(`Started flow ${flow.id} for chat ${chatId}`);
    }

    async continueFlow(message) {
        const flowState = this.activeFlows.get(message.from);
        if (!flowState) {
            console.error(`No active flow found for chat ${message.from}`);
            return;
        }

        const flow = this.flows.find((f) => f.id === flowState.flowId);
        if (!flow) {
            console.error(`Flow ${flowState.flowId} not found`);
            await this.endFlow(message.from);
            return;
        }

        const currentStep = flow.steps.find(
            (step) => step.id === flowState.currentStepId
        );

        if (!currentStep) {
            console.error(
                `Step ${flowState.currentStepId} not found in flow ${flow.id}`
            );
            await this.endFlow(message.from);
            return;
        }

        const selectedOption = this.findSelectedOption(
            currentStep,
            message.body
        );

        if (selectedOption) {
            await this.processSelectedOption(
                selectedOption,
                flowState,
                message
            );
        } else {
            await this.handleInvalidOption(message);
        }
    }

    findSelectedOption(step, messageBody) {
        return step.options.find(
            (option) =>
                option.value.toString() === messageBody ||
                option.label.toLowerCase() === messageBody.toLowerCase()
        );
    }

    async processSelectedOption(selectedOption, flowState, message) {
        const flow = this.flows.find((f) => f.id === flowState.flowId);
        const nextStep = flow.steps.find(
            (step) => step.id === selectedOption.nextStep
        );

        if (nextStep) {
            flowState.currentStepId = nextStep.id;
            flowState.data[nextStep.id] = selectedOption.label;
            await this.sendStepMessage(nextStep, message.from);
        } else {
            await this.endFlow(message.from);
        }
    }

    async sendMessage({ to, body }) {
        await this.whatsAppClient.sendMessage({ to, body });
    }

    async handleInvalidOption(message) {
        await this.sendMessage({
            to: message.from,
            body: "I'm sorry, I didn't understand that. Please choose one of the options provided.",
        });
    }

    async sendStepMessage(step, chatId) {
        const messageBody =
            step.message +
            (step.options.length > 0
                ? '\n\n' +
                  step.options
                      .map((option) => `${option.value}. ${option.label}`)
                      .join('\n')
                : '');

        await this.sendMessage({
            to: chatId,
            body: messageBody,
        });

        if (step.id === 'exit') this.endFlow(chatId);
    }

    async endFlow(chatId) {
        const flowState = this.activeFlows.get(chatId);
        if (!flowState) {
            console.error(
                `No active flow found for chat ${chatId} when trying to end flow`
            );
            return;
        }

        const flow = this.flows.find((f) => f.id === flowState.flowId);
        if (flow) {
            await this.processFlowData(flow, flowState.data);
        }

        this.activeFlows.delete(chatId);
        console.log(`Ended flow for chat ${chatId}`);
    }

    async processFlowData(flow, data) {
        console.log(`Processing flow data for flow ${flow.id}`, data);
        // Implement your data processing logic here
    }

    async sendErrorMessage(chatId) {
        await this.sendMessage({
            to: chatId,
            body: 'I apologize, but there was an error processing your request. Please try again later or contact our support team.',
        });
    }

    getFlows() {
        return this.flows;
    }

    async addFlow(flow) {
        flow.id = uuidv4();
        this.flows.push(flow);
        await this.saveFlows();
        console.log(`Added new flow with ID ${flow.id}`);
        return flow;
    }

    async updateFlow(updatedFlow) {
        const index = this.flows.findIndex((f) => f.id === updatedFlow.id);
        if (index !== -1) {
            this.flows[index] = updatedFlow;
            await this.saveFlows();
            console.log(`Updated flow with ID ${updatedFlow.id}`);
        } else {
            throw new Error(`Flow with ID ${updatedFlow.id} not found`);
        }
    }

    async deleteFlow(flowId) {
        const initialLength = this.flows.length;
        this.flows = this.flows.filter((f) => f.id !== flowId);
        if (this.flows.length < initialLength) {
            await this.saveFlows();
            console.log(`Deleted flow with ID ${flowId}`);
        } else {
            throw new Error(`Flow with ID ${flowId} not found`);
        }
    }
}
