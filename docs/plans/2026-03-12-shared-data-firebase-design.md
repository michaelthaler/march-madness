# Shared Data via Firebase — Design

## Overview

Add real-time shared state so all participants in the pool see the same tournament data, leaderboard, and each other's brackets. Replace localStorage-only persistence with Firebase Realtime Database as the source of truth.

## Constraints

- Free tier only (Firebase Spark plan)
- Small pool: 2-10 people
- No accounts or passwords — name-based identity
- Keep deploying on GitHub Pages (static site)

## User Flow

1. First visit: user enters their name → stored in localStorage as their identity
2. Admin (you): enters tournament team names and results via the existing bracket UI
3. Participants: each person enters their own picks via the bracket overlay
4. Pick locking: admin toggles a lock — once locked, no one can edit picks
5. Leaderboard + bracket details: visible to everyone, auto-update in real-time

## Firebase Database Structure

```
march-madness-2026/
  config/
    picksLocked: false
  tournament/
    year: 2026
    regions: ["South", "West", "East", "Midwest"]
    teams: { South: { 1: "Duke", ... }, ... }
    results: [ { round, region, seed1, seed2, winner }, ... ]
  participants/
    {name}/
      name: "Alice"
      picks: [ { round, region, seed1, seed2, winner }, ... ]
```

## Security Model

Simple trust-based model (no admin code):
- All data is readable and writable by anyone with the URL
- Participant picks are conceptually "owned" by the person whose name matches localStorage
- Pick locking is enforced client-side (config.picksLocked flag)
- Appropriate for a small trusted group

## Changes to Existing Code

### New file: `js/firebase-sync.js`
- Initialize Firebase app with config
- `syncState()`: attach Firebase listeners, push/pull data
- `onTournamentChanged(callback)`: real-time listener for tournament data
- `onParticipantsChanged(callback)`: real-time listener for all participants
- `saveTournament(tournament)`: write tournament data to Firebase
- `saveParticipant(name, picks)`: write one participant's picks
- `setPicksLocked(locked)`: toggle the lock flag
- `onPicksLockedChanged(callback)`: listen for lock state changes

### Modified: `js/storage.js`
- localStorage now only stores the user's name (identity)
- Remove full-state localStorage persistence (Firebase is the source of truth)
- Keep JSON/CSV export/import (reads from current in-memory state)

### Modified: `js/app.js`
- On init: show name prompt if no name in localStorage
- Replace `saveState()`/`loadState()` calls with Firebase sync calls
- Add "Lock Picks" / "Unlock Picks" button (visible to everyone, but conceptually admin-only)
- When picks locked: disable pick editing UI, show locked banner
- Real-time listeners update the in-memory state and re-render on changes

### Modified: `index.html`
- Add Firebase SDK script tags (from CDN)
- Add name entry modal
- Add pick-lock toggle button in header
- Add "picks locked" banner

### No changes needed:
- `js/data.js` — data structures unchanged
- `js/scoring.js` — pure functions, no persistence dependency
- `js/bracket-view.js` — renders from in-memory state, no persistence dependency
- `css/styles.css` — minor additions for new UI elements only

## Firebase Setup (One-Time)

1. Go to https://console.firebase.google.com/
2. Create project "march-madness-2026"
3. Enable Realtime Database (start in test mode for simplicity)
4. Copy the config object into the app
5. No authentication setup needed

## Real-Time Sync Strategy

- On app init: attach `.on('value')` listeners to `/tournament` and `/participants`
- When listener fires: update in-memory `state`, re-render affected UI
- When user makes a change: write to Firebase → listener fires → UI updates
- Conflict resolution: last-write-wins (fine for non-concurrent edits in a small group)
