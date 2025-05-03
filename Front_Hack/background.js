chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, (image) => {
      // Una vez que tienes la imagen, puedes enviarla a una API
      sendToAPI(image);
    });
  });
  
  function sendToAPI(imageData) {
    fetch("https://httpbin.org/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageData })
    })
      .then((response) => response.json())
      .then((data) => console.log("Imagen enviada a la API", data))
      .catch((error) => console.error("Error al enviar la imagen:", error));
  }
  