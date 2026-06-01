import type { MatchEvent } from "@kleague-manager/engine";

interface MatchEventsProps {
  events: MatchEvent[];
}

export function MatchEvents({ events }: MatchEventsProps) {
  if (events.length === 0) {
    return <p className="muted">No events yet.</p>;
  }

  return (
    <ol className="event-list">
      {events.map((event, index) => (
        <li key={`${event.minute}-${event.type}-${index}`}>
          <span>{event.minute}'</span>
          <strong>{event.type.replace("_", " ")}</strong>
          <p>{event.description}</p>
        </li>
      ))}
    </ol>
  );
}
