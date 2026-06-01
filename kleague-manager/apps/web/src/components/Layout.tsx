import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Static browser test bench</p>
          <h1>K League Manager Engine Demo</h1>
        </div>
        <nav aria-label="Demo sections">
          <a href="#engine-status">Status</a>
          <a href="#lineup-validation">Lineups</a>
          <a href="#match-simulator">Match</a>
          <a href="#season-simulator">Season</a>
          <a href="#promotion-relegation">Transitions</a>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="app-footer">
        Fan-made simulation prototype. Uses fictional data. Not affiliated with K League, clubs, or players.
      </footer>
    </div>
  );
}
