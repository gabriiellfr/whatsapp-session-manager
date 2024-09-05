<script>
    import { createEventDispatcher } from 'svelte';
    import { fade, slide } from 'svelte/transition';

    export let step;
    export let stepIndex;
    export let currentFlow;

    const dispatch = createEventDispatcher();

    function handleAddOption() {
        dispatch('addOption');
    }

    function handleRemoveStep() {
        dispatch('removeStep');
    }

    function handleRemoveOption(optionIndex) {
        dispatch('removeOption', optionIndex);
    }
</script>

<div class="flow-node bg-gray-800 p-6 rounded-lg shadow-md relative" in:fade>
    <button
        on:click={handleRemoveStep}
        class="absolute top-2 right-2 text-red-400 hover:text-red-300 transition-colors duration-200"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    </button>
    <h4 class="font-bold mb-4 text-xl text-gray-300">Step {stepIndex + 1}</h4>
    <textarea
        bind:value={step.message}
        placeholder="Step message"
        class="w-full p-3 mb-4 bg-gray-700 border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y text-gray-100 placeholder-gray-400"
        rows="3"
    ></textarea>
    <div class="options-container grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {#each step.options as option, optionIndex (option.value)}
            <div
                class="option-node bg-gray-700 p-4 rounded-md shadow-sm relative"
                in:slide
            >
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold text-gray-200"
                        >Option {optionIndex + 1}</span
                    >
                    <button
                        on:click={() => handleRemoveOption(optionIndex)}
                        class="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                <input
                    bind:value={option.label}
                    placeholder="Option label"
                    class="w-full p-2 mb-2 bg-gray-600 border-gray-500 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-100 placeholder-gray-400"
                />
                <select
                    bind:value={option.nextStep}
                    class="w-full p-2 bg-gray-600 border-gray-500 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-100"
                >
                    <option value="">Select next step</option>
                    {#each currentFlow.steps as nextStep, nextStepIndex}
                        {#if nextStep.id !== step.id}
                            <option value={nextStep.id}
                                >Step {nextStepIndex + 1}</option
                            >
                        {/if}
                    {/each}
                </select>
            </div>
        {/each}
    </div>
    <button
        on:click={handleAddOption}
        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm"
    >
        Add Option
    </button>
</div>
