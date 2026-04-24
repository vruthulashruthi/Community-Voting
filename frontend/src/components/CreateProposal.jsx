import { useState } from "react";
import { createProposal } from "../api";

export default function CreateProposal({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState(2);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const deadlineMs = ((days * 24 + hours) * 60 + minutes) * 60 * 1000;
      const deadline = new Date(Date.now() + deadlineMs).toISOString();
      await createProposal({ title, description, deadline });
      setTitle("");
      setDescription("");
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to create proposal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card proposal-wizard" onSubmit={submit}>
      <div className="wizard-panel">
        <h3>A clear, decisive headline.</h3>
        <p className="muted">Aim for one sentence. The chamber should know exactly what they are deciding.</p>

        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Description</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Deadline from now</label>
      </div>

      <div className="deadline-grid">
        <div>
          <span className="field-label">Days</span>
          <input
            type="number"
            min={0}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </div>
        <div>
          <span className="field-label">Hours</span>
          <input
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </div>
        <div>
          <span className="field-label">Minutes</span>
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
          />
        </div>
      </div>

      <p className="muted small-help">The deadline will be set to the combined duration you enter.</p>
      <hr />

      <div className="row row-space-between">
        <button type="button" className="secondary">Back</button>
        <button disabled={busy}>{busy ? "Creating..." : "Continue"}</button>
      </div>

      {error && <div className="error">{error}</div>}
    </form>
  );
}
