import {clientId ,clientSecret,tokenUrl} from './credentials.mjs';
// Configure your credentials


// Function to encode credentials for Basic Auth
function getBasicAuthHeader(clientId, clientSecret) {
  return 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
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
async function searchProducts(idToken) {
  try {
    const url = "https://api.inditex.com/pubvsearch/products";
    const headers = {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'OpenPlatform/1.0'
    };

    // Create URL with parameters
    const params = new URLSearchParams({
      'image': 'https://shop.rfef.es/cdn/shop/products/23CM0743_Z4.jpg',
      'page': 1,
      'perPage': 50
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

// Main execution function
async function main() {
  try {
    const tokens = await getAccessToken();
    console.log("Access token obtained successfully");
    
    const searchResults = await searchProducts(tokens.idToken);
    console.log(JSON.stringify(searchResults, null, 2));
  } catch (error) {
    console.error("Execution failed:", error);
    process.exit(1);
  }
}

// Execute the script
main();