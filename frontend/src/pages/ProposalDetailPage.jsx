import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProposal } from "../api";

const RESULT_ROWS = [
  { key: "yes", label: "Yes", tone: "yes", color: "#22c55e" },
  { key: "no", label: "No", tone: "no", color: "#ef4444" },
  { key: "abstain", label: "Abstain", tone: "abstain", color: "#f59e0b" },
];

function buildDonutSegments(counts, totalVotes, radius) {
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return RESULT_ROWS.map((row) => {
    const value = counts[row.key] || 0;
    const ratio = totalVotes > 0 ? value / totalVotes : 0;
    const segmentLength = circumference * ratio;
    const segment = {
      key: row.key,
      color: row.color,
      dashArray: `${segmentLength} ${circumference - segmentLength}`,
      dashOffset: -offset,
    };
    offset += segmentLength;
    return segment;
  });
}

export default function ProposalDetailPage() {
  const { proposalId } = useParams();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const next = await getProposal(proposalId);
        setDetail(next);
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load proposal details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [proposalId]);

  if (loading) {
    return (
      <div className="detail-shell">
        <div className="detail-floating-card">
          <p>Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-shell">
        <div className="detail-floating-card">
          <p className="error">{error}</p>
          <Link className="inline-link" to="/proposals">
            Back to proposals
          </Link>
        </div>
      </div>
    );
  }

  const votes = [...(detail?.votes || [])].sort(
    (left, right) => new Date(right.voted_at).getTime() - new Date(left.voted_at).getTime()
  );

  const totalVotes = detail?.counts?.total || 0;
  const isFinalized = detail?.status === "closed" || detail?.status === "expired";
  const donutRadius = 40;
  const donutSegments = buildDonutSegments(detail.counts, totalVotes, donutRadius);

  return (
    <div className="detail-shell">
      <div className="detail-floating-card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1 style={{ marginBottom: 4 }}>{detail.title}</h1>
          <span className={`badge ${detail.status}`}>{detail.status}</span>
        </div>

        <p className="muted detail-description">{detail.description || "No description provided."}</p>

        <div className="detail-meta-grid">
          <div className="meta-panel">
            <div className="meta-label">Created</div>
            <div>{new Date(detail.created_at).toLocaleString()}</div>
          </div>
          <div className="meta-panel">
            <div className="meta-label">Deadline</div>
            <div>{new Date(detail.deadline).toLocaleString()}</div>
          </div>
          <div className="meta-panel">
            <div className="meta-label">Total votes</div>
            <div>{totalVotes}</div>
          </div>
        </div>

        {isFinalized && (
          <section className="detail-section">
            <h3>Final results</h3>
            <div className="results-layout">
              <div className="donut-wrap">
                <svg className="donut-chart" viewBox="0 0 120 120" role="img" aria-label="Vote result chart">
                  <circle className="donut-track" cx="60" cy="60" r={donutRadius} />
                  {donutSegments.map((segment) => (
                    <circle
                      key={segment.key}
                      className="donut-segment"
                      cx="60"
                      cy="60"
                      r={donutRadius}
                      stroke={segment.color}
                      strokeDasharray={segment.dashArray}
                      strokeDashoffset={segment.dashOffset}
                    />
                  ))}
                </svg>
                <div className="donut-center-label">
                  <div className="meta-label">Total</div>
                  <div>{totalVotes}</div>
                </div>
              </div>

              <div className="results-chart">
                {RESULT_ROWS.map((row) => {
                  const value = detail.counts[row.key];
                  const percentage = totalVotes > 0 ? Math.round((value / totalVotes) * 100) : 0;
                  return (
                    <div key={row.key} className="result-row">
                      <div className="result-label">{row.label}</div>
                      <div className="result-bar-track">
                        <div className={`result-bar ${row.tone}`} style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="result-value">{value} ({percentage}%)</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="detail-section">
          <h3>Full vote history</h3>
          {votes.length === 0 ? (
            <p className="muted">No votes recorded.</p>
          ) : (
            <ul className="vote-history-list">
              {votes.map((vote) => (
                <li key={vote.id} className="vote-history-item">
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <strong>{vote.voter_name}</strong>
                    <span className="muted">Vote #{vote.id}</span>
                  </div>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <span>
                      Choice: <strong>{vote.vote}</strong>
                    </span>
                    <span className="muted">{new Date(vote.voted_at).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 20 }}>
          <Link className="inline-link" to="/proposals">
            Back to proposals
          </Link>
        </div>
      </div>
    </div>
  );
}
