import { useEffect, useState } from "react";

export default function Countdown({ deadline }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const end = new Date(deadline + (deadline.endsWith("Z") ? "" : "Z")).getTime();
  const diff = Math.max(0, end - now);

  if (diff === 0) return <span className="muted">Expired</span>;

  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  return (
    <span className="muted">
      ⏳ {days}d {hrs}h {mins}m {secs}s
    </span>
  );
}
