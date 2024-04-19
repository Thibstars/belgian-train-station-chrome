async function loadLiveBoardForStation(i18n, stationName) {
  const liveBoard = document.getElementById('liveBoard');
  const clearSearch = document.getElementById('clearSearch');
  clearSearch.hidden = false;
  removeStationDataClarifierIfPresent();

  liveBoard.innerHTML = i18n.getMessage('fetchingData') + stationName;

  showLoader();

  try {
    const response = await fetch(
        'https://api.irail.be/liveboard/?station=' + stationName + '&format=json&lang=' + i18n.getMessage('@@ui_locale'),
        {
          headers: {
            'user-agent': 'Belgian Train Station (https://github.com/Thibstars/belgian-train-station-chrome)'
          }
        });
    return await response.json();
  } catch (error) {
    return error;
  }
}

async function loadRandomStation(i18n) {
  try {
    const response = await fetch(
        'https://api.irail.be/stations/?format=json&lang=' + i18n.getMessage('@@ui_locale'),
        {
          headers: {
            'user-agent': 'Belgian Train Station (https://github.com/Thibstars/belgian-train-station-chrome)'
          }
        });
    const data = await response.json();

    const stations = data.station;

    return stations[Math.floor(Math.random() * stations.length)];
  } catch (error) {
    return error;
  }
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
    const time = new Date(departure.time * 1000);

    result += '<tr>'
    const isCanceled = !departure.canceled === '0';
    result += '<td' + (isCanceled ? ' class="canceled"' : '') + '>' + (!isCanceled ? i18n.getMessage('no')
        : i18n.getMessage('yes')) + '</td>'
    result += '<td' + (delayInMinutes > 0 ? ' class="delayed"' : '') + '>' + delayInMinutes + '</td>'
    result += '<td' + (departure.platform === '?' ? ' class="unknownPlatform"' : '') + '>' + departure.platform
        + '</td>'
    result += '<td>' + departure.station + '</td>'
    result += '<td title="' + time.toLocaleString() + '">' + time.toLocaleTimeString() + '</td>'
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

function showLiveBoard(i18n, stationName, data, liveBoard) {
  const departures = i18n.getMessage('departures') + data.departures.number;
  liveBoard.innerHTML = departures + '<br>' + createDeparturesTable(i18n, stationName, data.departures.departure);

  hideLoader();
}

function showNoResults(liveBoard, i18n, stationName) {
  liveBoard.innerHTML = i18n.getMessage('noResults') + stationName;

  hideLoader();
}

function showStationDataClarifier(clearSearch, i18n) {
  clearSearch.hidden = 'hidden';
  const stationName = document.getElementById('liveBoardTable').getAttribute('data-station-name');
  const stationDataClarifier = document.createElement('span');
  stationDataClarifier.setAttribute('id', 'stationDataClarifier')
  stationDataClarifier.innerText = i18n.getMessage('stationDataClarification') + ' ' + stationName;
  const liveBoardContainer = document.getElementById('liveBoardContainer');
  liveBoardContainer.insertBefore(stationDataClarifier, liveBoardContainer.children[0]);
}

document.addEventListener('DOMContentLoaded', function () {
  const loader = document.getElementById('loader');
  loader.removeAttribute('class');
  loader.children[0].hidden = 'hidden';
  loader.children[1].hidden = 'hidden';
  loader.children[2].hidden = 'hidden';

  const i18n = chrome.i18n;
  setStaticMessages(i18n);

  const stationNameInput = document.getElementById('stationName');
  loadRandomStation(i18n).then(
      (randomStation) => {
        stationNameInput.placeholder = randomStation.name;
      }
  );

  const manifestData = chrome.runtime.getManifest();
  document.getElementById('version').innerText = i18n.getMessage('version') + ' ' + manifestData.version;

  const clearSearch = document.getElementById('clearSearch');
  clearSearch.hidden = 'hidden';
  clearSearch.addEventListener('click', function () {
    document.getElementById('liveBoard').innerHTML = '';
    stationNameInput.value = '';
    clearSearch.hidden = 'hidden'

    loadRandomStation(i18n).then(
        (randomStation) => {
          stationNameInput.placeholder = randomStation.name;
        }
    );
  });

  stationNameInput.addEventListener('input', function () {
    if (stationNameInput.value) {
      const liveBoard = document.getElementById('liveBoard');
      loadLiveBoardForStation(i18n, stationNameInput.value).then(
          (data) => {
            showLiveBoard(i18n, stationNameInput.value, data, liveBoard);
          },
          () => {
            showNoResults(liveBoard, i18n, stationNameInput.value);
          }
      );
    } else {
      showStationDataClarifier(clearSearch, i18n);
    }
  });

}, false);