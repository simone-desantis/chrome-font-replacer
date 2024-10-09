let isEnabled = true;

function redirectUrl(details) {
  if (!isEnabled) return;

  let url = details.url;
  let newUrl = url.replace(/\/v142\//g, '/v141/');
  
  if (url !== newUrl) {
    console.log('Redirecting:', url, 'to', newUrl);
    return { redirectUrl: newUrl };
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  redirectUrl,
  { 
    urls: [
      "https://fonts.gstatic.com/s/googlematerialicons/v142/*",
      "https://*.google.com/*/v142/*"
    ],
    types: ["stylesheet", "script", "image", "font", "other"]
  },
  ["blocking"]
);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleReplacement') {
    isEnabled = request.state;
    console.log('Replacement toggled:', isEnabled);
    chrome.storage.sync.set({enabled: isEnabled});
    
    // Notify all content scripts about the state change
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'stateChanged', enabled: isEnabled});
      });
    });
  } else if (request.action === 'getState') {
    sendResponse({enabled: isEnabled});
  }
});

// Initialize the state
chrome.storage.sync.get('enabled', function(data) {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return;
  }
  isEnabled = data.enabled !== undefined ? data.enabled : true;
  console.log('Initial state:', isEnabled);
});