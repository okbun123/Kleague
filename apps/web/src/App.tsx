import { useMemo, useState } from "react";
import type { RulePackSelectorId } from "./data/demoClubs";
import { EngineStatusPanel } from "./components/EngineStatusPanel";
import { Layout } from "./components/Layout";
import { LineupValidationPanel } from "./components/LineupValidationPanel";
import { MatchSimulatorPanel } from "./components/MatchSimulatorPanel";
import { PromotionRelegationPanel } from "./components/PromotionRelegationPanel";
import { RulePackSelector } from "./components/RulePackSelector";
import { SeasonSimulatorPanel } from "./components/SeasonSimulatorPanel";
import { resolveRulePackSelection, type KLeague2_2027DemoConfig } from "./lib/demoSeason";

export function App() {
  const [selectedRulePack, setSelectedRulePack] = useState<RulePackSelectorId>("K_LEAGUE_1_2026");
  const [kLeague2_2027Config, setKLeague2_2027Config] = useState<KLeague2_2027DemoConfig>({});
  const selection = useMemo(
    () => resolveRulePackSelection(selectedRulePack, kLeague2_2027Config),
    [selectedRulePack, kLeague2_2027Config]
  );

  return (
    <Layout>
      <EngineStatusPanel
        selectedRulePack={selectedRulePack}
        selection={selection}
        kLeague2_2027Config={kLeague2_2027Config}
      />
      <RulePackSelector
        selectedRulePack={selectedRulePack}
        config={kLeague2_2027Config}
        onConfigChange={setKLeague2_2027Config}
        onRulePackChange={setSelectedRulePack}
        selection={selection}
      />
      <LineupValidationPanel />
      <MatchSimulatorPanel />
      <SeasonSimulatorPanel />
      <PromotionRelegationPanel />
    </Layout>
  );
}
