import MyVotesPanel from "../components/MyVotesPanel";

export default function MyVotesPage({ authUser }) {
  return (
    <div className="container">
      <p className="eyebrow">your ballot trail</p>
      <h1>My Votes</h1>
      <p className="muted">Review every recorded vote across active and finalized proposals.</p>
      <MyVotesPanel username={authUser?.username} />
    </div>
  );
}