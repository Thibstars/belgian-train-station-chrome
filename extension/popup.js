async function loadLiveBoardForStation(i18n, stationName) {
  const liveBoard = document.getElementById('liveBoard');
  const clearSearch = document.getElementById('clearSearch');
  clearSearch.hidden = false;
  removeStationDataClarifierIfPresent();

  liveBoard.innerHTML = i18n.getMessage('fetchingData') + stationName;

  showLoader();

  try {
    const response = await fetch(
        'https://api.irail.be/liveboard/?station=' + stationName + '&format=json',
        {
          headers: {
            'user-agent': 'Belgian Train Station (https://github.com/Thibstars/belgian-train-station-chrome)'
          }
        });
    const data = await response.json();
    const departures = i18n.getMessage('departures') + data.departures.number;
    liveBoard.innerHTML = departures + '<br>' + createDeparturesTable(i18n, stationName, data.departures.departure);
  } catch (error) {
    liveBoard.innerHTML = i18n.getMessage('noResults') + stationName;
  }

  hideLoader();
}

function removeStationDataClarifierIfPresent() {
  const stationDataClarifier = document.getElementById('stationDataClarifier');
  if (stationDataClarifier) {
    stationDataClarifier.remove();
  }
}

function showLoader() {
  const loader = document.getElementById('loader');
  loader.setAttribute('class', 'loading-state');
  loader.children[0].hidden = false;
  loader.children[1].hidden = false;
  loader.children[2].hidden = false;
}

function hideLoader() {
  const loader = document.getElementById('loader');
  loader.removeAttribute('class');
  loader.children[0].hidden = 'hidden';
  loader.children[1].hidden = 'hidden';
  loader.children[2].hidden = 'hidden';
}

function createDeparturesTable(i18n, stationName, departures) {
  let result = '<table id="liveBoardTable" data-station-name="' + stationName + '">\n'
      + '    <tr>\n'
      + '        <th>' + i18n.getMessage('canceled') + '</th>\n'
      + '        <th title="' + i18n.getMessage('delayTitle') + '">' + i18n.getMessage('delay') + '</th>\n'
      + '        <th>' + i18n.getMessage('platform') + '</th>\n'
      + '        <th>' + i18n.getMessage('station') + '</th>\n'
      + '        <th>' + i18n.getMessage('time') + '</th>\n'
      + '    </tr>\n';

  for (const departure of departures) {
    const delayInMinutes = departure.delay / 60;

    result += '<tr>'
    const isCanceled = !departure.canceled === '0';
    result += '<td' + (isCanceled ? ' class="canceled"' : '') + '>' + (!isCanceled ? i18n.getMessage('no')
        : i18n.getMessage('yes')) + '</td>'
    result += '<td' + (delayInMinutes > 0 ? ' class="delayed"' : '') + '>' + delayInMinutes + '</td>'
    result += '<td' + (departure.platform === '?' ? ' class="unknownPlatform"' : '') + '>' + departure.platform
        + '</td>'
    result += '<td>' + departure.station + '</td>'
    result += '<td>' + new Date(departure.time * 1000).toLocaleString() + '</td>'
    result += '</tr>'
  }

  result += '</table>'

  return result;
}

function setStaticMessages(i18n) {
  const title = i18n.getMessage('extensionName');
  document.title = title;
  document.getElementById('titleHeader').innerText = title;

  document.getElementById('stationNameLabel').innerText = i18n.getMessage('stationName');

  document.getElementById('clearSearch').innerText = i18n.getMessage('clear');
}

document.addEventListener('DOMContentLoaded', function () {
  const loader = document.getElementById('loader');
  loader.removeAttribute('class');
  loader.children[0].hidden = 'hidden';
  loader.children[1].hidden = 'hidden';
  loader.children[2].hidden = 'hidden';

  const i18n = chrome.i18n;
  setStaticMessages(i18n);

  const manifestData = chrome.runtime.getManifest();
  document.getElementById('version').innerText = i18n.getMessage('version') + ' ' + manifestData.version;

  const clearSearch = document.getElementById('clearSearch');
  clearSearch.hidden = 'hidden';
  clearSearch.addEventListener('click', function () {
    document.getElementById('liveBoard').innerHTML = '';
    stationNameInput.value = '';
    clearSearch.hidden = 'hidden'
  });

  const stationNameInput = document.getElementById("stationName");
  stationNameInput.addEventListener('input', function () {
    if (stationNameInput.value) {
      loadLiveBoardForStation(i18n, stationNameInput.value);
    } else {
      clearSearch.hidden = 'hidden';
      const stationName = document.getElementById('liveBoardTable').getAttribute('data-station-name');
      const stationDataClarifier = document.createElement('span');
      stationDataClarifier.setAttribute('id', 'stationDataClarifier')
      stationDataClarifier.innerText = i18n.getMessage('stationDataClarification') + ' ' + stationName;
      const liveBoardContainer = document.getElementById('liveBoardContainer');
      liveBoardContainer.insertBefore(stationDataClarifier, liveBoardContainer.children[0]);
    }
  });

}, false);