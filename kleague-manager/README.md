# K League Manager MVP

This repository contains the first MVP of a pure TypeScript K League football manager simulation engine. It intentionally has no UI framework and no database.

## Install

```sh
pnpm install
```

## Verify

```sh
pnpm typecheck
pnpm test
```

## What Is Implemented

- Deterministic seeded random generator.
- Simple deterministic match simulator with team strength, xG, shots, possession, cards, injuries, and events.
- K League lineup validation for 2026 K League 1 and K League 2, including U22 squad-size effects, foreign-player limits, substitute goalkeeper requirement, and K League 2 U22 substitution limits.
- Round-robin schedulers for:
  - 2026 K League 1 regular phase and split phase.
  - 2026 K League 2.
  - 2027 K League 1.
- Standings application and sorting with the specified K League tiebreaker order.
- Final split ordering, where Final B clubs cannot finish above Final A clubs.
- 2026 Gimcheon Sangmu transition and K League 1/K League 2 promotion/relegation outcomes.
- Separate configurable K League 2-K3 transition helper.

## 2027 Rule Packs

`createKLeague2027RulePack()` fixes only the confirmed K League 1 shape: 14 clubs, 3 round-robin legs, 39 rounds, and 39 matches per club.

The 2027 K League 2 format is intentionally not hardcoded. `createKLeague2027RulePack()` marks K League 2 as unconfirmed unless explicit `KLeague2027Config` schedule fields are provided. `generateKLeague2_2027Schedule()` throws `UnconfirmedRuleError` unless both `kLeague2TeamCount` and `kLeague2RoundRobinLegs` are supplied.

## Data Constraint

The MVP uses only fake clubs and fake players in tests. Real player names, real stats, crests, logos, images, and scraped data are deliberately excluded. The special identifier club `GIMCHEON_SANGMU` is represented only to model the 2026 automatic relegation rule.
