const clientId = "oauth-mkplace-oauthmmtivtzpbtrvgytvrupropro";
const clientSecret = "BPy6S-z@WPfKm~Q~";
const tokenUrl = "https://auth.inditex.com:443/openam/oauth2/itxid/itxidmp/access_token";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Mensaje recibido en background:", message);

    if (message.action === "openPopup") {
        console.log("Abriendo popup...");
        chrome.action.openPopup(() => {
            console.log("Popup abierto, enviando mensaje imgReady...");
            chrome.runtime.sendMessage({ action: "imgReady", url: message.url });
        });
    }

    if (message.action === "cargalistaropa") {
        console.log("Cargando lista de ropa...");
        fetchPrendas(message.imageUrl).then(lista => {
            chrome.runtime.sendMessage({ action: "listaCargada", lista: lista });
        }).catch(error => {
            console.error('Error al cargar la lista de ropa:', error);
        });
    }
});

async function fetchPrendas(imageUrl) {
    try {
        const tokens = await getAccessToken();
        const searchResults = await searchProducts(tokens.idToken, imageUrl);

        const formateadas = searchResults.map(prenda => ({
            id: prenda.id,
            nombre: prenda.name,
            precio: prenda.price.value.current,
            link: prenda.link,
            marca: prenda.brand,
        }));

        return formateadas;
    } catch (error) {
        console.error('Error al cargar prendas:', error);
        throw error;
    }
}

// Function to get access token
async function getAccessToken() {
    try {
        const headers = {
            'User-Agent': 'OpenPlatform/1.0',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': getBasicAuthHeader(clientId, clientSecret)
        };

        const formData = new URLSearchParams();
        formData.append('grant_type', 'client_credentials');
        formData.append('scope', 'technology.catalog.read');

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Error getting access token: ${response.status} ${await response.text()}`);
        }

        const data = await response.json();
        return {
            idToken: data.id_token,
            accessToken: data.access_token
        };
    } catch (error) {
        console.error(`Request error: ${error.message}`);
        throw error;
    }
}

// Function to search products
async function searchProducts(idToken, imageUrl) {
    try {
        const url = "https://api.inditex.com/pubvsearch/products";
        const headers = {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'OpenPlatform/1.0'
        };

        // Create URL with parameters
        const params = new URLSearchParams({
            'image': imageUrl,
            'page': 1,
            'perPage': 10,
        });

        const response = await fetch(`${url}?${params}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Error searching products: ${response.status} ${await response.text()}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Request error: ${error.message}`);
        throw error;
    }
}

// Function to get basic auth header
function getBasicAuthHeader(clientId, clientSecret) {
    return 'Basic ' + btoa(clientId + ':' + clientSecret);
}

