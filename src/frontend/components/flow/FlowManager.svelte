<script>
    import { onMount } from 'svelte';
    import { v4 as uuidv4 } from 'uuid';
    import FlowNode from './FlowNode.svelte';
    import { fade, slide } from 'svelte/transition';

    export let flows = [];
    export let saveFlow;
    export let deleteFlow;
    export let fetchFlows;

    let currentFlow = null;
    let showEditor = false;
    let errorMessage = '';
    let successMessage = '';

    onMount(() => {
        fetchFlows();
    });

    function createNewFlow() {
        currentFlow = {
            name: '',
            trigger: '',
            steps: [
                {
                    id: uuidv4(),
                    message: '',
                    options: [],
                },
            ],
        };
        showEditor = true;
        errorMessage = '';
        successMessage = '';
    }

    function editFlow(flow) {
        currentFlow = JSON.parse(JSON.stringify(flow));
        showEditor = true;
        errorMessage = '';
        successMessage = '';
    }

    function addStep() {
        currentFlow.steps = [
            ...currentFlow.steps,
            {
                id: uuidv4(),
                message: '',
                options: [],
            },
        ];
    }

    function addOption(step) {
        step.options = [
            ...step.options,
            {
                label: '',
                value: step.options.length + 1,
                nextStep: '',
            },
        ];
        currentFlow = { ...currentFlow };
    }

    function removeStep(stepId) {
        currentFlow.steps = currentFlow.steps.filter(
            (step) => step.id !== stepId
        );
        currentFlow.steps.forEach((step) => {
            step.options = step.options.filter(
                (option) => option.nextStep !== stepId
            );
        });
        currentFlow = { ...currentFlow };
    }

    function removeOption(step, optionIndex) {
        step.options.splice(optionIndex, 1);
        step.options.forEach((option, index) => {
            option.value = index + 1;
        });
        currentFlow = { ...currentFlow };
    }

    async function handleSaveFlow() {
        errorMessage = '';
        successMessage = '';
        if (!currentFlow.name || !currentFlow.name.trim()) {
            errorMessage = 'Flow name is required';
            return;
        }
        if (!currentFlow.trigger || !currentFlow.trigger.trim()) {
            errorMessage = 'Trigger is required';
            return;
        }
        if (
            currentFlow.steps.some(
                (step) => !step.message || !step.message.trim()
            )
        ) {
            errorMessage = 'All steps must have a message';
            return;
        }
        if (
            currentFlow.steps.some((step) =>
                step.options.some(
                    (option) => !option.label || !option.label.trim()
                )
            )
        ) {
            errorMessage = 'All options must have a label';
            return;
        }

        try {
            const savedFlow = await saveFlow(currentFlow);
            successMessage = 'Flow saved successfully!';
            await fetchFlows();
            setTimeout(() => {
                showEditor = false;
                currentFlow = null;
                successMessage = '';
            }, 2000);
        } catch (error) {
            errorMessage = 'Failed to save flow. Please try again.';
        }
    }

    function cancelEdit() {
        showEditor = false;
        currentFlow = null;
        errorMessage = '';
        successMessage = '';
    }

    async function handleDeleteFlow(flowId) {
        if (confirm('Are you sure you want to delete this flow?')) {
            try {
                await deleteFlow(flowId);
                successMessage = 'Flow deleted successfully!';
                await fetchFlows();
                setTimeout(() => {
                    successMessage = '';
                }, 2000);
            } catch (error) {
                errorMessage = 'Failed to delete flow. Please try again.';
            }
        }
    }
</script>

<div class="h-full w-full p-4 overflow-auto bg-gray-100">
    <div class="max-w-7xl mx-auto">
        <h2 class="text-3xl font-bold mb-6 text-gray-800">Flow Manager</h2>

        {#if successMessage}
            <div
                class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
                role="alert"
            >
                <p>{successMessage}</p>
            </div>
        {/if}

        {#if !showEditor}
            <button
                on:click={createNewFlow}
                class="bg-blue-600 text-white px-6 py-3 rounded-md mb-6 hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
                Create New Flow
            </button>

            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                in:fade
            >
                {#each flows as flow (flow.id)}
                    <div
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                    >
                        <h3 class="text-xl font-semibold mb-3 text-gray-800">
                            {flow.name}
                        </h3>
                        <p class="text-sm mb-2 text-gray-600">
                            <span class="font-medium">Trigger:</span>
                            {flow.trigger}
                        </p>
                        <p class="text-sm mb-4 text-gray-600">
                            Steps: {flow.steps.length}
                        </p>
                        <div class="flex justify-end space-x-2">
                            <button
                                on:click={() => editFlow(flow)}
                                class="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
                            >
                                Edit
                            </button>
                            <button
                                on:click={() => handleDeleteFlow(flow.id)}
                                class="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="bg-white p-8 rounded-lg shadow-md mb-4" in:slide>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label
                            for="flowName"
                            class="block text-sm font-medium text-gray-700 mb-2"
                            >Flow Name</label
                        >
                        <input
                            id="flowName"
                            bind:value={currentFlow.name}
                            placeholder="Enter flow name"
                            class="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        />
                    </div>
                    <div>
                        <label
                            for="flowTrigger"
                            class="block text-sm font-medium text-gray-700 mb-2"
                            >Trigger</label
                        >
                        <input
                            id="flowTrigger"
                            bind:value={currentFlow.trigger}
                            placeholder="Enter trigger (text or number)"
                            class="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        />
                    </div>
                </div>

                {#if errorMessage}
                    <p class="text-red-500 mb-6 bg-red-100 p-3 rounded-md">
                        {errorMessage}
                    </p>
                {/if}

                <div class="flow-visualization mb-6 space-y-6">
                    {#each currentFlow.steps as step, stepIndex (step.id)}
                        <FlowNode
                            {step}
                            {stepIndex}
                            on:addOption={() => addOption(step)}
                            on:removeStep={() => removeStep(step.id)}
                            on:removeOption={(e) =>
                                removeOption(step, e.detail)}
                            bind:currentFlow
                        />
                    {/each}
                </div>

                <button
                    on:click={addStep}
                    class="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors duration-200 shadow-md"
                >
                    Add Step
                </button>

                <div class="mt-8 flex justify-end space-x-4">
                    <button
                        on:click={cancelEdit}
                        class="bg-gray-300 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-400 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        on:click={handleSaveFlow}
                        class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-md"
                    >
                        Save Flow
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .flow-visualization {
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }
</style>
