import type { Club, Division } from "@kleague-manager/engine";

export type SeasonDemoRuleId = "K_LEAGUE_1_2026" | "K_LEAGUE_2_2026" | "K_LEAGUE_1_2027";
export type RulePackSelectorId = SeasonDemoRuleId | "K_LEAGUE_2_2027_CONFIGURABLE";

function makeClub(
  id: string,
  name: string,
  division: Division,
  strengthBias: number,
  flags: Partial<Pick<Club, "isGimcheonSangmu" | "isMilitaryTeam">> = {}
): Club {
  return {
    id,
    name,
    division,
    strengthBias,
    ...flags
  };
}

const kLeague1_2026Names = [
  "Harbor City FC",
  "Northgate United",
  "Blue River Athletic",
  "Hillcrest Rovers",
  "Central Works FC",
  "Stonebridge FC",
  "East Bay Phoenix",
  "Military Rule Club",
  "Metro Railers",
  "Forest Road FC",
  "Lakeview Stars",
  "South Point Eleven"
];

const kLeague2_2026Names = [
  "Lighthouse FC",
  "Westfield Motors",
  "Pine Coast United",
  "Ironworks FC",
  "Sunrise Borough",
  "Civic Ground FC",
  "Riverbend City",
  "Grey Harbor",
  "Copperline FC",
  "Vista County",
  "Springwell FC",
  "Green Market United",
  "Old Port FC",
  "Quartz City",
  "Maple Yard FC",
  "Canal Works",
  "Anchor District"
];

const kLeague1_2027Names = [
  "Harbor City FC",
  "Northgate United",
  "Blue River Athletic",
  "Hillcrest Rovers",
  "Central Works FC",
  "Stonebridge FC",
  "East Bay Phoenix",
  "Metro Railers",
  "Forest Road FC",
  "Lakeview Stars",
  "South Point Eleven",
  "Lighthouse FC",
  "Westfield Motors",
  "Pine Coast United"
];

export const kLeague1_2026Clubs: Club[] = kLeague1_2026Names.map((name, index) =>
  makeClub(
    index === 7 ? "GIMCHEON_SANGMU" : `K1_2026_${index + 1}`,
    name,
    "K_LEAGUE_1",
    4 - index * 0.55,
    index === 7 ? { isGimcheonSangmu: true, isMilitaryTeam: true } : {}
  )
);

export const kLeague2_2026Clubs: Club[] = kLeague2_2026Names.map((name, index) =>
  makeClub(`K2_2026_${index + 1}`, name, "K_LEAGUE_2", 2.5 - index * 0.25)
);

export const kLeague1_2027Clubs: Club[] = kLeague1_2027Names.map((name, index) =>
  makeClub(`K1_2027_${index + 1}`, name, "K_LEAGUE_1", 4.5 - index * 0.4)
);

export const k3ChampionClub: Club = makeClub("K3_CHAMPION", "K3 Licensed Champion", "K3", 1.2);
export const unlicensedK3ChampionClub: Club = makeClub("K3_UNLICENSED_CHAMPION", "K3 Community Champion", "K3", 1);

export function getSeasonClubs(ruleId: SeasonDemoRuleId): Club[] {
  switch (ruleId) {
    case "K_LEAGUE_1_2026":
      return kLeague1_2026Clubs;
    case "K_LEAGUE_2_2026":
      return kLeague2_2026Clubs;
    case "K_LEAGUE_1_2027":
      return kLeague1_2027Clubs;
  }
}

export function getClubName(clubs: Club[], clubId: string): string {
  return clubs.find((club) => club.id === clubId)?.name ?? clubId;
}
