from google import genai
from google.genai import types

import requests

image_path = "https://images.ctfassets.net/hnk2vsx53n6l/Rvz67EFHZ21uE2Zf7azO0/4a0e94a3522e12875f5c11af598ebdd1/4db0790b708c2c9693e33c58e8cfbe58eb990ab2.png"
image_bytes = requests.get(image_path).content
image = types.Part.from_bytes(
  data=image_bytes, mime_type="image/png"
)

client = genai.Client(api_key="AIzaSyCZquOYo6ICPHqnJ6UQD6NObbgYzK9g5O8")
response = client.models.generate_content(
    model="gemini-2.0-flash-exp",
    contents=["Dame un prompt para buscar prendas de ropa como estas en zara, devuelve únicamente un enlace con la busqueda ya realizada, debe ser una busqueda clara y corta", image],
)

print(response.text)
