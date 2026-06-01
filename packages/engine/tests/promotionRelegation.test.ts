import { describe, expect, it } from "vitest";
import { resolveKLeague2026PromotionRelegation, resolveKLeague2K3Transition } from "../src/index.js";
import { fakeClub, standingRows } from "./testData.js";

function withGimcheonAt(position: number) {
  const clubs = Array.from({ length: 12 }, (_, index) => fakeClub(index + 1, "K_LEAGUE_1"));
  clubs[position - 1] = fakeClub(100, "K_LEAGUE_1", {
    id: "GIMCHEON_SANGMU",
    name: "Gimcheon Sangmu Identifier Club",
    isGimcheonSangmu: true,
    isMilitaryTeam: true
  });
  return standingRows(clubs);
}

describe("2026 K League promotion/relegation transition", () => {
  it("relegates only Gimcheon and promotes three K League 2 clubs when Gimcheon finishes 12th", () => {
    const kLeague2 = standingRows(Array.from({ length: 17 }, (_, index) => fakeClub(index + 20, "K_LEAGUE_2")));
    const outcome = resolveKLeague2026PromotionRelegation({
      kLeague1FinalTable: withGimcheonAt(12),
      kLeague2FinalTable: kLeague2,
      kLeague2PlayoffWinner: kLeague2[2]!.club
    });

    expect(outcome.relegatedToKLeague2.map((club) => club.id)).toEqual(["GIMCHEON_SANGMU"]);
    expect(outcome.promotedToKLeague1.map((club) => club.id)).toEqual([
      kLeague2[0]!.club.id,
      kLeague2[1]!.club.id,
      kLeague2[2]!.club.id
    ]);
    expect(outcome.promotionRelegationPlayoffScheduled).toBe(false);
    expect(outcome.kLeague1ParticipantCount2027).toBe(14);
  });

  it("keeps K League 1 12th when it wins the promotion/relegation playoff", () => {
    const kLeague1 = withGimcheonAt(8);
    const kLeague2 = standingRows(Array.from({ length: 17 }, (_, index) => fakeClub(index + 40, "K_LEAGUE_2")));
    const outcome = resolveKLeague2026PromotionRelegation({
      kLeague1FinalTable: kLeague1,
      kLeague2FinalTable: kLeague2,
      kLeague2PlayoffWinner: kLeague2[2]!.club,
      kLeague2PlayoffLoser: kLeague2[3]!.club,
      promotionRelegationPlayoffWinner: kLeague1[11]!.club
    });

    expect(outcome.relegatedToKLeague2.map((club) => club.id)).toEqual(["GIMCHEON_SANGMU"]);
    expect(outcome.retainedInKLeague1.map((club) => club.id)).toEqual([kLeague1[11]!.club.id]);
    expect(outcome.promotedToKLeague1.map((club) => club.id)).toEqual([
      kLeague2[0]!.club.id,
      kLeague2[1]!.club.id,
      kLeague2[2]!.club.id
    ]);
    expect(outcome.retainedInKLeague2.map((club) => club.id)).toEqual([kLeague2[3]!.club.id]);
    expect(outcome.kLeague1ParticipantCount2027).toBe(14);
  });

  it("promotes the K League 2 PO loser when it wins the promotion/relegation playoff", () => {
    const kLeague1 = withGimcheonAt(8);
    const kLeague2 = standingRows(Array.from({ length: 17 }, (_, index) => fakeClub(index + 60, "K_LEAGUE_2")));
    const outcome = resolveKLeague2026PromotionRelegation({
      kLeague1FinalTable: kLeague1,
      kLeague2FinalTable: kLeague2,
      kLeague2PlayoffWinner: kLeague2[2]!.club,
      kLeague2PlayoffLoser: kLeague2[3]!.club,
      promotionRelegationPlayoffWinner: kLeague2[3]!.club
    });

    expect(outcome.relegatedToKLeague2.map((club) => club.id)).toEqual(["GIMCHEON_SANGMU", kLeague1[11]!.club.id]);
    expect(outcome.promotedToKLeague1.map((club) => club.id)).toEqual([
      kLeague2[0]!.club.id,
      kLeague2[1]!.club.id,
      kLeague2[2]!.club.id,
      kLeague2[3]!.club.id
    ]);
    expect(outcome.kLeague1ParticipantCount2027).toBe(14);
  });
});

describe("K League 2-K3 transition", () => {
  const kLeague2Bottom = fakeClub(1, "K_LEAGUE_2");
  const k3Champion = fakeClub(2, "K3");

  it("swaps clubs if the licensed K3 champion wins", () => {
    expect(
      resolveKLeague2K3Transition({
        kLeague2BottomClub: kLeague2Bottom,
        k3Champion,
        k3ChampionHasKLeague2License: true,
        k3WinsPlayoff: true
      })
    ).toMatchObject({
      playoffScheduled: true,
      promotedToKLeague2: k3Champion,
      relegatedToK3: kLeague2Bottom
    });
  });

  it("keeps the K League 2 club if the licensed K3 champion loses", () => {
    expect(
      resolveKLeague2K3Transition({
        kLeague2BottomClub: kLeague2Bottom,
        k3Champion,
        k3ChampionHasKLeague2License: true,
        k3WinsPlayoff: false
      })
    ).toMatchObject({
      playoffScheduled: true,
      retainedInKLeague2: kLeague2Bottom
    });
  });

  it("does not schedule a playoff if the K3 champion lacks a license", () => {
    expect(
      resolveKLeague2K3Transition({
        kLeague2BottomClub: kLeague2Bottom,
        k3Champion,
        k3ChampionHasKLeague2License: false
      })
    ).toMatchObject({
      playoffScheduled: false
    });
  });
});
