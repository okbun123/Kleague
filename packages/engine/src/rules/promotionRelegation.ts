import type { Club } from "../models/club.js";
import type { KLeague2K3TransitionOutcome, PromotionRelegationOutcome, StandingRow } from "../models/season.js";

export interface KLeague2026PromotionRelegationInput {
  kLeague1FinalTable: StandingRow[];
  kLeague2FinalTable: StandingRow[];
  kLeague2PlayoffWinner: Club;
  kLeague2PlayoffLoser?: Club;
  promotionRelegationPlayoffWinner?: Club;
}

export interface KLeague2K3TransitionInput {
  kLeague2BottomClub: Club;
  k3Champion: Club;
  k3ChampionHasKLeague2License: boolean;
  k3WinsPlayoff?: boolean;
}

function tableByPosition(table: StandingRow[]): StandingRow[] {
  return [...table].sort((a, b) => (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER));
}

function sameClub(a: Club | undefined, b: Club | undefined): boolean {
  return a !== undefined && b !== undefined && a.id === b.id;
}

export function resolveKLeague2026PromotionRelegation(
  input: KLeague2026PromotionRelegationInput
): PromotionRelegationOutcome {
  const kLeague1 = tableByPosition(input.kLeague1FinalTable);
  const kLeague2 = tableByPosition(input.kLeague2FinalTable);
  const gimcheonRow = kLeague1.find((row) => row.club.isGimcheonSangmu);
  const kLeague1Twelfth = kLeague1[11]?.club;
  const kLeague2First = kLeague2[0]?.club;
  const kLeague2Second = kLeague2[1]?.club;

  if (!gimcheonRow) {
    throw new Error("2026 transition requires a Gimcheon Sangmu row in the K League 1 final table.");
  }

  if (!kLeague1Twelfth || !kLeague2First || !kLeague2Second) {
    throw new Error("Promotion/relegation resolution requires complete K League 1 and K League 2 tables.");
  }

  const gimcheon = gimcheonRow.club;
  const gimcheonFinishedTwelfth = sameClub(gimcheon, kLeague1Twelfth);
  const promotedToKLeague1 = [kLeague2First, kLeague2Second, input.kLeague2PlayoffWinner];
  const relegatedToKLeague2 = [gimcheon];
  const retainedInKLeague1: Club[] = [];
  const retainedInKLeague2: Club[] = [];

  if (gimcheonFinishedTwelfth) {
    return {
      promotedToKLeague1,
      relegatedToKLeague2,
      retainedInKLeague1,
      retainedInKLeague2,
      promotionRelegationPlayoffScheduled: false,
      kLeague1ParticipantCount2027: 12 - relegatedToKLeague2.length + promotedToKLeague1.length
    };
  }

  if (!input.kLeague2PlayoffLoser) {
    throw new Error("A K League 2 playoff loser is required when Gimcheon does not finish 12th.");
  }

  const playoffWinner = input.promotionRelegationPlayoffWinner;
  if (sameClub(playoffWinner, kLeague1Twelfth)) {
    retainedInKLeague1.push(kLeague1Twelfth);
    retainedInKLeague2.push(input.kLeague2PlayoffLoser);
  } else if (sameClub(playoffWinner, input.kLeague2PlayoffLoser)) {
    promotedToKLeague1.push(input.kLeague2PlayoffLoser);
    relegatedToKLeague2.push(kLeague1Twelfth);
  }

  return {
    promotedToKLeague1,
    relegatedToKLeague2,
    retainedInKLeague1,
    retainedInKLeague2,
    promotionRelegationPlayoffScheduled: true,
    promotionRelegationPlayoff:
      playoffWinner === undefined
        ? {
            kLeague1Club: kLeague1Twelfth,
            kLeague2Club: input.kLeague2PlayoffLoser
          }
        : {
            kLeague1Club: kLeague1Twelfth,
            kLeague2Club: input.kLeague2PlayoffLoser,
            winner: playoffWinner
          },
    kLeague1ParticipantCount2027: 12 - relegatedToKLeague2.length + promotedToKLeague1.length
  };
}

export function resolveKLeague2K3Transition(input: KLeague2K3TransitionInput): KLeague2K3TransitionOutcome {
  if (!input.k3ChampionHasKLeague2License) {
    return {
      playoffScheduled: false,
      reason: "K3 champion does not hold a K League 2 club license."
    };
  }

  if (input.k3WinsPlayoff) {
    return {
      playoffScheduled: true,
      promotedToKLeague2: input.k3Champion,
      relegatedToK3: input.kLeague2BottomClub
    };
  }

  return {
    playoffScheduled: true,
    retainedInKLeague2: input.kLeague2BottomClub
  };
}
