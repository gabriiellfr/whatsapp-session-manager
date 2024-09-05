<script>
    export let qrUrl;
</script>

<div class="bg-gray-800 p-6 rounded-lg shadow-md mb-6">
    <h3 class="text-lg font-semibold mb-4 text-green-500">
        Scan QR Code to Connect
    </h3>
    <div class="bg-white p-4 rounded-lg inline-block mx-auto">
        <img src={qrUrl} alt="WhatsApp QR Code" class="w-64 h-64" />
    </div>
    <p class="text-sm text-gray-400 mt-4 text-center">
        Open WhatsApp on your phone and scan this QR code to log in
    </p>
</div>
