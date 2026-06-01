import type { StandingRow } from "../models/season.js";
import { sortStandings } from "./standings.js";

export function assignKLeague1SplitGroups(standingsAfter33: StandingRow[]): StandingRow[] {
  return sortStandings(standingsAfter33).map((row, index) => ({
    ...row,
    splitGroup: index < 6 ? "FINAL_A" : "FINAL_B"
  }));
}

export function sortKLeague1FinalSplitStandings(standings: StandingRow[]): StandingRow[] {
  return sortStandings(standings);
}
