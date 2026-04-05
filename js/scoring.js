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
    // For FF/Championship (R5/R6), use winnerSide to ensure the correct team is matched,
    // not just the same seed number from a different region
    if (round >= 5 && result.winnerSide && pick.winnerSide) {
      if (pick.winnerSide !== result.winnerSide) {
        return { correct: false, base: 0, bonus: 0, total: 0 };
      }
    }
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

// Match picks to results by bracket position
// R1: exact seed matchups (always fixed). R2-R4: bracket slot within region.
// R5-R6: matched by game index (order) since seeds vary by participant.
function matchGames(picks, results) {
  var r1ResultMap = {};
  var posResultMap = {};
  var resultsByRound = {};

  results.forEach(function(r) {
    if (r.round === 1) {
      r1ResultMap[gameKey(r)] = r;
    } else if (r.round >= 2 && r.round <= 4) {
      posResultMap[bracketPositionKey(r)] = r;
    } else {
      if (!resultsByRound[r.round]) resultsByRound[r.round] = [];
      resultsByRound[r.round].push(r);
    }
  });

  var pairs = [];
  var picksByRound = {};

  picks.forEach(function(p) {
    if (p.round === 1) {
      pairs.push({ pick: p, result: r1ResultMap[gameKey(p)] || null });
    } else if (p.round >= 2 && p.round <= 4) {
      pairs.push({ pick: p, result: posResultMap[bracketPositionKey(p)] || null });
    } else {
      if (!picksByRound[p.round]) picksByRound[p.round] = [];
      picksByRound[p.round].push(p);
    }
  });

  // Match R5/R6 by position index
  [5, 6].forEach(function(round) {
    var rPicks = picksByRound[round] || [];
    var rResults = resultsByRound[round] || [];
    for (var i = 0; i < rPicks.length; i++) {
      pairs.push({ pick: rPicks[i], result: rResults[i] || null });
    }
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

  var ffIndex = {};
  pairs.forEach(function(pair) {
    var pick = pair.pick;
    var result = pair.result;
    var sc = scoreGame(pick, result);
    var round = pick.round;

    var s1 = Math.min(pick.seed1, pick.seed2);
    var s2 = Math.max(pick.seed1, pick.seed2);

    // Compute position key for bracket-view matching
    var posKey;
    if (round === 1) {
      posKey = gameKey(pick);
    } else if (round >= 2 && round <= 4) {
      posKey = bracketPositionKey(pick);
    } else {
      // R5/R6: use round + index
      if (!ffIndex[round]) ffIndex[round] = 0;
      posKey = round + '-FF-' + ffIndex[round]++;
    }

    details.push({
      round: round,
      region: pick.region,
      matchup: s1 + 'v' + s2,
      positionKey: posKey,
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
