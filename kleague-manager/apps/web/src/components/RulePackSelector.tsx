import type { RulePackSelectorId } from "../data/demoClubs";
import {
  selectableRulePacks,
  type KLeague2_2027DemoConfig,
  type RulePackSelection
} from "../lib/demoSeason";

interface RulePackSelectorProps {
  selectedRulePack: RulePackSelectorId;
  config: KLeague2_2027DemoConfig;
  onConfigChange: (config: KLeague2_2027DemoConfig) => void;
  onRulePackChange: (rulePack: RulePackSelectorId) => void;
  selection: RulePackSelection;
}

function numericValue(value: number | undefined): string {
  return value === undefined ? "" : String(value);
}

export function RulePackSelector({
  selectedRulePack,
  config,
  onConfigChange,
  onRulePackChange,
  selection
}: RulePackSelectorProps) {
  function setNumeric(key: "teamCount" | "roundRobinLegs" | "promotionSlots", value: string) {
    const next = { ...config };
    if (value === "") {
      delete next[key];
    } else {
      next[key] = Number(value);
    }
    onConfigChange(next);
  }

  function setPlayoffs(value: string) {
    const next = { ...config };
    if (value === "") {
      delete next.hasPlayoffs;
    } else {
      next.hasPlayoffs = value === "true";
    }
    onConfigChange(next);
  }

  return (
    <section className="panel" id="rule-pack-selector">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Rule Pack Selector</p>
          <h2>Rule Pack</h2>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          Rule pack
          <select value={selectedRulePack} onChange={(event) => onRulePackChange(event.target.value as RulePackSelectorId)}>
            {selectableRulePacks.map((option) => (
              <option key={option.id} value={option.id}>
                {option.id}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Label
          <input value={selection.label} readOnly />
        </label>
      </div>

      {selectedRulePack === "K_LEAGUE_2_2027_CONFIGURABLE" ? (
        <div className="form-grid">
          <label className="field">
            Team count
            <input
              min="2"
              type="number"
              value={numericValue(config.teamCount)}
              onChange={(event) => setNumeric("teamCount", event.target.value)}
            />
          </label>
          <label className="field">
            Round-robin legs
            <input
              min="1"
              type="number"
              value={numericValue(config.roundRobinLegs)}
              onChange={(event) => setNumeric("roundRobinLegs", event.target.value)}
            />
          </label>
          <label className="field">
            Has playoffs
            <select
              value={config.hasPlayoffs === undefined ? "" : String(config.hasPlayoffs)}
              onChange={(event) => setPlayoffs(event.target.value)}
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="field">
            Promotion slots
            <input
              min="0"
              type="number"
              value={numericValue(config.promotionSlots)}
              onChange={(event) => setNumeric("promotionSlots", event.target.value)}
            />
          </label>
        </div>
      ) : null}

      {selection.error ? (
        <div className="notice error">
          <strong>{selection.error.name}</strong>
          <p>{selection.error.message}</p>
        </div>
      ) : (
        <div className="rule-summary">
          <span>{selection.rulePack?.name}</span>
          <span>{selection.rulePack?.division}</span>
          <span>{selection.rulePack?.teamCount ?? "configurable"} clubs</span>
          <span>{selection.rulePack?.regularRoundRobin?.legs ?? "?"} legs</span>
        </div>
      )}
    </section>
  );
}
