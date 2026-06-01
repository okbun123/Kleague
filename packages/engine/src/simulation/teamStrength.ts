import type { Lineup } from "../models/lineup.js";
import type { Player, PlayerAttributes } from "../models/player.js";

export interface TeamStrength {
  attack: number;
  defense: number;
  midfield: number;
  pressing: number;
  chanceCreation: number;
  setPieceThreat: number;
  goalkeeper: number;
  overall: number;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function attr(player: Player, selector: (attributes: PlayerAttributes) => number): number {
  return selector(player.attributes);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateTeamStrength(lineup: Lineup, strengthBias = 0): TeamStrength {
  const outfieldPlayers = lineup.startingXI.filter((player) => !player.isGoalkeeper);
  const goalkeepers = lineup.startingXI.filter((player) => player.isGoalkeeper);
  const playersForOutfield = outfieldPlayers.length > 0 ? outfieldPlayers : lineup.startingXI;
  const goalkeeper = average(
    goalkeepers.map((player) =>
      average([
        attr(player, (a) => a.concentration),
        attr(player, (a) => a.agility),
        attr(player, (a) => a.composure),
        attr(player, (a) => a.leadership)
      ])
    )
  );

  const attack = average(
    playersForOutfield.map((player) =>
      average([
        attr(player, (a) => a.finishing),
        attr(player, (a) => a.passing),
        attr(player, (a) => a.dribbling),
        attr(player, (a) => a.vision),
        attr(player, (a) => a.composure),
        attr(player, (a) => a.pace)
      ])
    )
  );
  const defenseOutfield = average(
    playersForOutfield.map((player) =>
      average([
        attr(player, (a) => a.tackling),
        attr(player, (a) => a.marking),
        attr(player, (a) => a.heading),
        attr(player, (a) => a.concentration),
        attr(player, (a) => a.strength)
      ])
    )
  );
  const defense = defenseOutfield * 0.82 + goalkeeper * 0.18;
  const midfield = average(
    playersForOutfield.map((player) =>
      average([
        attr(player, (a) => a.passing),
        attr(player, (a) => a.firstTouch),
        attr(player, (a) => a.vision),
        attr(player, (a) => a.workRate),
        attr(player, (a) => a.stamina)
      ])
    )
  );
  const playerPressing = average(
    playersForOutfield.map((player) =>
      average([attr(player, (a) => a.workRate), attr(player, (a) => a.stamina), attr(player, (a) => a.pace)])
    )
  );
  const tacticPressing = lineup.tactic.pressing;
  const pressing = playerPressing * 0.7 + tacticPressing * 0.3;
  const chanceCreation = attack * 0.45 + midfield * 0.35 + lineup.tactic.tempo * 0.1 + lineup.tactic.buildUpRisk * 0.1;
  const setPieceThreat = average(
    playersForOutfield.map((player) =>
      average([attr(player, (a) => a.heading), attr(player, (a) => a.crossing), attr(player, (a) => a.strength)])
    )
  );
  const mentalityAdjustment =
    lineup.tactic.mentality === "ATTACKING" ? 3 : lineup.tactic.mentality === "DEFENSIVE" ? -2 : 0;
  const overall = average([attack, defense, midfield, pressing, chanceCreation]) + strengthBias + mentalityAdjustment;

  return {
    attack: clamp(attack + strengthBias, 1, 100),
    defense: clamp(defense + strengthBias, 1, 100),
    midfield: clamp(midfield + strengthBias, 1, 100),
    pressing: clamp(pressing + strengthBias, 1, 100),
    chanceCreation: clamp(chanceCreation + strengthBias + mentalityAdjustment, 1, 100),
    setPieceThreat: clamp(setPieceThreat + strengthBias, 1, 100),
    goalkeeper: clamp(goalkeeper + strengthBias, 1, 100),
    overall: clamp(overall, 1, 100)
  };
}
