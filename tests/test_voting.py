"""Unit tests for core business rules."""
import time
from datetime import datetime, timedelta


def _auth_header(client, username="alice", password="password"):
    r = client.post("/auth/login", json={"username": username, "password": password})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _create_proposal(client, headers, title="Test", days=2):
    deadline = (datetime.utcnow() + timedelta(days=days)).isoformat()
    r = client.post("/proposals/", json={"title": title, "description": "d", "deadline": deadline}, headers=headers)
    assert r.status_code == 201, r.text
    return r.json()


def test_create_and_get_proposal(client):
    alice = _auth_header(client, "alice", "password")
    p = _create_proposal(client, alice, "Garden")
    r = client.get(f"/proposals/{p['id']}")
    assert r.status_code == 200
    body = r.json()
    assert body["title"] == "Garden"
    assert body["counts"]["total"] == 0


def test_vote_and_counts(client):
    alice = _auth_header(client, "alice", "password")
    bob = _auth_header(client, "bob", "password")
    p = _create_proposal(client, alice)
    r = client.post(f"/proposals/{p['id']}/vote", json={"voter_name": "alice", "vote": "yes"}, headers=alice)
    assert r.status_code == 201
    r = client.post(f"/proposals/{p['id']}/vote", json={"voter_name": "bob", "vote": "no"}, headers=bob)
    assert r.status_code == 201
    r = client.get(f"/proposals/{p['id']}")
    counts = r.json()["counts"]
    assert counts == {"yes": 1, "no": 1, "abstain": 0, "total": 2}


def test_duplicate_vote_rejected(client):
    alice = _auth_header(client, "alice", "password")
    p = _create_proposal(client, alice)
    client.post(f"/proposals/{p['id']}/vote", json={"voter_name": "alice", "vote": "yes"}, headers=alice)
    r = client.post(f"/proposals/{p['id']}/vote", json={"voter_name": "alice", "vote": "no"}, headers=alice)
    assert r.status_code == 409


def test_revoke_vote_when_active(client):
    alice = _auth_header(client, "alice", "password")
    p = _create_proposal(client, alice)
    r = client.post(f"/proposals/{p['id']}/vote", json={"voter_name": "alice", "vote": "yes"}, headers=alice)
    vote_id = r.json()["id"]
    r = client.delete(f"/votes/{vote_id}", headers=alice)
    assert r.status_code == 204
    r = client.get(f"/proposals/{p['id']}")
    assert r.json()["counts"]["total"] == 0


def test_cannot_vote_on_closed_proposal(client):
    admin = _auth_header(client, "admin", "admin123")
    alice = _auth_header(client, "alice", "password")
    p = _create_proposal(client, alice)
    r = client.patch(f"/proposals/{p['id']}/close", headers=admin)
    assert r.status_code == 200
    r = client.post(f"/proposals/{p['id']}/vote", json={"voter_name": "alice", "vote": "yes"}, headers=alice)
    assert r.status_code == 400


def test_cannot_revoke_on_closed_proposal(client):
    admin = _auth_header(client, "admin", "admin123")
    alice = _auth_header(client, "alice", "password")
    p = _create_proposal(client, alice)
    r = client.post(f"/proposals/{p['id']}/vote", json={"voter_name": "alice", "vote": "yes"}, headers=alice)
    vote_id = r.json()["id"]
    client.patch(f"/proposals/{p['id']}/close", headers=admin)
    r = client.delete(f"/votes/{vote_id}", headers=alice)
    assert r.status_code == 400


def test_expired_proposal_rejects_votes(client):
    alice = _auth_header(client, "alice", "password")
    # Use a near-future deadline, then wait briefly for status auto-expiry logic.
    deadline = (datetime.utcnow() + timedelta(seconds=1)).isoformat()
    r = client.post(
        "/proposals/",
        json={"title": "Soon", "description": "d", "deadline": deadline},
        headers=alice,
    )
    assert r.status_code == 201
    p = r.json()
    time.sleep(1.2)

    # Listing triggers status refresh; proposal should now be expired.
    listing = client.get("/proposals/")
    assert listing.status_code == 200
    refreshed = next(item for item in listing.json() if item["id"] == p["id"])
    assert refreshed["status"] == "expired"

    r = client.post(f"/proposals/{p['id']}/vote", json={"voter_name": "alice", "vote": "yes"}, headers=alice)
    assert r.status_code == 400


def test_create_with_past_deadline_rejected(client):
    alice = _auth_header(client, "alice", "password")
    deadline = (datetime.utcnow() - timedelta(days=1)).isoformat()
    r = client.post("/proposals/", json={"title": "Old", "deadline": deadline}, headers=alice)
    assert r.status_code == 400


def test_close_already_closed(client):
    admin = _auth_header(client, "admin", "admin123")
    alice = _auth_header(client, "alice", "password")
    p = _create_proposal(client, alice)
    client.patch(f"/proposals/{p['id']}/close", headers=admin)
    r = client.patch(f"/proposals/{p['id']}/close", headers=admin)
    assert r.status_code == 400


def test_list_proposals(client):
    alice = _auth_header(client, "alice", "password")
    _create_proposal(client, alice, "A")
    _create_proposal(client, alice, "B")
    r = client.get("/proposals/")
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_admin_only_close(client):
    alice = _auth_header(client, "alice", "password")
    p = _create_proposal(client, alice)
    r = client.patch(f"/proposals/{p['id']}/close", headers=alice)
    assert r.status_code == 403


def test_cannot_vote_as_someone_else(client):
    alice = _auth_header(client, "alice", "password")
    p = _create_proposal(client, alice)
    r = client.post(f"/proposals/{p['id']}/vote", json={"voter_name": "bob", "vote": "yes"}, headers=alice)
    assert r.status_code == 400


def test_cannot_revoke_others_vote(client):
    alice = _auth_header(client, "alice", "password")
    bob = _auth_header(client, "bob", "password")
    p = _create_proposal(client, alice)
    r = client.post(f"/proposals/{p['id']}/vote", json={"voter_name": "alice", "vote": "yes"}, headers=alice)
    vote_id = r.json()["id"]
    r = client.delete(f"/votes/{vote_id}", headers=bob)
    assert r.status_code == 403
