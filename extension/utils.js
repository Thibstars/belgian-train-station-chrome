// Use this method to avoid inspection warnings on i18n's getMessage method
function getMessage(i18n, key) {
  // noinspection JSUnresolvedReference
  return i18n.getMessage(key);
}

// Use this method to avoid inspection warnings on chrome's runtime.getManifest method
function getManifest() {
  // noinspection JSUnresolvedReference
  return chrome.runtime.getManifest();
}