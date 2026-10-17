# Abijan Life — Product roadmap

## Version 1: first playable Grand-Bassam demo
- Mobile-first browser experience with character creation.
- Four demo destinations: Grand-Bassam Beach, Les Palmiers Beach Bar, Artisan Corner, and Lavage International.
- Activities change demo energy, virtual FCFA balance, and recent activity.
- Local-device progress persistence with input/state validation and a reset control.
- Clear labels: FCFA is simulated, weather/time is not live, and Lavage International is not a real booking.
- Basic automated tests for initial state and persisted-state validation.

## Version 2: retained roadmap, not implemented in this demo
- Six needs: hunger, energy, fun, social, hygiene, and bladder.
- Character traits, lifetime aspirations, and optional starting-life scenarios.
- Skills, courses, job catalogue, shifts, performance, promotions, and side gigs.
- Housing, rent, furniture, property, vehicles, and simulated transport.
- Virtual FCFA banking, savings, businesses, taxes, and player-to-player transfers.
- Friendships, relationships, opt-in presence, chat, blocking/reporting/moderation, home visits, and multiplayer.
- Additional Grand-Bassam districts and later Abidjan/other city environments.
- Local cultural activities and events, rankings, rewards, governance, and phone hub.
- Potential Lavage Tracker and SOTRA integrations only after separate requirements, data access, privacy, and approval review.

## Safety and release boundaries
- This is a browser-only prototype. Browser local storage is user-editable and is not a secure source of truth.
- Do not use it for real accounts, real money, real bookings, multiplayer, or authoritative economy state.
- No Supabase schema, authentication, migrations, production secrets, paid resources, or deployment are configured by this change.
- Before real accounts/social play: design server-side authorization, persistence, abuse controls, privacy defaults, moderation/reporting, and integration tests.
- Keep Lagos Life as a systems reference, not a template for Nigerian identity. Build Côte d’Ivoire-specific environments and cultural detail deliberately.
