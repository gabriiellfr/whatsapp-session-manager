<script>
    export let clientInfo;
</script>

<div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">Client Information</h3>
    <div class="grid grid-cols-2 gap-4">
        <div>
            <p class="text-sm font-medium text-gray-500">Platform</p>
            <p class="font-semibold text-gray-800 capitalize">
                {clientInfo.platform}
            </p>
        </div>
        <div>
            <p class="text-sm font-medium text-gray-500">Push Name</p>
            <p class="font-semibold text-gray-800">{clientInfo.pushname}</p>
        </div>
        <div>
            <p class="text-sm font-medium text-gray-500">Phone Number</p>
            <p class="font-semibold text-gray-800">{clientInfo.wid.user}</p>
        </div>
        <div>
            <p class="text-sm font-medium text-gray-500">Server</p>
            <p class="font-semibold text-gray-800">{clientInfo.wid.server}</p>
        </div>
    </div>
</div>
