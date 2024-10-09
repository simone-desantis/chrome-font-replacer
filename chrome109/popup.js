document.addEventListener('DOMContentLoaded', function() {
  var toggleButton = document.getElementById('toggleButton');

  function updateButtonText(enabled) {
    toggleButton.textContent = enabled ? 'Disable' : 'Enable';
  }

  // Load the current state
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get('enabled', function(data) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      updateButtonText(data.enabled !== undefined ? data.enabled : true);
    });
  } else {
    updateButtonText(true);
  }

  toggleButton.addEventListener('click', function() {
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get('enabled', function(data) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        var newState = !(data.enabled !== undefined ? data.enabled : true);
        chrome.storage.sync.set({enabled: newState}, function() {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
          updateButtonText(newState);
          chrome.runtime.sendMessage({action: 'toggleReplacement', state: newState});
        });
      });
    } else {
      var newState = toggleButton.textContent === 'Enable';
      updateButtonText(newState);
      chrome.runtime.sendMessage({action: 'toggleReplacement', state: newState});
    }
  });
});