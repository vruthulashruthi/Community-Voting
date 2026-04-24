import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProposal, listProposals } from "../api";

export default function MyVotesPanel({ username }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!username) {
        setRows([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const proposals = await listProposals();
        const details = await Promise.all(proposals.map((p) => getProposal(p.id)));

        const mine = details
          .flatMap((detail) =>
            detail.votes
              .filter((vote) => vote.voter_name === username)
              .map((vote) => ({
                voteId: vote.id,
                proposalId: detail.id,
                proposalTitle: detail.title,
                proposalStatus: detail.status,
                choice: vote.vote,
                votedAt: vote.voted_at,
              }))
          )
          .sort((a, b) => new Date(b.votedAt).getTime() - new Date(a.votedAt).getTime());

        setRows(mine);
      } catch (e) {
        setError(e?.response?.data?.detail || "Failed to load your vote history");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [username]);

  return (
    <section className="card my-votes-panel">
      <div className="row row-space-between">
        <h3 className="heading-reset">My votes</h3>
        <span className="muted">{username || "Unknown user"}</span>
      </div>

      {loading ? (
        <p className="muted">Loading your votes...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : rows.length === 0 ? (
        <p className="muted">No recorded votes yet.</p>
      ) : (
        <ul className="my-votes-list">
          {rows.map((row) => (
            <li key={row.voteId} className="my-votes-item">
              <div className="row row-space-between">
                <strong>{row.proposalTitle}</strong>
                <span className={`badge ${row.proposalStatus}`}>{row.proposalStatus}</span>
              </div>
              <div className="row row-space-between">
                <span>
                  You voted <strong>{row.choice}</strong>
                </span>
                <span className="muted">{new Date(row.votedAt).toLocaleString()}</span>
              </div>
              <Link className="inline-link" to={`/proposals/${row.proposalId}`}>
                Open proposal details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
