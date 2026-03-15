// app.js — Main application controller
// Depends on: data.js, scoring.js, storage.js, bracket-view.js

(function() {
  var state = null;
  var currentOverlay = null; // { type: 'picks'|'detail', participantIndex: number }
  var leaderboardSort = { column: 'total', ascending: false };
  var importCallback = null;

  // ======== INIT ========
  function init() {
    state = loadState();
    if (!state) {
      state = createAppState();
    }

    initTheme();
    renderSetupBracket();
    renderParticipantsList();
    renderLeaderboard();
    attachEventListeners();
  }

  // ======== RENDERING ========

  function renderSetupBracket() {
    var container = document.getElementById('bracket-setup');
    BracketView.render(container, state.tournament, {
      mode: 'setup',
      tournament: state.tournament,
      onTeamNameChanged: onTeamNameChanged,
      onWinnerSelected: onResultWinnerSelected
    });
  }

  function renderParticipantsList() {
    var container = document.getElementById('participants-list');
    container.innerHTML = '';

    if (state.participants.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '<div class="empty-icon">&#127936;</div><p>No participants yet.</p><p>Add participants to start tracking picks.</p>';
      container.appendChild(empty);
      return;
    }

    var results = state.tournament.results;
    var teams = state.tournament.teams;

    state.participants.forEach(function(p, idx) {
      var card = document.createElement('div');
      card.className = 'participant-card';

      var nameEl = document.createElement('span');
      nameEl.className = 'participant-name';
      nameEl.textContent = p.name;

      var score = calculateScore(p.picks, results, teams);
      var scoreEl = document.createElement('span');
      scoreEl.className = 'participant-score';
      scoreEl.textContent = score.total + ' pts';

      var actions = document.createElement('div');
      actions.className = 'participant-actions';

      var editBtn = document.createElement('button');
      editBtn.className = 'btn btn-small';
      editBtn.textContent = 'Edit Picks';
      editBtn.addEventListener('click', function() { openPicksOverlay(idx); });

      var importBtn = document.createElement('button');
      importBtn.className = 'btn btn-small';
      importBtn.textContent = 'Import CSV';
      importBtn.addEventListener('click', function() { importPicksCSV(idx); });

      var exportBtn = document.createElement('button');
      exportBtn.className = 'btn btn-small';
      exportBtn.textContent = 'Export CSV';
      exportBtn.addEventListener('click', function() { exportPicksCSV(idx); });

      var delBtn = document.createElement('button');
      delBtn.className = 'btn btn-small btn-danger';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', function() { removeParticipant(idx); });

      actions.appendChild(editBtn);
      actions.appendChild(importBtn);
      actions.appendChild(exportBtn);
      actions.appendChild(delBtn);

      card.appendChild(nameEl);
      card.appendChild(scoreEl);
      card.appendChild(actions);
      container.appendChild(card);
    });
  }

  function renderLeaderboard() {
    var container = document.getElementById('leaderboard-container');
    container.innerHTML = '';

    if (state.participants.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '<div class="empty-icon">&#127942;</div><p>No participants yet.</p><p>Add participants and enter results to see the leaderboard.</p>';
      container.appendChild(empty);
      return;
    }

    var ranked = rankParticipants(state.participants, state.tournament.results, state.tournament.teams);

    // Sort by current sort column
    if (leaderboardSort.column !== 'total') {
      ranked = sortLeaderboard(ranked, leaderboardSort.column, leaderboardSort.ascending);
    } else if (leaderboardSort.ascending) {
      ranked.reverse();
    }

    var table = document.createElement('table');
    table.className = 'leaderboard-table';

    // Header
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    var columns = [
      { key: 'rank', label: '#', cls: 'rank-col' },
      { key: 'name', label: 'Name', cls: 'name-col' },
      { key: 'total', label: 'Total', cls: 'total-col' },
      { key: 'bonus', label: 'Upset Bonus', cls: 'bonus-col' },
      { key: 'r1', label: 'R64', cls: 'round-col' },
      { key: 'r2', label: 'R32', cls: 'round-col' },
      { key: 'r3', label: 'S16', cls: 'round-col' },
      { key: 'r4', label: 'E8', cls: 'round-col' },
      { key: 'r5', label: 'FF', cls: 'round-col' },
      { key: 'r6', label: 'Champ', cls: 'round-col' }
    ];

    columns.forEach(function(col) {
      var th = document.createElement('th');
      th.className = col.cls;
      th.textContent = col.label;
      if (leaderboardSort.column === col.key) {
        th.classList.add('sorted');
        var arrow = document.createElement('span');
        arrow.className = 'sort-arrow';
        arrow.textContent = leaderboardSort.ascending ? ' \u25B2' : ' \u25BC';
        th.appendChild(arrow);
      }
      th.addEventListener('click', function() {
        if (leaderboardSort.column === col.key) {
          leaderboardSort.ascending = !leaderboardSort.ascending;
        } else {
          leaderboardSort.column = col.key;
          leaderboardSort.ascending = col.key === 'name';
        }
        renderLeaderboard();
      });
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    var tbody = document.createElement('tbody');
    ranked.forEach(function(entry) {
      var tr = document.createElement('tr');
      if (entry.rank <= 3) tr.classList.add('rank-' + entry.rank);

      var participantIdx = state.participants.findIndex(function(p) { return p.name === entry.name; });

      tr.addEventListener('click', function() {
        if (participantIdx >= 0) openDetailOverlay(participantIdx);
      });

      var rankTd = document.createElement('td');
      rankTd.className = 'rank-col';
      rankTd.textContent = entry.rank;
      tr.appendChild(rankTd);

      var nameTd = document.createElement('td');
      nameTd.className = 'name-col';
      nameTd.textContent = entry.name;
      tr.appendChild(nameTd);

      var totalTd = document.createElement('td');
      totalTd.className = 'total-col';
      totalTd.textContent = entry.score.total;
      tr.appendChild(totalTd);

      var bonusTd = document.createElement('td');
      bonusTd.className = 'bonus-col';
      bonusTd.textContent = entry.score.upsetBonus > 0 ? '+' + entry.score.upsetBonus : '-';
      tr.appendChild(bonusTd);

      // Per-round scores
      for (var r = 0; r < 6; r++) {
        var roundData = entry.score.byRound[r];
        var td = document.createElement('td');
        td.className = 'round-col';
        var pts = roundData.points + roundData.bonus;
        td.textContent = pts > 0 ? pts : '-';
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  function sortLeaderboard(ranked, column, ascending) {
    var sorted = ranked.slice();
    sorted.sort(function(a, b) {
      var va, vb;
      switch (column) {
        case 'name':
          va = a.name.toLowerCase();
          vb = b.name.toLowerCase();
          return ascending ? va.localeCompare(vb) : vb.localeCompare(va);
        case 'total':
          va = a.score.total; vb = b.score.total;
          break;
        case 'bonus':
          va = a.score.upsetBonus; vb = b.score.upsetBonus;
          break;
        case 'r1': case 'r2': case 'r3': case 'r4': case 'r5': case 'r6':
          var ri = parseInt(column.substring(1)) - 1;
          va = a.score.byRound[ri].points + a.score.byRound[ri].bonus;
          vb = b.score.byRound[ri].points + b.score.byRound[ri].bonus;
          break;
        default:
          va = a.score.total; vb = b.score.total;
      }
      if (ascending) return va - vb;
      return vb - va;
    });
    // Reassign ranks based on total (not sort column)
    return sorted;
  }

  // ======== TOURNAMENT SETUP ========

  function onTeamNameChanged(region, seed, name) {
    if (!state.tournament.teams[region]) {
      state.tournament.teams[region] = {};
    }
    state.tournament.teams[region][seed] = name;
    saveState(state);
    // Re-render to update team names in later rounds
    renderSetupBracket();
  }

  function onResultWinnerSelected(round, region, gameIndex, winnerSeed, game) {
    // Set the result
    setResult(state.tournament.results, round, region, game.seed1, game.seed2, winnerSeed);

    // Cascade: clear downstream results that depended on the loser
    cascadeResults(state.tournament.results, round, region, game, winnerSeed, state.tournament);

    saveState(state);
    renderSetupBracket();
    renderParticipantsList();
    renderLeaderboard();
  }

  function cascadeResults(results, round, region, game, newWinner, tournament) {
    // For regional rounds (1-4)
    if (round < 4 && region) {
      // The next round game that this feeds into
      var nextRound = round + 1;
      var nextGames = getGamesForRound(nextRound, region, results);
      // This game feeds into nextGames[Math.floor(gameIndex/2)] but we don't have reliable gameIndex
      // Instead, recalculate: the game structure is determined by bracket progression
      // Just clear any next-round results that had the old wrong team
      // Simplest approach: remove results for all subsequent rounds in this region if they reference a team that's no longer valid
      clearInvalidDownstream(results, round + 1, region, tournament);
    } else if (round === 4 && region) {
      // E8 winner goes to FF. Clear FF and Champ results if they're invalid
      clearInvalidFF(results, tournament);
    } else if (round === 5) {
      // FF winner goes to Championship
      clearInvalidChampionship(results, tournament);
    }
  }

  function clearInvalidDownstream(results, fromRound, region, tournament) {
    for (var r = fromRound; r <= 4; r++) {
      var validGames = getGamesForRound(r, region, results);
      // Remove any results for this round/region that don't match valid matchups
      for (var i = results.length - 1; i >= 0; i--) {
        var res = results[i];
        if (res.round === r && res.region === region) {
          // Check if this result's matchup is still valid
          var found = false;
          for (var j = 0; j < validGames.length; j++) {
            var vg = validGames[j];
            if (vg.seed1 === res.seed1 && vg.seed2 === res.seed2) {
              found = true;
              break;
            }
            if (vg.seed1 === res.seed2 && vg.seed2 === res.seed1) {
              found = true;
              break;
            }
          }
          if (!found) {
            results.splice(i, 1);
          }
        }
      }
    }
    // Also cascade to FF if we touched E8
    if (fromRound <= 4) {
      clearInvalidFF(results, tournament);
    }
  }

  function clearInvalidFF(results, tournament) {
    var ffGames = getFFGames(tournament.regions, results);
    // Remove any FF results that don't match current E8 winners
    for (var i = results.length - 1; i >= 0; i--) {
      var res = results[i];
      if (res.round === 5 && !res.region) {
        var matchesSemi = false;
        for (var s = 0; s < ffGames.semis.length; s++) {
          var semi = ffGames.semis[s];
          if (semi.seed1 && semi.seed2) {
            var lo1 = Math.min(semi.seed1, semi.seed2);
            var hi1 = Math.max(semi.seed1, semi.seed2);
            var lo2 = Math.min(res.seed1, res.seed2);
            var hi2 = Math.max(res.seed1, res.seed2);
            if (lo1 === lo2 && hi1 === hi2) {
              matchesSemi = true;
              break;
            }
          }
        }
        if (!matchesSemi) results.splice(i, 1);
      }
    }
    clearInvalidChampionship(results, tournament);
  }

  function clearInvalidChampionship(results, tournament) {
    var ffGames = getFFGames(tournament.regions, results);
    for (var i = results.length - 1; i >= 0; i--) {
      var res = results[i];
      if (res.round === 6 && !res.region) {
        var champ = ffGames.championship;
        if (champ.seed1 && champ.seed2) {
          var lo1 = Math.min(champ.seed1, champ.seed2);
          var hi1 = Math.max(champ.seed1, champ.seed2);
          var lo2 = Math.min(res.seed1, res.seed2);
          var hi2 = Math.max(res.seed1, res.seed2);
          if (lo1 !== lo2 || hi1 !== hi2) {
            results.splice(i, 1);
          }
        } else {
          results.splice(i, 1);
        }
      }
    }
  }

  // ======== PARTICIPANTS ========

  function addParticipant() {
    var input = document.getElementById('input-participant-name');
    var name = input.value.trim();
    if (!name) return;

    // Check for duplicate
    for (var i = 0; i < state.participants.length; i++) {
      if (state.participants[i].name.toLowerCase() === name.toLowerCase()) {
        showNotification('Participant "' + name + '" already exists.', 'error');
        return;
      }
    }

    state.participants.push(createParticipant(name));
    saveState(state);
    input.value = '';
    renderParticipantsList();
    renderLeaderboard();
    showNotification('Added ' + name, 'success');
  }

  function removeParticipant(idx) {
    var name = state.participants[idx].name;
    if (!confirm('Remove participant "' + name + '"?')) return;
    state.participants.splice(idx, 1);
    saveState(state);
    renderParticipantsList();
    renderLeaderboard();
    showNotification('Removed ' + name, 'info');
  }

  // ======== OVERLAY ========

  function openPicksOverlay(participantIdx) {
    currentOverlay = { type: 'picks', participantIndex: participantIdx };
    var overlay = document.getElementById('bracket-overlay');
    overlay.classList.remove('hidden');

    var p = state.participants[participantIdx];
    document.getElementById('overlay-title').textContent = p.name + ' — Edit Picks';
    document.getElementById('overlay-score-summary').innerHTML = '';

    var container = document.getElementById('bracket-overlay-content');
    BracketView.render(container, state.tournament, {
      mode: 'picks',
      tournament: state.tournament,
      picks: p.picks,
      onWinnerSelected: function(round, region, gameIndex, winnerSeed, game) {
        onPickWinnerSelected(participantIdx, round, region, gameIndex, winnerSeed, game);
      }
    });
  }

  function openDetailOverlay(participantIdx) {
    currentOverlay = { type: 'detail', participantIndex: participantIdx };
    var overlay = document.getElementById('bracket-overlay');
    overlay.classList.remove('hidden');

    var p = state.participants[participantIdx];
    var score = calculateScore(p.picks, state.tournament.results, state.tournament.teams);

    document.getElementById('overlay-title').textContent = p.name;

    var summary = document.getElementById('overlay-score-summary');
    summary.innerHTML = '';
    var stats = [
      { label: 'Total', value: score.total },
      { label: 'Upset Bonus', value: '+' + score.upsetBonus }
    ];
    score.byRound.forEach(function(r) {
      stats.push({ label: r.shortName, value: r.points + r.bonus });
    });
    stats.forEach(function(s) {
      var stat = document.createElement('div');
      stat.className = 'overlay-stat';
      stat.innerHTML = '<div class="stat-value">' + s.value + '</div><div class="stat-label">' + s.label + '</div>';
      summary.appendChild(stat);
    });

    var container = document.getElementById('bracket-overlay-content');
    BracketView.render(container, state.tournament, {
      mode: 'detail',
      tournament: state.tournament,
      picks: p.picks,
      scoreDetails: score.details
    });
  }

  function closeOverlay() {
    currentOverlay = null;
    document.getElementById('bracket-overlay').classList.add('hidden');
    renderParticipantsList();
    renderLeaderboard();
  }

  function onPickWinnerSelected(participantIdx, round, region, gameIndex, winnerSeed, game) {
    var p = state.participants[participantIdx];
    setResult(p.picks, round, region, game.seed1, game.seed2, winnerSeed);

    // Cascade picks too
    cascadeResults(p.picks, round, region, game, winnerSeed, state.tournament);

    saveState(state);

    // Re-render overlay
    openPicksOverlay(participantIdx);
  }

  // ======== IMPORT/EXPORT ========

  function showImportModal(title, callback) {
    document.getElementById('import-modal-title').textContent = title;
    document.getElementById('import-textarea').value = '';
    document.getElementById('import-modal').classList.remove('hidden');
    importCallback = callback;
  }

  function hideImportModal() {
    document.getElementById('import-modal').classList.add('hidden');
    importCallback = null;
  }

  function handleImportConfirm() {
    var text = document.getElementById('import-textarea').value.trim();
    if (!text) {
      showNotification('Nothing to import', 'error');
      return;
    }
    if (importCallback) {
      try {
        importCallback(text);
        hideImportModal();
      } catch (e) {
        showNotification('Import error: ' + e.message, 'error');
      }
    }
  }

  function handleExportJSON() {
    var json = exportJSON(state);
    downloadFile(json, 'march-madness-2026.json', 'application/json');
    showNotification('Exported JSON', 'success');
  }

  function handleImportJSON() {
    showImportModal('Import JSON', function(text) {
      var newState = importJSON(text);
      state = newState;
      saveState(state);
      renderSetupBracket();
      renderParticipantsList();
      renderLeaderboard();
      showNotification('Imported successfully', 'success');
    });
  }

  function handleExportResultsCSV() {
    var csv = exportCSV(state.tournament.results);
    downloadFile(csv, 'tournament-results-2026.csv', 'text/csv');
    showNotification('Exported results CSV', 'success');
  }

  function handleImportResultsCSV() {
    showImportModal('Import Results CSV', function(text) {
      var games = importCSV(text);
      state.tournament.results = games;
      saveState(state);
      renderSetupBracket();
      renderParticipantsList();
      renderLeaderboard();
      showNotification('Imported results', 'success');
    });
  }

  function importPicksCSV(participantIdx) {
    showImportModal('Import Picks for ' + state.participants[participantIdx].name, function(text) {
      var games = importCSV(text);
      state.participants[participantIdx].picks = games;
      saveState(state);
      renderParticipantsList();
      renderLeaderboard();
      showNotification('Imported picks', 'success');
    });
  }

  function exportPicksCSV(participantIdx) {
    var p = state.participants[participantIdx];
    var csv = exportCSV(p.picks);
    downloadFile(csv, p.name.replace(/\s+/g, '-') + '-picks.csv', 'text/csv');
    showNotification('Exported picks for ' + p.name, 'success');
  }

  function handleReset() {
    if (!confirm('Reset all data? This cannot be undone.')) return;
    clearState();
    state = createAppState();
    renderSetupBracket();
    renderParticipantsList();
    renderLeaderboard();
    showNotification('All data reset', 'info');
  }

  // ======== NOTIFICATIONS ========

  function showNotification(message, type) {
    var notif = document.createElement('div');
    notif.className = 'notification ' + (type || 'info');
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(function() {
      notif.style.opacity = '0';
      notif.style.transition = 'opacity 0.3s';
      setTimeout(function() { notif.remove(); }, 300);
    }, 2500);
  }

  // ======== EVENT LISTENERS ========

  function attachEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
        btn.classList.add('active');
        var tabId = 'tab-' + btn.dataset.tab;
        document.getElementById(tabId).classList.add('active');

        // Refresh leaderboard when switching to it
        if (btn.dataset.tab === 'leaderboard') {
          renderLeaderboard();
        }
      });
    });

    // Theme toggle
    document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);

    // Header buttons
    document.getElementById('btn-export-json').addEventListener('click', handleExportJSON);
    document.getElementById('btn-import-json').addEventListener('click', handleImportJSON);
    document.getElementById('btn-reset').addEventListener('click', handleReset);

    // Setup buttons
    document.getElementById('btn-import-results-csv').addEventListener('click', handleImportResultsCSV);
    document.getElementById('btn-export-results-csv').addEventListener('click', handleExportResultsCSV);

    // Add participant
    document.getElementById('btn-add-participant').addEventListener('click', addParticipant);
    document.getElementById('input-participant-name').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') addParticipant();
    });

    // Overlay close
    document.getElementById('btn-close-overlay').addEventListener('click', closeOverlay);

    // Modal buttons
    document.getElementById('btn-import-confirm').addEventListener('click', handleImportConfirm);
    document.getElementById('btn-import-cancel').addEventListener('click', hideImportModal);

    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (currentOverlay) closeOverlay();
        else hideImportModal();
      }
    });
  }

  // ======== THEME ========

  function initTheme() {
    var saved = localStorage.getItem('mm-theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
    }
    updateThemeButton();
  }

  function toggleTheme() {
    document.documentElement.classList.toggle('light');
    var isLight = document.documentElement.classList.contains('light');
    localStorage.setItem('mm-theme', isLight ? 'light' : 'dark');
    updateThemeButton();
  }

  function updateThemeButton() {
    var btn = document.getElementById('btn-theme-toggle');
    var isLight = document.documentElement.classList.contains('light');
    btn.textContent = isLight ? '\u2600' : '\u263D';
    btn.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
  }

  // ======== BOOTSTRAP ========
  document.addEventListener('DOMContentLoaded', init);
})();
