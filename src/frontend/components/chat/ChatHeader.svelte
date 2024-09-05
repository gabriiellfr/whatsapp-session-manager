<script>
    import { MoreVertical } from 'lucide-svelte';
    import { contactsStore } from '../../stores/contactsStore';

    $: selectedContact = $contactsStore.selectedContact;
</script>

{#if selectedContact}
    <div
        class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700"
    >
        <div class="flex items-center">
            <div
                class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-lg font-semibold mr-3 shadow-sm"
            >
                {selectedContact.name[0].toUpperCase()}
            </div>
            <h2 class="text-lg font-semibold text-gray-100">
                {selectedContact.name}
            </h2>
        </div>
        <button
            class="text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full p-1"
            aria-label="More options"
        >
            <MoreVertical size={24} />
        </button>
    </div>
{/if}
