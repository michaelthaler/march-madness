// storage.js — localStorage persistence + JSON/CSV import/export
// Depends on: data.js

var STORAGE_KEY = 'marchMadness2026';

function saveState(appState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    var state = JSON.parse(raw);
    if (!state || !state.tournament || !state.participants) return null;
    if (!Array.isArray(state.tournament.regions)) return null;
    if (!state.tournament.teams) return null;
    if (!Array.isArray(state.participants)) return null;
    return state;
  } catch (e) {
    console.warn('Failed to load state:', e);
    return null;
  }
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

function exportJSON(appState) {
  return JSON.stringify(appState, null, 2);
}

function importJSON(jsonString) {
  var state;
  try {
    state = JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Invalid JSON: ' + e.message);
  }
  if (!state || !state.tournament || !state.participants) {
    throw new Error('Invalid format: missing tournament or participants');
  }
  if (!Array.isArray(state.tournament.regions) || !state.tournament.teams) {
    throw new Error('Invalid format: tournament missing regions or teams');
  }
  if (!Array.isArray(state.participants)) {
    throw new Error('Invalid format: participants must be an array');
  }
  return state;
}

function exportCSV(games) {
  var lines = ['round,region,seed1,seed2,winner,winnerSide'];
  games.forEach(function(g) {
    lines.push([
      g.round,
      g.region || '',
      g.seed1,
      g.seed2,
      g.winner || '',
      g.winnerSide || ''
    ].join(','));
  });
  return lines.join('\n');
}

function importCSV(csvString) {
  var lines = csvString.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have a header and at least one row');

  var header = lines[0].toLowerCase().trim();
  if (header.indexOf('round') === -1 || header.indexOf('seed1') === -1) {
    throw new Error('CSV must have columns: round, region, seed1, seed2, winner');
  }

  var games = [];
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    var parts = line.split(',').map(function(s) { return s.trim().replace(/^"|"$/g, ''); });
    if (parts.length < 5) continue;

    var round = parseInt(parts[0], 10);
    var region = parts[1] || null;
    var seed1 = parseInt(parts[2], 10);
    var seed2 = parseInt(parts[3], 10);
    var winner = parts[4] ? parseInt(parts[4], 10) : null;

    if (isNaN(round) || round < 1 || round > 6) {
      throw new Error('Invalid round on line ' + (i + 1) + ': ' + parts[0]);
    }
    if (isNaN(seed1) || seed1 < 1 || seed1 > 16) {
      throw new Error('Invalid seed1 on line ' + (i + 1) + ': ' + parts[2]);
    }
    if (isNaN(seed2) || seed2 < 1 || seed2 > 16) {
      throw new Error('Invalid seed2 on line ' + (i + 1) + ': ' + parts[3]);
    }
    if (winner !== null && winner !== seed1 && winner !== seed2) {
      throw new Error('Winner must be seed1 or seed2 on line ' + (i + 1));
    }
    if (region === '') region = null;

    var winnerSide = (parts.length >= 6 && parts[5]) ? parseInt(parts[5], 10) : null;
    if (winnerSide !== null && isNaN(winnerSide)) winnerSide = null;
    games.push(createGame(round, region, seed1, seed2, winner, winnerSide));
  }

  return games;
}

function downloadFile(content, filename, mimeType) {
  var blob = new Blob([content], { type: mimeType || 'text/plain' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function promptFileUpload(accept, callback) {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;
  input.addEventListener('change', function() {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        callback(e.target.result);
      };
      reader.readAsText(input.files[0]);
    }
  });
  input.click();
}
