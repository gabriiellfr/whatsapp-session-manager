<script>
    import { Video, Phone } from 'lucide-svelte';
</script>

<header
    class="bg-teal-700 text-white shadow-md p-4 flex justify-between items-center"
>
    <h1 class="text-2xl font-semibold">WhatsApp Web Client</h1>
    <div class="flex space-x-4">
        <button
            class="hover:bg-teal-800 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Video call"
        >
            <Video size={24} />
        </button>
        <button
            class="hover:bg-teal-800 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Voice call"
        >
            <Phone size={24} />
        </button>
    </div>
</header>
