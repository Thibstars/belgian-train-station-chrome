// Use this method to avoid inspection warnings on i18n's getMessage method
function getMessage(i18n, key) {
  let result = key;
  if (i18n) {
    // noinspection JSUnresolvedReference
    result = i18n.getMessage(key) ? i18n.getMessage(key) : key;
  }

  return result;
}

// Use this method to avoid inspection warnings on chrome's runtime.getManifest method
function getManifest() {
  // noinspection JSUnresolvedReference
  return chrome.runtime.getManifest();
}

function storeValueInGlobalStorage(key, value) {
  // noinspection JSUnresolvedReference
  return chrome.storage.sync.set({[key]: value});
}

function getValueFromGlobalStorage(key) {
  // noinspection JSUnresolvedReference
  return chrome.storage.sync.get([key]);
}