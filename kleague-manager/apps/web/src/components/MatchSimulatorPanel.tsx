import { useMemo, useState } from "react";
import { createKLeague2026RulePack, simulateMatch, type MatchResult } from "@kleague-manager/engine";
import { kLeague1_2026Clubs } from "../data/demoClubs";
import { tacticOptions, type DemoTacticKey } from "../data/demoPlayers";
import { createClubLineup } from "../data/demoSquads";
import { DebugJsonPanel } from "./DebugJsonPanel";
import { MatchEvents } from "./MatchEvents";

interface BatchSummary {
  homeWins: number;
  draws: number;
  awayWins: number;
}

function resultDigest(result: MatchResult): string {
  return JSON.stringify(result);
}

export function MatchSimulatorPanel() {
  const [homeClubId, setHomeClubId] = useState(kLeague1_2026Clubs[0]?.id ?? "");
  const [awayClubId, setAwayClubId] = useState(kLeague1_2026Clubs[1]?.id ?? "");
  const [seed, setSeed] = useState("demo-seed-1");
  const [homeTactic, setHomeTactic] = useState<DemoTacticKey>("balanced");
  const [awayTactic, setAwayTactic] = useState<DemoTacticKey>("counter");
  const [homeMorale, setHomeMorale] = useState(0);
  const [awayMorale, setAwayMorale] = useState(0);
  const [homeFatigue, setHomeFatigue] = useState(0);
  const [awayFatigue, setAwayFatigue] = useState(0);
  const [result, setResult] = useState<MatchResult | undefined>();
  const [sameSeedVerified, setSameSeedVerified] = useState<boolean | undefined>();
  const [batchSummary, setBatchSummary] = useState<BatchSummary | undefined>();

  const rulePack = useMemo(() => createKLeague2026RulePack().competitions.kLeague1, []);
  const homeClub = kLeague1_2026Clubs.find((club) => club.id === homeClubId) ?? kLeague1_2026Clubs[0];
  const awayClub = kLeague1_2026Clubs.find((club) => club.id === awayClubId) ?? kLeague1_2026Clubs[1];
  const canSimulate = Boolean(homeClub && awayClub && homeClub.id !== awayClub.id);

  function runSimulation(seedToUse: string): MatchResult | undefined {
    if (!homeClub || !awayClub || homeClub.id === awayClub.id) {
      return undefined;
    }

    return simulateMatch({
      home: homeClub,
      away: awayClub,
      homeLineup: createClubLineup(homeClub, tacticOptions[homeTactic]),
      awayLineup: createClubLineup(awayClub, tacticOptions[awayTactic]),
      rulePack,
      seed: seedToUse,
      context: {
        homeMorale,
        awayMorale,
        homeFatigue,
        awayFatigue
      }
    });
  }

  function simulateOnce() {
    const next = runSimulation(seed);
    setResult(next);
    setSameSeedVerified(undefined);
    setBatchSummary(undefined);
  }

  function runSameSeed() {
    const seedToUse = result?.seed ?? seed;
    const next = runSimulation(seedToUse);
    setSameSeedVerified(Boolean(next && result && resultDigest(next) === resultDigest(result)));
    setResult(next);
  }

  function runBatch() {
    let homeWins = 0;
    let draws = 0;
    let awayWins = 0;
    for (let index = 0; index < 100; index += 1) {
      const next = runSimulation(`${seed}:batch:${index}`);
      if (!next) {
        continue;
      }
      if (next.homeGoals > next.awayGoals) {
        homeWins += 1;
      } else if (next.homeGoals < next.awayGoals) {
        awayWins += 1;
      } else {
        draws += 1;
      }
    }
    setBatchSummary({ homeWins, draws, awayWins });
  }

  return (
    <section className="panel" id="match-simulator">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Match Simulator Panel</p>
          <h2>Single Match</h2>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          Home club
          <select value={homeClubId} onChange={(event) => setHomeClubId(event.target.value)}>
            {kLeague1_2026Clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Away club
          <select value={awayClubId} onChange={(event) => setAwayClubId(event.target.value)}>
            {kLeague1_2026Clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Seed
          <input value={seed} onChange={(event) => setSeed(event.target.value)} />
        </label>
        <label className="field">
          Home tactic
          <select value={homeTactic} onChange={(event) => setHomeTactic(event.target.value as DemoTacticKey)}>
            {Object.keys(tacticOptions).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Away tactic
          <select value={awayTactic} onChange={(event) => setAwayTactic(event.target.value as DemoTacticKey)}>
            {Object.keys(tacticOptions).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="slider-grid">
        <label>
          Home morale <strong>{homeMorale}</strong>
          <input min="-10" max="10" type="range" value={homeMorale} onChange={(event) => setHomeMorale(Number(event.target.value))} />
        </label>
        <label>
          Away morale <strong>{awayMorale}</strong>
          <input min="-10" max="10" type="range" value={awayMorale} onChange={(event) => setAwayMorale(Number(event.target.value))} />
        </label>
        <label>
          Home fatigue <strong>{homeFatigue}</strong>
          <input min="0" max="30" type="range" value={homeFatigue} onChange={(event) => setHomeFatigue(Number(event.target.value))} />
        </label>
        <label>
          Away fatigue <strong>{awayFatigue}</strong>
          <input min="0" max="30" type="range" value={awayFatigue} onChange={(event) => setAwayFatigue(Number(event.target.value))} />
        </label>
      </div>

      {!canSimulate ? <div className="notice error">Choose two different fake clubs.</div> : null}

      <div className="button-row">
        <button type="button" onClick={simulateOnce} disabled={!canSimulate}>
          Simulate Match
        </button>
        <button type="button" onClick={runSameSeed} disabled={!canSimulate || !result}>
          Run same seed again
        </button>
        <button type="button" onClick={runBatch} disabled={!canSimulate}>
          Run 100 simulations
        </button>
      </div>

      {sameSeedVerified !== undefined ? (
        <div className={`notice ${sameSeedVerified ? "success" : "error"}`}>
          Same seed deterministic check: {sameSeedVerified ? "exact match" : "changed result"}
        </div>
      ) : null}

      {batchSummary ? (
        <div className="result-grid">
          <div className="metric">
            <span>Home wins</span>
            <strong>{batchSummary.homeWins}</strong>
          </div>
          <div className="metric">
            <span>Draws</span>
            <strong>{batchSummary.draws}</strong>
          </div>
          <div className="metric">
            <span>Away wins</span>
            <strong>{batchSummary.awayWins}</strong>
          </div>
        </div>
      ) : null}

      {result ? (
        <>
          <div className="scoreline">
            <span>{homeClub?.name}</span>
            <strong>
              {result.homeGoals} - {result.awayGoals}
            </strong>
            <span>{awayClub?.name}</span>
          </div>
          <div className="result-grid">
            <div className="metric">
              <span>xG</span>
              <strong>
                {result.homeXg} - {result.awayXg}
              </strong>
            </div>
            <div className="metric">
              <span>Shots</span>
              <strong>
                {result.homeShots} - {result.awayShots}
              </strong>
            </div>
            <div className="metric">
              <span>Shots on target</span>
              <strong>
                {result.homeShotsOnTarget} - {result.awayShotsOnTarget}
              </strong>
            </div>
            <div className="metric">
              <span>Possession</span>
              <strong>
                {result.homePossession}% - {result.awayPossession}%
              </strong>
            </div>
            <div className="metric">
              <span>Cards</span>
              <strong>
                {result.homeCards} - {result.awayCards}
              </strong>
            </div>
            <div className="metric">
              <span>Injuries</span>
              <strong>
                {result.homeInjuries} - {result.awayInjuries}
              </strong>
            </div>
          </div>
          <h3>Event log</h3>
          <MatchEvents events={result.events} />
          <DebugJsonPanel title="Match result JSON" value={result} />
        </>
      ) : (
        <p className="muted">Run a match to see score, stats, and event log.</p>
      )}
    </section>
  );
}
