import { clientId, clientSecret, tokenUrl } from './credentials.mjs';

// --- Helpers de autenticación ---
function getBasicAuthHeader(clientId, clientSecret) {
    return 'Basic ' + btoa(`${clientId}:${clientSecret}`);
}

async function getAccessToken() {
    const headers = {
        'User-Agent': 'OpenPlatform/1.0',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': getBasicAuthHeader(clientId, clientSecret)
    };
    const body = new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'technology.catalog.read'
    });
    const res = await fetch(tokenUrl, { method: 'POST', headers, body });
    if (!res.ok) throw new Error(`Token error ${res.status}`);
    const { id_token } = await res.json();
    return id_token;
}

// --- Llamada a tu endpoint de búsqueda usando la imagen ---
async function searchProducts(idToken, imageDataUrl) {
    const url = 'https://api.inditex.com/pubvsearch/products';
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'OpenPlatform/1.0'
        },
        body: JSON.stringify({
            imageBase64: imageDataUrl.split(',')[1],
            page: 1,
            perPage: 50
        })
    });
    if (!res.ok) throw new Error(`Search error ${res.status}`);
    return res.json();
}

// --- Listener de mensajes desde content script ---
chrome.runtime.onMessage.addListener(async (msg, sender) => {
    if (msg.type !== 'capture_area') return;

    try {
        // 1. Captura visible completa
        chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, async (dataUrl) => {
            if (!dataUrl) {
                console.error("Error al capturar la pestaña.");
                return;
            }

            // 2. Recorta con un canvas
            const img = new Image();
            img.src = dataUrl;
            await new Promise(resolve => img.onload = resolve); // Esperar a que la imagen cargue

            const { x, y, width, height } = msg.rect;
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

            const croppedBlob = await canvas.convertToBlob({ type: 'image/png' });
            const reader = new FileReader();
            await new Promise(resolve => {
                reader.onloadend = resolve;
                reader.readAsDataURL(croppedBlob);
            });
            const croppedDataUrl = reader.result;

            // 3. Consigue el token
            const idToken = await getAccessToken();

            // 4. Lanza la búsqueda enviando la imagen recortada
            const results = await searchProducts(idToken, croppedDataUrl);
            console.log('Resultados API:', results);

            // 5. (Opcional) comunícalos al content script o popup
            // chrome.tabs.sendMessage(sender.tab.id, { type: 'api_results', data: results });

        });
    } catch (e) {
        console.error('Error en background:', e);
    }
});