import { useNavigate } from "react-router-dom";
import CreateProposal from "../components/CreateProposal";

export default function CreateProposalPage() {
  const navigate = useNavigate();

  const onCreated = () => {
    navigate("/proposals");
  };

  return (
    <div className="container create-page">
      <p className="muted">a new question for the chamber</p>
      <h1>Draft a proposal</h1>
      <p className="muted">Set a clear headline, describe the motion, and choose a voting window.</p>
      <CreateProposal onCreated={onCreated} />
    </div>
  );
}
