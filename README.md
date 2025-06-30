# hackupc25

Esta extensión es el resultado de un proyecto desarrollado para la competición hackupc25 en el challenge de Inditex, logrando el 3º puesto (empatado con el 2º).  
Permite realizar una captura de pantalla de un producto mostrado en el navegador y, automáticamente, te muestra prendas similares de Inditex.

## ¿Cómo funciona?

1. **Captura de pantalla:**  
   Selecciona cualquier producto en una tienda online, haz clic en la extensión y captura la imagen.
2. **Búsqueda de prendas similares:**  
   La extensión analiza la imagen y muestra prendas de Inditex que se parecen al producto capturado.

---

## Instalación

### 1. Instalar la extensión en Chrome

Esta extensión está diseñada para funcionar en **Google Chrome**.  
Para instalarla:

1. Descarga o clona este repositorio.
2. Abre Chrome y navega a `chrome://extensions/`.
3. Activa el **Modo de desarrollador** (arriba a la derecha).
4. Haz clic en **"Cargar descomprimida"** y selecciona la carpeta del proyecto.

### 2. Configurar el servidor Python

Para que las imágenes de las prendas aparezcan correctamente, es necesario ejecutar un servidor en Python:

1. Asegúrate de tener **Python 3.x** instalado.
2. Instala los paquetes requeridos ejecutando en la raíz del proyecto:

   ```bash
   pip install -r requirements.txt
   ```

3. Inicia el servidor ejecutando:

   ```bash
   python server.py
   ```
---

## Notas

- Esta extensión solo funciona en Chrome.
- El backend debe estar en ejecución para mostrar las prendas similares.
