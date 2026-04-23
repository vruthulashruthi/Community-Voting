"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, proposals, votes

# Ensure tables exist (Alembic is the source of truth for production migrations,
# but this guarantees a working DB even before migrations are run).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Community Digital Voting System",
    description="Vote on community proposals with deadlines and revocation support.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(proposals.router)
app.include_router(votes.router)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "service": "community-voting", "docs": "/docs"}
