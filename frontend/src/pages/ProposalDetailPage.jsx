import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProposal } from "../api";

const resultRows = [
  { key: "yes", label: "Yes", tone: "yes", color: "#22c55e" },
  { key: "no", label: "No", tone: "no", color: "#ef4444" },
  { key: "abstain", label: "Abstain", tone: "abstain", color: "#f59e0b" },
];

function buildDonutSegments(counts, totalVotes, radius) {
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return resultRows.map((row) => {
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
  const canViewVotes = Boolean(detail?.can_view_votes);
  const isFinalized = detail?.status === "closed" || detail?.status === "expired";
  const donutRadius = 40;
  const donutSegments = buildDonutSegments(detail.counts, totalVotes, donutRadius);

  return (
    <div className="detail-shell">
      <div className="detail-layout">
        <aside className="detail-sidebar">
          <div className="sidebar-brand">Ballot.</div>
          <div className="sidebar-section">navigate</div>
          <nav className="sidebar-nav">
            <Link to="/proposals" className="sidebar-link active">Proposals</Link>
            <Link to="/my-votes" className="sidebar-link">My votes</Link>
            <Link to="/create" className="sidebar-link">New proposal</Link>
          </nav>
        </aside>

        <div className="detail-main">
          <div className="detail-floating-card">
            <div className="row row-space-between">
              <div>
                <p className="eyebrow">proposal detail</p>
                <h1 className="title-tight">{detail.title}</h1>
              </div>
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
              {canViewVotes && (
                <div className="meta-panel">
                  <div className="meta-label">Total votes</div>
                  <div>{totalVotes}</div>
                </div>
              )}
            </div>

            {!canViewVotes && (
              <p className="muted text-margin-top-sm">
                Vote statistics and vote history will become visible after you vote in this proposal.
              </p>
            )}
          </div>

          {canViewVotes && isFinalized && (
            <section className="detail-section card">
              <h3>Results</h3>
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
                  {resultRows.map((row) => {
                    const value = detail.counts[row.key];
                    const percentage = totalVotes > 0 ? Math.round((value / totalVotes) * 100) : 0;
                    return (
                      <div key={row.key} className="result-row">
                        <div className="result-label">{row.label}</div>
                        <progress className={`result-progress ${row.tone}`} value={percentage} max="100" />
                        <div className="result-value">{value} ({percentage}%)</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {canViewVotes && (
            <section className="detail-section card">
              <h3>Vote history</h3>
              {votes.length === 0 ? (
                <p className="muted">No votes recorded.</p>
              ) : (
                <ul className="vote-history-list">
                  {votes.map((vote) => (
                    <li key={vote.id} className="vote-history-item">
                      <div className="row row-space-between">
                        <strong>{vote.voter_name}</strong>
                        <span className="muted">Vote #{vote.id}</span>
                      </div>
                      <div className="row row-space-between">
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
          )}

          <div className="row row-space-between row-margin-top-lg">
            <Link className="inline-link" to="/proposals">
              Back to proposals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
