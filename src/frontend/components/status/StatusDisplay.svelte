<script>
    import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-svelte';

    export let status;

    function getStatusIcon(status) {
        switch (status) {
            case 'ready':
            case 'qr_ready':
            case 'authenticated':
                return CheckCircle;
            case 'disconnected':
            case 'auth_failure':
                return XCircle;
            case 'initializing':
            case 'reconnecting':
                return Loader;
            default:
                return AlertCircle;
        }
    }

    function getStatusColor(status) {
        switch (status) {
            case 'ready':
            case 'qr_ready':
            case 'authenticated':
                return 'text-green-500';
            case 'disconnected':
            case 'auth_failure':
                return 'text-red-500';
            case 'initializing':
            case 'reconnecting':
                return 'text-yellow-500';
            default:
                return 'text-gray-400';
        }
    }
</script>

<div class="bg-gray-600 p-6 rounded-lg shadow-md mb-6">
    <div class="flex items-center mb-4">
        <svelte:component
            this={getStatusIcon(status.status)}
            class="{getStatusColor(status.status)} mr-3"
            size={32}
        />
        <span class="text-xl font-semibold capitalize text-gray-100">
            {status?.status?.replace('_', ' ')}
        </span>
    </div>
    <div class="grid grid-cols-2 gap-4">
        <div>
            <p class="text-sm font-medium text-gray-400">Connection</p>
            <p class="font-semibold text-gray-200">
                {status.isConnected ? 'Connected' : 'Disconnected'}
            </p>
        </div>
        <div>
            <p class="text-sm font-medium text-gray-400">Client Info</p>
            <p class="font-semibold text-gray-200">
                {status.clientInfo ? 'Available' : 'Not Available'}
            </p>
        </div>
    </div>
</div>
