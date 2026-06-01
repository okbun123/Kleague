import { ENGINE_PACKAGE_NAME, ENGINE_VERSION } from "@kleague-manager/engine";
import type { RulePackSelectorId } from "../data/demoClubs";
import type { KLeague2_2027DemoConfig, RulePackSelection } from "../lib/demoSeason";

interface EngineStatusPanelProps {
  selectedRulePack: RulePackSelectorId;
  selection: RulePackSelection;
  kLeague2_2027Config: KLeague2_2027DemoConfig;
}

export function EngineStatusPanel({ selectedRulePack, selection, kLeague2_2027Config }: EngineStatusPanelProps) {
  return (
    <section className="panel" id="engine-status">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Home / Engine Status</p>
          <h2>Engine Status</h2>
        </div>
        <span className="status-pill">Static demo</span>
      </div>

      <div className="status-grid">
        <div className="metric">
          <span>Package</span>
          <strong>{ENGINE_PACKAGE_NAME}</strong>
        </div>
        <div className="metric">
          <span>Version</span>
          <strong>{ENGINE_VERSION}</strong>
        </div>
        <div className="metric">
          <span>Selected rule pack</span>
          <strong>{selection.rulePack?.name ?? selectedRulePack}</strong>
        </div>
      </div>

      <div className="notice warning">
        This demo uses fake clubs and fake players. It is not affiliated with K League or any club.
      </div>

      <div className="rule-list">
        <h3>Available rule packs</h3>
        <ul>
          <li>K League 1 2026</li>
          <li>K League 2 2026</li>
          <li>K League 1 2027</li>
          <li>K League 2 2027 configurable/unconfirmed</li>
        </ul>
      </div>

      {selection.error ? (
        <div className="notice error">
          <strong>{selection.error.name}</strong>
          <p>{selection.error.message}</p>
        </div>
      ) : (
        <div className="notice success">
          {selection.rulePack?.name} is ready with team count {selection.rulePack?.teamCount ?? "not fixed"}.
        </div>
      )}

      <details className="debug-panel">
        <summary>Rule pack config</summary>
        <pre>{JSON.stringify({ selectedRulePack, kLeague2_2027Config, selection }, null, 2)}</pre>
      </details>
    </section>
  );
}
