import requests

# Configura tus credenciales
client_id = "oauth-mkpsbox-oauthgucglyelxyfsithbxnsnbxpro"
client_secret = "DVgL:tb6:TKki-~J"
token_url = "https://auth.inditex.com:443/openam/oauth2/itxid/itxidmp/sandbox/access_token"

headers = {
    "User-Agent": "OpenPlatform/1.0"
}

data = {
    "grant_type": "client_credentials&scope=technology.catalog.read",
    "scope": "SCOPE_1 SCOPE_N"
}
response = requests.post(
    token_url,
    headers=headers,
    data=data,
    auth=(client_id, client_secret)
)
if response.ok:
    access_token = response.json().get("access_token")
    print("Access token:", access_token)
else:
    print("Error:", response.status_code, response.text)
