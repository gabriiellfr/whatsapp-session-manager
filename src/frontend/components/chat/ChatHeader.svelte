<script>
    import { MoreVertical } from 'lucide-svelte';

    export let selectedContact;
</script>

<div
    class="bg-gray-100 px-4 py-2 flex items-center justify-between border-b border-gray-300"
>
    <div class="flex items-center">
        <div
            class="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white text-lg font-semibold mr-3 shadow-sm"
        >
            {selectedContact.name[0]}
        </div>
        <h2 class="text-lg font-semibold text-gray-800">
            {selectedContact.name}
        </h2>
    </div>
    <button
        class="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-full p-1"
        aria-label="More options"
    >
        <MoreVertical size={24} />
    </button>
</div>
