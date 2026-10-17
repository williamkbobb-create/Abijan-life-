# Abijan Life

A mobile-first life-simulation prototype set in Grand-Bassam, Côte d’Ivoire. Version 1 focuses on a small, interactive first-day experience rather than unfinished screens.

## Run locally

No build step or third-party JavaScript package is required. Open `index.html` in a modern browser. For best local persistence behavior, serve the folder with a static development server.

Run regression tests with Node.js 18 or later:

    npm test

## Implemented in this prototype

- Character creation with name and starting style.
- Four location cards and working activities.
- Simulated FCFA balance and energy changes.
- Recent activity history.
- Best-effort device-local save and reset.
- Responsive phone/desktop layout and keyboard focus styles.

## Important limitations

This is a front-end demo, not a production game. Browser local storage can be edited or cleared by players. There is no backend, secure account system, cloud persistence, real multiplayer, live weather, real-money payment, real booking, or live transport integration. The simulated balance is not money.

See ROADMAP.md for Version 1 boundaries and the retained Version 2 roadmap.
