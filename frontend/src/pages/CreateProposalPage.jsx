import { useNavigate } from "react-router-dom";
import CreateProposal from "../components/CreateProposal";

export default function CreateProposalPage() {
  const navigate = useNavigate();

  const onCreated = () => {
    navigate("/proposals");
  };

  return (
    <div className="container">
      <h1>Create Proposal</h1>
      <p className="muted">Create a proposal with a deadline. You will be redirected to proposals after submit.</p>
      <CreateProposal onCreated={onCreated} />
    </div>
  );
}
