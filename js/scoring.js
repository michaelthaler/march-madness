// scoring.js — Pure scoring engine
// Depends on: data.js (BASE_POINTS, gameKey, ROUNDS)

function calculateUpsetBonus(basePoints, winnerSeed, loserSeed) {
  // Upset = higher seed number (lower-ranked) beats lower seed number (higher-ranked)
  // Bonus = 10% per seed difference, applied to base points
  if (winnerSeed > loserSeed) {
    var diff = winnerSeed - loserSeed;
    return Math.round(basePoints * 0.10 * diff);
  }
  return 0;
}

function scoreGame(pick, result) {
  // If result has no winner yet, game not played
  if (!result || !result.winner) {
    return { correct: null, base: 0, bonus: 0, total: 0 };
  }
  // If pick has no winner, no points
  if (!pick || !pick.winner) {
    return { correct: false, base: 0, bonus: 0, total: 0 };
  }

  var round = result.round;
  var base = BASE_POINTS[round] || 0;

  if (pick.winner === result.winner) {
    var loserSeed = (result.winner === result.seed1) ? result.seed2 : result.seed1;
    var bonus = calculateUpsetBonus(base, result.winner, loserSeed);
    return {
      correct: true,
      base: base,
      bonus: bonus,
      total: base + bonus
    };
  }

  return { correct: false, base: 0, bonus: 0, total: 0 };
}

// Match picks to results by game key
function matchGames(picks, results) {
  var resultMap = {};
  results.forEach(function(r) {
    resultMap[gameKey(r)] = r;
  });

  var pairs = [];
  picks.forEach(function(p) {
    var key = gameKey(p);
    pairs.push({ pick: p, result: resultMap[key] || null });
  });

  return pairs;
}

function calculateScore(picks, results, teams) {
  var pairs = matchGames(picks, results);
  var total = 0;
  var upsetBonusTotal = 0;
  var details = [];

  // Per-round aggregation
  var byRoundMap = {};
  for (var r = 1; r <= 6; r++) {
    byRoundMap[r] = {
      round: r,
      name: ROUNDS[r].name,
      shortName: ROUNDS[r].shortName,
      correct: 0,
      possible: 0,
      points: 0,
      bonus: 0
    };
  }

  pairs.forEach(function(pair) {
    var pick = pair.pick;
    var result = pair.result;
    var sc = scoreGame(pick, result);
    var round = pick.round;

    var s1 = Math.min(pick.seed1, pick.seed2);
    var s2 = Math.max(pick.seed1, pick.seed2);

    details.push({
      round: round,
      region: pick.region,
      matchup: s1 + 'v' + s2,
      pick: pick.winner,
      actual: result ? result.winner : null,
      correct: sc.correct,
      base: sc.base,
      bonus: sc.bonus,
      total: sc.total
    });

    total += sc.total;
    upsetBonusTotal += sc.bonus;

    if (byRoundMap[round]) {
      if (result && result.winner) {
        byRoundMap[round].possible++;
      }
      if (sc.correct) {
        byRoundMap[round].correct++;
        byRoundMap[round].points += sc.base;
        byRoundMap[round].bonus += sc.bonus;
      }
    }
  });

  var byRound = [];
  for (var r = 1; r <= 6; r++) {
    byRound.push(byRoundMap[r]);
  }

  return {
    total: total,
    upsetBonus: upsetBonusTotal,
    byRound: byRound,
    details: details
  };
}

function rankParticipants(participants, results, teams) {
  var ranked = participants.map(function(p) {
    return {
      name: p.name,
      score: calculateScore(p.picks, results, teams)
    };
  });

  ranked.sort(function(a, b) { return b.score.total - a.score.total; });

  // Assign ranks with ties
  var rank = 1;
  for (var i = 0; i < ranked.length; i++) {
    if (i > 0 && ranked[i].score.total < ranked[i - 1].score.total) {
      rank = i + 1;
    }
    ranked[i].rank = rank;
  }

  return ranked;
}
