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
  const uiLanguage = getMessage(i18n, '@@ui_locale').substring(0, 2); // Only interested in the 2 first chars

  return SUPPORTED_API_LANGUAGES.includes(uiLanguage) ? uiLanguage : 'en'; // Get matching lang or default to en
}

async function getRandomStation(i18n) {
  const response = await fetch(
      API_BASE_URL + '/stations/?format=json&lang=' + determineAPILanguageFromUILocale(i18n),
      API_REQUEST_INIT
  );
  const data = await response.json();

  const stations = data.station;

  return stations[Math.floor(Math.random() * stations.length)];
}

async function getLiveBoard(i18n, stationName, movementType) {
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