const API_REQUEST_INIT =         {
  headers: {
    'user-agent': 'Belgian Train Station (https://github.com/Thibstars/belgian-train-station-chrome)',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
  }
};

const API_BASE_URL = 'https://api.irail.be';

const SUPPORTED_API_LANGUAGES = ['en', 'nl', 'de', 'fr'];

const MOVEMENT_TYPE = {
  DEPARTURE: Symbol.for('departure'),
  ARRIVAL: Symbol.for('arrival')
}

function determineAPILanguageFromUILocale(i18n) {
  const uiLanguage = i18n.getMessage('@@ui_locale').substring(0, 2); // Only interested in the 2 first chars

  return SUPPORTED_API_LANGUAGES.includes(uiLanguage) ? uiLanguage : 'en'; // Get matching lang or default to en
}

async function loadLiveBoardForStation(i18n, stationName, movementType) {
  const liveBoard = document.getElementById('liveBoard');
  liveBoard.setAttribute('data-movement-type', Symbol.keyFor(movementType));
  const clearSearch = document.getElementById('clearSearch');
  clearSearch.hidden = false;
  removeStationDataClarifierIfPresent();

  liveBoard.replaceChildren(document.createTextNode(i18n.getMessage('fetchingData') + stationName));

  showLoader();

  let movement;

  switch (movementType) {
    case MOVEMENT_TYPE.DEPARTURE:
      movement = Symbol.keyFor(MOVEMENT_TYPE.DEPARTURE);
      break;
    case MOVEMENT_TYPE.ARRIVAL:
      movement = Symbol.keyFor(MOVEMENT_TYPE.ARRIVAL);
      break
    default:
      movement = Symbol.keyFor(MOVEMENT_TYPE.DEPARTURE);
  }

  const response = await fetch(
      API_BASE_URL + '/liveboard/?station=' + stationName + '&format=json&lang=' + determineAPILanguageFromUILocale(i18n) + '&arrdep=' + movement,
      API_REQUEST_INIT
  );

  return await response.json();
}

async function loadRandomStation(i18n) {
  const response = await fetch(
      API_BASE_URL + '/stations/?format=json&lang=' + determineAPILanguageFromUILocale(i18n),
      API_REQUEST_INIT
  );
  const data = await response.json();

  const stations = data.station;

  return stations[Math.floor(Math.random() * stations.length)];
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

function createMovementTable(liveBoard, i18n, stationName, movements) {
  const movementsTable = document.createElement('table');
  movementsTable.id = 'liveBoardTable';
  movementsTable.setAttribute('data-station-name', stationName);
  const headerRow = document.createElement('tr');
  const thCanceled = document.createElement('th');
  thCanceled.replaceChildren(document.createTextNode(i18n.getMessage('canceled')));
  const thDelay = document.createElement('th');
  thDelay.title = i18n.getMessage('delayTitle');
  thDelay.replaceChildren(document.createTextNode(i18n.getMessage('delay')));
  const thPlatform = document.createElement('th');
  thPlatform.replaceChildren(document.createTextNode(i18n.getMessage('platform')));
  const thStation = document.createElement('th');
  thStation.replaceChildren(document.createTextNode(i18n.getMessage('station')));
  const thTime = document.createElement('th');
  thTime.replaceChildren(document.createTextNode(i18n.getMessage('time')));
  headerRow.replaceChildren(
      thCanceled,
      thDelay,
      thPlatform,
      thStation,
      thTime,
  );
  movementsTable.replaceChildren(headerRow);

  for (const movement of movements) {
    const delayInMinutes = movement.delay / 60;
    const time = new Date(movement.time * 1000);
    const isCanceled = !movement.canceled === '0';
    const isDelayed = delayInMinutes > 0;
    const isUnknownPlatform = movement.platform === '?';

    const trMovement = document.createElement('tr');
    movementsTable.appendChild(trMovement);

    const tdCanceled = document.createElement('td');
    tdCanceled.className = isCanceled ? 'canceled' : '';
    tdCanceled.replaceChildren(document.createTextNode(!isCanceled ? i18n.getMessage('no') : i18n.getMessage('yes')));
    const tdDelay = document.createElement('td');
    tdDelay.className = isDelayed ? 'delayed' : '';
    tdDelay.replaceChildren(document.createTextNode(isDelayed ? delayInMinutes.toString() : '-'));
    const tdPlatform = document.createElement('td');
    tdPlatform.className = isUnknownPlatform ? 'unknownPlatform' : '';
    tdPlatform.title = isUnknownPlatform ? i18n.getMessage('unknownPlatform') : '';
    tdPlatform.replaceChildren(document.createTextNode(movement.platform));
    const tdStation = document.createElement('td');
    tdStation.className = 'clickableCell';
    tdStation.replaceChildren(document.createTextNode(movement.station));
    tdStation.onclick = function () {
      const selectedStationName = tdStation.innerText;

      let movementType = getSelectedMovementType()

      loadLiveBoardForStation(i18n, selectedStationName, movementType).then(
          (data) => {
            showLiveBoard(i18n, selectedStationName, data, liveBoard);
            document.getElementById('stationName').value = selectedStationName;
          }
      ).catch(
          () => {
            showNoResults(liveBoard, i18n, selectedStationName);
          }
      );
    };
    const tdTime = document.createElement('td');
    tdTime.title = time.toLocaleString();
    tdTime.replaceChildren(document.createTextNode(time.toLocaleTimeString()));
    trMovement.replaceChildren(
        tdCanceled,
        tdDelay,
        tdPlatform,
        tdStation,
        tdTime,
    );
  }

  return movementsTable;
}

function setStaticMessages(i18n) {
  const title = i18n.getMessage('extensionName');
  document.title = title;
  document.getElementById('titleHeader').innerText = title;

  document.getElementById('movementTypeLabel').innerText = i18n.getMessage('movementType');

  document.getElementById('stationNameLabel').innerText = i18n.getMessage('stationName');

  document.getElementById('clearSearch').innerText = i18n.getMessage('clear');
}

function showLiveBoard(i18n, stationName, data, liveBoard) {
  const movementType = Symbol.for(liveBoard.getAttribute('data-movement-type'));

  let movements = document.createElement('div');
  movements.id = 'movements';
  const numberSpan = document.createElement('span');
  numberSpan.id = 'movementAmount';
  let movementData;

  switch (movementType) {
    case MOVEMENT_TYPE.DEPARTURE:
      movements.replaceChildren(
          document.createTextNode(i18n.getMessage('departures')),
          numberSpan
      );
      numberSpan.innerText = data.departures.number;
      movementData = data.departures.departure;
      break;
    case MOVEMENT_TYPE.ARRIVAL:
      movements.replaceChildren(
          document.createTextNode(i18n.getMessage('arrivals')),
          numberSpan
      );
      numberSpan.innerText = data.arrivals.number;

      movementData = data.arrivals.arrival;
      break
    default:
      movements.replaceChildren(
          document.createTextNode(i18n.getMessage('departures')),
          numberSpan
      );
      numberSpan.innerText = data.departures.number;
      movementData = data.departures.departure;
  }

  liveBoard.replaceChildren(
      movements,
      document.createElement('br'),
      createMovementTable(liveBoard, i18n, stationName, movementData)
  );

  hideLoader();
}

function showNoResults(liveBoard, i18n, stationName) {
  liveBoard.replaceChildren(document.createTextNode(i18n.getMessage('noResults') + stationName));

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

function getSelectedMovementType() {
  const movementTypeSelect = document.getElementById('movementType');

  switch (Symbol.for(movementTypeSelect.value.toLowerCase())) {
    case MOVEMENT_TYPE.DEPARTURE :
      return MOVEMENT_TYPE.DEPARTURE;
    case MOVEMENT_TYPE.ARRIVAL :
      return MOVEMENT_TYPE.ARRIVAL;
    default:
      return MOVEMENT_TYPE.DEPARTURE;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const loader = document.getElementById('loader');
  loader.removeAttribute('class');
  loader.children[0].hidden = 'hidden';
  loader.children[1].hidden = 'hidden';
  loader.children[2].hidden = 'hidden';

  const i18n = chrome.i18n;
  setStaticMessages(i18n);

  const movementTypeSelect = document.getElementById('movementType');
  movementTypeSelect.replaceChildren();
  for (let key in MOVEMENT_TYPE) {
    const option = document.createElement('option');
    option.value = key;
    option.innerText = i18n.getMessage('movementType_' + key);
    movementTypeSelect.appendChild(option);
  }

  const stationNameInput = document.getElementById('stationName');
  loadRandomStation(i18n).then((randomStation) => {
    stationNameInput.placeholder = randomStation.name;
  }).catch(() => {
    stationNameInput.placeholder = '';
  });

  const manifestData = chrome.runtime.getManifest();
  const versionLink = document.getElementById('version');
  const version = manifestData.version;
  versionLink.innerText = i18n.getMessage('version') + ' ' + version;
  versionLink.setAttribute('href', 'https://github.com/Thibstars/belgian-train-station-chrome/releases/tag/' + version);
  versionLink.title = i18n.getMessage('release');

  const clearSearch = document.getElementById('clearSearch');
  clearSearch.hidden = 'hidden';
  clearSearch.addEventListener('click', function () {
    document.getElementById('liveBoard').replaceChildren();
    stationNameInput.value = '';
    clearSearch.hidden = 'hidden'

    loadRandomStation(i18n).then(
        (randomStation) => {
          stationNameInput.placeholder = randomStation.name;
        }
    ).catch(() => {
      stationNameInput.placeholder = '';
    });
  });

  stationNameInput.addEventListener('input', function () {
    if (stationNameInput.value) {
      let movementType = getSelectedMovementType();

      const liveBoard = document.getElementById('liveBoard');
      loadLiveBoardForStation(i18n, stationNameInput.value, movementType).then(
          (data) => {
            showLiveBoard(i18n, stationNameInput.value, data, liveBoard);
          }
      ).catch(
          () => {
            showNoResults(liveBoard, i18n, stationNameInput.value);
          }
      );
    } else {
      showStationDataClarifier(clearSearch, i18n);
    }
  });

  movementTypeSelect.addEventListener('change', () => {
    const liveBoard = document.getElementById('liveBoard');
    const liveBoardTable = document.getElementById('liveBoardTable');

    if (liveBoardTable) {
      const stationName = liveBoardTable.getAttribute('data-station-name');
      if (stationName) {
        const stationDataClarifier = document.getElementById('stationDataClarifier');

        loadLiveBoardForStation(i18n, stationName, getSelectedMovementType()).then(
            (data) => {
              showLiveBoard(i18n, stationName, data, liveBoard);
              if (stationDataClarifier) {
                showStationDataClarifier(clearSearch, i18n);
              }
            }
        ).catch(
            () => {
              showNoResults(liveBoard, i18n, stationName);
            }
        );
      }
    }
  })

}, false);