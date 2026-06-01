import type { Player } from "./player.js";
import type { Tactic } from "./tactic.js";

export interface Lineup {
  startingXI: Player[];
  substitutes: Player[];
  tactic: Tactic;
}

export interface MatchSquad {
  clubId: string;
  lineup: Lineup;
  registeredPlayerIds: string[];
}
