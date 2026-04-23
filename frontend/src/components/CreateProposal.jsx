import { useState } from "react";
import { createProposal } from "../api";

export default function CreateProposal({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState(2);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const deadline = new Date(Date.now() + days * 86400 * 1000).toISOString();
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
    <form className="card" onSubmit={submit}>
      <h3>Create proposal</h3>
      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      <label>Description</label>
      <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      <label>Deadline (days from now)</label>
      <input
        type="number"
        min={1}
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
      />
      <hr />
      <button disabled={busy}>{busy ? "Creating..." : "Create"}</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
