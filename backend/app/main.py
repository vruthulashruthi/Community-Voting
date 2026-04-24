"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, proposals, votes
from app.settings import settings

if settings.auto_create_tables:
    # Keep local developer convenience optional; production should use Alembic migrations.
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Community Digital Voting System",
    description="Vote on community proposals with deadlines and revocation support.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(proposals.router)
app.include_router(votes.router)


@app.get("/", tags=["health"])
def root() -> dict[str, str]:
    return {"status": "ok", "service": "community-voting", "docs": "/docs"}
