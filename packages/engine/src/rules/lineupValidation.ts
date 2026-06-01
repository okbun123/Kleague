import type { CompetitionRulePack } from "../models/competition.js";
import type { Lineup } from "../models/lineup.js";
import type { Player } from "../models/player.js";
import { calculateKLeague2SubstitutionLimit } from "./substitutions.js";

export interface ValidateLineupInput {
  lineup: Lineup;
  rulePack: CompetitionRulePack;
  registeredPlayers: Player[];
  u22SubstituteAppearances?: number;
}

export interface LineupValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  effectiveMaxSquadSize: number;
  maxSubstitutions: number;
  foreignCount: number;
  u22Count: number;
  u22StarterCount: number;
}

export function isDomesticU22(player: Player, cutoffDate: string): boolean {
  const domesticByRule = player.nationalityType === "DOMESTIC" || player.isHomegrown;
  return domesticByRule && player.dateOfBirth >= cutoffDate;
}

export function calculateEffectiveMaxSquadSize(maxSquadSize: number, u22Count: number): number {
  if (u22Count >= 2) {
    return maxSquadSize;
  }

  if (u22Count === 1) {
    return maxSquadSize - 1;
  }

  return maxSquadSize - 2;
}

export function validateLineup(input: ValidateLineupInput): LineupValidationResult {
  const { lineup, rulePack, registeredPlayers } = input;
  const errors: string[] = [];
  const warnings: string[] = [];
  const allPlayers = [...lineup.startingXI, ...lineup.substitutes];
  const registeredIds = new Set(registeredPlayers.map((player) => player.id));
  const playerIds = allPlayers.map((player) => player.id);
  const uniquePlayerIds = new Set(playerIds);
  const u22Count = allPlayers.filter((player) => isDomesticU22(player, rulePack.lineupRules.u22CutoffDate)).length;
  const u22StarterCount = lineup.startingXI.filter((player) =>
    isDomesticU22(player, rulePack.lineupRules.u22CutoffDate)
  ).length;
  const foreignCount = allPlayers.filter((player) => player.nationalityType === "FOREIGN").length;
  const effectiveMaxSquadSize = calculateEffectiveMaxSquadSize(rulePack.lineupRules.maxSquadSize, u22Count);
  const maxSubstitutions = rulePack.lineupRules.kLeague2U22SubstitutionPolicy
    ? calculateKLeague2SubstitutionLimit({
        u22Starters: u22StarterCount,
        u22SubstituteAppearances: input.u22SubstituteAppearances ?? 0
      })
    : rulePack.lineupRules.maxSubstitutions;

  if (lineup.startingXI.length !== 11) {
    errors.push(`Starting XI must contain exactly 11 players; received ${lineup.startingXI.length}.`);
  }

  if (uniquePlayerIds.size !== playerIds.length) {
    errors.push("Match squad cannot contain duplicate players across starters and substitutes.");
  }

  const unregisteredPlayers = allPlayers.filter((player) => !registeredIds.has(player.id));
  if (unregisteredPlayers.length > 0) {
    errors.push(`All squad players must be registered; unregistered: ${unregisteredPlayers.map((p) => p.id).join(", ")}.`);
  }

  if (lineup.substitutes.filter((player) => player.isGoalkeeper).length < rulePack.lineupRules.requiredSubstituteGoalkeepers) {
    errors.push(`Substitutes must include at least ${rulePack.lineupRules.requiredSubstituteGoalkeepers} goalkeeper.`);
  }

  if (foreignCount > rulePack.lineupRules.maxForeignPlayersInMatchSquad) {
    errors.push(
      `Foreign player limit exceeded: ${foreignCount}/${rulePack.lineupRules.maxForeignPlayersInMatchSquad} in the match squad.`
    );
  }

  if (allPlayers.length > effectiveMaxSquadSize) {
    errors.push(
      `Squad has ${allPlayers.length} players, but only ${effectiveMaxSquadSize} are allowed with ${u22Count} domestic U22 player(s).`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    effectiveMaxSquadSize,
    maxSubstitutions,
    foreignCount,
    u22Count,
    u22StarterCount
  };
}
