import type { StandingRow } from "@kleague-manager/engine";

interface StandingsTableProps {
  rows: StandingRow[];
}

export function StandingsTable({ rows }: StandingsTableProps) {
  if (rows.length === 0) {
    return <p className="muted">No standings yet.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="standings-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Club</th>
            <th>Pl</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
            <th>Phase</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const previous = rows[index - 1];
            const startsFinalB = row.splitGroup === "FINAL_B" && previous?.splitGroup === "FINAL_A";
            return (
              <tr key={row.club.id} className={startsFinalB ? "split-divider" : undefined}>
                <td>{row.position ?? index + 1}</td>
                <td>{row.club.name}</td>
                <td>{row.played}</td>
                <td>{row.wins}</td>
                <td>{row.draws}</td>
                <td>{row.losses}</td>
                <td>{row.goalsFor}</td>
                <td>{row.goalsAgainst}</td>
                <td>{row.goalDifference}</td>
                <td className="points">{row.points}</td>
                <td>{row.splitGroup?.replace("_", " ") ?? "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
