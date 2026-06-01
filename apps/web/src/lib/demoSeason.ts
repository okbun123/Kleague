import {
  UnconfirmedRuleError,
  assignKLeague1SplitGroups,
  createInitialStandings,
  createKLeague2026RulePack,
  createKLeague2027RulePack,
  generateKLeague1_2026RegularSchedule,
  generateKLeague1_2026SplitSchedule,
  generateKLeague1_2027Schedule,
  generateKLeague2_2026Schedule,
  generateKLeague2_2027Schedule,
  resolveKLeague2026PromotionRelegation,
  resolveKLeague2K3Transition,
  runRound,
  sortKLeague1FinalSplitStandings,
  sortStandings,
  type Club,
  type CompetitionRulePack,
  type Fixture,
  type KLeague2K3TransitionOutcome,
  type MatchResult,
  type PromotionRelegationOutcome,
  type StandingRow
} from "@kleague-manager/engine";
import {
  getSeasonClubs,
  k3ChampionClub,
  kLeague1_2026Clubs,
  kLeague2_2026Clubs,
  type RulePackSelectorId,
  type SeasonDemoRuleId,
  unlicensedK3ChampionClub
} from "../data/demoClubs";
import { createClubLineup } from "../data/demoSquads";

export interface KLeague2_2027DemoConfig {
  teamCount?: number;
  roundRobinLegs?: number;
  hasPlayoffs?: boolean;
  promotionSlots?: number;
}

export interface RulePackSelection {
  id: RulePackSelectorId;
  label: string;
  rulePack?: CompetitionRulePack;
  error?: UnconfirmedRuleError;
}

export interface DemoSeasonOutcome {
  title: string;
  lines: string[];
  raw: PromotionRelegationOutcome | KLeague2K3TransitionOutcome | null;
}

export interface DemoSeasonState {
  ruleId: SeasonDemoRuleId;
  clubs: Club[];
  fixtures: Fixture[];
  standings: StandingRow[];
  results: MatchResult[];
  latestResults: MatchResult[];
  currentRound: number;
  splitGenerated: boolean;
  finalAClubIds: string[];
  finalBClubIds: string[];
  ended: boolean;
  outcome?: DemoSeasonOutcome;
}

export interface PromotionScenario {
  id: string;
  title: string;
  description: string;
  lines: string[];
  raw: PromotionRelegationOutcome | KLeague2K3TransitionOutcome;
}

export const selectableRulePacks: Array<{ id: RulePackSelectorId; label: string }> = [
  { id: "K_LEAGUE_1_2026", label: "K League 1 2026" },
  { id: "K_LEAGUE_2_2026", label: "K League 2 2026" },
  { id: "K_LEAGUE_1_2027", label: "K League 1 2027" },
  { id: "K_LEAGUE_2_2027_CONFIGURABLE", label: "K League 2 2027 configurable/unconfirmed" }
];

export function getCompetitionRulePack(ruleId: SeasonDemoRuleId): CompetitionRulePack {
  if (ruleId === "K_LEAGUE_1_2027") {
    return createKLeague2027RulePack().competitions.kLeague1;
  }

  const rules2026 = createKLeague2026RulePack();
  return ruleId === "K_LEAGUE_1_2026" ? rules2026.competitions.kLeague1 : rules2026.competitions.kLeague2;
}

export function resolveRulePackSelection(
  id: RulePackSelectorId,
  config: KLeague2_2027DemoConfig = {}
): RulePackSelection {
  const label = selectableRulePacks.find((option) => option.id === id)?.label ?? id;

  if (id === "K_LEAGUE_2_2027_CONFIGURABLE") {
    if (
      config.teamCount === undefined ||
      config.roundRobinLegs === undefined ||
      config.hasPlayoffs === undefined ||
      config.promotionSlots === undefined
    ) {
      return {
        id,
        label,
        error: new UnconfirmedRuleError(
          "K League 2 2027 is unconfirmed. Enter team count, round-robin legs, playoff flag, and promotion slots before using this rule pack."
        )
      };
    }

    try {
      generateKLeague2_2027Schedule(createTemporaryClubs(config.teamCount), {
        kLeague2TeamCount: config.teamCount,
        kLeague2RoundRobinLegs: config.roundRobinLegs,
        kLeague2HasPlayoffs: config.hasPlayoffs,
        kLeague2PromotionSlots: config.promotionSlots
      });
      return {
        id,
        label,
        rulePack: createKLeague2027RulePack({
          kLeague2TeamCount: config.teamCount,
          kLeague2RoundRobinLegs: config.roundRobinLegs,
          kLeague2HasPlayoffs: config.hasPlayoffs,
          kLeague2PromotionSlots: config.promotionSlots
        }).competitions.kLeague2
      };
    } catch (error) {
      return {
        id,
        label,
        error:
          error instanceof UnconfirmedRuleError
            ? error
            : new UnconfirmedRuleError(error instanceof Error ? error.message : "Unknown rule configuration error.")
      };
    }
  }

  return {
    id,
    label,
    rulePack: getCompetitionRulePack(id)
  };
}

function createTemporaryClubs(count: number): Club[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `K2_2027_CONFIG_${index + 1}`,
    name: `Config Test Club ${index + 1}`,
    division: "K_LEAGUE_2" as const
  }));
}

function generateFixtures(ruleId: SeasonDemoRuleId, clubs: Club[]): Fixture[] {
  switch (ruleId) {
    case "K_LEAGUE_1_2026":
      return generateKLeague1_2026RegularSchedule(clubs);
    case "K_LEAGUE_2_2026":
      return generateKLeague2_2026Schedule(clubs);
    case "K_LEAGUE_1_2027":
      return generateKLeague1_2027Schedule(clubs);
  }
}

export function createSeasonState(ruleId: SeasonDemoRuleId): DemoSeasonState {
  const clubs = getSeasonClubs(ruleId);
  return {
    ruleId,
    clubs,
    fixtures: generateFixtures(ruleId, clubs),
    standings: createInitialStandings(clubs),
    results: [],
    latestResults: [],
    currentRound: 0,
    splitGenerated: false,
    finalAClubIds: [],
    finalBClubIds: [],
    ended: false
  };
}

function maxRound(fixtures: Fixture[]): number {
  return fixtures.reduce((highest, fixture) => Math.max(highest, fixture.round), 0);
}

function rounds(fixtures: Fixture[]): number[] {
  return [...new Set(fixtures.map((fixture) => fixture.round))].sort((a, b) => a - b);
}

function addOutcomeIfEnded(state: DemoSeasonState): DemoSeasonState {
  if (!state.ended || state.outcome) {
    return state;
  }

  const outcome = resolveSeasonOutcome(state);
  return outcome ? { ...state, outcome } : state;
}

function maybeGenerateSplit(state: DemoSeasonState): DemoSeasonState {
  if (state.ruleId !== "K_LEAGUE_1_2026" || state.splitGenerated || state.currentRound < 33) {
    return state;
  }

  const groupedStandings = assignKLeague1SplitGroups(state.standings);
  const splitFixtures = generateKLeague1_2026SplitSchedule(groupedStandings, state.fixtures);
  const finalAClubIds = groupedStandings.filter((row) => row.splitGroup === "FINAL_A").map((row) => row.club.id);
  const finalBClubIds = groupedStandings.filter((row) => row.splitGroup === "FINAL_B").map((row) => row.club.id);

  return {
    ...state,
    fixtures: [...state.fixtures, ...splitFixtures],
    standings: groupedStandings,
    splitGenerated: true,
    ended: false,
    finalAClubIds,
    finalBClubIds
  };
}

export function runNextSeasonRound(input: DemoSeasonState): DemoSeasonState {
  const prepared = maybeGenerateSplit(input);
  if (prepared.ended) {
    return prepared;
  }

  const nextRound = rounds(prepared.fixtures).find((roundNumber) => roundNumber > prepared.currentRound);
  if (nextRound === undefined) {
    return addOutcomeIfEnded({ ...prepared, ended: true });
  }

  const rulePack = getCompetitionRulePack(prepared.ruleId);
  const roundFixtures = prepared.fixtures.filter((fixture) => fixture.round === nextRound);
  const roundResult = runRound(
    roundFixtures,
    prepared.standings,
    rulePack,
    (club) => createClubLineup(club),
    `web-demo:${prepared.ruleId}:R${nextRound}`
  );
  const sortedStandings =
    prepared.ruleId === "K_LEAGUE_1_2026" && prepared.splitGenerated
      ? sortKLeague1FinalSplitStandings(roundResult.standings)
      : sortStandings(roundResult.standings);
  const nextState: DemoSeasonState = {
    ...prepared,
    standings: sortedStandings,
    results: [...prepared.results, ...roundResult.results],
    latestResults: roundResult.results,
    currentRound: nextRound,
    ended: nextRound >= maxRound(prepared.fixtures)
  };

  return addOutcomeIfEnded(maybeGenerateSplit(nextState));
}

export function runSeasonToSplit(state: DemoSeasonState): DemoSeasonState {
  let nextState = state;
  while (nextState.ruleId === "K_LEAGUE_1_2026" && nextState.currentRound < 33 && !nextState.ended) {
    nextState = runNextSeasonRound(nextState);
  }
  return maybeGenerateSplit(nextState);
}

export function runSeasonToEnd(state: DemoSeasonState): DemoSeasonState {
  let nextState = state;
  let guard = 0;
  while (!nextState.ended && guard < 80) {
    nextState = runNextSeasonRound(nextState);
    guard += 1;
  }
  return addOutcomeIfEnded(nextState);
}

function clubList(clubs: Club[]): string {
  return clubs.length > 0 ? clubs.map((club) => club.name).join(", ") : "None";
}

function requireRow(table: StandingRow[], position: number): StandingRow {
  const row = table[position - 1];
  if (!row) {
    throw new Error(`Missing table row at position ${position}.`);
  }
  return row;
}

function makeStandingRows(clubs: Club[]): StandingRow[] {
  return clubs.map((club, index) => ({
    club,
    played: 38,
    wins: Math.max(0, 24 - index),
    draws: index % 5,
    losses: Math.max(0, index - 2),
    goalsFor: 62 - index,
    goalsAgainst: 30 + index,
    goalDifference: 32 - index * 2,
    points: clubs.length * 3 - index * 2,
    penaltyPoints: 0,
    position: index + 1
  }));
}

function resolveSeasonOutcome(state: DemoSeasonState): DemoSeasonOutcome | undefined {
  if (state.ruleId === "K_LEAGUE_1_2026") {
    const k2Table = makeStandingRows(kLeague2_2026Clubs);
    const kLeague1Twelfth = requireRow(state.standings, 12).club;
    const outcome = resolveKLeague2026PromotionRelegation({
      kLeague1FinalTable: state.standings,
      kLeague2FinalTable: k2Table,
      kLeague2PlayoffWinner: requireRow(k2Table, 3).club,
      kLeague2PlayoffLoser: requireRow(k2Table, 4).club,
      promotionRelegationPlayoffWinner: kLeague1Twelfth
    });

    return {
      title: "2026 K League 1/K League 2 transition",
      lines: promotionOutcomeLines(outcome),
      raw: outcome
    };
  }

  if (state.ruleId === "K_LEAGUE_2_2026") {
    const bottomClub = requireRow(state.standings, state.standings.length).club;
    const outcome = resolveKLeague2K3Transition({
      kLeague2BottomClub: bottomClub,
      k3Champion: k3ChampionClub,
      k3ChampionHasKLeague2License: true,
      k3WinsPlayoff: false
    });

    return {
      title: "2026 K League 2/K3 transition",
      lines: [
        `Automatic promotion demo: ${requireRow(state.standings, 1).club.name} and ${requireRow(state.standings, 2).club.name}.`,
        `Playoff winner demo: ${requireRow(state.standings, 3).club.name}.`,
        ...k2K3OutcomeLines(outcome)
      ],
      raw: outcome
    };
  }

  return {
    title: "2027 transition",
    lines: ["No detailed promotion/relegation transition is configured for this demo rule pack yet."],
    raw: null
  };
}

export function promotionOutcomeLines(outcome: PromotionRelegationOutcome): string[] {
  return [
    `Promoted to K League 1: ${clubList(outcome.promotedToKLeague1)}.`,
    `Relegated to K League 2: ${clubList(outcome.relegatedToKLeague2)}.`,
    `Retained in K League 1: ${clubList(outcome.retainedInKLeague1)}.`,
    `Retained in K League 2: ${clubList(outcome.retainedInKLeague2)}.`,
    outcome.promotionRelegationPlayoffScheduled
      ? `Promotion/relegation playoff: ${outcome.promotionRelegationPlayoff?.kLeague1Club.name} vs ${outcome.promotionRelegationPlayoff?.kLeague2Club.name}; winner ${outcome.promotionRelegationPlayoff?.winner?.name ?? "not set"}.`
      : "Promotion/relegation playoff: not scheduled.",
    `2027 K League 1 participant count: ${outcome.kLeague1ParticipantCount2027}.`
  ];
}

export function k2K3OutcomeLines(outcome: KLeague2K3TransitionOutcome): string[] {
  if (!outcome.playoffScheduled) {
    return [`K League 2/K3 playoff not scheduled: ${outcome.reason ?? "no reason supplied"}.`];
  }

  if (outcome.promotedToKLeague2 && outcome.relegatedToK3) {
    return [
      `K League 2/K3 playoff scheduled: ${outcome.promotedToKLeague2.name} promoted, ${outcome.relegatedToK3.name} relegated.`
    ];
  }

  return [`K League 2/K3 playoff scheduled: ${outcome.retainedInKLeague2?.name ?? "K League 2 club"} retained its place.`];
}

function kLeague1ScenarioTable(gimcheonPosition: number): StandingRow[] {
  const gimcheon = kLeague1_2026Clubs.find((club) => club.isGimcheonSangmu);
  if (!gimcheon) {
    throw new Error("Missing the military rule club.");
  }

  const otherClubs = kLeague1_2026Clubs.filter((club) => !club.isGimcheonSangmu);
  const ordered: Club[] = [];
  for (let position = 1; position <= 12; position += 1) {
    if (position === gimcheonPosition) {
      ordered.push(gimcheon);
    } else {
      const nextClub = otherClubs.shift();
      if (nextClub) {
        ordered.push(nextClub);
      }
    }
  }
  return makeStandingRows(ordered);
}

function promotionScenario(
  id: string,
  title: string,
  description: string,
  raw: PromotionRelegationOutcome | KLeague2K3TransitionOutcome
): PromotionScenario {
  return {
    id,
    title,
    description,
    raw,
    lines: "promotedToKLeague1" in raw ? promotionOutcomeLines(raw) : k2K3OutcomeLines(raw)
  };
}

export function getPromotionRelegationScenarios(): PromotionScenario[] {
  const k2Table = makeStandingRows(kLeague2_2026Clubs);
  const k1Gimcheon12 = kLeague1ScenarioTable(12);
  const k1Gimcheon8 = kLeague1ScenarioTable(8);
  const k1Twelfth = requireRow(k1Gimcheon8, 12).club;
  const k2PlayoffWinner = requireRow(k2Table, 3).club;
  const k2PlayoffLoser = requireRow(k2Table, 4).club;
  const k2Bottom = requireRow(k2Table, 17).club;

  return [
    promotionScenario(
      "gimcheon-12th",
      "Gimcheon rule slot finishes 12th",
      "Only the military rule club is relegated while three K League 2 clubs are promoted.",
      resolveKLeague2026PromotionRelegation({
        kLeague1FinalTable: k1Gimcheon12,
        kLeague2FinalTable: k2Table,
        kLeague2PlayoffWinner: k2PlayoffWinner
      })
    ),
    promotionScenario(
      "gimcheon-8th-k1-wins",
      "Gimcheon rule slot finishes 8th; K League 1 12th wins playoff",
      "The K League 1 12th-place club keeps its place and the K League 2 playoff loser remains in K League 2.",
      resolveKLeague2026PromotionRelegation({
        kLeague1FinalTable: k1Gimcheon8,
        kLeague2FinalTable: k2Table,
        kLeague2PlayoffWinner: k2PlayoffWinner,
        kLeague2PlayoffLoser: k2PlayoffLoser,
        promotionRelegationPlayoffWinner: k1Twelfth
      })
    ),
    promotionScenario(
      "gimcheon-8th-k2-wins",
      "Gimcheon rule slot finishes 8th; K League 2 PO loser wins playoff",
      "The K League 2 playoff loser also goes up, while the K League 1 12th-place club goes down.",
      resolveKLeague2026PromotionRelegation({
        kLeague1FinalTable: k1Gimcheon8,
        kLeague2FinalTable: k2Table,
        kLeague2PlayoffWinner: k2PlayoffWinner,
        kLeague2PlayoffLoser: k2PlayoffLoser,
        promotionRelegationPlayoffWinner: k2PlayoffLoser
      })
    ),
    promotionScenario(
      "licensed-k3-champion",
      "K League 2-K3 playoff with licensed K3 champion",
      "The licensed K3 champion wins the playoff and swaps places with the K League 2 bottom club.",
      resolveKLeague2K3Transition({
        kLeague2BottomClub: k2Bottom,
        k3Champion: k3ChampionClub,
        k3ChampionHasKLeague2License: true,
        k3WinsPlayoff: true
      })
    ),
    promotionScenario(
      "unlicensed-k3-champion",
      "K League 2-K3 playoff with unlicensed K3 champion",
      "No playoff is scheduled when the K3 champion does not hold a K League 2 license.",
      resolveKLeague2K3Transition({
        kLeague2BottomClub: k2Bottom,
        k3Champion: unlicensedK3ChampionClub,
        k3ChampionHasKLeague2License: false
      })
    )
  ];
}
