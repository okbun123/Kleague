export type NationalityType = "DOMESTIC" | "FOREIGN";

export type Position =
  | "GK"
  | "DL"
  | "DC"
  | "DR"
  | "DM"
  | "MC"
  | "ML"
  | "MR"
  | "AM"
  | "WL"
  | "WR"
  | "ST";

export interface PlayerAttributes {
  finishing: number;
  passing: number;
  firstTouch: number;
  dribbling: number;
  crossing: number;
  tackling: number;
  marking: number;
  heading: number;
  pace: number;
  stamina: number;
  strength: number;
  agility: number;
  workRate: number;
  vision: number;
  composure: number;
  concentration: number;
  leadership: number;
  pressureResistance: number;
}

export interface Player {
  id: string;
  name: string;
  dateOfBirth: string;
  nationalityType: NationalityType;
  positions: Position[];
  isGoalkeeper: boolean;
  isHomegrown: boolean;
  attributes: PlayerAttributes;
}
