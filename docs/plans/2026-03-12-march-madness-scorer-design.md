# March Madness Scorer 2026 — Design

## Overview

An interactive web-based March Madness bracket scoring tool for tracking a multi-player pool. Supports entering actual tournament results and multiple participants' bracket picks, then automatically calculates scores with upset bonuses and displays a leaderboard.

## Scoring Rules

**Base points per correct pick:**
| Round | Points |
|-------|--------|
| Round of 64 | 10 |
| Round of 32 | 20 |
| Sweet 16 | 40 |
| Elite 8 | 80 |
| Final Four | 160 |
| Championship | 320 |

**Upset bonus:** `round(base × 0.06 × seed_difference)` where `seed_difference = higher_seed - lower_seed`. Applied only when a lower-seeded team (higher number) is correctly picked to win.

## Tech Stack

Vanilla HTML/CSS/JS — no framework, no build step. Open `index.html` in a browser to use.

## File Structure

```
index.html              — Main page
css/styles.css          — All styling
js/scoring.js           — Pure scoring engine (no DOM)
js/data.js              — Tournament data structures + 2026 bracket
js/storage.js           — localStorage auto-save + JSON/CSV export/import
js/bracket-view.js      — Visual bracket tree rendering
js/app.js               — Main UI logic, event handlers, leaderboard
```

## Data Model

```js
tournament = {
  year: 2026,
  regions: ["South", "West", "East", "Midwest"],  // actual region names TBD
  teams: {
    "South": { 1: "Team A", 2: "Team B", ..., 16: "Team P" },
    // ... per region
  },
  results: [
    // Each game result, filled in as tournament progresses
    { round: 1, region: "South", seed1: 1, seed2: 16, winner: 1 },
    ...
  ]
}

participant = {
  name: "Player Name",
  picks: [
    // Same structure as results — one entry per game
    { round: 1, region: "South", seed1: 1, seed2: 16, winner: 16 },
    ...
  ]
}

// Full state saved to localStorage
appState = {
  tournament: { ... },
  participants: [ ... ]
}
```

## Scoring Engine

`calculateScore(picks, results, teams)` returns:
```js
{
  total: 142,
  upsetBonus: 22,
  byRound: [
    { round: 1, correct: 25, possible: 32, points: 260, bonus: 14 },
    ...
  ],
  details: [
    { round: 1, region: "South", matchup: "1v16", pick: 16, actual: 16,
      correct: true, base: 10, bonus: 9, total: 19 },
    ...
  ]
}
```

## UI Layout

### 1. Header
- Title: "March Madness Scorer 2026"
- Buttons: Import/Export state, Reset

### 2. Tournament Setup Tab
- Visual bracket tree for entering actual results
- Click a team to mark them as the winner, advancing them through rounds
- Import results via JSON or CSV paste

### 3. Participants Tab
- Add participants by name
- For each participant: click through bracket to set picks, OR import via JSON/CSV
- Delete/edit participants

### 4. Leaderboard Tab
- Ranked table: rank, name, total score, upset bonus, per-round breakdown
- Sortable columns
- Auto-updates when results or picks change

### 5. Bracket Detail View
- Click a participant from the leaderboard to see their full bracket
- Visual bracket tree with picks overlaid
- Color coding: green (correct), red (incorrect), gray (unplayed)
- Point values shown per game including upset bonus

## Visual Bracket

Traditional tournament tree layout:
- 4 region quadrants, left-to-right progression
- Final Four + Championship in the center
- Horizontally scrollable on small screens
- Each matchup cell shows: seed number, team name, winner highlight

## Import/Export

**Formats supported:** JSON and CSV

**JSON format:**
```json
{
  "tournament": { ... },
  "participants": [ ... ]
}
```

**CSV format (per participant):**
```
round,region,seed1,seed2,winner
1,South,1,16,1
1,South,8,9,8
...
```

**Persistence:**
- Auto-save to localStorage on every change
- Export full state as JSON file download
- Import JSON file to restore state

## Verification Plan

1. Open `index.html` in browser — page loads with empty bracket
2. Enter team names for all 4 regions (or import)
3. Add 2+ participants with different picks
4. Enter some results
5. Verify leaderboard scores match hand-calculated expected values
6. Verify upset bonus calculation with known examples from the spec
7. Export state, reload page, import state — verify everything restored
8. Test CSV import for participant picks
