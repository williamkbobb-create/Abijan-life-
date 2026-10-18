# Abijan Life — Product roadmap

## Après l’aperçu technique — priorité suivante
Ces éléments sont planifiés comme prochaines étapes; ils ne sont pas tous implémentés.
1. **Tutoriel de première visite** pour guider les nouveaux joueurs.
2. **Objectifs et progression** pour donner des buts clairs à la journée et à long terme.
3. **Plus de lieux, histoires et activités** ancrés dans Grand-Bassam et la Côte d’Ivoire.
4. **Téléphone en jeu** : préparer l’icône NouchiLink et développer progressivement le hub d’applications. L’URL officielle de NouchiLink doit être confirmée avant d’ajouter un lien.
5. **Sauvegarde et reprise** : améliorer la reprise sur l’appareil actuel. La synchronisation entre appareils nécessite une décision distincte sur les comptes et la persistance cloud.

## Version 1: first playable Grand-Bassam demo
- Mobile-first browser experience with character creation.
- Four demo destinations and playable activities.
- Activities change demo energy, virtual FCFA balance, and recent activity; resting restores energy.
- Local-device progress persistence with input/state validation and a reset control.
- Clear labels: FCFA is simulated, weather/time is not live, and activities are not real bookings.
- Basic automated regression tests.

## Version 2: broader roadmap, not implemented in this demo
- Six needs: hunger, energy, fun, social, hygiene, and bladder.
- Character traits, lifetime aspirations, and optional starting-life scenarios.
- Skills, courses, job catalogue, shifts, performance, promotions, and side gigs, including car-washing work.
- Housing, rent, furniture, property, vehicles, and simulated transport.
- Virtual FCFA banking, savings, businesses, taxes, and player-to-player transfers.
- Expanded phone apps: Messages, Phone, Settings, Jobs, Bank, NouchiLink, ChaufCI, and SkillSwap.
- Friendships, relationships, opt-in presence, chat, blocking/reporting/moderation, home visits, and multiplayer.
- Additional Grand-Bassam districts and later Abidjan/other city environments.
- Local cultural activities and events, rankings, rewards, governance, and character customization.
- Potential Lavage Tracker and SOTRA integrations only after separate requirements, data access, privacy, and approval review.

## Safety and release boundaries
- This is a browser-only prototype. Browser local storage is user-editable and is not a secure source of truth.
- Do not use it for real accounts, real money, real bookings, multiplayer, or authoritative economy state.
- The current demo starts directly with character creation; account registration and cloud saves are not part of this preview.
- No schema migrations, production settings changes, paid resources, or production deployment are part of this release review.
- Before real accounts/social play: design server-side authorization, persistence, abuse controls, privacy defaults, moderation/reporting, and integration tests.
- Keep Nigerian games as systems references, not templates for Nigerian identity. Build Côte d’Ivoire-specific environments and cultural detail deliberately.
