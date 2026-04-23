import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProposal, castVote, closeProposal, revokeVote } from "../api";
import Countdown from "./Countdown";

export default function ProposalCard({ proposal, onChange }) {
  const [detail, setDetail] = useState(null);
  const [choice, setChoice] = useState("yes");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [pendingRevokeId, setPendingRevokeId] = useState(null);

  const refresh = async () => {
    const d = await getProposal(proposal.id);
    setDetail(d);
  };

  useEffect(() => {
    refresh();
  }, [proposal.id]);

  const submitVote = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await castVote(proposal.id, { vote: choice });
      setMsg("Vote recorded.");
      await refresh();
      onChange();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to vote");
    }
  };

  const close = async () => {
    setMsg("");
    setErr("");
    try {
      await closeProposal(proposal.id);
      await refresh();
      onChange();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to close");
    }
  };

  const revoke = async (voteId) => {
    setMsg("");
    setErr("");
    try {
      await revokeVote(voteId);
      await refresh();
      onChange();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to revoke");
    }
  };

  const confirmRevoke = async () => {
    if (pendingRevokeId == null) return;
    const voteId = pendingRevokeId;
    setPendingRevokeId(null);
    await revoke(voteId);
  };

  if (!detail) return <div className="card">Loading…</div>;

  const isActive = detail.status === "active";

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>{detail.title}</h3>
        <div className="row">
          <Link className="detail-link-button" to={`/proposals/${detail.id}`}>
            View details
          </Link>
          <span className={`badge ${detail.status}`}>{detail.status}</span>
        </div>
      </div>
      <p className="muted">{detail.description}</p>
      <div className="row">
        <Countdown deadline={detail.deadline} />
        <span className="muted">· Deadline: {new Date(detail.deadline).toLocaleString()}</span>
      </div>
      <hr />
      <div className="counts">
        <span>✅ Yes: <b>{detail.counts.yes}</b></span>
        <span>❌ No: <b>{detail.counts.no}</b></span>
        <span>🤷 Abstain: <b>{detail.counts.abstain}</b></span>
        <span>Total: <b>{detail.counts.total}</b></span>
      </div>

      {isActive && (
        <>
          <hr />
          <form className="row" onSubmit={submitVote}>
            <select value={choice} onChange={(e) => setChoice(e.target.value)} style={{ width: 140 }}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="abstain">Abstain</option>
            </select>
            <button type="submit">Vote</button>
            <button type="button" className="secondary" onClick={close}>
              Admin close
            </button>
          </form>
        </>
      )}

      {detail.votes.length > 0 && (
        <>
          <hr />
          <details>
            <summary className="muted">Show votes ({detail.votes.length})</summary>
            <ul style={{ paddingLeft: 16 }}>
              {detail.votes.map((v) => (
                <li key={v.id} className="row" style={{ justifyContent: "space-between" }}>
                  <span>
                    <b>{v.voter_name}</b> voted <b>{v.vote}</b>
                    <span className="muted"> · {new Date(v.voted_at).toLocaleString()}</span>
                  </span>
                  {isActive && (
                    <button className="danger" type="button" onClick={() => setPendingRevokeId(v.id)}>
                      Revoke
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}

      {msg && <div className="success">{msg}</div>}
      {err && <div className="error">{err}</div>}

      {pendingRevokeId != null && (
        <div className="modal-backdrop" role="presentation" onClick={() => setPendingRevokeId(null)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="revoke-modal-title"
            aria-describedby="revoke-modal-description"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="revoke-modal-title">Confirm revoke</h3>
            <p id="revoke-modal-description" className="muted">
              Are you sure you want to revoke this vote? This action will delete the vote immediately.
            </p>
            <div className="row modal-actions">
              <button className="secondary" type="button" onClick={() => setPendingRevokeId(null)}>
                Cancel
              </button>
              <button className="danger" type="button" onClick={confirmRevoke}>
                Revoke vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
