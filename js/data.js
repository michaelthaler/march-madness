// data.js — Constants, data structures, and factory functions
// No dependencies. No DOM access.

const ROUNDS = [
  null, // index 0 unused
  { number: 1, name: 'Round of 64', shortName: 'R64', basePoints: 20, gamesPerRegion: 8 },
  { number: 2, name: 'Round of 32', shortName: 'R32', basePoints: 30, gamesPerRegion: 4 },
  { number: 3, name: 'Sweet 16', shortName: 'S16', basePoints: 50, gamesPerRegion: 2 },
  { number: 4, name: 'Elite 8', shortName: 'E8', basePoints: 90, gamesPerRegion: 1 },
  { number: 5, name: 'Final Four', shortName: 'FF', basePoints: 170, gamesPerRegion: 0 },
  { number: 6, name: 'Championship', shortName: 'Champ', basePoints: 330, gamesPerRegion: 0 }
];

const BASE_POINTS = [0, 20, 30, 50, 90, 170, 330];

// Standard NCAA bracket ordering within a region (R64 matchups)
const R64_MATCHUPS = [
  [1, 16], [8, 9], [5, 12], [4, 13],
  [6, 11], [3, 14], [7, 10], [2, 15]
];

const DEFAULT_REGIONS = ['South', 'West', 'East', 'Midwest'];

// Which regions pair up in the Final Four
// Left-side regions feed semifinal 1, right-side feed semifinal 2
const FF_PAIRINGS = [
  { semi: 0, regions: ['South', 'West'] },
  { semi: 1, regions: ['East', 'Midwest'] }
];

function createTournament(year, regionNames) {
  year = year || 2026;
  regionNames = regionNames || DEFAULT_REGIONS.slice();
  const teams = {};
  regionNames.forEach(r => { teams[r] = {}; });
  return {
    year: year,
    regions: regionNames,
    teams: teams,
    results: [] // array of game objects
  };
}

function createParticipant(name) {
  return { name: name, picks: [] };
}

function createGame(round, region, seed1, seed2, winner) {
  return {
    round: round,
    region: region || null,
    seed1: seed1,
    seed2: seed2,
    winner: winner || null
  };
}

function createAppState() {
  return {
    tournament: createTournament(2026, DEFAULT_REGIONS.slice()),
    participants: []
  };
}

// Deterministic game ID for DOM and lookup
function getGameId(round, region, gameIndex) {
  return 'R' + round + '-' + (region || 'FF') + '-' + gameIndex;
}

// Build game key for matching picks to results
function gameKey(game) {
  var s1 = Math.min(game.seed1, game.seed2);
  var s2 = Math.max(game.seed1, game.seed2);
  return game.round + '-' + (game.region || 'FF') + '-' + s1 + '-' + s2;
}

// Find a game in an array by round, region, and game index within that round/region
function findGameByIndex(games, round, region, gameIndex) {
  var matching = games.filter(function(g) {
    return g.round === round && g.region === region;
  });
  // Sort by seed1 to ensure consistent ordering
  matching.sort(function(a, b) { return a.seed1 - b.seed1; });
  return matching[gameIndex] || null;
}

// Get R64 games for a region (always the same matchups)
function getR64Games(region) {
  return R64_MATCHUPS.map(function(m) {
    return createGame(1, region, m[0], m[1], null);
  });
}

// Given results so far, compute what the matchups are for a given round and region
// Returns array of game objects (winner may be null if not yet determined)
function getGamesForRound(round, region, results) {
  if (round === 1) {
    // Overlay actual results onto the fixed matchups
    var r64 = getR64Games(region);
    r64.forEach(function(g) {
      var existing = findResultGame(results, g.round, g.region, g.seed1, g.seed2);
      if (existing) g.winner = existing.winner;
    });
    return r64;
  }

  // For rounds 2-4: pair up winners from the previous round
  var prevGames = getGamesForRound(round - 1, region, results);
  var games = [];
  for (var i = 0; i < prevGames.length; i += 2) {
    var w1 = prevGames[i].winner;
    var w2 = prevGames[i + 1].winner;
    var seed1 = w1 || 0;
    var seed2 = w2 || 0;
    var winner = null;
    if (seed1 && seed2) {
      var existing = findResultGame(results, round, region, Math.min(seed1, seed2), Math.max(seed1, seed2));
      if (existing) winner = existing.winner;
    }
    games.push(createGame(round, region, seed1, seed2, winner));
  }
  return games;
}

// Get Final Four games (round 5 and 6)
function getFFGames(regions, results) {
  var games = { semis: [], championship: null };

  FF_PAIRINGS.forEach(function(pairing, idx) {
    var r1 = pairing.regions[0];
    var r2 = pairing.regions[1];
    // Get E8 winners for each region
    var e8_1 = getGamesForRound(4, r1, results);
    var e8_2 = getGamesForRound(4, r2, results);
    var w1 = e8_1[0] ? e8_1[0].winner : 0;
    var w2 = e8_2[0] ? e8_2[0].winner : 0;
    var seed1 = w1 || 0;
    var seed2 = w2 || 0;
    var winner = null;
    if (seed1 && seed2) {
      var existing = findResultGame(results, 5, null, Math.min(seed1, seed2), Math.max(seed1, seed2));
      if (existing) winner = existing.winner;
    }
    var semiGame = createGame(5, null, seed1, seed2, winner);
    // Store region info for display
    semiGame._region1 = r1;
    semiGame._region2 = r2;
    games.semis.push(semiGame);
  });

  // Championship
  var w1 = games.semis[0].winner || 0;
  var w2 = games.semis[1].winner || 0;
  var champWinner = null;
  if (w1 && w2) {
    var existing = findResultGame(results, 6, null, Math.min(w1, w2), Math.max(w1, w2));
    if (existing) champWinner = existing.winner;
  }
  games.championship = createGame(6, null, w1, w2, champWinner);

  return games;
}

// Find a result game by round, region, seed1, seed2
function findResultGame(results, round, region, s1, s2) {
  var lo = Math.min(s1, s2);
  var hi = Math.max(s1, s2);
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    if (r.round === round && r.region === region) {
      var rlo = Math.min(r.seed1, r.seed2);
      var rhi = Math.max(r.seed1, r.seed2);
      if (rlo === lo && rhi === hi) return r;
    }
  }
  return null;
}

// Set or update a result in the results array
function setResult(results, round, region, seed1, seed2, winner) {
  var lo = Math.min(seed1, seed2);
  var hi = Math.max(seed1, seed2);
  var existing = findResultGame(results, round, region, lo, hi);
  if (existing) {
    existing.winner = winner;
    existing.seed1 = seed1;
    existing.seed2 = seed2;
  } else {
    results.push(createGame(round, region, seed1, seed2, winner));
  }
}

// Get the team name for a seed in a region
function getTeamName(tournament, region, seed) {
  if (!region || !seed) return '';
  var teams = tournament.teams[region];
  return (teams && teams[seed]) || '';
}

// For FF/Champ games, we need to know which region a seed came from
// Returns { region, seed } for a Final Four participant
function getFFTeamInfo(tournament, semiIndex, seed) {
  var pairing = FF_PAIRINGS[semiIndex];
  if (!pairing) return { region: null, seed: seed };
  // The seed in FF games is the original seed from the region
  // We need to figure out which region this seed came from
  // by checking E8 winners
  var results = tournament.results;
  for (var i = 0; i < pairing.regions.length; i++) {
    var r = pairing.regions[i];
    var e8 = getGamesForRound(4, r, results);
    if (e8[0] && e8[0].winner === seed) {
      return { region: r, seed: seed };
    }
  }
  return { region: null, seed: seed };
}
