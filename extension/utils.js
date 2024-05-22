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