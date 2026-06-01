interface DebugJsonPanelProps {
  title?: string;
  value: unknown;
}

export function DebugJsonPanel({ title = "Debug JSON", value }: DebugJsonPanelProps) {
  return (
    <details className="debug-panel">
      <summary>{title}</summary>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
}
