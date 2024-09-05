<script>
    export let clientInfo;
</script>

<div class="bg-gray-600 p-6 rounded-lg shadow-md mb-6">
    <h3 class="text-lg font-semibold mb-4 text-gray-100">Client Information</h3>
    <div class="grid grid-cols-2 gap-4">
        <div>
            <p class="text-sm font-medium text-gray-400">Platform</p>
            <p class="font-semibold text-gray-200 capitalize">
                {clientInfo.platform}
            </p>
        </div>
        <div>
            <p class="text-sm font-medium text-gray-400">Push Name</p>
            <p class="font-semibold text-gray-200">{clientInfo.pushname}</p>
        </div>
        <div>
            <p class="text-sm font-medium text-gray-400">Phone Number</p>
            <p class="font-semibold text-gray-200">{clientInfo.wid.user}</p>
        </div>
        <div>
            <p class="text-sm font-medium text-gray-400">Server</p>
            <p class="font-semibold text-gray-200">{clientInfo.wid.server}</p>
        </div>
    </div>
</div>
