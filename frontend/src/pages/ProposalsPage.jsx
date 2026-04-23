import { useEffect, useState } from "react";
import { listProposals } from "../api";
import ProposalCard from "../components/ProposalCard";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setProposals(await listProposals());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === "all" ? proposals : proposals.filter((p) => p.status === filter);

  return (
    <div className="container">
      <h1>Proposals</h1>
      <p className="muted">View proposal status, cast votes, and revoke while active.</p>

      <div className="row" style={{ marginBottom: 16 }}>
        <label style={{ margin: 0 }}>Filter:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 200 }}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="expired">Expired</option>
        </select>
        <button className="secondary" onClick={load}>Refresh</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="muted">No proposals.</p>
      ) : (
        filtered.map((p) => <ProposalCard key={p.id} proposal={p} onChange={load} />)
      )}
    </div>
  );
}
