export type Mentality = "DEFENSIVE" | "BALANCED" | "ATTACKING";

export interface Tactic {
  formation: string;
  mentality: Mentality;
  pressing: number;
  tempo: number;
  defensiveLine: number;
  width: number;
  buildUpRisk: number;
}
