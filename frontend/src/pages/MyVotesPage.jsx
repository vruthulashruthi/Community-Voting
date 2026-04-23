import MyVotesPanel from "../components/MyVotesPanel";

export default function MyVotesPage({ authUser }) {
  return (
    <div className="container">
      <h1>My Votes</h1>
      <p className="muted">See all your recorded votes across proposals.</p>
      <MyVotesPanel username={authUser?.username} />
    </div>
  );
}