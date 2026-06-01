import { useEffect, useMemo, useState } from "react";
import type { SeasonDemoRuleId } from "../data/demoClubs";
import {
  createSeasonState,
  runNextSeasonRound,
  runSeasonToEnd,
  runSeasonToSplit,
  type DemoSeasonState
} from "../lib/demoSeason";
import { readLocalSave, writeLocalSave } from "../lib/localSave";
import { DebugJsonPanel } from "./DebugJsonPanel";
import { FixtureList } from "./FixtureList";
import { StandingsTable } from "./StandingsTable";

const saveKey = "kleague-manager-web-season-demo";
const seasonOptions: Array<{ id: SeasonDemoRuleId; label: string }> = [
  { id: "K_LEAGUE_1_2026", label: "K League 1 2026" },
  { id: "K_LEAGUE_2_2026", label: "K League 2 2026" },
  { id: "K_LEAGUE_1_2027", label: "K League 1 2027" }
];

function loadInitialState(): DemoSeasonState {
  const saved = readLocalSave<DemoSeasonState | null>(saveKey, null);
  if (saved?.ruleId && Array.isArray(saved.fixtures) && Array.isArray(saved.standings)) {
    return saved;
  }
  return createSeasonState("K_LEAGUE_1_2026");
}

export function SeasonSimulatorPanel() {
  const [season, setSeason] = useState<DemoSeasonState>(() => loadInitialState());
  const currentOrNextFixtures = useMemo(() => {
    const preferredRound = season.currentRound === 0 ? 1 : season.currentRound;
    const nextRound = season.currentRound + 1;
    return season.fixtures
      .filter((fixture) => fixture.round === preferredRound || (!season.ended && fixture.round === nextRound))
      .slice(0, 18);
  }, [season]);

  useEffect(() => {
    writeLocalSave(saveKey, season);
  }, [season]);

  function changeRule(ruleId: SeasonDemoRuleId) {
    setSeason(createSeasonState(ruleId));
  }

  return (
    <section className="panel" id="season-simulator">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Season Simulator Panel</p>
          <h2>Season Progression</h2>
        </div>
        <span className={`status-pill ${season.ended ? "ok" : ""}`}>{season.ended ? "Ended" : "Round " + season.currentRound}</span>
      </div>

      <div className="form-grid">
        <label className="field">
          Competition
          <select value={season.ruleId} onChange={(event) => changeRule(event.target.value as SeasonDemoRuleId)}>
            {seasonOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Clubs
          <input value={`${season.clubs.length} fake clubs`} readOnly />
        </label>
      </div>

      <div className="button-row">
        <button type="button" onClick={() => setSeason(createSeasonState(season.ruleId))}>
          Generate Schedule
        </button>
        <button type="button" onClick={() => setSeason((current) => runNextSeasonRound(current))} disabled={season.ended}>
          Run Next Round
        </button>
        <button
          type="button"
          onClick={() => setSeason((current) => runSeasonToSplit(current))}
          disabled={season.ruleId !== "K_LEAGUE_1_2026" || season.currentRound >= 33}
        >
          Run To Split
        </button>
        <button type="button" onClick={() => setSeason((current) => runSeasonToEnd(current))} disabled={season.ended}>
          Run To End
        </button>
        <button type="button" className="secondary" onClick={() => setSeason(createSeasonState(season.ruleId))}>
          Reset Season
        </button>
      </div>

      <div className="status-grid">
        <div className="metric">
          <span>Current round</span>
          <strong>{season.currentRound}</strong>
        </div>
        <div className="metric">
          <span>Fixtures</span>
          <strong>{season.fixtures.length}</strong>
        </div>
        <div className="metric">
          <span>Results</span>
          <strong>{season.results.length}</strong>
        </div>
        <div className="metric">
          <span>Split status</span>
          <strong>{season.splitGenerated ? "Generated" : "Not generated"}</strong>
        </div>
      </div>

      {season.splitGenerated ? (
        <div className="two-column">
          <div className="notice success">
            <strong>Final A</strong>
            <p>{season.finalAClubIds.map((id) => season.clubs.find((club) => club.id === id)?.name ?? id).join(", ")}</p>
          </div>
          <div className="notice warning">
            <strong>Final B</strong>
            <p>{season.finalBClubIds.map((id) => season.clubs.find((club) => club.id === id)?.name ?? id).join(", ")}</p>
          </div>
        </div>
      ) : null}

      {season.latestResults.length > 0 ? (
        <FixtureList fixtures={season.fixtures.filter((fixture) => fixture.round === season.currentRound)} results={season.latestResults} title="Latest results" />
      ) : null}

      <FixtureList fixtures={currentOrNextFixtures} results={season.results} title="Current / next fixtures" />

      <h3>Standings</h3>
      <StandingsTable rows={season.standings} />

      {season.outcome ? (
        <div className="notice success">
          <strong>{season.outcome.title}</strong>
          <ul className="outcome-list">
            {season.outcome.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <DebugJsonPanel
        title="Season state JSON"
        value={{
          ruleId: season.ruleId,
          currentRound: season.currentRound,
          splitGenerated: season.splitGenerated,
          ended: season.ended,
          standings: season.standings,
          latestResults: season.latestResults,
          outcome: season.outcome
        }}
      />
    </section>
  );
}
