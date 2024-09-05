<script>
    export let qrUrl;
</script>

<div class="w-full p-4 bg-gray-600 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold text-gray-100 mb-4 text-center">
        Scan this QR Code
    </h2>
    <div
        class="flex justify-center items-center bg-white p-2 rounded-lg mx-auto"
        style="width: 16rem; height: 16rem;"
    >
        <img
            src={qrUrl}
            alt="WhatsApp QR Code"
            class="w-full h-full object-contain"
        />
    </div>
    <p class="text-sm text-gray-400 mt-4 text-center">
        Open WhatsApp on your phone and scan this QR code to log in
    </p>
</div>
