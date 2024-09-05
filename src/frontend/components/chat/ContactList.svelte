<script>
    import { Search } from 'lucide-svelte';

    export let filteredContacts;
    export let selectContact;
    export let searchQuery;

    const formatTimestamp = (timestamp) => {
        const utcDate = new Date(timestamp * 1000);

        const options = {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit',
        };

        return utcDate.toLocaleTimeString('pt-BR', options);
    };
</script>

<div class="p-4">
    <div class="relative">
        <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search or start new chat"
            class="w-full px-4 py-2 pl-10 bg-gray-100 text-gray-700 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <Search class="absolute left-3 top-2.5 text-gray-400" size={20} />
    </div>
</div>
<ul class="list-none p-0 m-0">
    {#each filteredContacts as contact}
        <li class="w-full">
            <button
                class="w-full text-left hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:bg-gray-100"
                on:click={() => selectContact(contact)}
            >
                <div
                    class="flex items-center px-4 py-3 border-b border-gray-200"
                >
                    <div
                        class="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-3 shadow-md flex-shrink-0"
                    >
                        {contact.name[0]}
                    </div>
                    <div class="flex-grow min-w-0">
                        <h3 class="font-semibold text-gray-800 truncate">
                            {contact.name}
                        </h3>
                        <p class="text-sm text-gray-600 truncate">
                            {String(contact.lastMessage).slice(0, 30) || ''}
                        </p>
                    </div>
                    <div class="flex flex-col items-end ml-2 flex-shrink-0">
                        <span class="text-xs text-gray-500 mb-1"
                            >{formatTimestamp(contact.timestamp)}</span
                        >
                        {#if contact.unreadCount > 0}
                            <span
                                class="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                            >
                                {contact.unreadCount}
                            </span>
                        {/if}
                    </div>
                </div>
            </button>
        </li>
    {/each}
</ul>
