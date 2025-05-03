import requests

# Configura tus credenciales
client_id = "oauth-mkplace-oauthmmtivtzpbtrvgytvrupropro"
client_secret = "BPy6S-z@WPfKm~Q~"
token_url = "https://auth.inditex.com:443/openam/oauth2/itxid/itxidmp/access_token"

headers = {
    "User-Agent": "OpenPlatform/1.0"
}

data = {
    "grant_type": "client_credentials",
    "scope": "technology.catalog.read"
}

# Solicitar el token de acceso
try:
    response = requests.post(
        token_url,
        headers=headers,
        data=data,
        auth=(client_id, client_secret)
    )

    if response.ok:
        id_token = response.json().get("id_token")
        access_token = response.json().get("access_token")
    else:
        print("Error al obtener el token de acceso:", response.status_code, response.text)
        exit()

except requests.exceptions.RequestException as e:
    print(f"Error en la solicitud: {e}")
    exit()

# Realiza la solicitud de búsqueda de productos
url = "https://api.inditex.com/pubvsearch/products"
headers = {
    'Authorization': f'Bearer {id_token}',  # Asegúrate de incluir "Bearer" antes del token
    'Content-Type': 'application/json',
    'User-Agent': 'OpenPlatform/1.0'
}

params = {
    'image': 'https://shop.rfef.es/cdn/shop/products/23CM0743_Z4.jpg',
    'page': 1,
    'perPage': 50
}

try:
    response = requests.get(url, headers=headers, params=params)

    if response.ok:
        print(response.json())  # Muestra la respuesta en formato JSON
    else:
        print("Error al hacer la solicitud de búsqueda de productos:", response.status_code, response.text)

except requests.exceptions.RequestException as e:
    print(f"Error en la solicitud: {e}")
    exit()
