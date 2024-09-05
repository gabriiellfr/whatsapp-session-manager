<script>
    import { Video, Phone } from 'lucide-svelte';
</script>

<header
    class="bbg-gray-900 text-white shadow-md p-4 flex justify-between items-center"
>
    <h1 class="text-2xl font-semibold">WhatsApp Web Client</h1>
    <div class="flex space-x-4">
        <button
            class="hover:bg-gray-700 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Video call"
        >
            <Video size={24} />
        </button>
        <button
            class="hover:bg-gray-700 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Voice call"
        >
            <Phone size={24} />
        </button>
    </div>
</header>
