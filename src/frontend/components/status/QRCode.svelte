<script>
    export let qrUrl;
</script>

<div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h3 class="text-lg font-semibold mb-4 text-gray-800">
        Scan QR Code to Connect
    </h3>
    <img src={qrUrl} alt="WhatsApp QR Code" class="mx-auto w-64 h-64" />
    <p class="text-sm text-gray-600 mt-4 text-center">
        Open WhatsApp on your phone and scan this QR code to log in
    </p>
</div>
