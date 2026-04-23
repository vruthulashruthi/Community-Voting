-- Seed data for the Community Voting System
-- Run with: sqlite3 voting.db < seed_data.sql

INSERT INTO proposals (title, description, created_at, deadline, status) VALUES
  ('Build a community garden', 'Convert the empty lot on Main St into a shared community garden.', datetime('now'), datetime('now', '+2 days'), 'active'),
  ('Adopt weekly cleanup day', 'Saturday morning neighborhood cleanup once a week.', datetime('now'), datetime('now', '+2 days'), 'active'),
  ('Install solar street lights', 'Replace existing street lights with solar-powered ones.', datetime('now', '-3 days'), datetime('now', '-1 days'), 'expired');

INSERT INTO votes (proposal_id, voter_name, vote, voted_at) VALUES
  (1, 'alice', 'yes', datetime('now')),
  (1, 'bob', 'yes', datetime('now')),
  (1, 'carol', 'no', datetime('now')),
  (2, 'alice', 'abstain', datetime('now'));
