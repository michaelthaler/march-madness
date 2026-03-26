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

const DEFAULT_REGIONS = ['East', 'South', 'West', 'Midwest'];

// Which regions pair up in the Final Four
// Left-side regions feed semifinal 1, right-side feed semifinal 2
const FF_PAIRINGS = [
  { semi: 0, regions: ['East', 'South'] },
  { semi: 1, regions: ['West', 'Midwest'] }
];

// 2026 NCAA Tournament teams by region and seed
const DEFAULT_TEAMS = {
  'East': {
    1: 'Duke', 2: 'UConn', 3: 'Michigan St.', 4: 'Kansas',
    5: "St. John's", 6: 'Louisville', 7: 'UCLA', 8: 'Ohio St.',
    9: 'TCU', 10: 'UCF', 11: 'South Florida', 12: 'N. Iowa',
    13: 'Cal Baptist', 14: 'N. Dakota St.', 15: 'Furman', 16: 'Siena'
  },
  'South': {
    1: 'Florida', 2: 'Houston', 3: 'Illinois', 4: 'Nebraska',
    5: 'Vanderbilt', 6: 'N. Carolina', 7: "Saint Mary's", 8: 'Clemson',
    9: 'Iowa', 10: 'Texas A&M', 11: 'VCU', 12: 'McNeese',
    13: 'Troy', 14: 'Penn', 15: 'Idaho', 16: 'Prairie View A&M'
  },
  'West': {
    1: 'Arizona', 2: 'Purdue', 3: 'Gonzaga', 4: 'Arkansas',
    5: 'Wisconsin', 6: 'BYU', 7: 'Miami', 8: 'Villanova',
    9: 'Utah St.', 10: 'Missouri', 11: 'Texas', 12: 'High Point',
    13: 'Hawaii', 14: 'Kennesaw St.', 15: 'Queens', 16: 'LIU'
  },
  'Midwest': {
    1: 'Michigan', 2: 'Iowa St.', 3: 'Virginia', 4: 'Alabama',
    5: 'Texas Tech', 6: 'Tennessee', 7: 'Kentucky', 8: 'Georgia',
    9: 'Saint Louis', 10: 'Santa Clara', 11: 'Miami (OH)', 12: 'Akron',
    13: 'Hofstra', 14: 'Wright St.', 15: 'Tennessee St.', 16: 'Howard'
  }
};

// 2026 NCAA Tournament actual results — Round of 64 and Round of 32
// Format: [round, region, seed1, seed2, winner]
var DEFAULT_RESULTS = [
  // ===== ROUND OF 64 =====
  // East Region
  [1, 'East', 1, 16, 1],   // Duke def. Siena
  [1, 'East', 8, 9, 9],    // TCU def. Ohio St. (upset)
  [1, 'East', 5, 12, 5],   // St. John's def. N. Iowa
  [1, 'East', 4, 13, 4],   // Kansas def. Cal Baptist
  [1, 'East', 6, 11, 6],   // Louisville def. South Florida
  [1, 'East', 3, 14, 3],   // Michigan St. def. N. Dakota St.
  [1, 'East', 7, 10, 7],   // UCLA def. UCF
  [1, 'East', 2, 15, 2],   // UConn def. Furman
  // South Region
  [1, 'South', 1, 16, 1],  // Florida def. Prairie View A&M
  [1, 'South', 8, 9, 9],   // Iowa def. Clemson (upset)
  [1, 'South', 5, 12, 5],  // Vanderbilt def. McNeese
  [1, 'South', 4, 13, 4],  // Nebraska def. Troy
  [1, 'South', 6, 11, 11], // VCU def. N. Carolina (upset)
  [1, 'South', 3, 14, 3],  // Illinois def. Penn
  [1, 'South', 7, 10, 10], // Texas A&M def. Saint Mary's (upset)
  [1, 'South', 2, 15, 2],  // Houston def. Idaho
  // West Region
  [1, 'West', 1, 16, 1],   // Arizona def. LIU
  [1, 'West', 8, 9, 9],    // Utah St. def. Villanova (upset)
  [1, 'West', 5, 12, 12],  // High Point def. Wisconsin (upset)
  [1, 'West', 4, 13, 4],   // Arkansas def. Hawaii
  [1, 'West', 6, 11, 11],  // Texas def. BYU (upset)
  [1, 'West', 3, 14, 3],   // Gonzaga def. Kennesaw St.
  [1, 'West', 7, 10, 7],   // Miami def. Missouri
  [1, 'West', 2, 15, 2],   // Purdue def. Queens
  // Midwest Region
  [1, 'Midwest', 1, 16, 1],  // Michigan def. Howard
  [1, 'Midwest', 8, 9, 9],   // Saint Louis def. Georgia (upset)
  [1, 'Midwest', 5, 12, 5],  // Texas Tech def. Akron
  [1, 'Midwest', 4, 13, 4],  // Alabama def. Hofstra
  [1, 'Midwest', 6, 11, 6],  // Tennessee def. Miami (OH)
  [1, 'Midwest', 3, 14, 3],  // Virginia def. Wright St.
  [1, 'Midwest', 7, 10, 7],  // Kentucky def. Santa Clara
  [1, 'Midwest', 2, 15, 2],  // Iowa St. def. Tennessee St.
  // ===== ROUND OF 32 =====
  // East Region
  [2, 'East', 1, 9, 1],    // Duke def. TCU
  [2, 'East', 4, 5, 5],    // St. John's def. Kansas (upset)
  [2, 'East', 3, 6, 3],    // Michigan St. def. Louisville
  [2, 'East', 2, 7, 2],    // UConn def. UCLA
  // South Region
  [2, 'South', 1, 9, 9],   // Iowa def. Florida (upset!)
  [2, 'South', 4, 5, 4],   // Nebraska def. Vanderbilt
  [2, 'South', 3, 11, 3],  // Illinois def. VCU
  [2, 'South', 2, 10, 2],  // Houston def. Texas A&M
  // West Region
  [2, 'West', 1, 9, 1],    // Arizona def. Utah St.
  [2, 'West', 4, 12, 4],   // Arkansas def. High Point
  [2, 'West', 3, 11, 11],  // Texas def. Gonzaga (upset)
  [2, 'West', 2, 7, 2],    // Purdue def. Miami
  // Midwest Region
  [2, 'Midwest', 1, 9, 1], // Michigan def. Saint Louis
  [2, 'Midwest', 4, 5, 4], // Alabama def. Texas Tech
  [2, 'Midwest', 3, 6, 6], // Tennessee def. Virginia (upset)
  [2, 'Midwest', 2, 7, 2]  // Iowa St. def. Kentucky
];

// 2026 ESPN Tournament Challenge bracket picks
// Format per pick: [round, region, seed1, seed2, winner]
var DEFAULT_PARTICIPANTS = [
  { name: "Samtoo1", picks: [
    [1,'East',1,16,1],[1,'East',2,15,2],[1,'East',3,14,3],[1,'East',4,13,4],
    [1,'East',5,12,5],[1,'East',6,11,6],[1,'East',7,10,7],[1,'East',8,9,8],
    [1,'South',1,16,1],[1,'South',2,15,2],[1,'South',3,14,3],[1,'South',4,13,4],
    [1,'South',5,12,5],[1,'South',6,11,6],[1,'South',7,10,10],[1,'South',8,9,9],
    [1,'West',1,16,1],[1,'West',2,15,2],[1,'West',3,14,3],[1,'West',4,13,4],
    [1,'West',5,12,5],[1,'West',6,11,11],[1,'West',7,10,10],[1,'West',8,9,8],
    [1,'Midwest',1,16,1],[1,'Midwest',2,15,15],[1,'Midwest',3,14,3],[1,'Midwest',4,13,4],
    [1,'Midwest',5,12,5],[1,'Midwest',6,11,6],[1,'Midwest',7,10,7],[1,'Midwest',8,9,8],
    [2,'East',1,8,1],[2,'East',2,7,2],[2,'East',3,6,3],[2,'East',4,5,4],
    [2,'South',1,9,1],[2,'South',2,10,2],[2,'South',3,6,3],[2,'South',4,5,4],
    [2,'West',1,8,1],[2,'West',2,10,2],[2,'West',3,11,11],[2,'West',4,5,4],
    [2,'Midwest',1,8,1],[2,'Midwest',3,6,6],[2,'Midwest',4,5,4],[2,'Midwest',7,15,7],
    [3,'East',1,4,1],[3,'East',2,3,2],[3,'South',1,4,1],[3,'South',2,3,2],
    [3,'West',1,4,4],[3,'West',2,11,2],[3,'Midwest',1,4,4],[3,'Midwest',6,7,6],
    [4,'East',1,2,2],[4,'South',1,2,2],[4,'West',2,4,2],[4,'Midwest',4,6,6],
    [5,null,2,2,2],[5,null,2,6,2],[6,null,2,2,2]
  ]},
  { name: "mtoma33", picks: [
    [1,'East',1,16,1],[1,'East',2,15,2],[1,'East',3,14,3],[1,'East',4,13,4],
    [1,'East',5,12,5],[1,'East',6,11,6],[1,'East',7,10,7],[1,'East',8,9,8],
    [1,'South',1,16,1],[1,'South',2,15,2],[1,'South',3,14,3],[1,'South',4,13,4],
    [1,'South',5,12,5],[1,'South',6,11,6],[1,'South',7,10,10],[1,'South',8,9,9],
    [1,'West',1,16,1],[1,'West',2,15,2],[1,'West',3,14,3],[1,'West',4,13,4],
    [1,'West',5,12,5],[1,'West',6,11,6],[1,'West',7,10,7],[1,'West',8,9,9],
    [1,'Midwest',1,16,1],[1,'Midwest',2,15,2],[1,'Midwest',3,14,3],[1,'Midwest',4,13,4],
    [1,'Midwest',5,12,5],[1,'Midwest',6,11,6],[1,'Midwest',7,10,7],[1,'Midwest',8,9,8],
    [2,'East',1,8,1],[2,'East',2,7,2],[2,'East',3,6,3],[2,'East',4,5,5],
    [2,'South',1,9,1],[2,'South',2,10,2],[2,'South',3,6,3],[2,'South',4,5,5],
    [2,'West',1,9,1],[2,'West',2,7,2],[2,'West',3,6,3],[2,'West',4,5,4],
    [2,'Midwest',1,8,1],[2,'Midwest',2,7,2],[2,'Midwest',3,6,3],[2,'Midwest',4,5,4],
    [3,'East',1,5,1],[3,'East',2,3,2],[3,'South',1,5,1],[3,'South',2,3,2],
    [3,'West',1,4,1],[3,'West',2,3,2],[3,'Midwest',1,4,1],[3,'Midwest',2,3,2],
    [4,'East',1,2,1],[4,'South',1,2,2],[4,'West',1,2,1],[4,'Midwest',1,2,2],
    [5,null,1,2,2],[5,null,1,2,1],[6,null,1,2,1]
  ]},
  { name: "Claude", picks: [
    [1,'East',1,16,1],[1,'East',2,15,2],[1,'East',3,14,3],[1,'East',4,13,4],
    [1,'East',5,12,5],[1,'East',6,11,6],[1,'East',7,10,7],[1,'East',8,9,8],
    [1,'South',1,16,1],[1,'South',2,15,2],[1,'South',3,14,3],[1,'South',4,13,4],
    [1,'South',5,12,5],[1,'South',6,11,11],[1,'South',7,10,7],[1,'South',8,9,9],
    [1,'West',1,16,1],[1,'West',2,15,2],[1,'West',3,14,3],[1,'West',4,13,4],
    [1,'West',5,12,5],[1,'West',6,11,6],[1,'West',7,10,10],[1,'West',8,9,9],
    [1,'Midwest',1,16,1],[1,'Midwest',2,15,2],[1,'Midwest',3,14,3],[1,'Midwest',4,13,4],
    [1,'Midwest',5,12,5],[1,'Midwest',6,11,6],[1,'Midwest',7,10,7],[1,'Midwest',8,9,8],
    [2,'East',1,8,1],[2,'East',2,7,2],[2,'East',3,6,3],[2,'East',4,5,5],
    [2,'South',1,9,1],[2,'South',2,7,2],[2,'South',3,11,3],[2,'South',4,5,5],
    [2,'West',1,9,1],[2,'West',2,10,2],[2,'West',3,6,3],[2,'West',4,5,5],
    [2,'Midwest',1,8,1],[2,'Midwest',2,7,2],[2,'Midwest',3,6,6],[2,'Midwest',4,5,4],
    [3,'East',1,5,1],[3,'East',2,3,2],[3,'South',1,5,1],[3,'South',2,3,2],
    [3,'West',1,5,1],[3,'West',2,3,2],[3,'Midwest',1,4,1],[3,'Midwest',2,6,2],
    [4,'East',1,2,1],[4,'South',1,2,1],[4,'West',1,2,1],[4,'Midwest',1,2,1],
    [5,null,1,1,1],[5,null,1,1,1],[6,null,1,1,1]
  ]},
  { name: "ESPNGenia", picks: [
    [1,'East',1,16,1],[1,'East',2,15,2],[1,'East',3,14,3],[1,'East',4,13,4],
    [1,'East',5,12,5],[1,'East',6,11,6],[1,'East',7,10,10],[1,'East',8,9,9],
    [1,'South',1,16,1],[1,'South',2,15,2],[1,'South',3,14,3],[1,'South',4,13,4],
    [1,'South',5,12,5],[1,'South',6,11,6],[1,'South',7,10,7],[1,'South',8,9,9],
    [1,'West',1,16,1],[1,'West',2,15,2],[1,'West',3,14,3],[1,'West',4,13,4],
    [1,'West',5,12,5],[1,'West',6,11,6],[1,'West',7,10,7],[1,'West',8,9,9],
    [1,'Midwest',1,16,1],[1,'Midwest',2,15,2],[1,'Midwest',3,14,3],[1,'Midwest',4,13,4],
    [1,'Midwest',5,12,5],[1,'Midwest',6,11,6],[1,'Midwest',7,10,7],[1,'Midwest',8,9,8],
    [2,'East',1,9,1],[2,'East',2,10,2],[2,'East',3,6,6],[2,'East',4,5,5],
    [2,'South',1,9,1],[2,'South',2,7,2],[2,'South',3,6,3],[2,'South',4,5,5],
    [2,'West',1,9,1],[2,'West',2,7,2],[2,'West',3,6,3],[2,'West',4,5,4],
    [2,'Midwest',1,8,1],[2,'Midwest',2,7,2],[2,'Midwest',3,6,6],[2,'Midwest',4,5,4],
    [3,'East',1,5,1],[3,'East',2,6,2],[3,'South',1,5,1],[3,'South',2,3,2],
    [3,'West',1,4,1],[3,'West',2,3,3],[3,'Midwest',1,4,1],[3,'Midwest',2,6,2],
    [4,'East',1,2,1],[4,'South',1,2,2],[4,'West',1,3,3],[4,'Midwest',1,2,1],
    [5,null,1,2,2],[5,null,1,3,1],[6,null,1,2,2]
  ]},
  { name: "Dancing with the Devils", picks: [
    [1,'East',1,16,1],[1,'East',2,15,2],[1,'East',3,14,3],[1,'East',4,13,4],
    [1,'East',5,12,5],[1,'East',6,11,11],[1,'East',7,10,7],[1,'East',8,9,8],
    [1,'South',1,16,1],[1,'South',2,15,2],[1,'South',3,14,3],[1,'South',4,13,4],
    [1,'South',5,12,5],[1,'South',6,11,11],[1,'South',7,10,7],[1,'South',8,9,9],
    [1,'West',1,16,1],[1,'West',2,15,2],[1,'West',3,14,3],[1,'West',4,13,4],
    [1,'West',5,12,5],[1,'West',6,11,11],[1,'West',7,10,10],[1,'West',8,9,9],
    [1,'Midwest',1,16,1],[1,'Midwest',2,15,2],[1,'Midwest',3,14,3],[1,'Midwest',4,13,4],
    [1,'Midwest',5,12,12],[1,'Midwest',6,11,6],[1,'Midwest',7,10,10],[1,'Midwest',8,9,9],
    [2,'East',1,8,1],[2,'East',2,7,2],[2,'East',3,11,3],[2,'East',4,5,5],
    [2,'South',1,9,1],[2,'South',2,7,2],[2,'South',3,11,3],[2,'South',4,5,5],
    [2,'West',1,9,1],[2,'West',2,10,2],[2,'West',3,11,3],[2,'West',4,5,4],
    [2,'Midwest',1,9,1],[2,'Midwest',2,10,2],[2,'Midwest',3,6,6],[2,'Midwest',4,12,12],
    [3,'East',1,5,1],[3,'East',2,3,3],[3,'South',1,5,1],[3,'South',2,3,3],
    [3,'West',1,4,1],[3,'West',2,3,2],[3,'Midwest',1,12,1],[3,'Midwest',2,6,2],
    [4,'East',1,3,1],[4,'South',1,3,1],[4,'West',1,2,1],[4,'Midwest',1,2,2],
    [5,null,1,1,1],[5,null,1,2,1],[6,null,1,1,1]
  ]},
  { name: "Gastelum", picks: [
    [1,'East',1,16,1],[1,'East',2,15,2],[1,'East',3,14,3],[1,'East',4,13,4],
    [1,'East',5,12,12],[1,'East',6,11,11],[1,'East',7,10,7],[1,'East',8,9,8],
    [1,'South',1,16,1],[1,'South',2,15,2],[1,'South',3,14,3],[1,'South',4,13,4],
    [1,'South',5,12,5],[1,'South',6,11,6],[1,'South',7,10,7],[1,'South',8,9,8],
    [1,'West',1,16,1],[1,'West',2,15,2],[1,'West',3,14,3],[1,'West',4,13,4],
    [1,'West',5,12,5],[1,'West',6,11,11],[1,'West',7,10,7],[1,'West',8,9,9],
    [1,'Midwest',1,16,1],[1,'Midwest',2,15,2],[1,'Midwest',3,14,3],[1,'Midwest',4,13,4],
    [1,'Midwest',5,12,5],[1,'Midwest',6,11,6],[1,'Midwest',7,10,7],[1,'Midwest',8,9,8],
    [2,'East',1,8,1],[2,'East',2,7,2],[2,'East',3,11,3],[2,'East',4,12,4],
    [2,'South',1,8,1],[2,'South',2,7,2],[2,'South',3,6,3],[2,'South',4,5,4],
    [2,'West',1,9,1],[2,'West',2,7,2],[2,'West',3,11,3],[2,'West',4,5,4],
    [2,'Midwest',1,8,1],[2,'Midwest',2,7,7],[2,'Midwest',3,6,6],[2,'Midwest',4,5,4],
    [3,'East',1,4,1],[3,'East',2,3,2],[3,'South',1,4,4],[3,'South',2,3,2],
    [3,'West',1,4,1],[3,'West',2,3,2],[3,'Midwest',1,4,1],[3,'Midwest',6,7,7],
    [4,'East',1,2,1],[4,'South',2,4,4],[4,'West',1,2,1],[4,'Midwest',1,7,1],
    [5,null,1,4,1],[5,null,1,1,1],[6,null,1,1,1]
  ]},
  { name: "Luck o' the foolish", picks: [
    [1,'East',1,16,1],[1,'East',2,15,2],[1,'East',3,14,3],[1,'East',4,13,4],
    [1,'East',5,12,12],[1,'East',6,11,6],[1,'East',7,10,7],[1,'East',8,9,8],
    [1,'South',1,16,1],[1,'South',2,15,2],[1,'South',3,14,3],[1,'South',4,13,4],
    [1,'South',5,12,5],[1,'South',6,11,11],[1,'South',7,10,10],[1,'South',8,9,8],
    [1,'West',1,16,1],[1,'West',2,15,2],[1,'West',3,14,3],[1,'West',4,13,13],
    [1,'West',5,12,5],[1,'West',6,11,6],[1,'West',7,10,10],[1,'West',8,9,8],
    [1,'Midwest',1,16,1],[1,'Midwest',2,15,2],[1,'Midwest',3,14,3],[1,'Midwest',4,13,4],
    [1,'Midwest',5,12,5],[1,'Midwest',6,11,6],[1,'Midwest',7,10,7],[1,'Midwest',8,9,9],
    [2,'East',1,8,1],[2,'East',2,7,2],[2,'East',3,6,3],[2,'East',4,12,4],
    [2,'South',1,8,1],[2,'South',2,10,2],[2,'South',3,11,3],[2,'South',4,5,4],
    [2,'West',1,8,8],[2,'West',2,10,2],[2,'West',3,6,3],[2,'West',5,13,5],
    [2,'Midwest',1,9,1],[2,'Midwest',2,7,7],[2,'Midwest',3,6,3],[2,'Midwest',4,5,5],
    [3,'East',1,4,1],[3,'East',2,3,2],[3,'South',1,4,4],[3,'South',2,3,3],
    [3,'West',2,3,2],[3,'West',5,8,5],[3,'Midwest',1,5,5],[3,'Midwest',3,7,7],
    [4,'East',1,2,1],[4,'South',3,4,3],[4,'West',2,5,2],[4,'Midwest',5,7,7],
    [5,null,1,3,1],[5,null,2,7,7],[6,null,1,7,7]
  ]},
  { name: "mattieft", picks: [
    [1,'East',1,16,1],[1,'East',2,15,2],[1,'East',3,14,3],[1,'East',4,13,4],
    [1,'East',5,12,12],[1,'East',6,11,6],[1,'East',7,10,7],[1,'East',8,9,8],
    [1,'South',1,16,1],[1,'South',2,15,2],[1,'South',3,14,3],[1,'South',4,13,13],
    [1,'South',5,12,5],[1,'South',6,11,11],[1,'South',7,10,10],[1,'South',8,9,9],
    [1,'West',1,16,1],[1,'West',2,15,2],[1,'West',3,14,3],[1,'West',4,13,13],
    [1,'West',5,12,5],[1,'West',6,11,6],[1,'West',7,10,10],[1,'West',8,9,8],
    [1,'Midwest',1,16,1],[1,'Midwest',2,15,2],[1,'Midwest',3,14,3],[1,'Midwest',4,13,4],
    [1,'Midwest',5,12,5],[1,'Midwest',6,11,11],[1,'Midwest',7,10,7],[1,'Midwest',8,9,9],
    [2,'East',1,8,1],[2,'East',2,7,2],[2,'East',3,6,6],[2,'East',4,12,4],
    [2,'South',1,9,1],[2,'South',2,10,10],[2,'South',3,11,3],[2,'South',5,13,5],
    [2,'West',1,8,1],[2,'West',2,10,2],[2,'West',3,6,3],[2,'West',5,13,5],
    [2,'Midwest',1,9,1],[2,'Midwest',2,7,7],[2,'Midwest',3,11,3],[2,'Midwest',4,5,5],
    [3,'East',1,4,1],[3,'East',2,6,2],[3,'South',1,5,5],[3,'South',3,10,3],
    [3,'West',1,5,1],[3,'West',2,3,3],[3,'Midwest',1,5,1],[3,'Midwest',3,7,3],
    [4,'East',1,2,2],[4,'South',3,5,3],[4,'West',1,3,3],[4,'Midwest',1,3,1],
    [5,null,1,3,1],[5,null,2,3,2],[6,null,1,2,1]
  ]}
];

function createTournament(year, regionNames) {
  year = year || 2026;
  regionNames = regionNames || DEFAULT_REGIONS.slice();
  const teams = {};
  regionNames.forEach(r => {
    teams[r] = DEFAULT_TEAMS[r] ? Object.assign({}, DEFAULT_TEAMS[r]) : {};
  });
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

// Build game key for matching picks to results (used for R1 only)
function gameKey(game) {
  var s1 = Math.min(game.seed1, game.seed2);
  var s2 = Math.max(game.seed1, game.seed2);
  return game.round + '-' + (game.region || 'FF') + '-' + s1 + '-' + s2;
}

// Maps each seed to its R1 bracket slot (0-7) for bracket position matching
var SEED_TO_SLOT = {1:0, 16:0, 8:1, 9:1, 5:2, 12:2, 4:3, 13:3, 6:4, 11:4, 3:5, 14:5, 7:6, 10:6, 2:7, 15:7};

// Returns a bracket-position key for R2-R4 games. Both seeds in a matchup
// always map to the same position regardless of who won the previous round.
function bracketPositionKey(game) {
  var slot = SEED_TO_SLOT[game.seed1];
  if (slot === undefined) return game.round + '-' + (game.region || 'FF') + '-unknown';
  var divisor = Math.pow(2, game.round - 1);
  var pos = Math.floor(slot / divisor);
  return game.round + '-' + (game.region || 'FF') + '-' + pos;
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
