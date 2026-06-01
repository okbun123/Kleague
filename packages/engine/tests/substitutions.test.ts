import { describe, expect, it } from "vitest";
import { calculateKLeague2SubstitutionLimit } from "../src/index.js";

describe("calculateKLeague2SubstitutionLimit", () => {
  it.each([
    [{ u22Starters: 0, u22SubstituteAppearances: 0 }, 3],
    [{ u22Starters: 1, u22SubstituteAppearances: 0 }, 4],
    [{ u22Starters: 1, u22SubstituteAppearances: 1 }, 5],
    [{ u22Starters: 2, u22SubstituteAppearances: 0 }, 5],
    [{ u22Starters: 0, u22SubstituteAppearances: 2 }, 4]
  ])("returns %s substitutions for %o", (input, expected) => {
    expect(calculateKLeague2SubstitutionLimit(input)).toBe(expected);
  });
});
