import type { Fixture, MatchResult } from "@kleague-manager/engine";

interface FixtureListProps {
  fixtures: Fixture[];
  results?: MatchResult[];
  title?: string;
}

export function FixtureList({ fixtures, results = [], title = "Fixtures" }: FixtureListProps) {
  const resultByFixture = new Map(results.map((result) => [result.fixtureId, result]));
  const grouped = fixtures.reduce<Record<string, Fixture[]>>((accumulator, fixture) => {
    const key = String(fixture.round);
    accumulator[key] = [...(accumulator[key] ?? []), fixture];
    return accumulator;
  }, {});

  return (
    <div>
      <h3>{title}</h3>
      {fixtures.length === 0 ? (
        <p className="muted">No fixtures generated.</p>
      ) : (
        <div className="fixture-list">
          {Object.entries(grouped).map(([round, roundFixtures]) => (
            <section key={round} className="fixture-round">
              <h4>Round {round}</h4>
              <ul>
                {roundFixtures.map((fixture) => {
                  const result = resultByFixture.get(fixture.id);
                  return (
                    <li key={fixture.id}>
                      <span>
                        {fixture.homeClub.name} vs {fixture.awayClub.name}
                      </span>
                      <strong>
                        {result
                          ? `${result.homeGoals}-${result.awayGoals}`
                          : fixture.phase
                            ? fixture.phase.replace("_", " ")
                            : "Scheduled"}
                      </strong>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
