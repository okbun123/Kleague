export interface KLeague2SubstitutionLimitInput {
  u22Starters: number;
  u22SubstituteAppearances: number;
}

export function calculateKLeague2SubstitutionLimit(input: KLeague2SubstitutionLimitInput): number {
  const { u22Starters, u22SubstituteAppearances } = input;

  if (u22Starters >= 2) {
    return 5;
  }

  if (u22Starters === 1) {
    return u22SubstituteAppearances >= 1 ? 5 : 4;
  }

  return u22SubstituteAppearances >= 2 ? 4 : 3;
}
