let isEnabled = true;

function replaceVersionInText(text) {
  return text.replace(/\/v142\//g, '/v141/');
}

function replaceVersionInElement(element) {
  if (!isEnabled) return;
  
  if (element.nodeType === Node.TEXT_NODE) {
    element.textContent = replaceVersionInText(element.textContent);
  } else if (element.nodeType === Node.ELEMENT_NODE) {
    for (let attr of element.attributes) {
      if (attr.value.includes('/v142/')) {
        attr.value = replaceVersionInText(attr.value);
      }
    }
    for (let child of element.childNodes) {
      replaceVersionInElement(child);
    }
  }
}

function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    if (!isEnabled) return;
    for (let mutation of mutations) {
      for (let node of mutation.addedNodes) {
        replaceVersionInElement(node);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

chrome.runtime.sendMessage({action: 'getState'}, function(response) {
  isEnabled = response.enabled;
  if (isEnabled) {
    replaceVersionInElement(document.documentElement);
    observeDOMChanges();
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'stateChanged') {
    isEnabled = request.enabled;
    if (isEnabled) {
      replaceVersionInElement(document.documentElement);
    }
  }
});