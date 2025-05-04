from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def obtener_primera_imagen_con_alt_selenium(url):
    try:
        options = Options()
        options.headless = True  # Modo headless original
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-software-rasterizer')  # Evita que aparezca el icono en la barra de tareas
        options.add_argument('--blink-settings=imagesEnabled=false')
        options.add_argument('--log-level=3')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])  # Oculta el mensaje "Chrome está siendo controlado por software automatizado"
        
        # Crear driver con las opciones
        driver = webdriver.Chrome(options=options)
        driver.get(url)
        
        # Configurar el timeout de espera
        wait = WebDriverWait(driver, 10)
        primera_imagen_con_alt = wait.until(EC.presence_of_element_located((By.XPATH, '//img[@alt]')))
        
        # Obtener datos
        src = primera_imagen_con_alt.get_attribute('src')
        alt = primera_imagen_con_alt.get_attribute('alt')
        
        # Cerrar navegador correctamente
        driver.quit()
        return {"src": src, "alt": alt}
        
    except Exception as e:
        print(f"Error en Selenium: {e}")
        if 'driver' in locals():
            driver.quit()
        return None

@app.route('/obtener_imagen', methods=['GET'])
def obtener_imagen_endpoint():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "Se requiere la URL"}), 400
    
    resultado = obtener_primera_imagen_con_alt_selenium(url)
    if resultado:
        return jsonify(resultado)
    else:
        return jsonify({"error": "No se encontró la imagen con alt"}), 404

if __name__ == '__main__':
    app.run(debug=False, port=5000)