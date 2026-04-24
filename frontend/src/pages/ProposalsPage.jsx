import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProposals } from "../api";
import ProposalCard from "../components/ProposalCard";

export default function ProposalsPage({ searchQuery, onSearchQueryChange }) {
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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filtered = proposals.filter((proposal) => {
    const matchesStatus = filter === "all" ? true : proposal.status === filter;
    const matchesSearch =
      normalizedQuery.length === 0
        ? true
        : [proposal.title, proposal.description, proposal.status]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(normalizedQuery));
    return matchesStatus && matchesSearch;
  });
  const statusCounts = proposals.reduce(
    (acc, proposal) => {
      acc[proposal.status] = (acc[proposal.status] || 0) + 1;
      return acc;
    },
    { active: 0, closed: 0, expired: 0 }
  );

  return (
    <div className="container proposals-page">
      <section className="page-hero">
        <p className="eyebrow">the chamber</p>
        <h1>Proposals</h1>
        <p className="muted">
          Read, weigh, and decide. Votes can be revoked or changed while a proposal is still active.
        </p>
        <Link className="new-proposal-pill hero-cta" to="/create">
          + New proposal
        </Link>
      </section>

      <section className="card filters-shell">
        <div className="search-strip">
          <input
            className="search-strip-input"
            type="search"
            placeholder="Search title, description, status..."
            aria-label="Search proposals"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
          />
        </div>
        <div className="proposal-filter-tabs">
          <button className={`filter-pill ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
            All <span>{proposals.length}</span>
          </button>
          <button className={`filter-pill ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>
            Active <span>{statusCounts.active}</span>
          </button>
          <button className={`filter-pill ${filter === "expired" ? "active" : ""}`} onClick={() => setFilter("expired")}>
            Expired <span>{statusCounts.expired}</span>
          </button>
          <button className={`filter-pill ${filter === "closed" ? "active" : ""}`} onClick={() => setFilter("closed")}>
            Closed <span>{statusCounts.closed}</span>
          </button>
        </div>

        <div className="proposal-filter-footer">
          <select className="select-medium" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="expired">Expired</option>
          </select>
          <button className="secondary" onClick={load}>Refresh</button>
        </div>
      </section>

      <div className="proposal-list-stack">
        {loading ? (
          <p>Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="muted">No proposals.</p>
        ) : (
          filtered.map((p) => <ProposalCard key={p.id} proposal={p} onChange={load} />)
        )}
      </div>
    </div>
  );
}
