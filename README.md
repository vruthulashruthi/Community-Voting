# 🗳️ Community Digital Voting System

A complete full-stack voting system where community members create proposals, vote on them, and revoke their votes — with deadlines, automatic expiry, and admin close support.

## Tech stack

- **Backend:** FastAPI + SQLAlchemy + Pydantic v2
- **Database:** SQLite + Alembic migrations
- **Frontend:** React 18 + Vite + Axios
- **SDK:** Auto-generated Python SDK via `openapi-generator-cli`
- **Tests:** Pytest with isolated in-memory DB
- **Automation:** Windows `.bat` scripts

## Folder structure

```
project/
├── setupdev.bat             # Requirement-aligned setup script
├── runapplication.bat       # Requirement-aligned run script
├── backend/
│   └── app/
│       ├── routers/         # FastAPI routes (proposals, votes)
│       ├── models/          # SQLAlchemy models
│       ├── schemas/         # Pydantic schemas
│       ├── services/        # Business logic
│       ├── database.py      # DB session + Base
│       └── main.py          # FastAPI app
├── frontend/                # React + Vite app
│   └── src/
│       ├── components/
│       ├── api.js           # Axios client
│       └── App.jsx
├── alembic/                 # DB migrations
├── tests/                   # Pytest suite
├── sdk_example/             # SDK generation + example
│   ├── generate_sdk.bat
│   └── example_usage.py
├── voting_sdk/              # Generated Python SDK artifact
├── scripts/
│   ├── setupdev.bat
│   └── runapplication.bat
├── seed_data.sql
├── alembic.ini
├── requirements.txt
└── README.md
```

## ⚙️ Setup (Windows)

Use Python 3.11 for dependency compatibility.

```bat
setupdev.bat
```

This creates an `env` virtual environment, installs backend deps, runs Alembic migrations, and installs frontend deps.
Java (JDK 17+) is required for SDK generation.

### Environment configuration

Copy `.env.example` to `.env` and adjust values for your environment.

```bash
cp .env.example .env
```

Key variables:

- `DATABASE_URL`: SQLAlchemy connection string.
- `CORS_ORIGINS`: Comma-delimited origins (for example `http://localhost:5173`).
- `AUTH_SECRET_KEY`: JWT signing key (must be strong in production).
- `AUTO_CREATE_TABLES`: Keep `false` in production and rely on Alembic.

### Manual setup (any OS)

```bash
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head

cd frontend
npm install
```

### Optional: seed sample data

```bash
sqlite3 voting.db < seed_data.sql
```

## 🚀 Run

```bat
runapplication.bat
```

Or manually in two terminals:

```bash
# Terminal 1 (backend)
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 (frontend)
cd frontend && npm run dev
```

- Backend: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

## 📡 API endpoints

| Method | Path                              | Description                       |
|--------|-----------------------------------|-----------------------------------|
| POST   | `/proposals/`                     | Create proposal                   |
| GET    | `/proposals/`                     | List all proposals                |
| GET    | `/proposals/{id}`                 | Get proposal + vote counts        |
| POST   | `/proposals/{id}/vote`            | Cast a vote                       |
| PATCH  | `/proposals/{id}/close`           | Admin closes the proposal         |
| DELETE | `/votes/{vote_id}`                | Revoke a vote (only while active) |
| POST   | `/auth/login`                     | Login and receive bearer token    |

### Auth & roles

- JWT bearer auth: send `Authorization: Bearer <token>`
- Demo users:
  - `alice` / `password` (voter)
  - `bob` / `password` (voter)
  - `admin` / `admin123` (admin)
- Rules:
  - Create proposal requires authentication.
  - Vote identity is bound to authenticated user.
  - Revoke is allowed only for your own vote (admin can revoke any active vote).
  - Close proposal is admin-only.

### Business rules enforced

- ✅ One vote per user per proposal (UNIQUE constraint + service check).
- ✅ Voting only when proposal status is `active`.
- ✅ Revocation only when proposal status is `active`.
- ✅ Proposals automatically expire after their deadline (default 2 days).
- ✅ Closed or expired proposals reject new votes and revocations.
- ✅ Admin can manually close an active proposal.

### Example: create + vote with curl

```bash
curl -X POST http://localhost:8000/proposals/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Build a park","description":"Green space.","deadline":"2030-01-01T00:00:00"}'

curl -X POST http://localhost:8000/proposals/1/vote \
  -H "Content-Type: application/json" \
  -d '{"voter_name":"alice","vote":"yes"}'

curl http://localhost:8000/proposals/1
```

## 🐍 Python SDK

1. Make sure the backend is running.
2. Verify Java is available: `java -version`
3. Install the OpenAPI generator CLI (one-time): `npm install -g @openapitools/openapi-generator-cli`
4. Generate SDK:
   ```bash
   cd sdk_example
   generate_sdk.bat
   ```
  This creates a `voting_sdk/` folder with the generated package.
5. Install and run the example:
   ```bash
  pip install -e ../voting_sdk
   python example_usage.py
   ```

Expected import style:

```python
from voting_sdk.api.proposals_api import ProposalsApi
from voting_sdk import ApiClient
```

## 🧪 Tests

```bash
pytest -v
```

## ✅ Quality checks

Backend:

```bash
ruff check backend tests
mypy backend/app
pytest -q
```

Frontend:

```bash
cd frontend
npm run lint
npm run test:run
npm run build
```

Covers:
- Duplicate voting rejection
- Voting on closed/expired proposals
- Revocation rules
- Past-deadline rejection on creation
- Counts aggregation
- Listing proposals

## 🗄️ Database schema

**proposals**: `id`, `title`, `description`, `created_at`, `deadline`, `status`
(`active` | `closed` | `expired`)

**votes**: `id`, `proposal_id` (FK), `voter_name`, `vote` (`yes`|`no`|`abstain`), `voted_at`,
`UNIQUE(proposal_id, voter_name)`

## License

MIT
