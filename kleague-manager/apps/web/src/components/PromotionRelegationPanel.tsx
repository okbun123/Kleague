import { useMemo, useState } from "react";
import { getPromotionRelegationScenarios } from "../lib/demoSeason";
import { DebugJsonPanel } from "./DebugJsonPanel";

export function PromotionRelegationPanel() {
  const scenarios = useMemo(() => getPromotionRelegationScenarios(), []);
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
  const scenario = scenarios.find((candidate) => candidate.id === scenarioId) ?? scenarios[0];

  return (
    <section className="panel" id="promotion-relegation">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Promotion/Relegation Panel</p>
          <h2>2026 Transition Scenarios</h2>
        </div>
      </div>

      <label className="field wide">
        Demo scenario
        <select value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}>
          {scenarios.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.title}
            </option>
          ))}
        </select>
      </label>

      {scenario ? (
        <>
          <p className="muted">{scenario.description}</p>
          <ul className="outcome-list">
            {scenario.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <DebugJsonPanel title="Transition outcome JSON" value={scenario.raw} />
        </>
      ) : (
        <p className="muted">No transition scenario available.</p>
      )}
    </section>
  );
}
