// Verificar si el script ya se ha cargado para evitar inicializaciones múltiples
if (window._extensionScriptLoaded) {
  console.log("[Extension] Script ya cargado, reiniciando variables");
  // Solo reiniciar variables sin volver a crear listeners
  window._extensionResetState();
} else {
  console.log("[Extension] Primera carga del script");
  window._extensionScriptLoaded = true;

  // Variables globales
  let startX = null;
  let startY = null;
  let selectionBox = null;
  let overlay = null;
  let controls = null;
  let selectionDone = false;
  let isDrawing = false;
  let capturedImageUrl = null;

  // Función global para reiniciar estado
  window._extensionResetState = function() {
    startX = null;
    startY = null;
    selectionDone = false;
    isDrawing = false;
    capturedImageUrl = null;
    if (selectionBox) selectionBox.remove();
    if (controls) controls.remove();
    if (overlay) overlay.remove();
    selectionBox = null;
    controls = null;
    overlay = null;
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "enableSelection") {
      console.log("[Extension] enableSelection recibido");
      capturedImageUrl = request.imageUrl;
      bloquearInteraccion();
      sendResponse({ status: "interaccion bloqueada" });
    }
    if (request.action === "disableSelection") {
      console.log("[Extension] disableSelection recibido");
      desbloquearInteraccion();
      sendResponse({ status: "interaccion restaurada" });
    }
    return true; // Indica que se manejará de forma asíncrona
  });

  function bloquearInteraccion() {
    // Limpiar cualquier selección anterior
    if (document.getElementById("bloqueo-overlay-extension")) {
      desbloquearInteraccion();
    }

    if (selectionDone) {
      selectionDone = false;
    }

    console.log("[Extension] bloqueando interacción");

    // Inyectar estilos
    const style = document.createElement("style");
    style.id = "bloqueo-interaccion-extension";
    style.innerHTML = `
      body *:not(#bloqueo-overlay-extension):not(#bloqueo-overlay-extension *) {
        user-select: none !important;
        pointer-events: none !important;
      }
      html, body { overflow: hidden !important; }
      #bloqueo-overlay-extension { cursor: crosshair; }
      #selection-rect {
        position: absolute;
        border: 2px dashed #007bff;
        background-color: rgba(0,123,255,0.2);
        z-index: 1000000;
        pointer-events: none;
      }
      #controls {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000002;
        display: none;
        gap: 10px;
      }
      #controls button {
        all: unset;
        background: #fff;
        border: 1px solid #ccc;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      #controls button:hover { background: #f0f0f0; }
    `;
    document.head.appendChild(style);

    // Crear overlay
    overlay = document.createElement("div");
    overlay.id = "bloqueo-overlay-extension";
    Object.assign(overlay.style, {
      position: "fixed", top: "0", left: "0",
      width: "100vw", height: "100vh",
      backgroundColor: "rgba(0,0,0,0.1)",
      zIndex: "999999",
      pointerEvents: "auto"
    });
    document.body.appendChild(overlay);

    // Caja de selección
    selectionBox = document.createElement("div");
    selectionBox.id = "selection-rect";
    overlay.appendChild(selectionBox);

    // Panel de controles
    controls = document.createElement("div");
    controls.id = "controls";

    const btnAceptar = document.createElement("button");
    btnAceptar.textContent = "Aceptar";
    btnAceptar.onclick = handleAceptar;

    const btnCancelar = document.createElement("button");
    btnCancelar.textContent = "Cancelar";
    btnCancelar.onclick = handleCancelar;

    const btnRedibujar = document.createElement("button");
    btnRedibujar.textContent = "Redibujar";
    btnRedibujar.onclick = handleRedibujar;

    controls.appendChild(btnAceptar);
    controls.appendChild(btnCancelar);
    controls.appendChild(btnRedibujar);
    overlay.appendChild(controls);

    // Listeners de ratón
    overlay.addEventListener("mousedown", onMouseDown);
    overlay.addEventListener("mousemove", onMouseMove);
    overlay.addEventListener("mouseup", onMouseUp);

    console.log("[Extension] interacción bloqueada, listo para seleccionar");
  }

  function recortarImagen(dataUrl, coords) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = coords.width;
        canvas.height = coords.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, coords.x, coords.y, coords.width, coords.height, 0, 0, coords.width, coords.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = dataUrl;
    });
  }

  function dataURLtoBlob(dataUrl) {
    // Verificar si el Data URL está bien formado
    const arr = dataUrl.split(',');
    if (arr.length !== 2) {
      console.error('Error: Data URL no tiene el formato correcto');
      return null;
    }
  
    const mime = arr[0].match(/:(.*?);/);
    if (!mime) {
      console.error('Error: No se encontró el tipo MIME en el Data URL');
      return null;
    }
  
    const mimeType = mime[1];
    const bstr = atob(arr[1]);  // Decodificar la parte base64
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
  
    // Rellenar el array Uint8Array con los datos decodificados
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
  
    return new Blob([u8arr], { type: mimeType });
  }
  

  async function handleAceptar(e) {
    e.stopPropagation();
    const rect = selectionBox.getBoundingClientRect();
  
    const croppedDataUrl = await recortarImagen(capturedImageUrl, {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    });
  
    const blob = dataURLtoBlob(croppedDataUrl);
    const formData = new FormData();
    formData.append("image", blob);
    formData.append("type", "image");
    formData.append("title", "Imagen recortada");
    formData.append("description", "Descripción de la imagen recortada");
  
    // Preparar encabezados con el Client-ID
    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Client-ID e29bc4be5812582"); // Cambia por tu Client-ID
  
    // Configurar la solicitud
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formData,
      redirect: 'follow'
    };
  
    // Subir la imagen a Imgur
    try {
      const res = await fetch("https://api.imgur.com/3/image", requestOptions);
      const result = await res.json();
  
      if (result.success) {
        const publicUrl = result.data.link;
        console.log("✅ Imagen subida:", publicUrl);
  
        // Enviar la URL de la imagen al background script o popup
        chrome.runtime.sendMessage({
          action: "imgurUrlReady",
          url: publicUrl
        });
      } else {
        console.error("❌ Error al subir a Imgur:", result);
      }
    } catch (err) {
      console.error("❌ Fallo en subida:", err);
    }
  
    finishSelection();
  }
  

  function handleCancelar(e) {
    e.stopPropagation();
    console.log("[Extension] Cancelar pulsado");
    chrome.runtime.sendMessage({ action: "selectionCancelled" });
    finishSelection();
  }

  function handleRedibujar(e) {
    e.stopPropagation();
    console.log("[Extension] Redibujar pulsado");
    // Ocultar controles
    controls.style.display = "none";
    // Resetear el cuadro de selección
    Object.assign(selectionBox.style, {
      left: "0px",
      top: "0px",
      width: "0px",
      height: "0px",
      display: "none"
    });
    // Resetear variables
    startX = null;
    startY = null;
    isDrawing = false;
    // Permitir dibujar de nuevo
    selectionDone = false;
  }

  function onMouseDown(e) {
    // Ignora clicks en el panel de controles o si ya se completó una selección
    if (selectionDone || e.target.closest('#controls')) return;
    console.log("[Extension] mousedown en", e.clientX, e.clientY);
    startX = e.clientX;
    startY = e.clientY;
    isDrawing = true;
    Object.assign(selectionBox.style, {
      left: `${startX}px`,
      top: `${startY}px`,
      width: "0px",
      height: "0px",
      display: "block"
    });
    controls.style.display = "none";
  }

  function onMouseMove(e) {
    if (!isDrawing || selectionDone) return;
    const currX = e.clientX, currY = e.clientY;
    const x = Math.min(currX, startX), y = Math.min(currY, startY);
    const w = Math.abs(currX - startX), h = Math.abs(currY - startY);
    Object.assign(selectionBox.style, {
      left: `${x}px`, top: `${y}px`,
      width: `${w}px`, height: `${h}px`
    });
  }

  function onMouseUp(e) {
    if (!isDrawing || selectionDone) return;
    // Ignora si el evento ocurrió dentro de los controles
    if (e.target.closest('#controls')) return;

    console.log("[Extension] mouseup");
    isDrawing = false;

    // Una vez completado el dibujo, bloqueamos la interacción excepto con los botones
    selectionDone = true;

    // Mostrar los controles
    controls.style.display = "flex";
  }

  function finishSelection() {
    console.log("[Extension] finalizando selección");
    selectionDone = true;
    isDrawing = false;

    // Limpiar eventos
    if (overlay) {
      overlay.removeEventListener("mousedown", onMouseDown);
      overlay.removeEventListener("mousemove", onMouseMove);
      overlay.removeEventListener("mouseup", onMouseUp);
    }

    desbloquearInteraccion();
  }

  function desbloquearInteraccion() {
    console.log("[Extension] desbloqueando interacción");
    const style = document.getElementById("bloqueo-interaccion-extension");
    if (style) style.remove();
    if (overlay) overlay.remove();
    overlay = null;
    selectionBox = null;
    controls = null;
  }
}
