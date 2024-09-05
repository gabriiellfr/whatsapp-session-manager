<script>
    export let ongoingChats;

    $: sortedChats = Array.from(ongoingChats.values()).sort(
        (a, b) => b.lastUpdate - a.lastUpdate
    );

    function formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString();
    }
</script>

<div class="p-4">
    <h2 class="text-2xl font-bold mb-4">Ongoing Chats Monitor</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each sortedChats as chat}
            <div class="bg-white p-4 rounded shadow">
                <h3 class="font-bold mb-2">{chat.contactName}</h3>
                <p class="text-sm mb-1">Flow: {chat.flowName}</p>
                <p class="text-sm mb-1">Current Step: {chat.currentStep}</p>
                <p class="text-sm mb-1">
                    Last Update: {formatTimestamp(chat.lastUpdate)}
                </p>
                <p class="text-sm">
                    Status: <span class="font-semibold">{chat.status}</span>
                </p>
            </div>
        {/each}
    </div>
</div>
