// bracket-view.js — Visual bracket tree rendering
// Depends on: data.js

var BracketView = (function() {

  function el(tag, className, text) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // Build the team display for a matchup slot
  function createTeamEl(seed, teamName, options) {
    var div = el('div', 'team');
    if (!seed) {
      div.classList.add('empty');
      var seedSpan = el('span', 'seed', '');
      var nameSpan = el('span', 'team-name', 'TBD');
      div.appendChild(seedSpan);
      div.appendChild(nameSpan);
      return div;
    }

    var seedSpan = el('span', 'seed', seed);
    div.appendChild(seedSpan);

    if (options.mode === 'setup' && options.round === 1 && options.isTeamNameEditable) {
      var nameWrap = el('span', 'team-name');
      var input = document.createElement('input');
      input.type = 'text';
      input.value = teamName || '';
      input.placeholder = 'Seed ' + seed;
      input.dataset.region = options.region;
      input.dataset.seed = seed;
      input.addEventListener('blur', function() {
        if (options.onTeamNameChanged) {
          options.onTeamNameChanged(options.region, seed, input.value.trim());
        }
      });
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') input.blur();
      });
      nameWrap.appendChild(input);
      div.appendChild(nameWrap);
    } else {
      var nameSpan = el('span', 'team-name', teamName || 'Seed ' + seed);
      div.appendChild(nameSpan);
    }

    div.dataset.seed = seed;
    return div;
  }

  // Build a single matchup element
  function createMatchupEl(game, options) {
    var matchup = el('div', 'matchup');
    var round = game.round;
    var region = game.region;

    var seed1 = game.seed1;
    var seed2 = game.seed2;
    var winner = game.winner;

    var name1 = '', name2 = '';

    // Get team names
    if (options.tournament) {
      if (round <= 4 && region) {
        name1 = seed1 ? getTeamName(options.tournament, region, seed1) : '';
        name2 = seed2 ? getTeamName(options.tournament, region, seed2) : '';
      } else if (round === 5 && game._region1) {
        name1 = seed1 ? getTeamName(options.tournament, game._region1, seed1) : '';
        name2 = seed2 ? getTeamName(options.tournament, game._region2, seed2) : '';
      } else if (round === 6) {
        // Championship: find regions from FF
        if (seed1) name1 = findChampTeamName(options.tournament, seed1, 0, options.resultsForLookup);
        if (seed2) name2 = findChampTeamName(options.tournament, seed2, 1, options.resultsForLookup);
      }
    }

    var teamOpts1 = Object.assign({}, options, { round: round, isTeamNameEditable: round === 1 });
    var teamOpts2 = Object.assign({}, options, { round: round, isTeamNameEditable: round === 1 });

    var team1 = createTeamEl(seed1, name1, teamOpts1);
    var team2 = createTeamEl(seed2, name2, teamOpts2);

    if (winner === seed1 && seed1) team1.classList.add('winner');
    if (winner === seed2 && seed2) team2.classList.add('winner');

    // Scoring overlay for detail mode
    if (options.mode === 'detail' && options.scoreDetails) {
      var detail = findScoreDetail(options.scoreDetails, round, region, seed1, seed2, options.gameIndex);
      if (detail) {
        if (detail.correct === true) {
          matchup.classList.add('correct');
          var picked = detail.pick;
          if (picked === seed1) team1.classList.add('correct-pick');
          if (picked === seed2) team2.classList.add('correct-pick');
          // Add score badge
          var badge = el('span', 'score-badge earned', '+' + detail.total);
          if (detail.bonus > 0) {
            badge.textContent = '+' + detail.base;
            var bonusBadge = el('span', 'score-badge bonus', '+' + detail.bonus);
            matchup.dataset.bonus = detail.bonus;
          }
          matchup.appendChild(badge);
          if (bonusBadge) matchup.appendChild(bonusBadge);
        } else if (detail.correct === false) {
          matchup.classList.add('incorrect');
          var picked = detail.pick;
          if (picked === seed1) team1.classList.add('incorrect-pick');
          if (picked === seed2) team2.classList.add('incorrect-pick');
        } else {
          matchup.classList.add('unplayed-result');
        }
      }
    }

    // Click handler for selecting winners
    if ((options.mode === 'setup' && round > 1) || options.mode === 'picks') {
      if (seed1 && seed2) {
        team1.addEventListener('click', function() {
          if (options.onWinnerSelected) {
            options.onWinnerSelected(round, region, options.gameIndex, seed1, game);
          }
        });
        team2.addEventListener('click', function() {
          if (options.onWinnerSelected) {
            options.onWinnerSelected(round, region, options.gameIndex, seed2, game);
          }
        });
      }
    }
    // In setup mode round 1, clicking team names to select winner after names entered
    if (options.mode === 'setup' && round === 1 && seed1 && seed2) {
      team1.addEventListener('click', function(e) {
        if (e.target.tagName === 'INPUT') return; // don't select winner while editing name
        if (options.onWinnerSelected) {
          options.onWinnerSelected(round, region, options.gameIndex, seed1, game);
        }
      });
      team2.addEventListener('click', function(e) {
        if (e.target.tagName === 'INPUT') return;
        if (options.onWinnerSelected) {
          options.onWinnerSelected(round, region, options.gameIndex, seed2, game);
        }
      });
    }

    matchup.appendChild(team1);
    matchup.appendChild(team2);

    // Score badges in detail mode - position them
    var badges = matchup.querySelectorAll('.score-badge');
    badges.forEach(function(b) {
      b.style.position = 'absolute';
      b.style.top = '2px';
    });
    if (badges[0]) badges[0].style.right = badges[1] ? '30px' : '4px';
    if (badges[1]) badges[1].style.right = '4px';

    return matchup;
  }

  function findChampTeamName(tournament, seed, semiIndex, resultsOverride) {
    var info = getFFTeamInfoFromResults(tournament, semiIndex, seed, resultsOverride);
    if (info.region) return getTeamName(tournament, info.region, seed);
    // Also check the other semi
    var otherInfo = getFFTeamInfoFromResults(tournament, 1 - semiIndex, seed, resultsOverride);
    if (otherInfo.region) return getTeamName(tournament, otherInfo.region, seed);
    return '';
  }

  // Like getFFTeamInfo but accepts an explicit results array (for picks/detail mode)
  function getFFTeamInfoFromResults(tournament, semiIndex, seed, resultsOverride) {
    if (resultsOverride) {
      var pairing = FF_PAIRINGS[semiIndex];
      if (!pairing) return { region: null, seed: seed };
      for (var i = 0; i < pairing.regions.length; i++) {
        var r = pairing.regions[i];
        var e8 = getGamesForRound(4, r, resultsOverride);
        if (e8[0] && e8[0].winner === seed) {
          return { region: r, seed: seed };
        }
      }
      return { region: null, seed: seed };
    }
    return getFFTeamInfo(tournament, semiIndex, seed);
  }

  function findScoreDetail(details, round, region, seed1, seed2, gameIndex) {
    if (round === 1) {
      // R1: exact seed pair match
      var s1 = Math.min(seed1, seed2);
      var s2 = Math.max(seed1, seed2);
      for (var i = 0; i < details.length; i++) {
        var d = details[i];
        if (d.round === round && d.region === region && d.matchup === s1 + 'v' + s2) {
          return d;
        }
      }
    } else if (round >= 2 && round <= 4) {
      // R2-R4: match by bracket position
      var game = { round: round, region: region, seed1: seed1, seed2: seed2 };
      var posKey = bracketPositionKey(game);
      for (var i = 0; i < details.length; i++) {
        if (details[i].positionKey === posKey) return details[i];
      }
    } else {
      // R5/R6: match by round + game index
      var posKey = round + '-FF-' + (gameIndex || 0);
      for (var i = 0; i < details.length; i++) {
        if (details[i].positionKey === posKey) return details[i];
      }
    }
    return null;
  }

  // Render a single region's bracket (rounds 1-4)
  function renderRegion(regionName, tournament, results, options) {
    var wrapper = el('div', 'bracket-region-wrapper');
    var label = el('div', 'bracket-region-label', regionName);
    wrapper.appendChild(label);

    var region = el('div', 'bracket-region');

    var rounds = [1, 2, 3, 4];
    var prevRoundEl = null;

    for (var ri = 0; ri < rounds.length; ri++) {
      var round = rounds[ri];
      var games = getGamesForRound(round, regionName, results);

      // If we're rendering picks, overlay pick data
      if (options.mode === 'picks' || options.mode === 'detail') {
        var pickResults = options.picks || [];
        games = getGamesForRound(round, regionName, pickResults);
        // For detail mode, we still need the actual results for matchup structure
        if (options.mode === 'detail') {
          games = getGamesForRound(round, regionName, results);
          // Overlay pick winners
          var pickGames = getGamesForRound(round, regionName, pickResults);
          games.forEach(function(g, idx) {
            if (pickGames[idx]) {
              g._pickWinner = pickGames[idx].winner;
            }
          });
        }
      }

      var roundCol = el('div', 'bracket-round');
      roundCol.dataset.round = round;

      for (var gi = 0; gi < games.length; gi++) {
        var game = games[gi];
        var matchupOpts = Object.assign({}, options, {
          region: regionName,
          gameIndex: gi,
          tournament: tournament
        });
        var matchupEl = createMatchupEl(game, matchupOpts);
        matchupEl.dataset.game = getGameId(round, regionName, gi);
        roundCol.appendChild(matchupEl);
      }

      // Add connector column between rounds
      if (ri > 0) {
        var connector = el('div', 'round-connector');
        var prevGames = getGamesForRound(rounds[ri - 1], regionName, results);
        for (var ci = 0; ci < prevGames.length; ci += 2) {
          var pair = el('div', 'connector-pair');
          connector.appendChild(pair);
        }
        region.appendChild(connector);
      }

      region.appendChild(roundCol);
    }

    wrapper.appendChild(region);
    return wrapper;
  }

  // Render the Final Four center section
  function renderFinalFour(tournament, results, options) {
    var center = el('div', 'bracket-center');
    var ffLabel = el('div', 'ff-label', 'Final Four');
    center.appendChild(ffLabel);

    var ffGames = getFFGames(tournament.regions, results);

    // If rendering picks
    if ((options.mode === 'picks' || options.mode === 'detail') && options.picks) {
      var pickFF = getFFGames(tournament.regions, options.picks);
      if (options.mode === 'picks') {
        ffGames = pickFF;
      }
    }

    var ffMatchups = el('div', 'ff-matchups');

    // Semifinal 1
    var semi1 = ffGames.semis[0];
    var semi1Opts = Object.assign({}, options, {
      gameIndex: 0,
      tournament: tournament
    });
    var semi1El = createMatchupEl(semi1, semi1Opts);
    semi1El.dataset.game = getGameId(5, null, 0);
    ffMatchups.appendChild(semi1El);

    // Semifinal 2
    var semi2 = ffGames.semis[1];
    var semi2Opts = Object.assign({}, options, {
      gameIndex: 1,
      tournament: tournament
    });
    var semi2El = createMatchupEl(semi2, semi2Opts);
    semi2El.dataset.game = getGameId(5, null, 1);
    ffMatchups.appendChild(semi2El);

    center.appendChild(ffMatchups);

    // Championship
    var champLabel = el('div', 'champ-label', 'Championship');
    center.appendChild(champLabel);

    var champ = ffGames.championship;
    // Determine which results to use for team name lookup
    var lookupResults = results;
    if ((options.mode === 'picks' || options.mode === 'detail') && options.picks) {
      lookupResults = options.picks;
    }
    var champOpts = Object.assign({}, options, {
      gameIndex: 0,
      tournament: tournament,
      resultsForLookup: lookupResults
    });
    var champEl = createMatchupEl(champ, champOpts);
    champEl.dataset.game = getGameId(6, null, 0);
    center.appendChild(champEl);

    // Champion display
    if (champ.winner) {
      var champDisplay = el('div', 'champion-display');
      var champTitle = el('div', 'champion-title', 'Champion');
      var champName = el('div', 'champion-name');
      // Find champion name
      var champTeamName = '';
      for (var ri = 0; ri < tournament.regions.length; ri++) {
        var tn = getTeamName(tournament, tournament.regions[ri], champ.winner);
        if (tn) { champTeamName = tn; break; }
      }
      champName.textContent = champTeamName || ('Seed ' + champ.winner);
      champDisplay.appendChild(champTitle);
      champDisplay.appendChild(champName);
      center.appendChild(champDisplay);
    }

    return center;
  }

  // Main render function
  function render(container, tournament, options) {
    container.innerHTML = '';
    options = options || {};

    var results = tournament.results || [];
    if (options.mode === 'picks' && options.picks) {
      // For picks mode, use picks as the "results" for bracket progression
    }

    var regions = tournament.regions;

    // Left half: regions[0] (top) and regions[1] (bottom)
    var leftHalf = el('div', 'bracket-half bracket-left');
    if (regions[0]) {
      leftHalf.appendChild(renderRegion(regions[0], tournament, results, options));
    }
    if (regions[1]) {
      leftHalf.appendChild(renderRegion(regions[1], tournament, results, options));
    }

    // Center: Final Four
    var center = renderFinalFour(tournament, results, options);

    // Right half: regions[2] (top) and regions[3] (bottom)
    var rightHalf = el('div', 'bracket-half bracket-right');
    if (regions[2]) {
      rightHalf.appendChild(renderRegion(regions[2], tournament, results, options));
    }
    if (regions[3]) {
      rightHalf.appendChild(renderRegion(regions[3], tournament, results, options));
    }

    container.appendChild(leftHalf);
    container.appendChild(center);
    container.appendChild(rightHalf);
  }

  return {
    render: render
  };
})();
