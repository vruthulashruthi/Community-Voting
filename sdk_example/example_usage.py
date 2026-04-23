"""Example usage of the generated Python SDK.

Steps:
  1. Start the backend (runapplication.bat)
  2. Generate SDK:
      cd sdk_example
      generate_sdk.bat
  3. Install SDK:
      pip install -e ../voting_sdk
  4. Run this script:
      python example_usage.py
"""
from datetime import datetime, timedelta

from voting_sdk import ApiClient, Configuration
from voting_sdk.api.proposals_api import ProposalsApi
from voting_sdk.api.votes_api import VotesApi
from voting_sdk.models.proposal_create import ProposalCreate
from voting_sdk.models.vote_create import VoteCreate
from voting_sdk.rest import ApiException


def main():
    config = Configuration(host="http://localhost:8000")
    with ApiClient(config) as client:
        proposals_api = ProposalsApi(client)
        votes_api = VotesApi(client)

        # 1. Create a proposal
        deadline = (datetime.utcnow() + timedelta(days=2)).isoformat()
        new_proposal = proposals_api.create_proposal_proposals_post(
            proposal_create=ProposalCreate(
                title="SDK demo proposal",
                description="Created from the Python SDK",
                deadline=deadline,
            )
        )
        print("Created proposal:", new_proposal.id, new_proposal.title)

        # 2. Cast a vote
        vote = proposals_api.vote_on_proposal_proposals_proposal_id_vote_post(
            proposal_id=new_proposal.id,
            vote_create=VoteCreate(voter_name="sdk_user", vote="yes"),
        )
        print("Cast vote id:", vote.id)

        # 3. Get details
        detail = proposals_api.get_proposal_proposals_proposal_id_get(proposal_id=new_proposal.id)
        print("Counts:", detail.counts)

        # 4. Revoke
        votes_api.revoke_vote_votes_vote_id_delete(vote_id=vote.id)
        print("Revoked vote.")

        # 5. List all
        all_props = proposals_api.list_proposals_proposals_get()
        print(f"Total proposals: {len(all_props)}")


if __name__ == "__main__":
    try:
        main()
    except ApiException as e:
        print("API error:", e)
