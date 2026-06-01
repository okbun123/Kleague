import { useMemo, useState } from "react";
import { lineupScenarios, validateDemoScenario } from "../data/demoSquads";
import { DebugJsonPanel } from "./DebugJsonPanel";

export function LineupValidationPanel() {
  const [scenarioId, setScenarioId] = useState(lineupScenarios[0]?.id ?? "");
  const scenario = useMemo(
    () => lineupScenarios.find((candidate) => candidate.id === scenarioId) ?? lineupScenarios[0],
    [scenarioId]
  );
  const result = scenario ? validateDemoScenario(scenario) : undefined;

  return (
    <section className="panel" id="lineup-validation">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lineup Validation Panel</p>
          <h2>Match Squad Rules</h2>
        </div>
        {result ? <span className={`status-pill ${result.valid ? "ok" : "bad"}`}>{result.valid ? "Valid" : "Invalid"}</span> : null}
      </div>

      <div className="form-grid">
        <label className="field wide">
          Scenario
          <select value={scenarioId} onChange={(event) => setScenarioId(event.target.value)}>
            {lineupScenarios.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {scenario && result ? (
        <>
          <p className="muted">{scenario.expected}</p>
          <div className="result-grid">
            <div className="metric">
              <span>Valid</span>
              <strong>{String(result.valid)}</strong>
            </div>
            <div className="metric">
              <span>Effective max squad</span>
              <strong>{result.effectiveMaxSquadSize}</strong>
            </div>
            <div className="metric">
              <span>Max substitutions</span>
              <strong>{result.maxSubstitutions}</strong>
            </div>
            <div className="metric">
              <span>Foreign players</span>
              <strong>{result.foreignCount}</strong>
            </div>
            <div className="metric">
              <span>U22 players</span>
              <strong>{result.u22Count}</strong>
            </div>
            <div className="metric">
              <span>U22 starters</span>
              <strong>{result.u22StarterCount}</strong>
            </div>
          </div>

          <div className="two-column">
            <div>
              <h3>Errors</h3>
              {result.errors.length > 0 ? (
                <ul className="message-list error-list">
                  {result.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No errors.</p>
              )}
            </div>
            <div>
              <h3>Warnings</h3>
              {result.warnings.length > 0 ? (
                <ul className="message-list warning-list">
                  {result.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No warnings.</p>
              )}
            </div>
          </div>
          <DebugJsonPanel title="Lineup validation JSON" value={{ scenario, result }} />
        </>
      ) : (
        <p className="muted">No scenario available.</p>
      )}
    </section>
  );
}
