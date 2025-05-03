chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Mensaje recibido en background:", message);
    if (message.action === "openPopup") {
      console.log("Abriendo popup...");
      chrome.action.openPopup(() => {
        console.log("Popup abierto, enviando mensaje imgReady...");
        chrome.runtime.sendMessage({ action: "imgReady", url: message.url });
      });
    }
  });
  