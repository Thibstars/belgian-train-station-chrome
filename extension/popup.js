async function loadLiveBoardForStation(stationName) {
  const liveBoard = document.getElementById('liveBoard');
  const clearSearch = document.getElementById('clearSearch');
  clearSearch.hidden = false;

  liveBoard.innerHTML = 'Fetching station data for station: ' + stationName;

  try {
    const response = await fetch('https://api.irail.be/liveboard/?station=' + stationName + '&format=json');
    const data = await response.json();
    console.log(data);
    const departures = 'Departures: ' + data.departures.number;
    console.log(data.departures.departure);
    console.log(data.departures.departure[0].station)
    liveBoard.innerHTML = departures + '<br>' + createDeparturesTable(data.departures.departure);
  } catch (error) {
    liveBoard.innerHTML = 'No results found for ' + stationName;
  }
}

function createDeparturesTable(departures) {
  let result = '<table id="liveBoardTable">\n'
      + '    <tr>\n'
      + '        <th>Canceled</th>\n'
      + '        <th>Delay</th>\n'
      + '        <th>Platform</th>\n'
      + '        <th>Station</th>\n'
      + '        <th>Time</th>\n'
      + '    </tr>\n';

  for (const departure of departures) {
    result += '<tr>'
    result += '<td>' + (departure.canceled === '0' ? 'No' : 'Yes') + '</td>'
    result += '<td>' + departure.delay + '</td>'
    result += '<td>' + departure.platform + '</td>'
    result += '<td>' + departure.station + '</td>'
    result += '<td>' + new Date(departure.time * 1000).toLocaleString() + '</td>'
    result += '</tr>'
  }

  result += '</table>'

  return result;
}


document.addEventListener('DOMContentLoaded', function() {
  const stationNameInput = document.getElementById("stationName");
  stationNameInput.addEventListener('input', function (){loadLiveBoardForStation(stationNameInput.value)});

  const clearSearch = document.getElementById('clearSearch');
  clearSearch.hidden = 'hidden';
  clearSearch.addEventListener('click', function (){
    document.getElementById('liveBoard').innerHTML = '';
    stationNameInput.value = '';
    clearSearch.hidden = 'hidden'
  });

}, false);