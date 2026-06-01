import type { Club } from "../models/club.js";
import type { MatchResult } from "../models/match.js";
import type { StandingRow } from "../models/season.js";

export interface KLeague2PlayoffFixture {
  label: string;
  homeClub: Club;
  awayClub: Club;
  higherSeed: Club;
}

export function createKLeague2_2026SemiPlayoffs(standings: StandingRow[]): KLeague2PlayoffFixture[] {
  const ordered = [...standings].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const third = ordered[2]?.club;
  const fourth = ordered[3]?.club;
  const fifth = ordered[4]?.club;
  const sixth = ordered[5]?.club;

  if (!third || !fourth || !fifth || !sixth) {
    throw new Error("K League 2 playoffs require standings positions 3 through 6.");
  }

  return [
    {
      label: "Semi playoff 1",
      homeClub: third,
      awayClub: sixth,
      higherSeed: third
    },
    {
      label: "Semi playoff 2",
      homeClub: fourth,
      awayClub: fifth,
      higherSeed: fourth
    }
  ];
}

export function resolveHigherSeedAdvancesOnDraw(result: MatchResult, fixture: KLeague2PlayoffFixture): Club {
  if (result.homeGoals > result.awayGoals) {
    return fixture.homeClub;
  }

  if (result.awayGoals > result.homeGoals) {
    return fixture.awayClub;
  }

  return fixture.higherSeed;
}
